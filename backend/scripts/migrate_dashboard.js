const pool = require('../config/db');

async function migrate() {
    try {
        // 1. Gate passes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS gate_passes (
                pass_id INT AUTO_INCREMENT PRIMARY KEY,
                leave_id INT NOT NULL,
                student_id INT NOT NULL,
                qr_code TEXT NOT NULL,
                status ENUM('active','used','expired') DEFAULT 'active',
                scan_in TIMESTAMP NULL,
                scan_out TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (leave_id) REFERENCES leave_requests(leave_id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created gate_passes table');

        // 2. Mood tracker table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mood_entries (
                entry_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                mood ENUM('great','good','okay','low','bad') NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_date (user_id, created_at)
            )
        `);
        console.log('✅ Created mood_entries table');

        // 3. Complaints table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                complaint_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category ENUM('hostel','food','security','maintenance','other') DEFAULT 'other',
                status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
                is_anonymous BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created complaints table');

        // 4. Announcements table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                announcement_id INT AUTO_INCREMENT PRIMARY KEY,
                posted_by INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created announcements table');

        // 5. Counseling appointments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS counseling_appointments (
                appointment_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                counsellor_id INT,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                reason TEXT,
                status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
                is_private BOOLEAN DEFAULT FALSE,
                is_anonymous BOOLEAN DEFAULT FALSE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created counseling_appointments table');

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
