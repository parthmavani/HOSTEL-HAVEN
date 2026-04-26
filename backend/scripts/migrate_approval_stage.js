const pool = require('../config/db');

async function migrate() {
    try {
        // Check if column already exists
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'leave_requests' 
            AND COLUMN_NAME = 'approval_stage'
        `);

        if (columns.length > 0) {
            console.log('✅ approval_stage column already exists');
        } else {
            await pool.query(`
                ALTER TABLE leave_requests 
                ADD COLUMN approval_stage 
                ENUM('parent','counsellor','warden','done') 
                DEFAULT 'parent'
            `);
            console.log('✅ Added approval_stage column to leave_requests');
        }

        // Update existing approved/rejected leaves to have approval_stage = 'done'
        const [result] = await pool.query(`
            UPDATE leave_requests 
            SET approval_stage = 'done' 
            WHERE current_status IN ('approved', 'rejected')
        `);
        console.log(`✅ Updated ${result.affectedRows} existing completed leaves to approval_stage = done`);

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
