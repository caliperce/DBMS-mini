const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/registrations - list all registrations (with optional filters)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    let sql = `
      SELECT r.registration_id, r.student_id, r.exam_id,
             s.first_name || ' ' || s.last_name AS student_name,
             s.email AS student_email,
             e.exam_code, e.exam_name,
             TO_CHAR(r.registration_date, 'YYYY-MM-DD') AS registration_date,
             r.fee_paid, r.payment_ref, r.status, r.attempt_number
      FROM Registration r
      JOIN Student s ON r.student_id = s.student_id
      JOIN Exam e ON r.exam_id = e.exam_id
    `;

    const binds = {};
    const conditions = [];

    if (req.query.exam_id) {
      conditions.push('r.exam_id = :exam_id');
      binds.exam_id = parseInt(req.query.exam_id, 10);
    }
    if (req.query.status) {
      conditions.push('r.status = :status');
      binds.status = req.query.status;
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY r.registration_id';

    const result = await conn.execute(sql, binds);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/registrations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/registrations - register student for exam
router.post('/', async (req, res) => {
  let conn;
  try {
    const { student_id, exam_id, attempt_number } = req.body;

    if (!student_id || !exam_id) {
      return res.status(400).json({ error: 'Missing required fields: student_id, exam_id' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, status, attempt_number)
      VALUES (:student_id, :exam_id, SYSDATE, 0, 'Pending', :attempt_number)
      RETURNING registration_id INTO :id
    `, {
      student_id,
      exam_id,
      attempt_number: attempt_number || 1,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ registrationId: newId, message: 'Registration created successfully' });
  } catch (err) {
    console.error('POST /api/registrations error:', err.message);
    if (err.message.includes('ORA-00001')) {
      return res.status(400).json({ error: 'This student is already registered for this exam with the same attempt number' });
    }
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid student_id or exam_id' });
    }
    res.status(500).json({ error: 'Failed to create registration' });
  } finally {
    if (conn) await conn.close();
  }
});

// PUT /api/registrations/:id/payment - update payment
router.put('/:id/payment', async (req, res) => {
  let conn;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid registration ID' });

    const { payment_ref } = req.body;
    if (!payment_ref) {
      return res.status(400).json({ error: 'Missing required field: payment_ref' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      UPDATE Registration
      SET fee_paid = 1, payment_ref = :payment_ref, status = 'Confirmed'
      WHERE registration_id = :id
    `, { payment_ref, id }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    console.error('PUT /api/registrations/:id/payment error:', err.message);
    res.status(500).json({ error: 'Failed to update payment' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
