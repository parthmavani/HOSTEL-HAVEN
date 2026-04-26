const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testLogin() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hostel_leave_management'
        });

        const email = 'guard@university.edu';
        const password = 'guard123';

        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            console.log('User not found in DB');
            return;
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Login test for ${email}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
        console.log('User Role:', user.role);
        console.log('Is Active:', user.is_active);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testLogin();
