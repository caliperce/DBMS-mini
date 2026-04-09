const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/hall-tickets?student_id=X - get hall tickets for a student
router.get('/', async (req, res) => {
  let conn;
  try {
    const studentId = req.query.student_id ? parseInt(req.query.student_id, 10) : null;

    conn = await getConnection();

    let sql = `
      SELECT ht.ticket_id, ht.registration_id, ht.schedule_id,
             ht.roll_number, ht.seat_number,
             TO_CHAR(ht.issued_date, 'YYYY-MM-DD') AS issued_date,
             ht.is_valid, ht.qr_code,
             s.first_name || ' ' || s.last_name AS student_name,
             s.student_id,
             s.email AS student_email,
             s.photo_url,
             e.exam_name, e.exam_code, e.duration_minutes,
             ec.centre_name, ec.city AS centre_city, ec.address AS centre_address,
             TO_CHAR(sc.exam_date, 'YYYY-MM-DD') AS exam_date,
             sc.start_time, sc.end_time, sc.hall_number
      FROM Hall_Ticket ht
      JOIN Registration r ON ht.registration_id = r.registration_id
      JOIN Student s ON r.student_id = s.student_id
      JOIN Schedule sc ON ht.schedule_id = sc.schedule_id
      JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id
      JOIN Exam e ON r.exam_id = e.exam_id
    `;

    const binds = {};

    if (studentId) {
      sql += ' WHERE s.student_id = :student_id';
      binds.student_id = studentId;
    }

    sql += ' ORDER BY sc.exam_date, e.exam_name';

    const result = await conn.execute(sql, binds);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/hall-tickets error:', err.message);
    res.status(500).json({ error: 'Failed to fetch hall tickets' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/hall-tickets - generate hall ticket (with atomic seat decrement)
router.post('/', async (req, res) => {
  let conn;
  try {
    const { registration_id, schedule_id, roll_number, seat_number } = req.body;

    if (!registration_id || !schedule_id || !roll_number) {
      return res.status(400).json({ error: 'Missing required fields: registration_id, schedule_id, roll_number' });
    }

    conn = await getConnection();

    // Lock the schedule row and check seat availability
    const seatCheck = await conn.execute(
      `SELECT seats_available FROM Schedule WHERE schedule_id = :schedule_id FOR UPDATE`,
      { schedule_id }
    );

    if (seatCheck.rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const seatsAvailable = Number(seatCheck.rows[0].SEATS_AVAILABLE);
    if (seatsAvailable <= 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'No seats available for this schedule' });
    }

    // Decrement seats atomically
    await conn.execute(
      `UPDATE Schedule SET seats_available = seats_available - 1 WHERE schedule_id = :schedule_id AND seats_available > 0`,
      { schedule_id }
    );

    // Generate QR code placeholder
    const qrCode = `NEMS-${roll_number}-${Date.now()}`;

    const result = await conn.execute(`
      INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid, qr_code)
      VALUES (:registration_id, :schedule_id, :roll_number, :seat_number, SYSDATE, 1, :qr_code)
      RETURNING ticket_id INTO :id
    `, {
      registration_id,
      schedule_id,
      roll_number,
      seat_number: seat_number || null,
      qr_code: qrCode,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    });

    // Commit the entire transaction (seat decrement + hall ticket insert)
    await conn.commit();

    const newId = result.outBinds.id[0];
    res.status(201).json({ ticketId: newId, qrCode, message: 'Hall ticket generated successfully' });
  } catch (err) {
    // Rollback on any error so the seat decrement is undone
    if (conn) {
      try { await conn.rollback(); } catch (rbErr) { /* ignore rollback error */ }
    }
    console.error('POST /api/hall-tickets error:', err.message);
    if (err.message.includes('ORA-00001')) {
      return res.status(400).json({ error: 'A hall ticket already exists for this registration or roll number is taken' });
    }
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({ error: 'Invalid registration_id or schedule_id' });
    }
    res.status(500).json({ error: 'Failed to generate hall ticket' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
