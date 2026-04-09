package nems;

import java.sql.*;
import java.util.Scanner;

public class NEMSApp {

    private static Scanner sc = new Scanner(System.in);

    // ========================== MAIN ==========================
    public static void main(String[] args) {

        // Load Oracle JDBC driver
        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            System.out.println("Oracle JDBC Driver loaded.");
        } catch (ClassNotFoundException e) {
            System.out.println("ERROR: Oracle JDBC Driver not found!");
            System.out.println("Add ojdbc8.jar to your project Libraries in NetBeans.");
            return;
        }

        // Test database connection
        try (Connection conn = DBConnection.getConnection()) {
            System.out.println("Connected to Oracle database successfully!\n");
        } catch (SQLException e) {
            System.out.println("ERROR: Could not connect to database!");
            System.out.println("Check URL, username and password in DBConnection.java");
            System.out.println("Details: " + e.getMessage());
            return;
        }

        // Menu loop
        boolean running = true;
        while (running) {
            System.out.println("\n========================================");
            System.out.println("   NEMS - National Examination");
            System.out.println("   Management System");
            System.out.println("========================================");
            System.out.println(" 1. Initialize Database (Create Tables)");
            System.out.println(" 2. Load Sample Data");
            System.out.println("    ---- Student ----");
            System.out.println(" 3. Add Student");
            System.out.println(" 4. View All Students");
            System.out.println(" 5. Search Student by ID");
            System.out.println("    ---- Exam ----");
            System.out.println(" 6. Add Exam");
            System.out.println(" 7. View All Exams");
            System.out.println("    ---- Registration ----");
            System.out.println(" 8. Register Student for Exam");
            System.out.println(" 9. Update Registration (Payment)");
            System.out.println("10. View Registrations for Exam");
            System.out.println("    ---- Centre & Schedule ----");
            System.out.println("11. Add Exam Centre");
            System.out.println("12. Add Schedule");
            System.out.println("13. View Available Seats for Exam");
            System.out.println("    ---- Hall Ticket ----");
            System.out.println("14. Generate Hall Ticket");
            System.out.println("15. View Hall Ticket for Student");
            System.out.println("    ---- Result ----");
            System.out.println("16. Add Result");
            System.out.println("17. Generate Rank List for Exam");
            System.out.println("    ---- Grievance ----");
            System.out.println("18. File Grievance");
            System.out.println("19. View Open Grievances");
            System.out.println("    ---- Reports ----");
            System.out.println("20. Students by Category");
            System.out.println("21. Pass Percentage by Centre");
            System.out.println("22. Avg Marks by Subject Area");
            System.out.println("23. View All Table Row Counts");
            System.out.println(" 0. Exit");
            System.out.println("========================================");

            int choice = readInt("Enter choice: ");

            switch (choice) {
                case  1: setupDatabase();          break;
                case  2: insertSampleData();       break;
                case  3: addStudent();             break;
                case  4: viewAllStudents();        break;
                case  5: searchStudentById();      break;
                case  6: addExam();                break;
                case  7: viewAllExams();           break;
                case  8: registerStudent();        break;
                case  9: updateRegistration();     break;
                case 10: viewRegistrations();      break;
                case 11: addExamCentre();          break;
                case 12: addSchedule();            break;
                case 13: viewAvailableSeats();     break;
                case 14: generateHallTicket();     break;
                case 15: viewHallTicket();         break;
                case 16: addResult();              break;
                case 17: generateRankList();       break;
                case 18: fileGrievance();          break;
                case 19: viewOpenGrievances();     break;
                case 20: studentsByCategory();     break;
                case 21: passPercentageByCentre(); break;
                case 22: avgMarksBySubject();      break;
                case 23: viewRowCounts();          break;
                case  0: running = false;          break;
                default: System.out.println("Invalid choice. Try again.");
            }
        }
        System.out.println("\nGoodbye!");
        sc.close();
    }

    // ========================== DATABASE SETUP ==========================

    private static void setupDatabase() {
        System.out.println("\nInitializing NEMS Database...");

        String[] tables = {
            "Response", "Question", "Grievance", "Result",
            "Hall_Ticket", "Schedule", "Exam_Centre", "Registration",
            "Exam", "Student"
        };

        String[] sequences = {
            "student_seq", "exam_seq", "registration_seq", "centre_seq",
            "schedule_seq", "ticket_seq", "result_seq", "grievance_seq",
            "question_seq", "response_seq"
        };

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            // Drop existing tables
            for (String t : tables) {
                try { stmt.execute("DROP TABLE " + t + " CASCADE CONSTRAINTS"); }
                catch (SQLException e) { /* table does not exist, ignore */ }
            }
            System.out.println("  Existing tables dropped.");

            // Drop existing sequences
            for (String s : sequences) {
                try { stmt.execute("DROP SEQUENCE " + s); }
                catch (SQLException e) { /* sequence does not exist, ignore */ }
            }
            System.out.println("  Existing sequences dropped.");

            // Create sequences
            for (String s : sequences) {
                stmt.execute("CREATE SEQUENCE " + s + " START WITH 1 INCREMENT BY 1");
            }
            System.out.println("  Sequences created.");

            // Create tables
            stmt.execute(
                "CREATE TABLE Student (" +
                "student_id NUMBER PRIMARY KEY, " +
                "first_name VARCHAR2(50) NOT NULL, " +
                "last_name VARCHAR2(50) NOT NULL, " +
                "date_of_birth DATE NOT NULL, " +
                "gender CHAR(1) NOT NULL, " +
                "email VARCHAR2(100) NOT NULL UNIQUE, " +
                "phone VARCHAR2(15), " +
                "address VARCHAR2(4000), " +
                "nationality VARCHAR2(50), " +
                "category VARCHAR2(20) DEFAULT 'General', " +
                "photo_url VARCHAR2(255), " +
                "created_at TIMESTAMP DEFAULT SYSTIMESTAMP, " +
                "CONSTRAINT chk_student_gender CHECK (gender IN ('M','F','O')))"
            );

            stmt.execute(
                "CREATE TABLE Exam (" +
                "exam_id NUMBER PRIMARY KEY, " +
                "exam_name VARCHAR2(100) NOT NULL, " +
                "exam_code VARCHAR2(20) NOT NULL UNIQUE, " +
                "conducting_body VARCHAR2(100) NOT NULL, " +
                "total_marks NUMBER NOT NULL, " +
                "passing_marks NUMBER NOT NULL, " +
                "duration_minutes NUMBER NOT NULL, " +
                "exam_level VARCHAR2(20) DEFAULT 'National', " +
                "description VARCHAR2(4000), " +
                "is_active NUMBER(1) DEFAULT 1, " +
                "CONSTRAINT chk_exam_active CHECK (is_active IN (0,1)))"
            );

            stmt.execute(
                "CREATE TABLE Registration (" +
                "registration_id NUMBER PRIMARY KEY, " +
                "student_id NUMBER NOT NULL, " +
                "exam_id NUMBER NOT NULL, " +
                "registration_date DATE DEFAULT SYSDATE NOT NULL, " +
                "fee_paid NUMBER(1) DEFAULT 0 NOT NULL, " +
                "payment_ref VARCHAR2(50), " +
                "status VARCHAR2(20) DEFAULT 'Pending' NOT NULL, " +
                "attempt_number NUMBER DEFAULT 1 NOT NULL, " +
                "CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES Student(student_id), " +
                "CONSTRAINT fk_reg_exam FOREIGN KEY (exam_id) REFERENCES Exam(exam_id), " +
                "CONSTRAINT uq_reg UNIQUE (student_id, exam_id, attempt_number), " +
                "CONSTRAINT chk_reg_status CHECK (status IN ('Pending','Confirmed','Cancelled')), " +
                "CONSTRAINT chk_reg_fee CHECK (fee_paid IN (0,1)))"
            );

            stmt.execute(
                "CREATE TABLE Exam_Centre (" +
                "centre_id NUMBER PRIMARY KEY, " +
                "centre_name VARCHAR2(100) NOT NULL, " +
                "address VARCHAR2(4000) NOT NULL, " +
                "city VARCHAR2(50) NOT NULL, " +
                "state VARCHAR2(50) NOT NULL, " +
                "pincode VARCHAR2(10), " +
                "total_capacity NUMBER NOT NULL, " +
                "contact_person VARCHAR2(100), " +
                "contact_phone VARCHAR2(15), " +
                "is_active NUMBER(1) DEFAULT 1, " +
                "CONSTRAINT chk_centre_active CHECK (is_active IN (0,1)))"
            );

            stmt.execute(
                "CREATE TABLE Schedule (" +
                "schedule_id NUMBER PRIMARY KEY, " +
                "exam_id NUMBER NOT NULL, " +
                "centre_id NUMBER NOT NULL, " +
                "exam_date DATE NOT NULL, " +
                "start_time VARCHAR2(8) NOT NULL, " +
                "end_time VARCHAR2(8) NOT NULL, " +
                "hall_number VARCHAR2(20), " +
                "seats_available NUMBER NOT NULL, " +
                "shift VARCHAR2(10) NOT NULL, " +
                "CONSTRAINT fk_sched_exam FOREIGN KEY (exam_id) REFERENCES Exam(exam_id), " +
                "CONSTRAINT fk_sched_centre FOREIGN KEY (centre_id) REFERENCES Exam_Centre(centre_id), " +
                "CONSTRAINT chk_seats CHECK (seats_available >= 0), " +
                "CONSTRAINT chk_shift CHECK (shift IN ('Morning','Afternoon','Evening')))"
            );

            stmt.execute(
                "CREATE TABLE Hall_Ticket (" +
                "ticket_id NUMBER PRIMARY KEY, " +
                "registration_id NUMBER NOT NULL UNIQUE, " +
                "schedule_id NUMBER NOT NULL, " +
                "roll_number VARCHAR2(20) NOT NULL UNIQUE, " +
                "seat_number VARCHAR2(10), " +
                "issued_date DATE DEFAULT SYSDATE NOT NULL, " +
                "is_valid NUMBER(1) DEFAULT 1, " +
                "qr_code VARCHAR2(255), " +
                "CONSTRAINT fk_ht_reg FOREIGN KEY (registration_id) REFERENCES Registration(registration_id), " +
                "CONSTRAINT fk_ht_sched FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id), " +
                "CONSTRAINT chk_ht_valid CHECK (is_valid IN (0,1)))"
            );

            stmt.execute(
                "CREATE TABLE Result (" +
                "result_id NUMBER PRIMARY KEY, " +
                "registration_id NUMBER NOT NULL UNIQUE, " +
                "marks_obtained NUMBER(6,2) NOT NULL, " +
                "grade VARCHAR2(5), " +
                "percentile NUMBER(5,2), " +
                "rank_position NUMBER, " +
                "result_status VARCHAR2(10) NOT NULL, " +
                "published_date DATE, " +
                "remarks VARCHAR2(4000), " +
                "CONSTRAINT fk_res_reg FOREIGN KEY (registration_id) REFERENCES Registration(registration_id), " +
                "CONSTRAINT chk_marks CHECK (marks_obtained >= 0), " +
                "CONSTRAINT chk_res_status CHECK (result_status IN ('Pass','Fail','Absent','Withheld')))"
            );

            stmt.execute(
                "CREATE TABLE Grievance (" +
                "grievance_id NUMBER PRIMARY KEY, " +
                "student_id NUMBER NOT NULL, " +
                "result_id NUMBER DEFAULT NULL, " +
                "grievance_type VARCHAR2(50) NOT NULL, " +
                "description VARCHAR2(4000) NOT NULL, " +
                "filed_date DATE DEFAULT SYSDATE NOT NULL, " +
                "status VARCHAR2(20) DEFAULT 'Open' NOT NULL, " +
                "resolved_date DATE, " +
                "resolution_notes VARCHAR2(4000), " +
                "CONSTRAINT fk_grv_student FOREIGN KEY (student_id) REFERENCES Student(student_id), " +
                "CONSTRAINT fk_grv_result FOREIGN KEY (result_id) REFERENCES Result(result_id) ON DELETE SET NULL, " +
                "CONSTRAINT chk_grv_status CHECK (status IN ('Open','Under Review','Resolved')))"
            );

            stmt.execute(
                "CREATE TABLE Question (" +
                "question_id NUMBER PRIMARY KEY, " +
                "exam_id NUMBER NOT NULL, " +
                "question_text VARCHAR2(4000) NOT NULL, " +
                "question_type VARCHAR2(20) NOT NULL, " +
                "correct_answer VARCHAR2(4000) NOT NULL, " +
                "marks NUMBER(4,1) NOT NULL, " +
                "negative_marks NUMBER(4,1) DEFAULT 0, " +
                "difficulty_level VARCHAR2(10), " +
                "subject_area VARCHAR2(50), " +
                "CONSTRAINT fk_q_exam FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE, " +
                "CONSTRAINT chk_difficulty CHECK (difficulty_level IN ('Easy','Medium','Hard')))"
            );

            stmt.execute(
                "CREATE TABLE Response (" +
                "response_id NUMBER PRIMARY KEY, " +
                "registration_id NUMBER NOT NULL, " +
                "question_id NUMBER NOT NULL, " +
                "answer_given VARCHAR2(4000), " +
                "is_correct NUMBER(1), " +
                "marks_awarded NUMBER(4,1), " +
                "time_taken_secs NUMBER, " +
                "CONSTRAINT fk_resp_reg FOREIGN KEY (registration_id) REFERENCES Registration(registration_id), " +
                "CONSTRAINT fk_resp_q FOREIGN KEY (question_id) REFERENCES Question(question_id), " +
                "CONSTRAINT uq_resp UNIQUE (registration_id, question_id), " +
                "CONSTRAINT chk_resp_correct CHECK (is_correct IN (0,1)))"
            );

            System.out.println("  All 10 tables created successfully!");
            System.out.println("\nDatabase initialized. Now run option 2 to load sample data.");

        } catch (SQLException e) {
            System.out.println("Error during setup: " + e.getMessage());
        }
    }

    // ========================== SAMPLE DATA ==========================

    private static void insertSampleData() {
        System.out.println("\nInserting sample data...");

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            // ----- Students -----
            stmt.executeUpdate("INSERT INTO Student (student_id, first_name, last_name, date_of_birth, gender, email, phone, nationality, category) VALUES (student_seq.NEXTVAL, 'Arjun', 'Sharma', TO_DATE('2002-06-15','YYYY-MM-DD'), 'M', 'arjun.sharma@email.com', '9876543210', 'Indian', 'General')");
            stmt.executeUpdate("INSERT INTO Student (student_id, first_name, last_name, date_of_birth, gender, email, phone, nationality, category) VALUES (student_seq.NEXTVAL, 'Priya', 'Patel', TO_DATE('2001-09-22','YYYY-MM-DD'), 'F', 'priya.patel@email.com', '9876543211', 'Indian', 'OBC')");
            stmt.executeUpdate("INSERT INTO Student (student_id, first_name, last_name, date_of_birth, gender, email, phone, nationality, category) VALUES (student_seq.NEXTVAL, 'Rahul', 'Kumar', TO_DATE('2003-01-10','YYYY-MM-DD'), 'M', 'rahul.kumar@email.com', '9876543212', 'Indian', 'SC')");
            stmt.executeUpdate("INSERT INTO Student (student_id, first_name, last_name, date_of_birth, gender, email, phone, nationality, category) VALUES (student_seq.NEXTVAL, 'Ananya', 'Reddy', TO_DATE('2002-03-28','YYYY-MM-DD'), 'F', 'ananya.reddy@email.com', '9876543213', 'Indian', 'General')");
            stmt.executeUpdate("INSERT INTO Student (student_id, first_name, last_name, date_of_birth, gender, email, phone, nationality, category) VALUES (student_seq.NEXTVAL, 'Vikram', 'Singh', TO_DATE('2001-12-05','YYYY-MM-DD'), 'M', 'vikram.singh@email.com', '9876543214', 'Indian', 'EWS')");
            System.out.println("  5 Students inserted.");

            // ----- Exams -----
            stmt.executeUpdate("INSERT INTO Exam (exam_id, exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, is_active) VALUES (exam_seq.NEXTVAL, 'Joint Entrance Examination', 'JEE2024', 'National Testing Agency', 300, 90, 180, 'National', 1)");
            stmt.executeUpdate("INSERT INTO Exam (exam_id, exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, is_active) VALUES (exam_seq.NEXTVAL, 'National Eligibility cum Entrance Test', 'NEET2024', 'National Testing Agency', 720, 360, 200, 'National', 1)");
            stmt.executeUpdate("INSERT INTO Exam (exam_id, exam_name, exam_code, conducting_body, total_marks, passing_marks, duration_minutes, exam_level, is_active) VALUES (exam_seq.NEXTVAL, 'Common Admission Test', 'CAT2024', 'IIM Bangalore', 228, 100, 120, 'National', 1)");
            System.out.println("  3 Exams inserted.");

            // ----- Registrations -----
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 1, 1, TO_DATE('2024-01-15','YYYY-MM-DD'), 1, 'TXN2024JEE001', 'Confirmed', 1)");
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 2, 1, TO_DATE('2024-01-16','YYYY-MM-DD'), 1, 'TXN2024JEE002', 'Confirmed', 1)");
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 3, 1, TO_DATE('2024-01-17','YYYY-MM-DD'), 1, 'TXN2024JEE003', 'Confirmed', 1)");
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 4, 2, TO_DATE('2024-02-01','YYYY-MM-DD'), 1, 'TXN2024NEET001', 'Confirmed', 1)");
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 5, 2, TO_DATE('2024-02-02','YYYY-MM-DD'), 0, NULL, 'Pending', 1)");
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 1, 3, TO_DATE('2024-03-01','YYYY-MM-DD'), 1, 'TXN2024CAT001', 'Confirmed', 1)");
            stmt.executeUpdate("INSERT INTO Registration (registration_id, student_id, exam_id, registration_date, fee_paid, payment_ref, status, attempt_number) VALUES (registration_seq.NEXTVAL, 3, 2, TO_DATE('2024-02-05','YYYY-MM-DD'), 1, 'TXN2024NEET002', 'Confirmed', 1)");
            System.out.println("  7 Registrations inserted.");

            // ----- Exam Centres -----
            stmt.executeUpdate("INSERT INTO Exam_Centre (centre_id, centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active) VALUES (centre_seq.NEXTVAL, 'SSN College of Engineering', '603 110 Kalavakkam', 'Chennai', 'Tamil Nadu', '603110', 500, 'Dr. Ramesh', '9800000001', 1)");
            stmt.executeUpdate("INSERT INTO Exam_Centre (centre_id, centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active) VALUES (centre_seq.NEXTVAL, 'IIT Delhi Main Hall', 'Hauz Khas New Delhi', 'New Delhi', 'Delhi', '110016', 800, 'Prof. Gupta', '9800000002', 1)");
            stmt.executeUpdate("INSERT INTO Exam_Centre (centre_id, centre_name, address, city, state, pincode, total_capacity, contact_person, contact_phone, is_active) VALUES (centre_seq.NEXTVAL, 'Presidency College Hall', 'College Road Chennai', 'Chennai', 'Tamil Nadu', '600005', 600, 'Dr. Lakshmi', '9800000003', 1)");
            System.out.println("  3 Exam Centres inserted.");

            // ----- Schedules -----
            stmt.executeUpdate("INSERT INTO Schedule (schedule_id, exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift) VALUES (schedule_seq.NEXTVAL, 1, 1, TO_DATE('2024-04-10','YYYY-MM-DD'), '09:00:00', '12:00:00', 'H1', 120, 'Morning')");
            stmt.executeUpdate("INSERT INTO Schedule (schedule_id, exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift) VALUES (schedule_seq.NEXTVAL, 1, 2, TO_DATE('2024-04-10','YYYY-MM-DD'), '14:00:00', '17:00:00', 'A1', 200, 'Afternoon')");
            stmt.executeUpdate("INSERT INTO Schedule (schedule_id, exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift) VALUES (schedule_seq.NEXTVAL, 2, 1, TO_DATE('2024-05-05','YYYY-MM-DD'), '09:00:00', '12:20:00', 'H2', 150, 'Morning')");
            stmt.executeUpdate("INSERT INTO Schedule (schedule_id, exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift) VALUES (schedule_seq.NEXTVAL, 2, 3, TO_DATE('2024-05-05','YYYY-MM-DD'), '09:00:00', '12:20:00', 'P1', 180, 'Morning')");
            stmt.executeUpdate("INSERT INTO Schedule (schedule_id, exam_id, centre_id, exam_date, start_time, end_time, hall_number, seats_available, shift) VALUES (schedule_seq.NEXTVAL, 3, 2, TO_DATE('2024-11-24','YYYY-MM-DD'), '14:00:00', '16:00:00', 'B1', 100, 'Afternoon')");
            System.out.println("  5 Schedules inserted.");

            // ----- Hall Tickets -----
            stmt.executeUpdate("INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid) VALUES (ticket_seq.NEXTVAL, 1, 1, 'JEE2024-0001', 'S-12', TO_DATE('2024-03-25','YYYY-MM-DD'), 1)");
            stmt.executeUpdate("INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid) VALUES (ticket_seq.NEXTVAL, 2, 2, 'JEE2024-0002', 'A-45', TO_DATE('2024-03-25','YYYY-MM-DD'), 1)");
            stmt.executeUpdate("INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid) VALUES (ticket_seq.NEXTVAL, 3, 1, 'JEE2024-0003', 'S-13', TO_DATE('2024-03-25','YYYY-MM-DD'), 1)");
            stmt.executeUpdate("INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid) VALUES (ticket_seq.NEXTVAL, 4, 3, 'NEET2024-0001', 'H2-01', TO_DATE('2024-04-20','YYYY-MM-DD'), 1)");
            stmt.executeUpdate("INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid) VALUES (ticket_seq.NEXTVAL, 6, 5, 'CAT2024-0001', 'B-22', TO_DATE('2024-11-10','YYYY-MM-DD'), 1)");
            stmt.executeUpdate("INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, roll_number, seat_number, issued_date, is_valid) VALUES (ticket_seq.NEXTVAL, 7, 4, 'NEET2024-0002', 'P1-05', TO_DATE('2024-04-20','YYYY-MM-DD'), 1)");
            System.out.println("  6 Hall Tickets inserted.");

            // ----- Results -----
            stmt.executeUpdate("INSERT INTO Result (result_id, registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks) VALUES (result_seq.NEXTVAL, 1, 245.50, 'A', 98.50, 1520, 'Pass', TO_DATE('2024-05-15','YYYY-MM-DD'), 'Excellent performance')");
            stmt.executeUpdate("INSERT INTO Result (result_id, registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks) VALUES (result_seq.NEXTVAL, 2, 180.00, 'B', 85.30, 15200, 'Pass', TO_DATE('2024-05-15','YYYY-MM-DD'), NULL)");
            stmt.executeUpdate("INSERT INTO Result (result_id, registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks) VALUES (result_seq.NEXTVAL, 3, 65.00, 'D', 40.10, 98000, 'Fail', TO_DATE('2024-05-15','YYYY-MM-DD'), 'Below passing marks')");
            stmt.executeUpdate("INSERT INTO Result (result_id, registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks) VALUES (result_seq.NEXTVAL, 4, 580.00, 'A', 96.70, 5600, 'Pass', TO_DATE('2024-06-10','YYYY-MM-DD'), NULL)");
            stmt.executeUpdate("INSERT INTO Result (result_id, registration_id, marks_obtained, grade, percentile, rank_position, result_status, published_date, remarks) VALUES (result_seq.NEXTVAL, 7, 420.00, 'B', 78.20, 45000, 'Pass', TO_DATE('2024-06-10','YYYY-MM-DD'), NULL)");
            System.out.println("  5 Results inserted.");

            // ----- Grievances -----
            stmt.executeUpdate("INSERT INTO Grievance (grievance_id, student_id, result_id, grievance_type, description, filed_date, status) VALUES (grievance_seq.NEXTVAL, 3, 3, 'Result', 'My marks seem incorrect. I request re-evaluation of Paper 2.', TO_DATE('2024-05-20','YYYY-MM-DD'), 'Open')");
            stmt.executeUpdate("INSERT INTO Grievance (grievance_id, student_id, result_id, grievance_type, description, filed_date, status, resolved_date, resolution_notes) VALUES (grievance_seq.NEXTVAL, 2, 2, 'Result', 'Percentile calculation appears wrong.', TO_DATE('2024-05-18','YYYY-MM-DD'), 'Resolved', TO_DATE('2024-05-25','YYYY-MM-DD'), 'Percentile verified and found correct.')");
            stmt.executeUpdate("INSERT INTO Grievance (grievance_id, student_id, result_id, grievance_type, description, filed_date, status) VALUES (grievance_seq.NEXTVAL, 5, NULL, 'Registration', 'Payment was deducted but registration shows Pending.', TO_DATE('2024-02-10','YYYY-MM-DD'), 'Under Review')");
            System.out.println("  3 Grievances inserted.");

            // ----- Questions (JEE - exam_id=1) -----
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 1, 'What is the derivative of sin(x)?', 'MCQ', 'cos(x)', 4, 1, 'Easy', 'Mathematics')");
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 1, 'The SI unit of force is?', 'MCQ', 'Newton', 4, 1, 'Easy', 'Physics')");
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 1, 'What is the hybridization of carbon in methane?', 'MCQ', 'sp3', 4, 1, 'Medium', 'Chemistry')");
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 1, 'Evaluate the integral of e^x dx.', 'Numerical', 'e^x + C', 4, 0, 'Medium', 'Mathematics')");
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 1, 'Explain the Heisenberg Uncertainty Principle.', 'Short', 'Position and momentum cannot be simultaneously measured with arbitrary precision.', 4, 0, 'Hard', 'Physics')");

            // ----- Questions (NEET - exam_id=2) -----
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 2, 'What is the powerhouse of the cell?', 'MCQ', 'Mitochondria', 4, 1, 'Easy', 'Biology')");
            stmt.executeUpdate("INSERT INTO Question (question_id, exam_id, question_text, question_type, correct_answer, marks, negative_marks, difficulty_level, subject_area) VALUES (question_seq.NEXTVAL, 2, 'Which blood group is the universal donor?', 'MCQ', 'O negative', 4, 1, 'Easy', 'Biology')");
            System.out.println("  7 Questions inserted.");

            // ----- Responses -----
            // Student 1 (Arjun) answering JEE questions
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 1, 1, 'cos(x)', 1, 4, 45)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 1, 2, 'Newton', 1, 4, 30)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 1, 3, 'sp3', 1, 4, 60)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 1, 4, 'e^x + C', 1, 4, 90)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 1, 5, 'It is about uncertainty in quantum mechanics.', 0, 2, 120)");

            // Student 2 (Priya) answering JEE questions
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 2, 1, 'cos(x)', 1, 4, 50)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 2, 2, 'Joule', 0, -1, 25)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 2, 3, 'sp2', 0, -1, 55)");

            // Student 3 (Rahul) answering JEE questions
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 3, 1, '-cos(x)', 0, -1, 40)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 3, 2, 'Newton', 1, 4, 35)");

            // Student 4 (Ananya) answering NEET questions
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 4, 6, 'Mitochondria', 1, 4, 20)");
            stmt.executeUpdate("INSERT INTO Response (response_id, registration_id, question_id, answer_given, is_correct, marks_awarded, time_taken_secs) VALUES (response_seq.NEXTVAL, 4, 7, 'O negative', 1, 4, 25)");
            System.out.println("  12 Responses inserted.");

            System.out.println("\nAll sample data loaded successfully!");

        } catch (SQLException e) {
            System.out.println("Error inserting data: " + e.getMessage());
        }
    }

    // ========================== STUDENT OPERATIONS ==========================

    private static void addStudent() {
        System.out.println("\n--- Add New Student ---");
        String firstName   = readLine("First Name: ");
        String lastName    = readLine("Last Name: ");
        String dob         = readLine("Date of Birth (YYYY-MM-DD): ");
        String gender      = readLine("Gender (M/F/O): ");
        String email       = readLine("Email: ");
        String phone       = readLine("Phone: ");
        String nationality = readLine("Nationality: ");
        String category    = readLine("Category (General/OBC/SC/ST/EWS): ");

        String sql = "INSERT INTO Student (student_id, first_name, last_name, date_of_birth, " +
                     "gender, email, phone, nationality, category) " +
                     "VALUES (student_seq.NEXTVAL, ?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, firstName);
            ps.setString(2, lastName);
            ps.setString(3, dob);
            ps.setString(4, gender);
            ps.setString(5, email);
            ps.setString(6, phone);
            ps.setString(7, nationality);
            ps.setString(8, category);
            ps.executeUpdate();
            System.out.println("Student added successfully!");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void viewAllStudents() {
        String sql = "SELECT student_id, first_name, last_name, " +
                     "TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS dob, " +
                     "gender, email, category FROM Student ORDER BY student_id";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            System.out.println("\n--- All Students ---");
            System.out.printf("%-5s %-12s %-12s %-12s %-4s %-28s %-10s%n",
                "ID", "First Name", "Last Name", "DOB", "Gen", "Email", "Category");
            System.out.println("------------------------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-5d %-12s %-12s %-12s %-4s %-28s %-10s%n",
                    rs.getInt("student_id"),
                    rs.getString("first_name"),
                    rs.getString("last_name"),
                    rs.getString("dob"),
                    rs.getString("gender"),
                    rs.getString("email"),
                    rs.getString("category"));
            }
            if (!found) System.out.println("  No students found.");

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void searchStudentById() {
        int id = readInt("Enter Student ID: ");

        String sql = "SELECT student_id, first_name, last_name, " +
                     "TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS dob, " +
                     "gender, email, phone, nationality, category " +
                     "FROM Student WHERE student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                System.out.println("\n--- Student Details ---");
                System.out.println("ID          : " + rs.getInt("student_id"));
                System.out.println("Name        : " + rs.getString("first_name") + " " + rs.getString("last_name"));
                System.out.println("DOB         : " + rs.getString("dob"));
                System.out.println("Gender      : " + rs.getString("gender"));
                System.out.println("Email       : " + rs.getString("email"));
                System.out.println("Phone       : " + rs.getString("phone"));
                System.out.println("Nationality : " + rs.getString("nationality"));
                System.out.println("Category    : " + rs.getString("category"));
            } else {
                System.out.println("Student not found with ID: " + id);
            }
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== EXAM OPERATIONS ==========================

    private static void addExam() {
        System.out.println("\n--- Add New Exam ---");
        String name     = readLine("Exam Name: ");
        String code     = readLine("Exam Code: ");
        String body     = readLine("Conducting Body: ");
        int totalMarks  = readInt("Total Marks: ");
        int passMarks   = readInt("Passing Marks: ");
        int duration    = readInt("Duration (minutes): ");
        String level    = readLine("Exam Level (National/State/District): ");

        String sql = "INSERT INTO Exam (exam_id, exam_name, exam_code, conducting_body, " +
                     "total_marks, passing_marks, duration_minutes, exam_level, is_active) " +
                     "VALUES (exam_seq.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, 1)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, code);
            ps.setString(3, body);
            ps.setInt(4, totalMarks);
            ps.setInt(5, passMarks);
            ps.setInt(6, duration);
            ps.setString(7, level);
            ps.executeUpdate();
            System.out.println("Exam added successfully!");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void viewAllExams() {
        String sql = "SELECT exam_id, exam_name, exam_code, conducting_body, " +
                     "total_marks, passing_marks, duration_minutes, exam_level " +
                     "FROM Exam ORDER BY exam_id";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            System.out.println("\n--- All Exams ---");
            System.out.printf("%-5s %-35s %-10s %-25s %-7s %-7s %-5s %-10s%n",
                "ID", "Exam Name", "Code", "Conducting Body", "Total", "Pass", "Mins", "Level");
            System.out.println("--------------------------------------------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-5d %-35s %-10s %-25s %-7d %-7d %-5d %-10s%n",
                    rs.getInt("exam_id"),
                    rs.getString("exam_name"),
                    rs.getString("exam_code"),
                    rs.getString("conducting_body"),
                    rs.getInt("total_marks"),
                    rs.getInt("passing_marks"),
                    rs.getInt("duration_minutes"),
                    rs.getString("exam_level"));
            }
            if (!found) System.out.println("  No exams found.");

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== REGISTRATION OPERATIONS ==========================

    private static void registerStudent() {
        System.out.println("\n--- Register Student for Exam ---");
        int studentId   = readInt("Student ID: ");
        int examId      = readInt("Exam ID: ");
        String feePaid  = readLine("Fee Paid? (y/n): ");
        String payRef   = null;
        String status   = "Pending";
        int fee = 0;

        if (feePaid.equalsIgnoreCase("y")) {
            fee = 1;
            payRef = readLine("Payment Reference: ");
            status = "Confirmed";
        }

        String sql = "INSERT INTO Registration (registration_id, student_id, exam_id, " +
                     "registration_date, fee_paid, payment_ref, status, attempt_number) " +
                     "VALUES (registration_seq.NEXTVAL, ?, ?, SYSDATE, ?, ?, ?, 1)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, examId);
            ps.setInt(3, fee);
            if (payRef != null) {
                ps.setString(4, payRef);
            } else {
                ps.setNull(4, java.sql.Types.VARCHAR);
            }
            ps.setString(5, status);
            ps.executeUpdate();
            System.out.println("Registration successful! Status: " + status);
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void updateRegistration() {
        System.out.println("\n--- Update Registration (Payment) ---");
        int regId     = readInt("Registration ID: ");
        String payRef = readLine("Payment Reference: ");
        String status = readLine("New Status (Confirmed/Cancelled): ");

        String sql = "UPDATE Registration SET fee_paid = 1, payment_ref = ?, status = ? " +
                     "WHERE registration_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, payRef);
            ps.setString(2, status);
            ps.setInt(3, regId);
            int rows = ps.executeUpdate();
            if (rows > 0) {
                System.out.println("Registration updated successfully!");
            } else {
                System.out.println("Registration not found with ID: " + regId);
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.14: Confirmed registrations for an exam
    private static void viewRegistrations() {
        int examId = readInt("Enter Exam ID: ");

        String sql = "SELECT s.student_id, " +
                     "s.first_name || ' ' || s.last_name AS student_name, " +
                     "s.email, r.registration_id, " +
                     "TO_CHAR(r.registration_date, 'YYYY-MM-DD') AS reg_date, " +
                     "r.attempt_number " +
                     "FROM Registration r " +
                     "JOIN Student s ON r.student_id = s.student_id " +
                     "WHERE r.exam_id = ? AND r.status = 'Confirmed' " +
                     "ORDER BY s.last_name, s.first_name";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Confirmed Registrations for Exam ID: " + examId + " ---");
            System.out.printf("%-5s %-20s %-28s %-8s %-12s %-7s%n",
                "SID", "Student Name", "Email", "RegID", "Reg Date", "Attempt");
            System.out.println("----------------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-5d %-20s %-28s %-8d %-12s %-7d%n",
                    rs.getInt("student_id"),
                    rs.getString("student_name"),
                    rs.getString("email"),
                    rs.getInt("registration_id"),
                    rs.getString("reg_date"),
                    rs.getInt("attempt_number"));
            }
            if (!found) System.out.println("  No confirmed registrations found.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== CENTRE & SCHEDULE ==========================

    private static void addExamCentre() {
        System.out.println("\n--- Add Exam Centre ---");
        String name     = readLine("Centre Name: ");
        String address  = readLine("Address: ");
        String city     = readLine("City: ");
        String state    = readLine("State: ");
        String pincode  = readLine("Pincode: ");
        int capacity    = readInt("Total Capacity: ");
        String person   = readLine("Contact Person: ");
        String phone    = readLine("Contact Phone: ");

        String sql = "INSERT INTO Exam_Centre (centre_id, centre_name, address, city, state, " +
                     "pincode, total_capacity, contact_person, contact_phone, is_active) " +
                     "VALUES (centre_seq.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, 1)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, address);
            ps.setString(3, city);
            ps.setString(4, state);
            ps.setString(5, pincode);
            ps.setInt(6, capacity);
            ps.setString(7, person);
            ps.setString(8, phone);
            ps.executeUpdate();
            System.out.println("Exam Centre added successfully!");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    private static void addSchedule() {
        System.out.println("\n--- Add Schedule ---");
        int examId      = readInt("Exam ID: ");
        int centreId    = readInt("Centre ID: ");
        String examDate = readLine("Exam Date (YYYY-MM-DD): ");
        String start    = readLine("Start Time (HH:MM:SS): ");
        String end      = readLine("End Time (HH:MM:SS): ");
        String hall     = readLine("Hall Number: ");
        int seats       = readInt("Seats Available: ");
        String shift    = readLine("Shift (Morning/Afternoon/Evening): ");

        String sql = "INSERT INTO Schedule (schedule_id, exam_id, centre_id, exam_date, " +
                     "start_time, end_time, hall_number, seats_available, shift) " +
                     "VALUES (schedule_seq.NEXTVAL, ?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ps.setInt(2, centreId);
            ps.setString(3, examDate);
            ps.setString(4, start);
            ps.setString(5, end);
            ps.setString(6, hall);
            ps.setInt(7, seats);
            ps.setString(8, shift);
            ps.executeUpdate();
            System.out.println("Schedule added successfully!");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.17: Available seats per centre for an exam
    private static void viewAvailableSeats() {
        int examId = readInt("Enter Exam ID: ");

        String sql = "SELECT ec.centre_name, ec.city, sc.hall_number, sc.shift, " +
                     "TO_CHAR(sc.exam_date, 'YYYY-MM-DD') AS exam_date, sc.seats_available " +
                     "FROM Schedule sc " +
                     "JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id " +
                     "WHERE sc.exam_id = ? AND sc.seats_available > 0 " +
                     "ORDER BY ec.city, sc.exam_date, sc.shift";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Available Seats for Exam ID: " + examId + " ---");
            System.out.printf("%-28s %-12s %-6s %-12s %-12s %-6s%n",
                "Centre", "City", "Hall", "Shift", "Date", "Seats");
            System.out.println("------------------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-28s %-12s %-6s %-12s %-12s %-6d%n",
                    rs.getString("centre_name"),
                    rs.getString("city"),
                    rs.getString("hall_number"),
                    rs.getString("shift"),
                    rs.getString("exam_date"),
                    rs.getInt("seats_available"));
            }
            if (!found) System.out.println("  No available seats found.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== HALL TICKET ==========================

    private static void generateHallTicket() {
        System.out.println("\n--- Generate Hall Ticket ---");
        int regId       = readInt("Registration ID: ");
        int schedId     = readInt("Schedule ID: ");
        String rollNo   = readLine("Roll Number: ");
        String seatNo   = readLine("Seat Number: ");

        String sql = "INSERT INTO Hall_Ticket (ticket_id, registration_id, schedule_id, " +
                     "roll_number, seat_number, issued_date, is_valid) " +
                     "VALUES (ticket_seq.NEXTVAL, ?, ?, ?, ?, SYSDATE, 1)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, regId);
            ps.setInt(2, schedId);
            ps.setString(3, rollNo);
            ps.setString(4, seatNo);
            ps.executeUpdate();
            System.out.println("Hall Ticket generated successfully! Roll No: " + rollNo);
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.18: Hall ticket details for a student
    private static void viewHallTicket() {
        int studentId = readInt("Enter Student ID: ");

        String sql = "SELECT s.first_name || ' ' || s.last_name AS student_name, " +
                     "ht.roll_number, ht.seat_number, " +
                     "ec.centre_name, ec.city AS centre_city, " +
                     "TO_CHAR(sc.exam_date, 'YYYY-MM-DD') AS exam_date, " +
                     "sc.start_time, sc.end_time, sc.hall_number, e.exam_name " +
                     "FROM Hall_Ticket ht " +
                     "JOIN Registration r ON ht.registration_id = r.registration_id " +
                     "JOIN Student s ON r.student_id = s.student_id " +
                     "JOIN Schedule sc ON ht.schedule_id = sc.schedule_id " +
                     "JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id " +
                     "JOIN Exam e ON r.exam_id = e.exam_id " +
                     "WHERE s.student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Hall Ticket(s) for Student ID: " + studentId + " ---");
            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.println("------------------------------------------");
                System.out.println("Student     : " + rs.getString("student_name"));
                System.out.println("Exam        : " + rs.getString("exam_name"));
                System.out.println("Roll Number : " + rs.getString("roll_number"));
                System.out.println("Seat Number : " + rs.getString("seat_number"));
                System.out.println("Centre      : " + rs.getString("centre_name") + ", " + rs.getString("centre_city"));
                System.out.println("Date        : " + rs.getString("exam_date"));
                System.out.println("Time        : " + rs.getString("start_time") + " to " + rs.getString("end_time"));
                System.out.println("Hall        : " + rs.getString("hall_number"));
            }
            if (!found) System.out.println("  No hall tickets found for this student.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== RESULT ==========================

    private static void addResult() {
        System.out.println("\n--- Add Result ---");
        int regId           = readInt("Registration ID: ");
        double marks        = readDouble("Marks Obtained: ");
        String grade        = readLine("Grade (A/B/C/D/F): ");
        double percentile   = readDouble("Percentile: ");
        int rankPos         = readInt("Rank Position: ");
        String status       = readLine("Result Status (Pass/Fail/Absent/Withheld): ");

        String sql = "INSERT INTO Result (result_id, registration_id, marks_obtained, " +
                     "grade, percentile, rank_position, result_status, published_date) " +
                     "VALUES (result_seq.NEXTVAL, ?, ?, ?, ?, ?, ?, SYSDATE)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, regId);
            ps.setDouble(2, marks);
            ps.setString(3, grade);
            ps.setDouble(4, percentile);
            ps.setInt(5, rankPos);
            ps.setString(6, status);
            ps.executeUpdate();
            System.out.println("Result added successfully!");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.15: Rank list for an exam
    private static void generateRankList() {
        int examId = readInt("Enter Exam ID: ");

        String sql = "SELECT s.first_name || ' ' || s.last_name AS student_name, " +
                     "ht.roll_number, res.marks_obtained, res.grade, res.percentile, " +
                     "RANK() OVER (ORDER BY res.marks_obtained DESC) AS computed_rank " +
                     "FROM Result res " +
                     "JOIN Registration r ON res.registration_id = r.registration_id " +
                     "JOIN Student s ON r.student_id = s.student_id " +
                     "JOIN Hall_Ticket ht ON ht.registration_id = r.registration_id " +
                     "WHERE r.exam_id = ? AND res.result_status = 'Pass' " +
                     "ORDER BY res.marks_obtained DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Rank List for Exam ID: " + examId + " (Passed Students) ---");
            System.out.printf("%-4s %-20s %-16s %-8s %-6s %-10s%n",
                "Rank", "Student Name", "Roll Number", "Marks", "Grade", "Percentile");
            System.out.println("------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-4d %-20s %-16s %-8.2f %-6s %-10.2f%n",
                    rs.getInt("computed_rank"),
                    rs.getString("student_name"),
                    rs.getString("roll_number"),
                    rs.getDouble("marks_obtained"),
                    rs.getString("grade"),
                    rs.getDouble("percentile"));
            }
            if (!found) System.out.println("  No passed results found for this exam.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== GRIEVANCE ==========================

    private static void fileGrievance() {
        System.out.println("\n--- File Grievance ---");
        int studentId   = readInt("Student ID: ");
        String hasResult = readLine("Associate with a Result? (y/n): ");
        Integer resultId = null;
        if (hasResult.equalsIgnoreCase("y")) {
            resultId = readInt("Result ID: ");
        }
        String type = readLine("Grievance Type (Result/Registration/Centre): ");
        String desc = readLine("Description: ");

        String sql = "INSERT INTO Grievance (grievance_id, student_id, result_id, " +
                     "grievance_type, description, filed_date, status) " +
                     "VALUES (grievance_seq.NEXTVAL, ?, ?, ?, ?, SYSDATE, 'Open')";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            if (resultId != null) {
                ps.setInt(2, resultId);
            } else {
                ps.setNull(2, java.sql.Types.NUMERIC);
            }
            ps.setString(3, type);
            ps.setString(4, desc);
            ps.executeUpdate();
            System.out.println("Grievance filed successfully!");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.20: Open grievances with student and result info
    private static void viewOpenGrievances() {
        String sql = "SELECT g.grievance_id, " +
                     "s.first_name || ' ' || s.last_name AS student_name, " +
                     "g.grievance_type, " +
                     "TO_CHAR(g.filed_date, 'YYYY-MM-DD') AS filed_date, " +
                     "g.status, res.marks_obtained, res.result_status " +
                     "FROM Grievance g " +
                     "JOIN Student s ON g.student_id = s.student_id " +
                     "LEFT JOIN Result res ON g.result_id = res.result_id " +
                     "WHERE g.status <> 'Resolved' " +
                     "ORDER BY g.filed_date ASC";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            System.out.println("\n--- Open / Under Review Grievances ---");
            System.out.printf("%-5s %-20s %-15s %-12s %-15s %-8s %-10s%n",
                "GID", "Student", "Type", "Filed", "Status", "Marks", "Result");
            System.out.println("--------------------------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                double marks = rs.getDouble("marks_obtained");
                String marksStr = rs.wasNull() ? "N/A" : String.format("%.2f", marks);
                String resStatus = rs.getString("result_status");
                if (resStatus == null) resStatus = "N/A";

                System.out.printf("%-5d %-20s %-15s %-12s %-15s %-8s %-10s%n",
                    rs.getInt("grievance_id"),
                    rs.getString("student_name"),
                    rs.getString("grievance_type"),
                    rs.getString("filed_date"),
                    rs.getString("status"),
                    marksStr,
                    resStatus);
            }
            if (!found) System.out.println("  No open grievances found.");

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== ANALYTICS / REPORTS ==========================

    // Listing 15.16: Students by category for an exam
    private static void studentsByCategory() {
        int examId = readInt("Enter Exam ID: ");

        String sql = "SELECT s.category, COUNT(*) AS num_registered " +
                     "FROM Registration r " +
                     "JOIN Student s ON r.student_id = s.student_id " +
                     "WHERE r.exam_id = ? " +
                     "GROUP BY s.category " +
                     "ORDER BY num_registered DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Students by Category for Exam ID: " + examId + " ---");
            System.out.printf("%-15s %-10s%n", "Category", "Count");
            System.out.println("---------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-15s %-10d%n",
                    rs.getString("category"),
                    rs.getInt("num_registered"));
            }
            if (!found) System.out.println("  No registrations found.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.21: Pass percentage per exam centre
    private static void passPercentageByCentre() {
        int examId = readInt("Enter Exam ID: ");

        String sql = "SELECT ec.centre_name, ec.city, " +
                     "COUNT(res.result_id) AS total_appeared, " +
                     "SUM(CASE WHEN res.result_status = 'Pass' THEN 1 ELSE 0 END) AS passed, " +
                     "ROUND(100.0 * SUM(CASE WHEN res.result_status = 'Pass' THEN 1 ELSE 0 END) " +
                     "/ COUNT(res.result_id), 2) AS pass_pct " +
                     "FROM Result res " +
                     "JOIN Registration reg ON res.registration_id = reg.registration_id " +
                     "JOIN Hall_Ticket ht ON ht.registration_id = reg.registration_id " +
                     "JOIN Schedule sc ON ht.schedule_id = sc.schedule_id " +
                     "JOIN Exam_Centre ec ON sc.centre_id = ec.centre_id " +
                     "WHERE reg.exam_id = ? " +
                     "GROUP BY ec.centre_id, ec.centre_name, ec.city " +
                     "ORDER BY pass_pct DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Pass Percentage by Centre for Exam ID: " + examId + " ---");
            System.out.printf("%-28s %-12s %-10s %-8s %-8s%n",
                "Centre", "City", "Appeared", "Passed", "Pass %");
            System.out.println("----------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-28s %-12s %-10d %-8d %-8.2f%n",
                    rs.getString("centre_name"),
                    rs.getString("city"),
                    rs.getInt("total_appeared"),
                    rs.getInt("passed"),
                    rs.getDouble("pass_pct"));
            }
            if (!found) System.out.println("  No results found for this exam.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Listing 15.19: Average marks per subject area
    private static void avgMarksBySubject() {
        int examId = readInt("Enter Exam ID: ");

        String sql = "SELECT q.subject_area, " +
                     "COUNT(rsp.response_id) AS responses, " +
                     "ROUND(AVG(rsp.marks_awarded), 2) AS avg_marks, " +
                     "MAX(rsp.marks_awarded) AS max_marks, " +
                     "MIN(rsp.marks_awarded) AS min_marks " +
                     "FROM Response rsp " +
                     "JOIN Question q ON rsp.question_id = q.question_id " +
                     "WHERE q.exam_id = ? " +
                     "GROUP BY q.subject_area " +
                     "ORDER BY avg_marks DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ResultSet rs = ps.executeQuery();

            System.out.println("\n--- Average Marks by Subject for Exam ID: " + examId + " ---");
            System.out.printf("%-15s %-10s %-10s %-10s %-10s%n",
                "Subject", "Responses", "Avg Marks", "Max Marks", "Min Marks");
            System.out.println("-----------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-15s %-10d %-10.2f %-10.1f %-10.1f%n",
                    rs.getString("subject_area"),
                    rs.getInt("responses"),
                    rs.getDouble("avg_marks"),
                    rs.getDouble("max_marks"),
                    rs.getDouble("min_marks"));
            }
            if (!found) System.out.println("  No responses found for this exam.");
            rs.close();

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // Verification: Row counts for all tables
    private static void viewRowCounts() {
        String sql = "SELECT 'STUDENT' AS tbl, COUNT(*) AS cnt FROM Student " +
                     "UNION ALL SELECT 'EXAM', COUNT(*) FROM Exam " +
                     "UNION ALL SELECT 'REGISTRATION', COUNT(*) FROM Registration " +
                     "UNION ALL SELECT 'EXAM_CENTRE', COUNT(*) FROM Exam_Centre " +
                     "UNION ALL SELECT 'SCHEDULE', COUNT(*) FROM Schedule " +
                     "UNION ALL SELECT 'HALL_TICKET', COUNT(*) FROM Hall_Ticket " +
                     "UNION ALL SELECT 'RESULT', COUNT(*) FROM Result " +
                     "UNION ALL SELECT 'GRIEVANCE', COUNT(*) FROM Grievance " +
                     "UNION ALL SELECT 'QUESTION', COUNT(*) FROM Question " +
                     "UNION ALL SELECT 'RESPONSE', COUNT(*) FROM Response";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            System.out.println("\n--- Table Row Counts ---");
            System.out.printf("%-18s %-6s%n", "Table", "Rows");
            System.out.println("------------------------");

            while (rs.next()) {
                System.out.printf("%-18s %-6d%n",
                    rs.getString("tbl"),
                    rs.getInt("cnt"));
            }

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    // ========================== UTILITY METHODS ==========================

    private static int readInt(String prompt) {
        System.out.print(prompt);
        while (!sc.hasNextInt()) {
            System.out.print("Please enter a valid number: ");
            sc.next();
        }
        int val = sc.nextInt();
        sc.nextLine(); // consume newline
        return val;
    }

    private static double readDouble(String prompt) {
        System.out.print(prompt);
        while (!sc.hasNextDouble()) {
            System.out.print("Please enter a valid number: ");
            sc.next();
        }
        double val = sc.nextDouble();
        sc.nextLine(); // consume newline
        return val;
    }

    private static String readLine(String prompt) {
        System.out.print(prompt);
        return sc.nextLine().trim();
    }
}
