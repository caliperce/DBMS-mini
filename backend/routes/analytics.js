const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow } = require('../db');

// GET /api/analytics/table-counts - row count for each table
router.get('/table-counts', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 'Student' AS table_name, COUNT(*) AS row_count FROM Student
      UNION ALL
      SELECT 'Exam', COUNT(*) FROM Exam
      UNION ALL
      SELECT 'Registration', COUNT(*) FROM Registration
      UNION ALL
      SELECT 'Exam_Centre', COUNT(*) FROM Exam_Centre
      UNION ALL
      SELECT 'Schedule', COUNT(*) FROM Schedule
      UNION ALL
      SELECT 'Hall_Ticket', COUNT(*) FROM Hall_Ticket
      UNION ALL
      SELECT 'Result', COUNT(*) FROM Result
      UNION ALL
      SELECT 'Grievance', COUNT(*) FROM Grievance
      UNION ALL
      SELECT 'Question', COUNT(*) FROM Question
      UNION ALL
      SELECT 'Response', COUNT(*) FROM Response
    `);
    // Return as { Table_Name: count, ... } object for the frontend
    const counts = {};
    for (const row of result.rows) {
      counts[row.TABLE_NAME] = row.ROW_COUNT;
    }
    res.json(counts);
  } catch (err) {
    console.error('GET /api/analytics/table-counts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch table counts' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/analytics/category-count?exam_id=X - students by category for an exam
router.get('/category-count', async (req, res) => {
  let conn;
  try {
    const examId = req.query.exam_id ? parseInt(req.query.exam_id, 10) : null;
    if (!examId) {
      return res.status(400).json({ error: 'exam_id query parameter is required' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      SELECT s.category,
             COUNT(*) AS num_registered
      FROM Registration r
      JOIN Student s ON r.student_id = s.student_id
      WHERE r.exam_id = :exam_id
      GROUP BY s.category
      ORDER BY num_registered DESC
    `, { exam_id: examId });

    // Return as [{name, value}] for pie chart
    const data = result.rows.map((r) => ({ name: r.CATEGORY, value: r.NUM_REGISTERED }));
    res.json(data);
  } catch (err) {
    console.error('GET /api/analytics/category-count error:', err.message);
    res.status(500).json({ error: 'Failed to fetch category count' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/analytics/pass-percentage?exam_id=X - pass % by centre
router.get('/pass-percentage', async (req, res) => {
  let conn;
  try {
    const examId = req.query.exam_id ? parseInt(req.query.exam_id, 10) : null;
    if (!examId) {
      return res.status(400).json({ error: 'exam_id query parameter is required' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      SELECT ec.centre_name,
             ec.city,
             COUNT(res.result_id) AS total_appeared,
             SUM(CASE WHEN res.result_status = 'Pass' THEN 1 ELSE 0 END) AS passed,
             ROUND(
                 100.0 * SUM(CASE WHEN res.result_status = 'Pass' THEN 1 ELSE 0 END)
                 / NULLIF(COUNT(res.result_id), 0), 2
             ) AS pass_pct
      FROM Result res
      JOIN Registration reg ON res.registration_id = reg.registration_id
      JOIN Hall_Ticket ht ON ht.registration_id = reg.registration_id
      JOIN Schedule sc ON ht.schedule_id = sc.schedule_id
      JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id
      WHERE reg.exam_id = :exam_id
      GROUP BY ec.centre_id, ec.centre_name, ec.city
      ORDER BY pass_pct DESC
    `, { exam_id: examId });

    const data = result.rows.map((r) => ({
      name: r.CENTRE_NAME,
      city: r.CITY,
      total_appeared: r.TOTAL_APPEARED,
      passed: r.PASSED,
      pass_pct: r.PASS_PCT || 0,
      fail_pct: r.TOTAL_APPEARED > 0 ? Math.round(100 - (r.PASS_PCT || 0)) : 0,
    }));
    res.json(data);
  } catch (err) {
    console.error('GET /api/analytics/pass-percentage error:', err.message);
    res.status(500).json({ error: 'Failed to fetch pass percentage' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/analytics/subject-marks?exam_id=X - avg/max/min marks by subject area
router.get('/subject-marks', async (req, res) => {
  let conn;
  try {
    const examId = req.query.exam_id ? parseInt(req.query.exam_id, 10) : null;
    if (!examId) {
      return res.status(400).json({ error: 'exam_id query parameter is required' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      SELECT q.subject_area,
             COUNT(rsp.response_id) AS responses,
             ROUND(AVG(rsp.marks_awarded), 2) AS avg_marks,
             MAX(rsp.marks_awarded) AS max_marks,
             MIN(rsp.marks_awarded) AS min_marks
      FROM Response rsp
      JOIN Question q ON rsp.question_id = q.question_id
      WHERE q.exam_id = :exam_id
      GROUP BY q.subject_area
      ORDER BY avg_marks DESC
    `, { exam_id: examId });

    const data = result.rows.map((r) => ({
      name: r.SUBJECT_AREA,
      responses: r.RESPONSES,
      avg_marks: r.AVG_MARKS,
      max_marks: r.MAX_MARKS,
      min_marks: r.MIN_MARKS,
    }));
    res.json(data);
  } catch (err) {
    console.error('GET /api/analytics/subject-marks error:', err.message);
    res.status(500).json({ error: 'Failed to fetch subject marks' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/analytics/dashboard - dashboard stats
router.get('/dashboard', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(`
      SELECT
        (SELECT COUNT(*) FROM Student) AS total_students,
        (SELECT COUNT(*) FROM Exam) AS total_exams,
        (SELECT COUNT(*) FROM Registration) AS total_registrations,
        (SELECT COUNT(*) FROM Result) AS total_results,
        (SELECT COUNT(*) FROM Registration WHERE status = 'Confirmed') AS confirmed_count,
        (SELECT COUNT(*) FROM Registration WHERE status = 'Pending') AS pending_count,
        (SELECT COUNT(*) FROM Result WHERE result_status = 'Pass') AS pass_count,
        (SELECT COUNT(*) FROM Grievance WHERE status <> 'Resolved') AS open_grievances
      FROM DUAL
    `);

    const row = result.rows[0] || {};
    const dash = {
      total_students: row.TOTAL_STUDENTS || 0,
      total_exams: row.TOTAL_EXAMS || 0,
      total_registrations: row.TOTAL_REGISTRATIONS || 0,
      total_results: row.TOTAL_RESULTS || 0,
      confirmed_count: row.CONFIRMED_COUNT || 0,
      pending_count: row.PENDING_COUNT || 0,
      pass_count: row.PASS_COUNT || 0,
      open_grievances: row.OPEN_GRIEVANCES || 0,
    };

    // Category data for pie chart
    const catResult = await conn.execute(`
      SELECT s.category AS name, COUNT(*) AS value
      FROM Student s
      GROUP BY s.category
      ORDER BY value DESC
    `);
    dash.category_data = catResult.rows.map((r) => ({ name: r.NAME, value: r.VALUE }));

    // Exam registration data for bar chart
    const regResult = await conn.execute(`
      SELECT e.exam_code AS name,
             COUNT(r.registration_id) AS registrations,
             SUM(CASE WHEN r.status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed
      FROM Exam e
      LEFT JOIN Registration r ON e.exam_id = r.exam_id
      GROUP BY e.exam_code
      ORDER BY e.exam_code
    `);
    dash.exam_reg_data = regResult.rows.map((r) => ({
      name: r.NAME,
      registrations: r.REGISTRATIONS,
      confirmed: r.CONFIRMED,
    }));

    res.json(dash);
  } catch (err) {
    console.error('GET /api/analytics/dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
