const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/grievances - list all grievances (with optional status filter)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    let sql = `
      SELECT g.grievance_id, g.student_id, g.result_id,
             s.first_name || ' ' || s.last_name AS student_name,
             s.email AS student_email,
             g.grievance_type, g.description,
             TO_CHAR(g.filed_date, 'YYYY-MM-DD') AS filed_date,
             g.status,
             TO_CHAR(g.resolved_date, 'YYYY-MM-DD') AS resolved_date,
             g.resolution_notes,
             res.marks_obtained, res.result_status
      FROM Grievance g
      JOIN Student s ON g.student_id = s.student_id
      LEFT JOIN Result res ON g.result_id = res.result_id
    `;

    const binds = {};

    if (req.query.status) {
      sql += ' WHERE g.status = :status';
      binds.status = req.query.status;
    }

    sql += ' ORDER BY g.filed_date DESC';

    const result = await conn.execute(sql, binds);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/grievances error:', err.message);
    res.status(500).json({ error: 'Failed to fetch grievances' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/grievances - file a grievance
router.post('/', async (req, res) => {
  let conn;
  try {
    const { student_id, result_id, grievance_type, description } = req.body;

    if (!student_id || !grievance_type || !description) {
      return res.status(400).json({ error: 'Missing required fields: student_id, grievance_type, description' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      INSERT INTO Grievance (student_id, result_id, grievance_type, description, filed_date, status)
      VALUES (:student_id, :result_id, :grievance_type, :description, SYSDATE, 'Open')
      RETURNING grievance_id INTO :id
    `, {
      student_id,
      result_id: result_id || null,
      grievance_type,
      description,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ grievanceId: newId, message: 'Grievance filed successfully' });
  } catch (err) {
    console.error('POST /api/grievances error:', err.message);
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid student_id or result_id' });
    }
    res.status(500).json({ error: 'Failed to file grievance' });
  } finally {
    if (conn) await conn.close();
  }
});

// PUT /api/grievances/:id/resolve - resolve a grievance
router.put('/:id/resolve', async (req, res) => {
  let conn;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid grievance ID' });

    const { resolution_notes } = req.body;
    if (!resolution_notes) {
      return res.status(400).json({ error: 'Missing required field: resolution_notes' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      UPDATE Grievance
      SET status = 'Resolved',
          resolved_date = SYSDATE,
          resolution_notes = :resolution_notes
      WHERE grievance_id = :id
    `, { resolution_notes, id }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    res.json({ message: 'Grievance resolved successfully' });
  } catch (err) {
    console.error('PUT /api/grievances/:id/resolve error:', err.message);
    res.status(500).json({ error: 'Failed to resolve grievance' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
