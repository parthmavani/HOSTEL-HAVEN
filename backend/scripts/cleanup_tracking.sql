USE hostel_leave_management;

-- 1. Remove location_updates table
DROP TABLE IF EXISTS location_updates;

-- 2. Remove tracking-related columns from users table
ALTER TABLE users 
    DROP COLUMN IF EXISTS is_sharing_location,
    DROP COLUMN IF EXISTS current_latitude,
    DROP COLUMN IF EXISTS current_longitude;

-- 3. Remove safety_mode column from leave_requests
ALTER TABLE leave_requests 
    DROP COLUMN IF EXISTS safety_mode;

-- 4. Clean up notifications table (retaining standard message fields)
ALTER TABLE notifications 
    DROP COLUMN IF EXISTS type,
    DROP COLUMN IF EXISTS sender_id,
    DROP COLUMN IF EXISTS status;
