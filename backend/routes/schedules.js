const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/schedules - list all schedules (with optional exam_id filter)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    let sql = `
      SELECT sc.schedule_id, sc.exam_id, sc.centre_id,
             e.exam_code, e.exam_name,
             ec.centre_name, ec.city,
             TO_CHAR(sc.exam_date, 'YYYY-MM-DD') AS exam_date,
             sc.start_time, sc.end_time, sc.hall_number,
             sc.seats_available, sc.shift
      FROM Schedule sc
      JOIN Exam e ON sc.exam_id = e.exam_id
      JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id
    `;

    const binds = {};

    if (req.query.exam_id) {
      sql += ' WHERE sc.exam_id = :exam_id';
      binds.exam_id = parseInt(req.query.exam_id, 10);
    }

    sql += ' ORDER BY sc.exam_date, sc.start_time';

    const result = await conn.execute(sql, binds);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/schedules error:', err.message);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/schedules - add new schedule
router.post('/', async (req, res) => {
  let conn;
  try {
    const {
      exam_id, centre_id, exam_date, start_time, end_time,
      hall_number, seats_available, shift
    } = req.body;

    if (!exam_id || !centre_id || !exam_date || !start_time || !end_time || seats_available == null || !shift) {
      return res.status(400).json({ error: 'Missing required fields: exam_id, centre_id, exam_date, start_time, end_time, seats_available, shift' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      INSERT INTO Schedule (exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift)
      VALUES (:exam_id, :centre_id, TO_DATE(:exam_date, 'YYYY-MM-DD'), :start_time, :end_time, :hall_number, :seats_available, :shift)
      RETURNING schedule_id INTO :id
    `, {
      exam_id,
      centre_id,
      exam_date,
      start_time,
      end_time,
      hall_number: hall_number || null,
      seats_available,
      shift,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ scheduleId: newId, message: 'Schedule created successfully' });
  } catch (err) {
    console.error('POST /api/schedules error:', err.message);
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid exam_id or centre_id' });
    }
    if (err.message.includes('ORA-02290')) {
      return res.status(400).json({ error: 'Invalid shift value. Must be Morning, Afternoon, or Evening' });
    }
    res.status(500).json({ error: 'Failed to create schedule' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
