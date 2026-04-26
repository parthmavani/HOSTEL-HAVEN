const pool = require('./config/db');

async function showSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE leave_history');
        console.log('Schema for leave_history:');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error querying DB:', err);
        process.exit(1);
    }
}

showSchema();
