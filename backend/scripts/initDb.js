const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function initDb() {
    let connection;
    try {
        // Connect to MySQL server (without database selected first)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server.');

        // Read the SQL setup file
        const sqlPath = path.join(__dirname, '../sql/setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL into individual statements (simple split by semicolon)
        // Note: This is a basic implementation. Complex SQL with stored procedures might need better parsing.
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('Database initialized successfully.');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

initDb();
