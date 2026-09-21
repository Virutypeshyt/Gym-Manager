const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const db       = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ──────────────────────────────────────────────────────────
//  DASHBOARD
// ──────────────────────────────────────────────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    const [[{ totalMembers }]] = await db.query(
      `SELECT COUNT(*) AS totalMembers FROM members`
    );
    const [[{ activeTrainers }]] = await db.query(
      `SELECT COUNT(*) AS activeTrainers FROM trainers WHERE status = 'Active'`
    );
    const [[{ totalRevenue }]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM payments WHERE status = 'Paid'`
    );
    const [[{ paymentsToday }]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS paymentsToday
       FROM payments WHERE status = 'Paid' AND pay_date = CURDATE()`
    );

    res.json({
      totalMembers:   totalMembers   || 0,
      activeTrainers: activeTrainers || 0,
      totalRevenue:   totalRevenue   || 0,
      paymentsToday:  paymentsToday  || 0,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
//  MEMBERS
// ──────────────────────────────────────────────────────────
app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, gender, plan,
              DATE_FORMAT(join_date, '%d %b %Y') AS join_date, status
       FROM members ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Members error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  const { name, email, phone, gender, plan, join_date, status } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO members (name, email, phone, gender, plan, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, gender, plan, join_date, status || 'Active']
    );
    res.json({ id: result.insertId, message: 'Member added' });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM members WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
//  PAYMENTS
// ──────────────────────────────────────────────────────────
app.get('/api/payments', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, m.name AS member, p.amount, p.mode,
              DATE_FORMAT(p.pay_date, '%d %b %Y') AS pay_date, p.status
       FROM payments p
       JOIN members m ON p.member_id = m.id
       ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Payments error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  const { member_id, amount, mode, pay_date, status } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO payments (member_id, amount, mode, pay_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [member_id, amount, mode, pay_date, status || 'Paid']
    );
    res.json({ id: result.insertId, message: 'Payment added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
//  WORKOUTS
// ──────────────────────────────────────────────────────────
app.get('/api/workouts', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT w.id, m.name AS member, w.workout, w.frequency,
              w.difficulty, t.name AS trainer
       FROM workouts w
       JOIN members m ON w.member_id = m.id
       LEFT JOIN trainers t ON w.trainer_id = t.id
       ORDER BY w.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Workouts error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workouts', async (req, res) => {
  const { member_id, workout, frequency, difficulty, trainer_id } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO workouts (member_id, workout, frequency, difficulty, trainer_id)
       VALUES (?, ?, ?, ?, ?)`,
      [member_id, workout, frequency, difficulty, trainer_id || null]
    );
    res.json({ id: result.insertId, message: 'Workout added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
//  DIET PLANS
// ──────────────────────────────────────────────────────────
app.get('/api/dietplans', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.id, m.name AS member, d.diet_type, d.calories, d.notes
       FROM diet_plans d
       JOIN members m ON d.member_id = m.id
       ORDER BY d.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Diet plans error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dietplans', async (req, res) => {
  const { member_id, diet_type, calories, notes } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO diet_plans (member_id, diet_type, calories, notes)
       VALUES (?, ?, ?, ?)`,
      [member_id, diet_type, calories, notes || '']
    );
    res.json({ id: result.insertId, message: 'Diet plan added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
//  TRAINERS (bonus endpoint for dropdowns)
// ──────────────────────────────────────────────────────────
app.get('/api/trainers', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name, specialty, experience, status FROM trainers ORDER BY id`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
//  SERVE FRONTEND
// ──────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`🏋️  Gym Management Server running at http://localhost:${PORT}`);
});
