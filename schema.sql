DROP DATABASE IF EXISTS gym_db;
CREATE DATABASE gym_db;
USE gym_db;

-- ─── MEMBERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  gender      ENUM('Male','Female','Other') NOT NULL,
  plan        ENUM('Basic','Standard','Premium') NOT NULL,
  join_date   DATE NOT NULL,
  status      ENUM('Active','Inactive') DEFAULT 'Active'
);

-- ─── TRAINERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  specialty   VARCHAR(100),
  experience  INT COMMENT 'years',
  status      ENUM('Active','Inactive') DEFAULT 'Active'
);

-- ─── PAYMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  mode        ENUM('Cash','Card','UPI','Net Banking') NOT NULL,
  pay_date    DATE NOT NULL,
  status      ENUM('Paid','Pending','Failed') DEFAULT 'Paid',
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- ─── WORKOUT SCHEDULE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS workouts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  workout     VARCHAR(100) NOT NULL,
  frequency   ENUM('Daily','3x/Week','5x/Week','Weekends') NOT NULL,
  difficulty  ENUM('Beginner','Intermediate','Advanced') NOT NULL,
  trainer_id  INT,
  FOREIGN KEY (member_id)  REFERENCES members(id)  ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- ─── DIET PLANS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diet_plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  diet_type   ENUM('Keto','Vegan','High Protein','Balanced','Low Carb') NOT NULL,
  calories    INT NOT NULL,
  notes       VARCHAR(255),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- ============================================================
--  SEED DATA
-- ============================================================

INSERT INTO members (name, email, phone, gender, plan, join_date, status) VALUES
('Arjun Sharma',     'arjun.sharma@email.com',   '9876543210', 'Male',   'Premium',  '2024-01-15', 'Active'),
('Priya Nair',       'priya.nair@email.com',      '9876543211', 'Female', 'Standard', '2024-02-20', 'Active'),
('Rohan Mehta',      'rohan.mehta@email.com',     '9876543212', 'Male',   'Basic',    '2024-03-10', 'Active'),
('Sneha Reddy',      'sneha.reddy@email.com',     '9876543213', 'Female', 'Premium',  '2024-01-28', 'Active'),
('Karthik Iyer',     'karthik.iyer@email.com',    '9876543214', 'Male',   'Standard', '2024-04-05', 'Active'),
('Deepa Krishnan',   'deepa.krishnan@email.com',  '9876543215', 'Female', 'Basic',    '2024-05-12', 'Inactive'),
('Vijay Anand',      'vijay.anand@email.com',     '9876543216', 'Male',   'Premium',  '2024-02-18', 'Active'),
('Meera Pillai',     'meera.pillai@email.com',    '9876543217', 'Female', 'Standard', '2024-06-01', 'Active'),
('Sanjay Gupta',     'sanjay.gupta@email.com',    '9876543218', 'Male',   'Basic',    '2024-03-22', 'Active'),
('Anjali Singh',     'anjali.singh@email.com',    '9876543219', 'Female', 'Premium',  '2024-07-08', 'Active'),
('Rahul Verma',      'rahul.verma@email.com',     '9876543220', 'Male',   'Standard', '2024-04-15', 'Active'),
('Lakshmi Devi',     'lakshmi.devi@email.com',    '9876543221', 'Female', 'Basic',    '2024-08-03', 'Inactive');

INSERT INTO trainers (name, specialty, experience, status) VALUES
('Coach Ramesh',   'Strength Training',   8,  'Active'),
('Coach Sunita',   'Cardio & Aerobics',   5,  'Active'),
('Coach Prakash',  'Yoga & Flexibility',  12, 'Active'),
('Coach Divya',    'Weight Loss',         6,  'Active'),
('Coach Aryan',    'CrossFit',            4,  'Active'),
('Coach Nalini',   'Zumba & Dance',       7,  'Inactive');

INSERT INTO payments (member_id, amount, mode, pay_date, status) VALUES
(1,  2999.00, 'Card',        '2025-04-29', 'Paid'),
(2,  1999.00, 'UPI',         '2025-04-29', 'Paid'),
(3,   999.00, 'Cash',        '2025-04-28', 'Paid'),
(4,  2999.00, 'Net Banking', '2025-04-28', 'Paid'),
(5,  1999.00, 'UPI',         '2025-04-27', 'Paid'),
(6,   999.00, 'Cash',        '2025-04-26', 'Pending'),
(7,  2999.00, 'Card',        '2025-04-25', 'Paid'),
(8,  1999.00, 'UPI',         '2025-04-24', 'Paid'),
(9,   999.00, 'Cash',        '2025-04-23', 'Paid'),
(10, 2999.00, 'Card',        '2025-04-29', 'Paid'),
(11, 1999.00, 'Net Banking', '2025-04-22', 'Paid'),
(12,  999.00, 'UPI',         '2025-04-21', 'Failed');

INSERT INTO workouts (member_id, workout, frequency, difficulty, trainer_id) VALUES
(1,  'Powerlifting',      'Daily',     'Advanced',     1),
(2,  'Treadmill Cardio',  '5x/Week',   'Intermediate', 2),
(3,  'Full Body HIIT',    '3x/Week',   'Beginner',     5),
(4,  'Yoga Flow',         'Daily',     'Intermediate', 3),
(5,  'CrossFit WOD',      '5x/Week',   'Advanced',     5),
(6,  'Zumba Dance',       'Weekends',  'Beginner',     6),
(7,  'Deadlifts & Squats','Daily',     'Advanced',     1),
(8,  'Pilates Core',      '3x/Week',   'Intermediate', 4),
(9,  'Cycling Cardio',    '3x/Week',   'Beginner',     2),
(10, 'Olympic Lifting',   'Daily',     'Advanced',     1),
(11, 'Functional Fitness','5x/Week',   'Intermediate', 5),
(12, 'Stretching & Yoga', 'Weekends',  'Beginner',     3);

INSERT INTO diet_plans (member_id, diet_type, calories, notes) VALUES
(1,  'High Protein', 3200, 'Focus on lean meats, eggs, and legumes'),
(2,  'Balanced',     1800, 'Equal macros; avoid processed foods'),
(3,  'Keto',         2000, 'Low carb; high healthy fats'),
(4,  'Vegan',        1600, 'Plant-based; supplement B12 and iron'),
(5,  'High Protein', 2800, 'Pre/post workout protein shakes'),
(6,  'Low Carb',     1400, 'Weight-loss focused; salads and grilled'),
(7,  'High Protein', 3500, 'Bulk phase; calorie surplus'),
(8,  'Balanced',     1700, 'Mediterranean style'),
(9,  'Low Carb',     1600, 'Reduce rice; increase vegetables'),
(10, 'High Protein', 3000, 'Elite athlete diet plan'),
(11, 'Keto',         2200, 'Strict keto with cheat meal on Sunday'),
(12, 'Vegan',        1500, 'Detox and cleanse programme');
