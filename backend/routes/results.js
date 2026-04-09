const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/results - list all results (JOIN with student name and exam code)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT res.result_id, res.registration_id,
             s.first_name || ' ' || s.last_name AS student_name,
             s.student_id,
             e.exam_code, e.exam_name, e.total_marks,
             res.marks_obtained, res.grade, res.percentile,
             res.rank_position, res.result_status,
             TO_CHAR(res.published_date, 'YYYY-MM-DD') AS published_date,
             res.remarks
      FROM Result res
      JOIN Registration r ON res.registration_id = r.registration_id
      JOIN Student s ON r.student_id = s.student_id
      JOIN Exam e ON r.exam_id = e.exam_id
      ORDER BY res.result_id
    `);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/results error:', err.message);
    res.status(500).json({ error: 'Failed to fetch results' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/results/rank-list?exam_id=X - rank list for an exam
router.get('/rank-list', async (req, res) => {
  let conn;
  try {
    const examId = req.query.exam_id ? parseInt(req.query.exam_id, 10) : null;
    if (!examId) {
      return res.status(400).json({ error: 'exam_id query parameter is required' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      SELECT s.first_name || ' ' || s.last_name AS student_name,
             s.student_id,
             ht.roll_number,
             res.marks_obtained,
             res.grade,
             res.percentile,
             res.result_status,
             RANK() OVER (ORDER BY res.marks_obtained DESC) AS computed_rank
      FROM Result res
      JOIN Registration r ON res.registration_id = r.registration_id
      JOIN Student s ON r.student_id = s.student_id
      LEFT JOIN Hall_Ticket ht ON ht.registration_id = r.registration_id
      WHERE r.exam_id = :exam_id
        AND res.result_status = 'Pass'
      ORDER BY res.marks_obtained DESC
    `, { exam_id: examId });

    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/results/rank-list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch rank list' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/results - add result
router.post('/', async (req, res) => {
  let conn;
  try {
    const {
      registration_id, marks_obtained, grade, percentile,
      rank_position, result_status, published_date, remarks
    } = req.body;

    if (!registration_id || marks_obtained == null || !result_status) {
      return res.status(400).json({ error: 'Missing required fields: registration_id, marks_obtained, result_status' });
    }

    // Build the SQL dynamically based on whether published_date is provided
    const pubDateExpr = published_date
      ? `TO_DATE(:published_date, 'YYYY-MM-DD')`
      : 'SYSDATE';

    const sql = `
      INSERT INTO Result (registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks)
      VALUES (:registration_id, :marks_obtained, :grade, :percentile, :rank_position, :result_status, ${pubDateExpr}, :remarks)
      RETURNING result_id INTO :id
    `;

    const binds = {
      registration_id,
      marks_obtained,
      grade: grade || null,
      percentile: percentile != null ? percentile : null,
      rank_position: rank_position != null ? rank_position : null,
      result_status,
      remarks: remarks || null,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    // Only add the published_date bind if we are using it in the SQL
    if (published_date) {
      binds.published_date = published_date;
    }

    conn = await getConnection();
    const result = await conn.execute(sql, binds, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ resultId: newId, message: 'Result added successfully' });
  } catch (err) {
    console.error('POST /api/results error:', err.message);
    if (err.message.includes('ORA-00001')) {
      return res.status(400).json({ error: 'A result already exists for this registration' });
    }
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid registration_id' });
    }
    if (err.message.includes('ORA-02290')) {
      return res.status(400).json({ error: 'Invalid result_status. Must be Pass, Fail, Absent, or Withheld' });
    }
    res.status(500).json({ error: 'Failed to add result' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
