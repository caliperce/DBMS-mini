const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/centres - list all centres
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT centre_id, centre_name, address, city, state, pincode,
             total_capacity, contact_person, contact_phone, is_active
      FROM Exam_Centre
      ORDER BY centre_id
    `);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/centres error:', err.message);
    res.status(500).json({ error: 'Failed to fetch centres' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/centres - add new centre
router.post('/', async (req, res) => {
  let conn;
  try {
    const {
      centre_name, address, city, state, pincode,
      total_capacity, contact_person, contact_phone, is_active
    } = req.body;

    if (!centre_name || !address || !city || !state || total_capacity == null) {
      return res.status(400).json({ error: 'Missing required fields: centre_name, address, city, state, total_capacity' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      INSERT INTO Exam_Centre (centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active)
      VALUES (:centre_name, :address, :city, :state, :pincode, :total_capacity, :contact_person, :contact_phone, :is_active)
      RETURNING centre_id INTO :id
    `, {
      centre_name,
      address,
      city,
      state,
      pincode: pincode || null,
      total_capacity,
      contact_person: contact_person || null,
      contact_phone: contact_phone || null,
      is_active: is_active != null ? is_active : 1,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ centreId: newId, message: 'Centre created successfully' });
  } catch (err) {
    console.error('POST /api/centres error:', err.message);
    res.status(500).json({ error: 'Failed to create centre' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
