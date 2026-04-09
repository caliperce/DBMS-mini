# National Examination Management System (NEMS)
## Database Design and Implementation Report

| Field | Details |
|---|---|
| **Subject** | Database Management Systems |
| **Report Type** | Project Report |
| **Domain** | Education / Government Systems |
| **Database** | Relational (SQL) |

**Submitted By:**
- Kavitha Rosalin J — 3122245001073
- Keerthana S — 3122245001077
- Aishwarya M — 3122245001301

*Sri SivaSubramaniya Nadar College of Engineering*

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Why SQL? ACID Properties and Suitability Analysis](#4-why-sql-acid-properties-and-suitability-analysis)
5. [System Overview](#5-system-overview)
6. [Entities and Attributes](#6-entities-and-attributes)
7. [ER Diagram](#7-er-diagram)
8. [Relationships and Cardinality](#8-relationships-and-cardinality)
9. [Participation Constraints](#9-participation-constraints)
10. [ER to Relational Mapping](#10-er-to-relational-mapping)
11. [Final Relational Schema](#11-final-relational-schema)
12. [Relational Schema Diagram](#12-relational-schema-diagram)
13. [Functional Dependencies](#13-functional-dependencies)
14. [Constraints](#14-constraints)
15. [SQL Queries](#15-sql-queries)
16. [System Architecture](#16-system-architecture)
17. [Scalability and Concurrency](#17-scalability-and-concurrency)
18. [Conclusion](#18-conclusion)

---

## 1. Abstract

The **National Examination Management System (NEMS)** is a comprehensive, database-driven platform designed to digitize and streamline the entire lifecycle of national-level examinations. The system encompasses student registration, exam scheduling, hall-ticket generation, result processing, grievance handling, and question bank management within a single unified framework.

This project presents a rigorous relational database design for NEMS, including Entity-Relationship (ER) modelling, ER-to-Relational mapping, normalization up to Third Normal Form (3NF), and a complete suite of SQL queries covering data definition, manipulation, and analytics. The system is designed to handle millions of concurrent records while maintaining full ACID compliance, data integrity, and referential consistency through carefully defined primary keys, foreign keys, check constraints, and functional dependencies.

The document argues why a relational SQL-based architecture is the appropriate choice over NoSQL alternatives for a high-stakes, consistency-critical domain such as national examinations. Scalability considerations and concurrency control mechanisms are also discussed to ensure the system remains performant under peak examination loads.

---

## 2. Introduction

### 2.1 Background

National examinations are critical milestones that determine the academic and professional futures of millions of candidates every year. Traditionally managed through paper-based processes, these examinations are prone to delays, inconsistencies, data loss, and fraudulent activities. Digitising this ecosystem through a well-designed database system is therefore not merely a convenience but a necessity.

### 2.2 Objectives of NEMS

The primary objectives of the National Examination Management System are:

1. Maintain a centralised, authoritative repository of student data, examination records, and results.
2. Automate hall-ticket generation and result publication.
3. Provide a transparent and auditable grievance redressal mechanism.
4. Enable real-time scheduling of examination centres and halls.
5. Ensure end-to-end data integrity, confidentiality, and availability.
6. Support high-concurrency access during peak load periods such as registration deadlines and result announcements.

### 2.3 Scope of This Report

This report covers the complete database design for NEMS, including:

- Identification of entities, attributes, and relationships.
- ER Diagram and its translation to a relational schema.
- Functional dependencies and normalization.
- Integrity constraints and SQL implementation.

---

## 3. Problem Statement

The manual management of national examinations suffers from several critical drawbacks that motivate the need for an integrated digital system:

1. **Data Fragmentation:** Student information, registrations, schedules, and results are maintained in isolated silos without cross-referencing, leading to inconsistencies.
2. **Scalability Challenges:** A single national examination may attract millions of applicants. Paper or spreadsheet-based systems cannot scale to meet this demand.
3. **Lack of Auditability:** Without a proper database, it is impossible to trace changes made to results or registrations, facilitating malpractice.
4. **Slow Result Processing:** Manual collation of answer sheets, marks, and grade computation is time-consuming and error-prone.
5. **No Grievance Tracking:** Students have no formal mechanism to raise and track complaints about incorrect results or administrative errors.
6. **Scheduling Conflicts:** Manually allocating students to examination centres and halls without a database often leads to overbooking and scheduling conflicts.
7. **Security Risks:** Paper-based question distribution is vulnerable to leaks; a secure, database-driven question bank mitigates this risk.

NEMS addresses all of the above by providing a single, relational database that serves as the system of record for the entire examination management workflow.

---

## 4. Why SQL? ACID Properties and Suitability Analysis

### 4.1 Why a Relational (SQL) Database?

Relational databases are built on a mathematically rigorous foundation (relational algebra) and enforce structured, typed schemas. They are purpose-built for scenarios that require:

- Data integrity across multiple related tables via foreign keys.
- Complex multi-table queries using JOIN, GROUP BY, and aggregate functions.
- Transactional guarantees ensuring no partial updates.
- Standardised query language (SQL) supported universally.
- Constraint enforcement (NOT NULL, UNIQUE, CHECK, etc.) at the storage layer.

### 4.2 ACID Properties Explained

ACID stands for **Atomicity, Consistency, Isolation, and Durability**. These four properties collectively guarantee that database transactions are processed reliably.

| Property | Definition | Relevance to NEMS |
|---|---|---|
| **Atomicity** | A transaction is all-or-nothing. If any step fails, all changes are rolled back. | When registering a student: inserting the Registration record AND updating seat availability must both succeed or both fail. |
| **Consistency** | A transaction brings the database from one valid state to another, respecting all constraints. | A student cannot receive a Hall Ticket unless they have a confirmed, fee-paid Registration. This invariant is always maintained. |
| **Isolation** | Concurrent transactions execute as if they were serial. | When two students simultaneously register for the last available seat, isolation ensures only one succeeds without a race condition. |
| **Durability** | Once a transaction is committed, changes survive system failures. | Published exam results are permanently stored and cannot be lost due to a server crash or power failure. |

### 4.3 Why NoSQL is NOT Suitable for NEMS

| NoSQL Characteristic | Why It Is Problematic for NEMS |
|---|---|
| **Eventual Consistency (BASE model)** | Examination results, registrations, and seat allocations require immediate consistency. A student must not be able to book a seat that has just been taken by another student, even for a brief window. |
| **Schema-less / Flexible Schema** | NEMS entities (Student, Result, Hall Ticket) have rigid, well-defined schemas that must be enforced at the database level to prevent corrupt records. |
| **Weak / No Foreign Key Support** | Cross-entity referential integrity (e.g., a Result must reference a valid Registration and Student) cannot be enforced in most NoSQL systems, leading to orphaned records. |
| **No Native ACID Transactions** | Document or key-value stores that lack multi-document transactions cannot guarantee that a multi-step process (register → pay → assign seat → issue hall ticket) executes atomically. |
| **Poor Support for Complex Queries** | Generating rank lists, statistical reports, and cross-joined analytics across Student, Result, Exam, and Centre tables requires relational JOIN operations that NoSQL databases handle poorly. |

> **Conclusion:** The highly relational, integrity-critical, and transactional nature of national examination management makes a SQL relational database the only appropriate architectural choice.

---

## 5. System Overview

### 5.1 System Description

NEMS is a multi-tier information system that manages the complete examination lifecycle. The system is divided into the following functional modules:

1. **Student Management Module** — Registration, profile management, eligibility verification.
2. **Examination Management Module** — Exam creation, question bank, scheduling.
3. **Centre Management Module** — Exam centre allocation, hall assignment, capacity management.
4. **Hall Ticket Module** — Automated generation and distribution of hall tickets.
5. **Result Processing Module** — Marks entry, grade computation, rank generation, result publication.
6. **Grievance Management Module** — Online complaint filing, status tracking, resolution recording.

### 5.2 Key Stakeholders

| Stakeholder | Role in NEMS |
|---|---|
| Students | Register for exams, download hall tickets, view results, file grievances |
| Exam Authority | Create exams, set schedules, manage question banks, publish results |
| Exam Centre Admin | Manage hall assignments, report attendance |
| Invigilators | Monitor examination sessions |
| Evaluators | Enter marks and validate responses |
| Grievance Officers | Review and resolve student grievances |
| System Administrators | Maintain database integrity, backups, access control |

---

## 6. Entities and Attributes

### 6.1 Student

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| student_id | INT | PK | Unique student identifier |
| first_name | VARCHAR(50) | | Student's first name |
| last_name | VARCHAR(50) | | Student's last name |
| date_of_birth | DATE | | Date of birth |
| gender | CHAR(1) | | M / F / O |
| email | VARCHAR(100) | UK | Contact email address |
| phone | VARCHAR(15) | | Mobile phone number |
| address | TEXT | | Residential address |
| nationality | VARCHAR(50) | | Nationality |
| category | VARCHAR(20) | | General / OBC / SC / ST / EWS |
| photo_url | VARCHAR(255) | | URL to passport photograph |
| created_at | TIMESTAMP | | Record creation timestamp |

### 6.2 Exam

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| exam_id | INT | PK | Unique exam identifier |
| exam_name | VARCHAR(100) | | Full name of the examination |
| exam_code | VARCHAR(20) | UK | Short alphanumeric code |
| conducting_body | VARCHAR(100) | | Organisation conducting the exam |
| total_marks | INT | | Maximum marks for the exam |
| passing_marks | INT | | Minimum passing marks |
| duration_minutes | INT | | Duration in minutes |
| exam_level | VARCHAR(20) | | National / State / District |
| description | TEXT | | Detailed description |
| is_active | BOOLEAN | | Whether registrations are open |

### 6.3 Registration

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| registration_id | INT | PK | Unique registration identifier |
| student_id | INT | FK | References Student |
| exam_id | INT | FK | References Exam |
| registration_date | DATE | | Date of registration |
| fee_paid | BOOLEAN | | Whether application fee is paid |
| payment_ref | VARCHAR(50) | | Payment transaction reference |
| status | VARCHAR(20) | | Pending / Confirmed / Cancelled |
| attempt_number | INT | | Which attempt this registration is |

### 6.4 Exam_Centre

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| centre_id | INT | PK | Unique centre identifier |
| centre_name | VARCHAR(100) | | Name of the examination centre |
| address | TEXT | | Full address |
| city | VARCHAR(50) | | City of the centre |
| state | VARCHAR(50) | | State / Province |
| pincode | VARCHAR(10) | | Postal code |
| total_capacity | INT | | Total seating capacity |
| contact_person | VARCHAR(100) | | Name of centre coordinator |
| contact_phone | VARCHAR(15) | | Phone of coordinator |
| is_active | BOOLEAN | | Whether centre is currently active |

### 6.5 Schedule

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| schedule_id | INT | PK | Unique schedule identifier |
| exam_id | INT | FK | References Exam |
| centre_id | INT | FK | References Exam_Centre |
| exam_date | DATE | | Date of the exam session |
| start_time | TIME | | Session start time |
| end_time | TIME | | Session end time |
| hall_number | VARCHAR(20) | | Specific hall within the centre |
| seats_available | INT | | Remaining seats for this session |
| shift | VARCHAR(10) | | Morning / Afternoon / Evening |

### 6.6 Hall_Ticket

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| ticket_id | INT | PK | Unique hall ticket identifier |
| registration_id | INT | FK | References Registration |
| schedule_id | INT | FK | References Schedule |
| roll_number | VARCHAR(20) | UK | Unique roll number for the exam |
| seat_number | VARCHAR(10) | | Assigned seat in the hall |
| issued_date | DATE | | Date the ticket was generated |
| is_valid | BOOLEAN | | Whether ticket is still valid |
| qr_code | VARCHAR(255) | | URL or data for QR verification |

### 6.7 Result

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| result_id | INT | PK | Unique result identifier |
| registration_id | INT | FK | References Registration |
| marks_obtained | DECIMAL(6,2) | | Total marks scored |
| grade | VARCHAR(5) | | Letter grade (A, B, C…) |
| percentile | DECIMAL(5,2) | | Percentile rank |
| rank | INT | | All-India or state rank |
| result_status | VARCHAR(10) | | Pass / Fail / Absent / Withheld |
| published_date | DATE | | Date result was made public |
| remarks | TEXT | | Additional evaluator remarks |

### 6.8 Grievance

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| grievance_id | INT | PK | Unique grievance identifier |
| student_id | INT | FK | References Student |
| result_id | INT | FK | References Result (nullable) |
| grievance_type | VARCHAR(50) | | Result / Registration / Centre |
| description | TEXT | | Detailed complaint description |
| filed_date | DATE | | Date complaint was filed |
| status | VARCHAR(20) | | Open / Under Review / Resolved |
| resolved_date | DATE | | Date of resolution (nullable) |
| resolution_notes | TEXT | | Resolution details |

### 6.9 Question

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| question_id | INT | PK | Unique question identifier |
| exam_id | INT | FK | References Exam |
| question_text | TEXT | | Full text of the question |
| question_type | VARCHAR(20) | | MCQ / Short / Long / Numerical |
| correct_answer | TEXT | | Correct answer or answer key |
| marks | DECIMAL(4,1) | | Marks allotted for this question |
| negative_marks | DECIMAL(4,1) | | Marks deducted for wrong answer |
| difficulty_level | VARCHAR(10) | | Easy / Medium / Hard |
| subject_area | VARCHAR(50) | | Topic / Subject the question covers |

### 6.10 Response

| Attribute | Data Type | Key | Description |
|---|---|---|---|
| response_id | INT | PK | Unique response identifier |
| registration_id | INT | FK | References Registration |
| question_id | INT | FK | References Question |
| answer_given | TEXT | | The student's answer |
| is_correct | BOOLEAN | | Whether the answer is correct |
| marks_awarded | DECIMAL(4,1) | | Marks awarded for this response |
| time_taken_secs | INT | | Time taken to answer (seconds) |

---

## 7. ER Diagram

The Entity Relationship (ER) Diagram provides a comprehensive visual representation of all entities in NEMS, their attributes, and the relationships connecting them.

- **Figure 7.1:** Entity Relationship Diagram before normalization for NEMS
- **Figure 7.2:** ER after normalization
- **Figure 7.3:** Entity Relationship Diagram after normalization for NEMS

---

## 8. Relationships and Cardinality

| Entity 1 | Relationship | Entity 2 | Cardinality | Description |
|---|---|---|---|---|
| Student | Registers For | Exam | M:N | A student can register for many exams; an exam has many student registrants. Resolved through Registration. |
| Registration | Belongs To | Student | M:1 | Many registrations belong to one student. |
| Registration | Is For | Exam | M:1 | Many registrations are for one exam. |
| Exam | Is Scheduled At | Exam_Centre | M:N | An exam can be held at many centres; a centre hosts many exams. Resolved through Schedule. |
| Schedule | Links | Exam | M:1 | Multiple schedule slots belong to one exam. |
| Schedule | Links | Exam_Centre | M:1 | Multiple schedule slots are at one centre. |
| Registration | Generates | Hall_Ticket | 1:1 | Each confirmed registration generates exactly one hall ticket. |
| Hall_Ticket | Assigned To | Schedule | M:1 | Multiple hall tickets can reference a single schedule slot. |
| Registration | Produces | Result | 1:1 | Each registration attempt produces at most one result. |
| Exam | Contains | Question | 1:M | One exam contains many questions. |
| Registration | Has | Response | 1:M | One registration can have many question responses. |
| Question | Answered By | Response | 1:M | One question can be answered by many students (multiple registrations). |
| Student | Files | Grievance | 1:M | A student can file multiple grievances. |
| Grievance | Related To | Result | M:1 | Multiple grievances may relate to one result (nullable). |

---

## 9. Participation Constraints

| Entity | Relationship | Participation | Justification |
|---|---|---|---|
| Registration | Registers For | Total | Every registration record must be associated with both a Student and an Exam. |
| Hall_Ticket | Belongs To Reg. | Total | A hall ticket cannot exist without a valid registration. |
| Hall_Ticket | References Sched. | Total | A hall ticket must reference a specific schedule slot. |
| Result | Produced By Reg. | Total | Every result must be tied to a registration. |
| Response | Belongs To Reg. | Total | Every response is tied to a registration and a question. |
| Response | Answers Question | Total | A response must reference an existing question. |
| Question | Belongs To Exam | Total | Every question must belong to an exam. |
| Schedule | For Exam | Total | Every schedule slot must reference an exam. |
| Schedule | At Centre | Total | Every schedule slot must reference a centre. |
| Student | Has Grievance | Partial | Not every student files a grievance. |
| Grievance | Related To Result | Partial | A grievance may or may not be related to a result (could be about registration). |
| Exam | Has Schedule | Partial | An exam may be created before a schedule is assigned. |
| Student | Has Registration | Partial | A student may be in the system without yet registering for an exam. |

---

## 10. ER to Relational Mapping

The ER diagram is translated to a relational schema following the standard mapping rules:

### 10.1 Mapping Rules Applied

1. **Strong Entities** are mapped directly to tables with their attributes. The primary key of the entity becomes the primary key of the table.
2. **Weak Entities** are mapped to tables that include the primary key of the identifying (owner) entity as a foreign key, combined with the partial key to form the composite primary key.
3. **Binary 1:1 Relationships** — the primary key of one entity is added as a foreign key to the other (on the total-participation side).
4. **Binary 1:N Relationships** — the primary key of the "1" side entity is added as a foreign key in the "N" side entity's table.
5. **Binary M:N Relationships** — a new relationship table is created with the primary keys of both participating entities as foreign keys; together they form the composite primary key.
6. **Multi-valued Attributes** — create a separate table with the entity's primary key and the multi-valued attribute.

### 10.2 Mapping Summary

| ER Element | Mapping Type | Resulting Table / Action |
|---|---|---|
| Student | Strong Entity | `Student(student_id PK, ...)` |
| Exam | Strong Entity | `Exam(exam_id PK, ...)` |
| Exam_Centre | Strong Entity | `Exam_Centre(centre_id PK, ...)` |
| Question | Strong Entity | `Question(question_id PK, exam_id FK, ...)` |
| Student ↔ Exam (M:N) | M:N Relationship | `Registration(registration_id PK, student_id FK, exam_id FK, ...)` |
| Exam ↔ Centre (M:N) | M:N Relationship | `Schedule(schedule_id PK, exam_id FK, centre_id FK, ...)` |
| Registration → Hall_Ticket (1:1) | 1:1 Relationship | `Hall_Ticket(ticket_id PK, registration_id FK UK, schedule_id FK, ...)` |
| Registration → Result (1:1) | 1:1 Relationship | `Result(result_id PK, registration_id FK UK, ...)` |
| Registration ↔ Question (via Response) | M:N Relationship | `Response(response_id PK, registration_id FK, question_id FK, ...)` |
| Student → Grievance (1:M) | 1:M Relationship | `Grievance(grievance_id PK, student_id FK, result_id FK NULL, ...)` |

---

## 11. Final Relational Schema

```
Student(student_id, first_name, last_name, date_of_birth, gender, email, phone, address,
        nationality, category, photo_url, created_at)

Exam(exam_id, exam_name, exam_code, conducting_body, total_marks, passing_marks,
     duration_minutes, exam_level, description, is_active)

Registration(registration_id, student_id → Student, exam_id → Exam, registration_date,
             fee_paid, payment_ref, status, attempt_number)

Exam_Centre(centre_id, centre_name, address, city, state, pincode, total_capacity,
            contact_person, contact_phone, is_active)

Schedule(schedule_id, exam_id → Exam, centre_id → Exam_Centre, exam_date,
         start_time, end_time, hall_number, seats_available, shift)

Hall_Ticket(ticket_id, registration_id → Registration, schedule_id → Schedule,
            roll_number, seat_number, issued_date, is_valid, qr_code)

Result(result_id, registration_id → Registration, marks_obtained, grade, percentile,
       rank, result_status, published_date, remarks)

Grievance(grievance_id, student_id → Student, result_id → Result [NULL], grievance_type,
          description, filed_date, status, resolved_date, resolution_notes)

Question(question_id, exam_id → Exam, question_text, question_type, correct_answer,
         marks, negative_marks, difficulty_level, subject_area)

Response(response_id, registration_id → Registration, question_id → Question,
         answer_given, is_correct, marks_awarded, time_taken_secs)
```

> **Legend:** `underlined` = Primary Key; *italic* = Foreign Key; `→` = references

---

## 12. Relational Schema Diagram

*(Figure 12.1: Relational Schema Diagram for NEMS — see original PDF)*

The diagram illustrates all tables with their columns, primary keys, foreign keys, and the referential links between tables.

---

## 13. Functional Dependencies

### 13.1 Definition

A Functional Dependency (FD) `X → Y` states that the attribute set Y is functionally determined by attribute set X: for any two tuples that agree on X, they must also agree on Y.

### 13.2 Functional Dependencies Per Table

#### 13.2.1 Student
```
student_id → first_name, last_name, date_of_birth, gender, email, phone, address, nationality, category, photo_url, created_at
email → student_id  (email is a candidate key)
```

#### 13.2.2 Exam
```
exam_id → exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, description, is_active
exam_code → exam_id  (exam_code is a candidate key)
```

#### 13.2.3 Registration
```
registration_id → student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number
(student_id, exam_id, attempt_number) → registration_id
```

#### 13.2.4 Exam_Centre
```
centre_id → centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active
```

#### 13.2.5 Schedule
```
schedule_id → exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift
(exam_id, centre_id, exam_date, shift) → schedule_id
```

#### 13.2.6 Hall_Ticket
```
ticket_id → registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid, qr_code
registration_id → ticket_id  (1:1 relationship)
roll_number → ticket_id
```

#### 13.2.7 Result
```
result_id → registration_id, marks_obtained, grade, percentile, rank, result_status, published_date, remarks
registration_id → result_id  (1:1 relationship)
```

#### 13.2.8 Grievance
```
grievance_id → student_id, result_id, grievance_type, description, filed_date, status, resolved_date, resolution_notes
```

#### 13.2.9 Question
```
question_id → exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area
```

#### 13.2.10 Response
```
response_id → registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs
(registration_id, question_id) → response_id
```

### 13.3 Normalization Status

| Table | 1NF | 2NF | 3NF | Notes |
|---|:---:|:---:|:---:|---|
| Student | ✓ | ✓ | ✓ | All attributes depend solely on student_id |
| Exam | ✓ | ✓ | ✓ | All attributes depend solely on exam_id |
| Registration | ✓ | ✓ | ✓ | No partial or transitive dependencies |
| Exam_Centre | ✓ | ✓ | ✓ | All attributes depend on centre_id |
| Schedule | ✓ | ✓ | ✓ | No redundant dependencies |
| Hall_Ticket | ✓ | ✓ | ✓ | 1:1 with Registration, no anomalies |
| Result | ✓ | ✓ | ✓ | 1:1 with Registration, no anomalies |
| Grievance | ✓ | ✓ | ✓ | Nullable FK to Result is acceptable |
| Question | ✓ | ✓ | ✓ | Fully dependent on question_id |
| Response | ✓ | ✓ | ✓ | Composite candidate key, no partial deps |

---

## 14. Constraints

### 14.1 Types of Constraints in NEMS

#### 14.1.1 Primary Key Constraints

Every table has a single-column surrogate primary key (`INT AUTO_INCREMENT`) ensuring uniqueness and non-nullability.

#### 14.1.2 Foreign Key Constraints

All foreign key references enforce referential integrity:

- `Registration.student_id → Student.student_id` (ON DELETE RESTRICT)
- `Registration.exam_id → Exam.exam_id` (ON DELETE RESTRICT)
- `Schedule.exam_id → Exam.exam_id`
- `Schedule.centre_id → Exam_Centre.centre_id`
- `Hall_Ticket.registration_id → Registration.registration_id`
- `Hall_Ticket.schedule_id → Schedule.schedule_id`
- `Result.registration_id → Registration.registration_id`
- `Response.registration_id → Registration.registration_id`
- `Response.question_id → Question.question_id`
- `Grievance.student_id → Student.student_id`
- `Grievance.result_id → Result.result_id` (nullable, ON DELETE SET NULL)
- `Question.exam_id → Exam.exam_id`

#### 14.1.3 Unique Constraints

- `Student.email` — no two students share an email.
- `Exam.exam_code` — each exam has a unique code.
- `Hall_Ticket.roll_number` — globally unique roll number.
- `Hall_Ticket.registration_id` — enforces the 1:1 relationship with Registration.
- `Result.registration_id` — enforces the 1:1 relationship with Registration.
- `(registration_id, question_id)` in Response — a student can answer each question only once per registration.

#### 14.1.4 NOT NULL Constraints

All primary keys, foreign keys, and business-critical attributes (e.g., `exam_date`, `marks_obtained`, `roll_number`) are declared `NOT NULL`.

#### 14.1.5 CHECK Constraints

- `Student.gender IN ('M', 'F', 'O')`
- `Registration.status IN ('Pending', 'Confirmed', 'Cancelled')`
- `Schedule.shift IN ('Morning', 'Afternoon', 'Evening')`
- `Result.result_status IN ('Pass', 'Fail', 'Absent', 'Withheld')`
- `Grievance.status IN ('Open', 'Under Review', 'Resolved')`
- `Question.difficulty_level IN ('Easy', 'Medium', 'Hard')`
- `Schedule.seats_available >= 0`
- `Result.marks_obtained >= 0`
- `Response.marks_awarded >= Result.negative_marks` (trigger-based)

---

## 15. SQL Queries

### 15.1 DDL — Table Creation

```sql
-- Listing 15.1: Create Student Table
CREATE TABLE Student (
    student_id   INT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(50)  NOT NULL,
    last_name    VARCHAR(50)  NOT NULL,
    date_of_birth DATE        NOT NULL,
    gender       CHAR(1)      NOT NULL CHECK (gender IN ('M','F','O')),
    email        VARCHAR(100) NOT NULL UNIQUE,
    phone        VARCHAR(15),
    address      TEXT,
    nationality  VARCHAR(50),
    category     VARCHAR(20)  DEFAULT 'General',
    photo_url    VARCHAR(255),
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

```sql
-- Listing 15.2: Create Exam Table
CREATE TABLE Exam (
    exam_id          INT AUTO_INCREMENT PRIMARY KEY,
    exam_name        VARCHAR(100) NOT NULL,
    exam_code        VARCHAR(20)  NOT NULL UNIQUE,
    conducting_body  VARCHAR(100) NOT NULL,
    total_marks      INT          NOT NULL,
    passing_marks    INT          NOT NULL,
    duration_minutes INT          NOT NULL,
    exam_level       VARCHAR(20)  DEFAULT 'National',
    description      TEXT,
    is_active        BOOLEAN      DEFAULT TRUE
);
```

```sql
-- Listing 15.3: Create Registration Table
CREATE TABLE Registration (
    registration_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id       INT NOT NULL,
    exam_id          INT NOT NULL,
    registration_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    fee_paid         BOOLEAN NOT NULL DEFAULT FALSE,
    payment_ref      VARCHAR(50),
    status           VARCHAR(20) NOT NULL DEFAULT 'Pending'
                     CHECK (status IN ('Pending','Confirmed','Cancelled')),
    attempt_number   INT NOT NULL DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (student_id, exam_id, attempt_number)
);
```

```sql
-- Listing 15.4: Create Exam_Centre Table
CREATE TABLE Exam_Centre (
    centre_id      INT AUTO_INCREMENT PRIMARY KEY,
    centre_name    VARCHAR(100) NOT NULL,
    address        TEXT         NOT NULL,
    city           VARCHAR(50)  NOT NULL,
    state          VARCHAR(50)  NOT NULL,
    pincode        VARCHAR(10),
    total_capacity INT          NOT NULL,
    contact_person VARCHAR(100),
    contact_phone  VARCHAR(15),
    is_active      BOOLEAN      DEFAULT TRUE
);
```

```sql
-- Listing 15.5: Create Schedule Table
CREATE TABLE Schedule (
    schedule_id     INT AUTO_INCREMENT PRIMARY KEY,
    exam_id         INT NOT NULL,
    centre_id       INT NOT NULL,
    exam_date       DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    hall_number     VARCHAR(20),
    seats_available INT NOT NULL CHECK (seats_available >= 0),
    shift           VARCHAR(10) NOT NULL
                    CHECK (shift IN ('Morning','Afternoon','Evening')),
    FOREIGN KEY (exam_id)    REFERENCES Exam(exam_id),
    FOREIGN KEY (centre_id)  REFERENCES Exam_Centre(centre_id)
);
```

```sql
-- Listing 15.6: Create Hall_Ticket Table
CREATE TABLE Hall_Ticket (
    ticket_id       INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL UNIQUE,
    schedule_id     INT NOT NULL,
    roll_number     VARCHAR(20) NOT NULL UNIQUE,
    seat_number     VARCHAR(10),
    issued_date     DATE NOT NULL DEFAULT (CURRENT_DATE),
    is_valid        BOOLEAN DEFAULT TRUE,
    qr_code         VARCHAR(255),
    FOREIGN KEY (registration_id) REFERENCES Registration(registration_id),
    FOREIGN KEY (schedule_id)     REFERENCES Schedule(schedule_id)
);
```

```sql
-- Listing 15.7: Create Result Table
CREATE TABLE Result (
    result_id       INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL UNIQUE,
    marks_obtained  DECIMAL(6,2) NOT NULL CHECK (marks_obtained >= 0),
    grade           VARCHAR(5),
    percentile      DECIMAL(5,2),
    rank            INT,
    result_status   VARCHAR(10) NOT NULL
                    CHECK (result_status IN ('Pass','Fail','Absent','Withheld')),
    published_date  DATE,
    remarks         TEXT,
    FOREIGN KEY (registration_id) REFERENCES Registration(registration_id)
);
```

```sql
-- Listing 15.8: Create Grievance Table
CREATE TABLE Grievance (
    grievance_id     INT AUTO_INCREMENT PRIMARY KEY,
    student_id       INT NOT NULL,
    result_id        INT DEFAULT NULL,
    grievance_type   VARCHAR(50) NOT NULL,
    description      TEXT        NOT NULL,
    filed_date       DATE NOT NULL DEFAULT (CURRENT_DATE),
    status           VARCHAR(20) NOT NULL DEFAULT 'Open'
                     CHECK (status IN ('Open','Under Review','Resolved')),
    resolved_date    DATE,
    resolution_notes TEXT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (result_id)  REFERENCES Result(result_id)   ON DELETE SET NULL
);
```

```sql
-- Listing 15.9: Create Question Table
CREATE TABLE Question (
    question_id      INT AUTO_INCREMENT PRIMARY KEY,
    exam_id          INT NOT NULL,
    question_text    TEXT        NOT NULL,
    question_type    VARCHAR(20) NOT NULL,
    correct_answer   TEXT        NOT NULL,
    marks            DECIMAL(4,1) NOT NULL,
    negative_marks   DECIMAL(4,1) DEFAULT 0,
    difficulty_level VARCHAR(10) CHECK (difficulty_level IN ('Easy','Medium','Hard')),
    subject_area     VARCHAR(50),
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE
);
```

```sql
-- Listing 15.10: Create Response Table
CREATE TABLE Response (
    response_id     INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    question_id     INT NOT NULL,
    answer_given    TEXT,
    is_correct      BOOLEAN,
    marks_awarded   DECIMAL(4,1),
    time_taken_secs INT,
    FOREIGN KEY (registration_id) REFERENCES Registration(registration_id),
    FOREIGN KEY (question_id)     REFERENCES Question(question_id),
    UNIQUE (registration_id, question_id)
);
```

### 15.2 DML — Data Manipulation Queries

```sql
-- Listing 15.11: Insert a new student
INSERT INTO Student (first_name, last_name, date_of_birth, gender, email, phone, category)
VALUES ('Arjun', 'Sharma', '2002-06-15', 'M', 'arjun.sharma@email.com', '9876543210', 'General');
```

```sql
-- Listing 15.12: Register a student for an exam
INSERT INTO Registration (student_id, exam_id, registration_date, fee_paid, status)
VALUES (1, 3, CURRENT_DATE, TRUE, 'Confirmed');
```

```sql
-- Listing 15.13: Update registration status after payment
UPDATE Registration
SET fee_paid    = TRUE,
    payment_ref = 'TXN2024ABC123',
    status      = 'Confirmed'
WHERE registration_id = 42;
```

### 15.3 Query — Analytics and Reports

```sql
-- Listing 15.14: List all confirmed registrations for a specific exam
SELECT s.student_id,
       CONCAT(s.first_name, ' ', s.last_name) AS student_name,
       s.email,
       r.registration_id,
       r.registration_date,
       r.attempt_number
FROM Registration r
JOIN Student s ON r.student_id = s.student_id
WHERE r.exam_id = 3
  AND r.status  = 'Confirmed'
ORDER BY s.last_name, s.first_name;
```

```sql
-- Listing 15.15: Generate rank list for an exam
SELECT CONCAT(s.first_name,' ',s.last_name) AS student_name,
       ht.roll_number,
       res.marks_obtained,
       res.grade,
       res.percentile,
       RANK() OVER (ORDER BY res.marks_obtained DESC) AS computed_rank
FROM Result res
JOIN Registration r  ON res.registration_id = r.registration_id
JOIN Student s       ON r.student_id         = s.student_id
JOIN Hall_Ticket ht  ON ht.registration_id   = r.registration_id
WHERE r.exam_id         = 3
  AND res.result_status = 'Pass'
ORDER BY res.marks_obtained DESC;
```

```sql
-- Listing 15.16: Count students by category for an exam
SELECT s.category,
       COUNT(*) AS num_registered
FROM Registration r
JOIN Student s ON r.student_id = s.student_id
WHERE r.exam_id = 3
GROUP BY s.category
ORDER BY num_registered DESC;
```

```sql
-- Listing 15.17: Find seats available per centre for an exam
SELECT ec.centre_name,
       ec.city,
       sc.hall_number,
       sc.shift,
       sc.exam_date,
       sc.seats_available
FROM Schedule sc
JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id
WHERE sc.exam_id          = 3
  AND sc.seats_available  > 0
ORDER BY ec.city, sc.exam_date, sc.shift;
```

```sql
-- Listing 15.18: Retrieve a student's hall ticket details
SELECT CONCAT(s.first_name,' ',s.last_name) AS student_name,
       ht.roll_number,
       ht.seat_number,
       ec.centre_name,
       ec.address   AS centre_address,
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
WHERE s.student_id = 101;
```

```sql
-- Listing 15.19: Average marks per subject area for an exam
SELECT q.subject_area,
       COUNT(r.response_id) AS responses,
       AVG(r.marks_awarded) AS avg_marks,
       MAX(r.marks_awarded) AS max_marks,
       MIN(r.marks_awarded) AS min_marks
FROM Response r
JOIN Question q ON r.question_id = q.question_id
WHERE q.exam_id = 3
GROUP BY q.subject_area
ORDER BY avg_marks DESC;
```

```sql
-- Listing 15.20: List open grievances with student and result info
SELECT g.grievance_id,
       CONCAT(s.first_name,' ',s.last_name) AS student_name,
       g.grievance_type,
       g.filed_date,
       g.status,
       res.marks_obtained,
       res.result_status
FROM Grievance g
JOIN Student s        ON g.student_id  = s.student_id
LEFT JOIN Result res  ON g.result_id   = res.result_id
WHERE g.status != 'Resolved'
ORDER BY g.filed_date ASC;
```

```sql
-- Listing 15.21: Pass percentage per exam centre
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
WHERE reg.exam_id = 3
GROUP BY ec.centre_id, ec.centre_name, ec.city
ORDER BY pass_pct DESC;
```

---

## 16. System Architecture

### 16.1 Architecture Overview

NEMS follows a **three-tier client-server architecture**:

1. **Presentation Tier** — Web and mobile frontends (Student Portal, Admin Dashboard, Evaluator Interface) built with modern frameworks.
2. **Application Tier** — RESTful API services handling business logic: registration processing, hall ticket generation, result computation, grievance management.
3. **Data Tier** — Centralised relational database (MySQL / PostgreSQL) with read replicas, connection pooling, and automated backup.

```
Users
  │
  ▼
Frontend UI (Student Portal / Admin Portal)
  │
  ▼
API Layer / Backend Server
  ├── Registration Service
  ├── Exam Service
  ├── Scheduling Service
  ├── Evaluation Service
  ├── Result Service
  └── Grievance Service
  │
  ├──────────────┬──────────────┐
  ▼              ▼              ▼
Registration   Exam        Scheduling
 Service      Service       Service
  │                            │
  ▼                            │
Evaluation Service             │
  │                            ▼
Grievance Service        Result Service
                               │
                               ▼
                        Admit Card Service
                               │
                               ▼
                         Database (SQL)
               Student | Exam | Registration
               Result  | Response | Schedule
```

### 16.2 Key Architectural Components

| Component | Description |
|---|---|
| **Load Balancer** | Distributes incoming requests across multiple API server instances to prevent any single server from being overwhelmed. |
| **API Gateway** | Single entry point for all client requests; handles authentication, rate limiting, and routing to appropriate microservices. |
| **Application Servers** | Stateless RESTful services responsible for business logic. Can be horizontally scaled. |
| **Primary Database** | Single write-master (MySQL/PostgreSQL) that receives all INSERT/UPDATE/DELETE operations, ensuring ACID compliance. |
| **Read Replicas** | Asynchronous read replicas serve SELECT-heavy workloads (result viewing, reports), reducing load on the primary. |
| **Cache Layer (Redis)** | In-memory cache for frequently accessed, read-heavy data such as exam schedules, centre information, and published results. |
| **Message Queue** | Asynchronous processing of bulk tasks: bulk hall ticket generation, result SMS/email dispatch, grievance notifications. |
| **Object Storage** | Stores student photographs, hall ticket PDFs, and scanned answer sheets. |
| **Monitoring & Logging** | Centralised log aggregation and performance dashboards for proactive incident detection. |

---

## 17. Scalability and Concurrency

### 17.1 Scalability Challenges in NEMS

National examinations can have:
- Millions of registrations within a short window.
- Concurrent seat booking where hundreds of thousands of students attempt to grab the last available seat simultaneously.
- Result download spikes when results are published — often tens of millions of requests within minutes.

### 17.2 Horizontal Scaling Strategy

1. **Application-Level Horizontal Scaling:** Stateless API servers can be replicated and placed behind a load balancer. New instances can be auto-provisioned using container orchestration (Kubernetes).
2. **Read Replicas:** All read queries (result display, schedule lookup) are routed to read replicas, reducing pressure on the write-primary database.
3. **Database Sharding (Future):** Partition the student table horizontally by region or registration date range to distribute write load across multiple database servers.
4. **CDN for Static Content:** Hall ticket PDFs and admit card images are served via a Content Delivery Network to avoid repeated database hits.

### 17.3 Concurrency Control

#### 17.3.1 Seat Booking Race Condition

When multiple students compete for the last available seat in a schedule:

```sql
-- Listing 17.1: Atomic seat booking using SELECT FOR UPDATE
START TRANSACTION;

-- Lock the schedule row to prevent concurrent modification
SELECT seats_available
FROM Schedule
WHERE schedule_id = 55
FOR UPDATE;

-- Check availability
-- (Application layer checks if seats_available > 0)

-- Decrement seat count
UPDATE Schedule
SET seats_available = seats_available - 1
WHERE schedule_id       = 55
  AND seats_available   > 0;

-- Insert hall ticket only if UPDATE affected 1 row
INSERT INTO Hall_Ticket (registration_id, schedule_id, roll_number, issued_date)
VALUES (201, 55, 'NEMS2024101', CURRENT_DATE);

COMMIT;
```

#### 17.3.2 Isolation Levels

- **READ COMMITTED** is used for general read queries to avoid dirty reads while maximising throughput.
- **SERIALIZABLE** (or `SELECT FOR UPDATE`) is applied to critical write transactions such as seat allocation and result publishing to prevent phantom reads and lost updates.

#### 17.3.3 Deadlock Prevention

- All transactions acquire locks in a consistent order (Student → Registration → Schedule).
- Short transaction durations minimize the lock-hold window.
- The database is configured with an appropriate `innodb_lock_wait_timeout` to detect and automatically resolve deadlocks.

### 17.4 Caching Strategy

| Data | Cache Duration | Rationale |
|---|---|---|
| Exam Schedule | 30 minutes | Rarely changes; reduces DB load during peak browsing |
| Centre Information | 1 hour | Static reference data |
| Published Results | Until update | Immutable after publication; massive read spike expected |
| Exam Details | 15 minutes | Semi-static; occasionally updated |
| Student Profile | Session-based | Personal data; invalidate on update |

---

## 18. Conclusion

The **National Examination Management System (NEMS)** demonstrates how a well-designed relational database can serve as the reliable backbone of a mission-critical, large-scale government application.

Key design decisions made in this project include:

1. **SQL over NoSQL** — The transactional, integrity-critical, and multi-relational nature of examination data mandates the use of a relational database with full ACID compliance.
2. **Normalisation to 3NF** — All ten tables are normalised to Third Normal Form, eliminating update anomalies, insertion anomalies, and deletion anomalies.
3. **Comprehensive Constraint Design** — Primary keys, foreign keys, unique constraints, NOT NULL constraints, and CHECK constraints collectively enforce data quality at the storage layer, independent of application-level validation.
4. **ER-to-Relational Faithfulness** — The relational schema faithfully reflects all entities, attributes, and relationships identified in the ER model, with proper handling of M:N relationships via bridge tables.
5. **Concurrency-Safe Seat Allocation** — The use of `SELECT FOR UPDATE` within explicit transactions ensures that seat booking is race-condition-free even under peak concurrent load.
6. **Scalable Architecture** — Read replicas, caching, and horizontal application scaling allow the system to gracefully handle millions of students without degradation of service.

NEMS can serve as a reference architecture for examination management at any scale — state, national, or international. Future enhancements could include biometric attendance integration, AI-powered malpractice detection, real-time result analytics dashboards, and blockchain-based certificate issuance.

---

*End of Report*

**National Examination Management System (NEMS)**  
*Database Design and Implementation Report*
