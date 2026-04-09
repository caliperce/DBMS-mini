const express = require('express');
const router = express.Router();
const { getConnection, transformRows, transformRow, oracledb } = require('../db');

// GET /api/students - list all students
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT student_id, first_name, last_name,
             TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
             gender, email, phone, address, nationality, category, photo_url,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM Student
      ORDER BY student_id
    `);
    res.json(transformRows(result.rows));
  } catch (err) {
    console.error('GET /api/students error:', err.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /api/students/:id - get student by ID
router.get('/:id', async (req, res) => {
  let conn;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid student ID' });

    conn = await getConnection();
    const result = await conn.execute(`
      SELECT student_id, first_name, last_name,
             TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
             gender, email, phone, address, nationality, category, photo_url,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM Student
      WHERE student_id = :id
    `, { id });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(transformRow(result.rows[0]));
  } catch (err) {
    console.error('GET /api/students/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch student' });
  } finally {
    if (conn) await conn.close();
  }
});

// POST /api/students - add new student
router.post('/', async (req, res) => {
  let conn;
  try {
    const { first_name, last_name, date_of_birth, gender, email, phone, address, nationality, category } = req.body;

    if (!first_name || !last_name || !date_of_birth || !gender || !email) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, date_of_birth, gender, email' });
    }

    conn = await getConnection();
    const result = await conn.execute(`
      INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, address, nationality, category)
      VALUES (:first_name, :last_name, TO_DATE(:date_of_birth, 'YYYY-MM-DD'), :gender, :email, :phone, :address, :nationality, :category)
      RETURNING student_id INTO :id
    `, {
      first_name,
      last_name,
      date_of_birth,
      gender,
      email,
      phone: phone || null,
      address: address || null,
      nationality: nationality || null,
      category: category || 'General',
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }, { autoCommit: true });

    const newId = result.outBinds.id[0];
    res.status(201).json({ studentId: newId, message: 'Student created successfully' });
  } catch (err) {
    console.error('POST /api/students error:', err.message);
    if (err.message.includes('ORA-00001')) {
      return res.status(400).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
