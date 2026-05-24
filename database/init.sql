-- PostgreSQL Initialization Script
-- AI-Based Student Performance Prediction System

-- Create extension for UUID if needed, though we use SERIAL for simplicity & fast indexing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    UNIQUE (student_id, date)
);

-- 5. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score FLOAT DEFAULT 0.0,
    max_score FLOAT DEFAULT 100.0,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Submitted', 'Graded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_rate FLOAT NOT NULL,     -- e.g., 0 to 100
    study_hours FLOAT NOT NULL,         -- hours per week
    previous_grades FLOAT NOT NULL,      -- average percentage
    assignment_scores FLOAT NOT NULL,    -- average assignment grade
    sleep_hours FLOAT NOT NULL,          -- sleep per night
    internet_access BOOLEAN NOT NULL DEFAULT TRUE,
    participation FLOAT NOT NULL,        -- participation index (0-100)
    family_support FLOAT NOT NULL,       -- support index (0-100)
    predicted_score FLOAT NOT NULL,      -- GPA or percentage predicted
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
    confidence_score FLOAT NOT NULL,     -- model prediction confidence
    recommendations TEXT,
    improvement_strategy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    generated_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --- Optimized Indexing ---
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_student ON predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_reports_student ON reports(student_id);

-- --- Default Seed Data ---
-- Admin account (password is "admin123", hashed using bcrypt: $2b$12$6t3rQ11JvT.e5t3X6/g2KekfF78/d/C.FkZ6o3B2W0m6vQG.4q5Yy)
INSERT INTO users (full_name, email, hashed_password, role)
VALUES ('System Admin', 'admin@aiacademy.com', '$2b$12$6t3rQ11JvT.e5t3X6/g2KekfF78/d/C.FkZ6o3B2W0m6vQG.4q5Yy', 'admin')
ON CONFLICT (email) DO NOTHING;
