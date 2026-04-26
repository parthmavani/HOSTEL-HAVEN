const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database...');

        // 1. Clean existing data
        console.log('Cleaning existing data...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DELETE FROM notifications');
        await connection.query('DELETE FROM leave_approvals');
        await connection.query('DELETE FROM leave_requests');
        await connection.query('DELETE FROM parent_student');
        await connection.query('DELETE FROM students');
        await connection.query('DELETE FROM authorities');
        await connection.query('DELETE FROM users');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Create Users
        console.log('Creating users...');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const users = [
            // Student
            { full_name: 'Rahul Sharma', email: 'rahul@student.com', role: 'student' },
            // Parent
            { full_name: 'Rajesh Sharma', email: 'rajesh@parent.com', role: 'parent' },
            // Warden
            { full_name: 'Suresh Verma', email: 'warden@hostel.com', role: 'warden' },
            // Counsellor
            { full_name: 'Dr. Anita Desai', email: 'counsellor@college.com', role: 'counsellor' },
            // Admin
            { full_name: 'System Admin', email: 'admin@hostel.com', role: 'admin' }
        ];

        const userIds = {};

        for (const user of users) {
            const [result] = await connection.query(
                'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
                [user.full_name, user.email, password, user.role]
            );
            userIds[user.role] = result.insertId;
        }

        // 3. Add Role Details
        console.log('Adding role details...');

        // Student Details
        await connection.query(
            'INSERT INTO students (user_id, enrollment_number, room_number, department, year_of_study) VALUES (?, ?, ?, ?, ?)',
            [userIds['student'], 'EN2025001', '101-B', 'Computer Science', 3]
        );

        // Link Parent-Student
        await connection.query(
            'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
            [userIds['parent'], 1] // Assuming auto-increment ID for student table starts at 1, but safer to query.
            // Wait, student_id in parent_student usually refers to the ID in `students` table or `users` table? 
            // Checking authController: values are [parentUser[0].user_id, studentResult.insertId].
            // So it refers to the primary key of the `students` table.
        );
        // Let's get the student primary key
        const [studRows] = await connection.query('SELECT student_id FROM students WHERE user_id = ?', [userIds['student']]);
        const studentPK = studRows[0].student_id;

        // Re-insert parent_student with correct ID
        await connection.query('DELETE FROM parent_student'); // Clear the speculative one if I ran it
        await connection.query(
            'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
            [userIds['parent'], studentPK]
        );

        // Warden Details
        await connection.query(
            'INSERT INTO authorities (user_id, designation, office_location) VALUES (?, ?, ?)',
            [userIds['warden'], 'Chief Warden', 'Block A, Ground Floor']
        );

        // Counsellor Details
        await connection.query(
            'INSERT INTO authorities (user_id, designation, office_location) VALUES (?, ?, ?)',
            [userIds['counsellor'], 'Senior Counsellor', 'Student Center, Room 204']
        );

        // 4. Create Leaves (Preview/Sample Data)
        console.log('Creating sample leaves...');

        const leaves = [
            {
                leave_type: 'HOME',
                description: 'Going home for sister\'s wedding',
                from_date: '2026-03-10',
                to_date: '2026-03-15',
                status: 'PENDING',
                out_time: '10:00:00',
                expected_return_time: '18:00:00'
            },
            {
                leave_type: 'OUTING',
                description: 'Weekend outing with friends',
                from_date: '2026-02-20',
                to_date: '2026-02-20',
                status: 'APPROVED',
                out_time: '14:00:00',
                expected_return_time: '20:00:00'
            },
            {
                leave_type: 'EMERGENCY',
                description: 'Medical appointment',
                from_date: '2026-02-01',
                to_date: '2026-02-01',
                status: 'REJECTED',
                rejection_reason: 'Invalid proof submitted',
                out_time: '09:00:00',
                expected_return_time: '12:00:00'
            }
        ];

        for (const leave of leaves) {
            await connection.query(
                `INSERT INTO leave_requests (
                    student_id, leave_type, description, from_date, to_date, 
                    out_time, expected_return_time, current_status, rejection_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userIds['student'],
                    leave.leave_type,
                    leave.description,
                    leave.from_date,
                    leave.to_date,
                    leave.out_time,
                    leave.expected_return_time,
                    leave.status,
                    leave.rejection_reason || null
                ]
            );
        }

        console.log('--- Data Seeding Completed ---');
        console.log('Credentials for testing:');
        console.log('Student:    rahul@student.com / password123');
        console.log('Parent:     rajesh@parent.com / password123');
        console.log('Warden:     warden@hostel.com / password123');
        console.log('Counsellor: counsellor@college.com / password123');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        if (connection) await connection.end();
    }
};

seedData();
