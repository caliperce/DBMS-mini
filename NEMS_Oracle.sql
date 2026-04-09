-- ============================================================
-- National Examination Management System (NEMS)
-- Oracle SQL*Plus Compatible Script
-- ============================================================
-- Run with: @NEMS_Oracle.sql   (from SQL*Plus)
-- ============================================================

SET SERVEROUTPUT ON
SET DEFINE OFF

-- ============================================================
-- SECTION 1: DROP EXISTING TABLES (clean slate)
-- ============================================================
-- Drop in reverse dependency order

BEGIN
   FOR t IN (
      SELECT table_name FROM user_tables
      WHERE table_name IN (
         'RESPONSE','QUESTION','GRIEVANCE','RESULT',
         'HALL_TICKET','SCHEDULE','EXAM_CENTRE','REGISTRATION',
         'EXAM','STUDENT'
      )
   ) LOOP
      EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
   END LOOP;
END;
/

-- ============================================================
-- SECTION 2: DDL - TABLE CREATION
-- ============================================================

-- Listing 15.1: Create Student Table
CREATE TABLE Student (
    student_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name    VARCHAR2(50)   NOT NULL,
    last_name     VARCHAR2(50)   NOT NULL,
    date_of_birth DATE           NOT NULL,
    gender        CHAR(1)        NOT NULL,
    email         VARCHAR2(100)  NOT NULL UNIQUE,
    phone         VARCHAR2(15),
    address       CLOB,
    nationality   VARCHAR2(50),
    category      VARCHAR2(20)   DEFAULT 'General',
    photo_url     VARCHAR2(255),
    created_at    TIMESTAMP      DEFAULT SYSTIMESTAMP,
    CONSTRAINT chk_student_gender CHECK (gender IN ('M','F','O'))
);

-- Listing 15.2: Create Exam Table
CREATE TABLE Exam (
    exam_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_name        VARCHAR2(100)  NOT NULL,
    exam_code        VARCHAR2(20)   NOT NULL UNIQUE,
    conducting_body  VARCHAR2(100)  NOT NULL,
    total_marks      NUMBER         NOT NULL,
    passing_marks    NUMBER         NOT NULL,
    duration_minutes NUMBER         NOT NULL,
    exam_level       VARCHAR2(20)   DEFAULT 'National',
    description      CLOB,
    is_active        NUMBER(1)      DEFAULT 1,
    CONSTRAINT chk_exam_active CHECK (is_active IN (0, 1))
);

-- Listing 15.3: Create Registration Table
CREATE TABLE Registration (
    registration_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id        NUMBER         NOT NULL,
    exam_id           NUMBER         NOT NULL,
    registration_date DATE           DEFAULT SYSDATE NOT NULL,
    fee_paid          NUMBER(1)      DEFAULT 0 NOT NULL,
    payment_ref       VARCHAR2(50),
    status            VARCHAR2(20)   DEFAULT 'Pending' NOT NULL,
    attempt_number    NUMBER         DEFAULT 1 NOT NULL,
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id)
        REFERENCES Student(student_id),
    CONSTRAINT fk_reg_exam FOREIGN KEY (exam_id)
        REFERENCES Exam(exam_id),
    CONSTRAINT uq_reg_student_exam_attempt UNIQUE (student_id, exam_id, attempt_number),
    CONSTRAINT chk_reg_status CHECK (status IN ('Pending','Confirmed','Cancelled')),
    CONSTRAINT chk_reg_fee CHECK (fee_paid IN (0, 1))
);

-- Listing 15.4: Create Exam_Centre Table
CREATE TABLE Exam_Centre (
    centre_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    centre_name    VARCHAR2(100)  NOT NULL,
    address        CLOB           NOT NULL,
    city           VARCHAR2(50)   NOT NULL,
    state          VARCHAR2(50)   NOT NULL,
    pincode        VARCHAR2(10),
    total_capacity NUMBER         NOT NULL,
    contact_person VARCHAR2(100),
    contact_phone  VARCHAR2(15),
    is_active      NUMBER(1)      DEFAULT 1,
    CONSTRAINT chk_centre_active CHECK (is_active IN (0, 1))
);

-- Listing 15.5: Create Schedule Table
CREATE TABLE Schedule (
    schedule_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id         NUMBER         NOT NULL,
    centre_id       NUMBER         NOT NULL,
    exam_date       DATE           NOT NULL,
    start_time      VARCHAR2(8)    NOT NULL,
    end_time        VARCHAR2(8)    NOT NULL,
    hall_number     VARCHAR2(20),
    seats_available NUMBER         NOT NULL,
    shift           VARCHAR2(10)   NOT NULL,
    CONSTRAINT fk_sched_exam FOREIGN KEY (exam_id)
        REFERENCES Exam(exam_id),
    CONSTRAINT fk_sched_centre FOREIGN KEY (centre_id)
        REFERENCES Exam_Centre(centre_id),
    CONSTRAINT chk_seats_avail CHECK (seats_available >= 0),
    CONSTRAINT chk_shift CHECK (shift IN ('Morning','Afternoon','Evening'))
);

-- Listing 15.6: Create Hall_Ticket Table
CREATE TABLE Hall_Ticket (
    ticket_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_id NUMBER         NOT NULL UNIQUE,
    schedule_id     NUMBER         NOT NULL,
    roll_number     VARCHAR2(20)   NOT NULL UNIQUE,
    seat_number     VARCHAR2(10),
    issued_date     DATE           DEFAULT SYSDATE NOT NULL,
    is_valid        NUMBER(1)      DEFAULT 1,
    qr_code         VARCHAR2(255),
    CONSTRAINT fk_ht_registration FOREIGN KEY (registration_id)
        REFERENCES Registration(registration_id),
    CONSTRAINT fk_ht_schedule FOREIGN KEY (schedule_id)
        REFERENCES Schedule(schedule_id),
    CONSTRAINT chk_ht_valid CHECK (is_valid IN (0, 1))
);

-- Listing 15.7: Create Result Table
CREATE TABLE Result (
    result_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_id NUMBER         NOT NULL UNIQUE,
    marks_obtained  NUMBER(6,2)    NOT NULL,
    grade           VARCHAR2(5),
    percentile      NUMBER(5,2),
    rank_position   NUMBER,
    result_status   VARCHAR2(10)   NOT NULL,
    published_date  DATE,
    remarks         CLOB,
    CONSTRAINT fk_res_registration FOREIGN KEY (registration_id)
        REFERENCES Registration(registration_id),
    CONSTRAINT chk_marks_positive CHECK (marks_obtained >= 0),
    CONSTRAINT chk_result_status CHECK (result_status IN ('Pass','Fail','Absent','Withheld'))
);

-- Listing 15.8: Create Grievance Table
CREATE TABLE Grievance (
    grievance_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id       NUMBER         NOT NULL,
    result_id        NUMBER         DEFAULT NULL,
    grievance_type   VARCHAR2(50)   NOT NULL,
    description      CLOB           NOT NULL,
    filed_date       DATE           DEFAULT SYSDATE NOT NULL,
    status           VARCHAR2(20)   DEFAULT 'Open' NOT NULL,
    resolved_date    DATE,
    resolution_notes CLOB,
    CONSTRAINT fk_grv_student FOREIGN KEY (student_id)
        REFERENCES Student(student_id),
    CONSTRAINT fk_grv_result FOREIGN KEY (result_id)
        REFERENCES Result(result_id) ON DELETE SET NULL,
    CONSTRAINT chk_grv_status CHECK (status IN ('Open','Under Review','Resolved'))
);

-- Listing 15.9: Create Question Table
CREATE TABLE Question (
    question_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id          NUMBER         NOT NULL,
    question_text    CLOB           NOT NULL,
    question_type    VARCHAR2(20)   NOT NULL,
    correct_answer   CLOB           NOT NULL,
    marks            NUMBER(4,1)    NOT NULL,
    negative_marks   NUMBER(4,1)    DEFAULT 0,
    difficulty_level VARCHAR2(10),
    subject_area     VARCHAR2(50),
    CONSTRAINT fk_q_exam FOREIGN KEY (exam_id)
        REFERENCES Exam(exam_id) ON DELETE CASCADE,
    CONSTRAINT chk_difficulty CHECK (difficulty_level IN ('Easy','Medium','Hard'))
);

-- Listing 15.10: Create Response Table
CREATE TABLE Response (
    response_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_id NUMBER         NOT NULL,
    question_id     NUMBER         NOT NULL,
    answer_given    CLOB,
    is_correct      NUMBER(1),
    marks_awarded   NUMBER(4,1),
    time_taken_secs NUMBER,
    CONSTRAINT fk_resp_registration FOREIGN KEY (registration_id)
        REFERENCES Registration(registration_id),
    CONSTRAINT fk_resp_question FOREIGN KEY (question_id)
        REFERENCES Question(question_id),
    CONSTRAINT uq_resp_reg_question UNIQUE (registration_id, question_id),
    CONSTRAINT chk_resp_correct CHECK (is_correct IN (0, 1))
);

-- ============================================================
-- SECTION 3: DML - SAMPLE DATA INSERTION
-- ============================================================

-- Insert Students
INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, nationality, category)
VALUES ('Arjun', 'Sharma', TO_DATE('2002-06-15','YYYY-MM-DD'), 'M', 'arjun.sharma@email.com', '9876543210', 'Indian', 'General');

INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, nationality, category)
VALUES ('Priya', 'Patel', TO_DATE('2001-09-22','YYYY-MM-DD'), 'F', 'priya.patel@email.com', '9876543211', 'Indian', 'OBC');

INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, nationality, category)
VALUES ('Rahul', 'Kumar', TO_DATE('2003-01-10','YYYY-MM-DD'), 'M', 'rahul.kumar@email.com', '9876543212', 'Indian', 'SC');

INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, nationality, category)
VALUES ('Ananya', 'Reddy', TO_DATE('2002-03-28','YYYY-MM-DD'), 'F', 'ananya.reddy@email.com', '9876543213', 'Indian', 'General');

INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, nationality, category)
VALUES ('Vikram', 'Singh', TO_DATE('2001-12-05','YYYY-MM-DD'), 'M', 'vikram.singh@email.com', '9876543214', 'Indian', 'EWS');

-- Insert Exams
INSERT INTO Exam (exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, is_active)
VALUES ('Joint Entrance Examination', 'JEE2024', 'National Testing Agency', 300, 90, 180, 'National', 1);

INSERT INTO Exam (exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, is_active)
VALUES ('National Eligibility cum Entrance Test', 'NEET2024', 'National Testing Agency', 720, 360, 200, 'National', 1);

INSERT INTO Exam (exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, is_active)
VALUES ('Common Admission Test', 'CAT2024', 'IIM Bangalore', 228, 100, 120, 'National', 1);

-- Insert Exam Centres
INSERT INTO Exam_Centre (centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active)
VALUES ('SSN College of Engineering', '603 110 Kalavakkam', 'Chennai', 'Tamil Nadu', '603110', 500, 'Dr. Ramesh', '9800000001', 1);

INSERT INTO Exam_Centre (centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active)
VALUES ('IIT Delhi Main Hall', 'Hauz Khas, New Delhi', 'New Delhi', 'Delhi', '110016', 800, 'Prof. Gupta', '9800000002', 1);

INSERT INTO Exam_Centre (centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active)
VALUES ('Presidency College Hall', 'College Road, Chennai', 'Chennai', 'Tamil Nadu', '600005', 600, 'Dr. Lakshmi', '9800000003', 1);

-- Insert Registrations
INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (1, 1, TO_DATE('2024-01-15','YYYY-MM-DD'), 1, 'TXN2024JEE001', 'Confirmed', 1);

INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (2, 1, TO_DATE('2024-01-16','YYYY-MM-DD'), 1, 'TXN2024JEE002', 'Confirmed', 1);

INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (3, 1, TO_DATE('2024-01-17','YYYY-MM-DD'), 1, 'TXN2024JEE003', 'Confirmed', 1);

INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (4, 2, TO_DATE('2024-02-01','YYYY-MM-DD'), 1, 'TXN2024NEET001', 'Confirmed', 1);

INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (5, 2, TO_DATE('2024-02-02','YYYY-MM-DD'), 0, NULL, 'Pending', 1);

INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (1, 3, TO_DATE('2024-03-01','YYYY-MM-DD'), 1, 'TXN2024CAT001', 'Confirmed', 1);

INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number)
VALUES (3, 2, TO_DATE('2024-02-05','YYYY-MM-DD'), 1, 'TXN2024NEET002', 'Confirmed', 1);

-- Insert Schedules
INSERT INTO Schedule (exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift)
VALUES (1, 1, TO_DATE('2024-04-10','YYYY-MM-DD'), '09:00:00', '12:00:00', 'H1', 120, 'Morning');

INSERT INTO Schedule (exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift)
VALUES (1, 2, TO_DATE('2024-04-10','YYYY-MM-DD'), '14:00:00', '17:00:00', 'A1', 200, 'Afternoon');

INSERT INTO Schedule (exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift)
VALUES (2, 1, TO_DATE('2024-05-05','YYYY-MM-DD'), '09:00:00', '12:20:00', 'H2', 150, 'Morning');

INSERT INTO Schedule (exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift)
VALUES (2, 3, TO_DATE('2024-05-05','YYYY-MM-DD'), '09:00:00', '12:20:00', 'P1', 180, 'Morning');

INSERT INTO Schedule (exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift)
VALUES (3, 2, TO_DATE('2024-11-24','YYYY-MM-DD'), '14:00:00', '16:00:00', 'B1', 100, 'Afternoon');

-- Insert Hall Tickets
INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid)
VALUES (1, 1, 'JEE2024-0001', 'S-12', TO_DATE('2024-03-25','YYYY-MM-DD'), 1);

INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid)
VALUES (2, 2, 'JEE2024-0002', 'A-45', TO_DATE('2024-03-25','YYYY-MM-DD'), 1);

INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid)
VALUES (3, 1, 'JEE2024-0003', 'S-13', TO_DATE('2024-03-25','YYYY-MM-DD'), 1);

INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid)
VALUES (4, 3, 'NEET2024-0001', 'H2-01', TO_DATE('2024-04-20','YYYY-MM-DD'), 1);

INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid)
VALUES (6, 5, 'CAT2024-0001', 'B-22', TO_DATE('2024-11-10','YYYY-MM-DD'), 1);

INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid)
VALUES (7, 4, 'NEET2024-0002', 'P1-05', TO_DATE('2024-04-20','YYYY-MM-DD'), 1);

-- Insert Results
INSERT INTO Result (registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks)
VALUES (1, 245.50, 'A', 98.50, 1520, 'Pass', TO_DATE('2024-05-15','YYYY-MM-DD'), 'Excellent performance');

INSERT INTO Result (registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks)
VALUES (2, 180.00, 'B', 85.30, 15200, 'Pass', TO_DATE('2024-05-15','YYYY-MM-DD'), NULL);

INSERT INTO Result (registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks)
VALUES (3, 65.00, 'D', 40.10, 98000, 'Fail', TO_DATE('2024-05-15','YYYY-MM-DD'), 'Below passing marks');

INSERT INTO Result (registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks)
VALUES (4, 580.00, 'A', 96.70, 5600, 'Pass', TO_DATE('2024-06-10','YYYY-MM-DD'), NULL);

INSERT INTO Result (registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks)
VALUES (7, 420.00, 'B', 78.20, 45000, 'Pass', TO_DATE('2024-06-10','YYYY-MM-DD'), NULL);

-- Insert Grievances
INSERT INTO Grievance (student_id, result_id, grievance_type, description, filed_date, status)
VALUES (3, 3, 'Result', 'My marks seem incorrect. I request re-evaluation of Paper 2.', TO_DATE('2024-05-20','YYYY-MM-DD'), 'Open');

INSERT INTO Grievance (student_id, result_id, grievance_type, description, filed_date, status, resolved_date, resolution_notes)
VALUES (2, 2, 'Result', 'Percentile calculation appears wrong.', TO_DATE('2024-05-18','YYYY-MM-DD'), 'Resolved', TO_DATE('2024-05-25','YYYY-MM-DD'), 'Percentile verified and found correct. No change required.');

INSERT INTO Grievance (student_id, result_id, grievance_type, description, filed_date, status)
VALUES (5, NULL, 'Registration', 'Payment was deducted but registration shows Pending.', TO_DATE('2024-02-10','YYYY-MM-DD'), 'Under Review');

-- Insert Questions (for JEE - exam_id = 1)
INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (1, 'What is the derivative of sin(x)?', 'MCQ', 'cos(x)', 4, 1, 'Easy', 'Mathematics');

INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (1, 'The SI unit of force is?', 'MCQ', 'Newton', 4, 1, 'Easy', 'Physics');

INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (1, 'What is the hybridization of carbon in methane?', 'MCQ', 'sp3', 4, 1, 'Medium', 'Chemistry');

INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (1, 'Evaluate the integral of e^x dx.', 'Numerical', 'e^x + C', 4, 0, 'Medium', 'Mathematics');

INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (1, 'Explain the Heisenberg Uncertainty Principle.', 'Short', 'Position and momentum cannot be simultaneously measured with arbitrary precision.', 4, 0, 'Hard', 'Physics');

-- Insert Questions (for NEET - exam_id = 2)
INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (2, 'What is the powerhouse of the cell?', 'MCQ', 'Mitochondria', 4, 1, 'Easy', 'Biology');

INSERT INTO Question (exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area)
VALUES (2, 'Which blood group is the universal donor?', 'MCQ', 'O negative', 4, 1, 'Easy', 'Biology');

-- Insert Responses (Student 1 answering JEE questions)
INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (1, 1, 'cos(x)', 1, 4, 45);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (1, 2, 'Newton', 1, 4, 30);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (1, 3, 'sp3', 1, 4, 60);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (1, 4, 'e^x + C', 1, 4, 90);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (1, 5, 'It is about uncertainty in quantum mechanics.', 0, 2, 120);

-- Student 2 answering JEE questions
INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (2, 1, 'cos(x)', 1, 4, 50);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (2, 2, 'Joule', 0, -1, 25);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (2, 3, 'sp2', 0, -1, 55);

-- Student 3 answering JEE questions
INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (3, 1, '-cos(x)', 0, -1, 40);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (3, 2, 'Newton', 1, 4, 35);

-- Student 4 answering NEET questions
INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (4, 6, 'Mitochondria', 1, 4, 20);

INSERT INTO Response (registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs)
VALUES (4, 7, 'O negative', 1, 4, 25);

COMMIT;

-- ============================================================
-- SECTION 4: DML - UPDATE QUERY
-- ============================================================

-- Listing 15.13: Update registration status after payment
UPDATE Registration
SET fee_paid    = 1,
    payment_ref = 'TXN2024ABC123',
    status      = 'Confirmed'
WHERE registration_id = 5;

COMMIT;

-- ============================================================
-- SECTION 5: ANALYTICS AND REPORT QUERIES
-- ============================================================

-- Listing 15.14: List all confirmed registrations for a specific exam (JEE, exam_id=1)
SELECT s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       s.email,
       r.registration_id,
       r.registration_date,
       r.attempt_number
FROM Registration r
JOIN Student s ON r.student_id = s.student_id
WHERE r.exam_id = 1
  AND r.status  = 'Confirmed'
ORDER BY s.last_name, s.first_name;

-- Listing 15.15: Generate rank list for an exam (JEE, exam_id=1)
SELECT s.first_name || ' ' || s.last_name AS student_name,
       ht.roll_number,
       res.marks_obtained,
       res.grade,
       res.percentile,
       RANK() OVER (ORDER BY res.marks_obtained DESC) AS computed_rank
FROM Result res
JOIN Registration r  ON res.registration_id = r.registration_id
JOIN Student s       ON r.student_id         = s.student_id
JOIN Hall_Ticket ht  ON ht.registration_id   = r.registration_id
WHERE r.exam_id         = 1
  AND res.result_status = 'Pass'
ORDER BY res.marks_obtained DESC;

-- Listing 15.16: Count students by category for an exam (JEE, exam_id=1)
SELECT s.category,
       COUNT(*) AS num_registered
FROM Registration r
JOIN Student s ON r.student_id = s.student_id
WHERE r.exam_id = 1
GROUP BY s.category
ORDER BY num_registered DESC;

-- Listing 15.17: Find seats available per centre for an exam (JEE, exam_id=1)
SELECT ec.centre_name,
       ec.city,
       sc.hall_number,
       sc.shift,
       sc.exam_date,
       sc.seats_available
FROM Schedule sc
JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id
WHERE sc.exam_id          = 1
  AND sc.seats_available  > 0
ORDER BY ec.city, sc.exam_date, sc.shift;

-- Listing 15.18: Retrieve a student's hall ticket details (student_id=1)
SELECT s.first_name || ' ' || s.last_name AS student_name,
       ht.roll_number,
       ht.seat_number,
       ec.centre_name,
       ec.city AS centre_city,
       sc.exam_date,
       sc.start_time,
       sc.end_time,
       sc.hall_number,
       e.exam_name
FROM Hall_Ticket ht
JOIN Registration r  ON ht.registration_id = r.registration_id
JOIN Student s       ON r.student_id        = s.student_id
JOIN Schedule sc     ON ht.schedule_id      = sc.schedule_id
JOIN Exam_Centre ec  ON sc.centre_id        = ec.centre_id
JOIN Exam e          ON r.exam_id           = e.exam_id
WHERE s.student_id = 1;

-- Listing 15.19: Average marks per subject area for an exam (JEE, exam_id=1)
SELECT q.subject_area,
       COUNT(rsp.response_id) AS responses,
       ROUND(AVG(rsp.marks_awarded), 2) AS avg_marks,
       MAX(rsp.marks_awarded) AS max_marks,
       MIN(rsp.marks_awarded) AS min_marks
FROM Response rsp
JOIN Question q ON rsp.question_id = q.question_id
WHERE q.exam_id = 1
GROUP BY q.subject_area
ORDER BY avg_marks DESC;

-- Listing 15.20: List open grievances with student and result info
SELECT g.grievance_id,
       s.first_name || ' ' || s.last_name AS student_name,
       g.grievance_type,
       g.filed_date,
       g.status,
       res.marks_obtained,
       res.result_status
FROM Grievance g
JOIN Student s        ON g.student_id  = s.student_id
LEFT JOIN Result res  ON g.result_id   = res.result_id
WHERE g.status <> 'Resolved'
ORDER BY g.filed_date ASC;

-- Listing 15.21: Pass percentage per exam centre (JEE, exam_id=1)
SELECT ec.centre_name,
       ec.city,
       COUNT(res.result_id) AS total_appeared,
       SUM(CASE WHEN res.result_status = 'Pass' THEN 1 ELSE 0 END) AS passed,
       ROUND(
           100.0 * SUM(CASE WHEN res.result_status = 'Pass' THEN 1 ELSE 0 END)
           / COUNT(res.result_id), 2
       ) AS pass_pct
FROM Result res
JOIN Registration reg ON res.registration_id = reg.registration_id
JOIN Hall_Ticket ht   ON ht.registration_id  = reg.registration_id
JOIN Schedule sc      ON ht.schedule_id      = sc.schedule_id
JOIN Exam_Centre ec   ON sc.centre_id        = ec.centre_id
WHERE reg.exam_id = 1
GROUP BY ec.centre_id, ec.centre_name, ec.city
ORDER BY pass_pct DESC;

-- ============================================================
-- SECTION 6: CONCURRENCY - ATOMIC SEAT BOOKING
-- (Listing 17.1 from report - Oracle version)
-- ============================================================
-- NOTE: In Oracle SQL*Plus, run this as a transaction block.
-- This demonstrates the seat booking pattern.
-- Uncomment to run:

-- SELECT seats_available
-- FROM Schedule
-- WHERE schedule_id = 1
-- FOR UPDATE;
--
-- UPDATE Schedule
-- SET seats_available = seats_available - 1
-- WHERE schedule_id     = 1
--   AND seats_available > 0;
--
-- -- Only insert if the UPDATE affected 1 row (check SQL%ROWCOUNT in PL/SQL)
-- INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, issued_date)
-- VALUES (5, 1, 'JEE2024-0004', SYSDATE);
--
-- COMMIT;

-- ============================================================
-- SECTION 7: VERIFICATION QUERIES
-- ============================================================

-- Verify all tables were created
SELECT table_name FROM user_tables
WHERE table_name IN ('STUDENT','EXAM','REGISTRATION','EXAM_CENTRE',
                     'SCHEDULE','HALL_TICKET','RESULT','GRIEVANCE',
                     'QUESTION','RESPONSE')
ORDER BY table_name;

-- Verify row counts for each table
SELECT 'STUDENT' AS tbl, COUNT(*) AS cnt FROM Student
UNION ALL
SELECT 'EXAM', COUNT(*) FROM Exam
UNION ALL
SELECT 'REGISTRATION', COUNT(*) FROM Registration
UNION ALL
SELECT 'EXAM_CENTRE', COUNT(*) FROM Exam_Centre
UNION ALL
SELECT 'SCHEDULE', COUNT(*) FROM Schedule
UNION ALL
SELECT 'HALL_TICKET', COUNT(*) FROM Hall_Ticket
UNION ALL
SELECT 'RESULT', COUNT(*) FROM Result
UNION ALL
SELECT 'GRIEVANCE', COUNT(*) FROM Grievance
UNION ALL
SELECT 'QUESTION', COUNT(*) FROM Question
UNION ALL
SELECT 'RESPONSE', COUNT(*) FROM Response;

PROMPT
PROMPT ============================================
PROMPT   NEMS Database Setup Complete!
PROMPT   All 10 tables created and populated.
PROMPT ============================================
PROMPT
