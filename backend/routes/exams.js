const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/exams - list all exams
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT exam_id, exam_name, exam_code, conducting_body,
             total_marks, passing_marks, duration_minutes,
             exam_level, description, is_active
      FROM Exam
      ORDER BY exam_id
    `);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/exams error:', err.message);
    res.status(500).json({ error: 'Failed to fetch exams' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/exams - add new exam
router.post('/', async (req, res) => {
  let conn;
  try {
    const {
      exam_name, exam_code, conducting_body, total_marks,
      passing_marks, duration_minutes, exam_level, description, is_active
    } = req.body;

    if (!exam_name || !exam_code || !conducting_body || total_marks == null || passing_marks == null || duration_minutes == null) {
      return res.status(400).json({ error: 'Missing required fields: exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      INSERT INTO Exam (exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, description, is_active)
      VALUES (:exam_name, :exam_code, :conducting_body, :total_marks, :passing_marks, :duration_minutes, :exam_level, :description, :is_active)
      RETURNING exam_id INTO :id
    `, {
      exam_name,
      exam_code,
      conducting_body,
      total_marks,
      passing_marks,
      duration_minutes,
      exam_level: exam_level || 'National',
      description: description || null,
      is_active: is_active != null ? is_active : 1,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ examId: newId, message: 'Exam created successfully' });
  } catch (err) {
    console.error('POST /api/exams error:', err.message);
    if (err.message.includes('ORA-00001')) {
      return res.status(400).json({ error: 'An exam with this exam_code already exists' });
    }
    res.status(500).json({ error: 'Failed to create exam' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
