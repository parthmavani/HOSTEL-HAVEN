const pool = require('./config/db');
async function runMigration() {
    try {
        console.log('Adding counsellor_id column to students...');
        await pool.query('ALTER TABLE students ADD COLUMN counsellor_id INT NULL');
        console.log('Adding foreign key constraint...');
        await pool.query('ALTER TABLE students ADD CONSTRAINT fk_student_counsellor FOREIGN KEY (counsellor_id) REFERENCES users(user_id) ON DELETE SET NULL');
        console.log('Migration successful.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
runMigration();
