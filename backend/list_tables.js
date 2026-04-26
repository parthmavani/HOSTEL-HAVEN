const pool = require('./config/db');

async function listTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        const dbName = 'hostel_leave_management';
        const key = `Tables_in_${dbName}`;
        console.log('Tables:');
        rows.forEach(row => console.log(row[key]));
        process.exit(0);
    } catch (err) {
        console.error('Error querying DB:', err);
        process.exit(1);
    }
}

listTables();
