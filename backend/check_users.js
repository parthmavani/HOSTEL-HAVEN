const pool = require('./config/db');

async function checkUsers() {
    try {
        const [rows] = await pool.query('SELECT user_id, full_name, role FROM users');
        console.log('Users in DB:');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error querying DB:', err);
        process.exit(1);
    }
}

checkUsers();
