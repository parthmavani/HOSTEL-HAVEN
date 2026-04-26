const pool = require('./config/db');

async function checkRoles() {
    try {
        const [rows] = await pool.query('SELECT user_id, full_name, role, length(role) as len FROM users');
        console.log('User Roles with length:');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error querying DB:', err);
        process.exit(1);
    }
}

checkRoles();
