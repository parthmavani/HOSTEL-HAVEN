const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createGuard() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hostel_leave_management'
        });

        console.log('Connected to MySQL.');

        // 1. Update users table role enum to include 'guard'
        console.log('Updating users table role enum...');
        await connection.query(`
            ALTER TABLE users MODIFY COLUMN role ENUM('student','parent','warden','counsellor','admin','guard') NOT NULL
        `);
        console.log('Role enum updated successfully.');

        // 2. Create guard user
        const email = 'guard@university.edu';
        const password = 'guard123';
        const fullName = 'Campus Security Guard 1';

        // Check if exists
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.log('Guard user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await connection.query(
                'UPDATE users SET password = ?, is_active = TRUE WHERE email = ?',
                [hashedPassword, email]
            );
        } else {
            console.log('Creating new guard user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await connection.query(
                'INSERT INTO users (full_name, email, password, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
                [fullName, email, hashedPassword, 'guard']
            );
        }

        console.log(`\n✅ Guard Account Ready:`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

createGuard();
