# 🏋️ IronForge — Gym Management System
### Full-Stack DBMS Project · Node.js + Express + MySQL

---

## 📁 Project Structure

```
gym-management/
├── backend/
│   ├── server.js          # Express API server
│   └── db.js              # MySQL connection pool
├── frontend/
│   ├── index.html         # Single-page app
│   ├── css/style.css      # Dark theme styles
│   └── js/app.js          # Fetch + DOM logic
├── schema.sql             # DB schema + seed data
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### Step 1 — Database Setup
```bash
# Login to MySQL and run the schema
mysql -u root -p < schema.sql
```

Or manually in MySQL Workbench / CLI:
```sql
source /path/to/gym-management/schema.sql;
```

### Step 2 — Configure DB credentials
Edit `backend/db.js`:
```js
const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',        // ← your MySQL username
  password: '',            // ← your MySQL password
  database: 'gym_db',
});
```

### Step 3 — Install & Run
```bash
npm install
npm start
```

### Step 4 — Open in Browser
```
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | /api/dashboard    | Stats summary       |
| GET    | /api/members      | All members         |
| POST   | /api/members      | Add member          |
| DELETE | /api/members/:id  | Delete member       |
| GET    | /api/payments     | All payments        |
| POST   | /api/payments     | Record payment      |
| GET    | /api/workouts     | All workouts        |
| POST   | /api/workouts     | Add workout         |
| GET    | /api/dietplans    | All diet plans      |
| POST   | /api/dietplans    | Add diet plan       |
| GET    | /api/trainers     | All trainers        |

---

## 🗃️ Database Tables

| Table       | Columns                                          |
|-------------|--------------------------------------------------|
| members     | id, name, email, phone, gender, plan, join_date  |
| trainers    | id, name, specialty, experience, status          |
| payments    | id, member_id→, amount, mode, pay_date, status   |
| workouts    | id, member_id→, workout, frequency, difficulty   |
| diet_plans  | id, member_id→, diet_type, calories, notes       |

---

## ✨ Features
- 📊 Live dashboard with animated stat counters
- 👥 Member CRUD with avatar initials & badges
- 💳 Payment tracking with mode & status badges
- 🏃 Workout schedule with difficulty & trainer
- 🥗 Diet plans with calorie targets
- 🌑 Dark industrial theme with neon accents
- 🔔 Toast notifications for all actions
- ⚡ Error handling — no infinite loading states
