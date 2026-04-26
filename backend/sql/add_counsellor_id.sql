-- Migration: Add counsellor_id to students table
ALTER TABLE students ADD COLUMN counsellor_id INT NULL;
ALTER TABLE students ADD CONSTRAINT fk_student_counsellor FOREIGN KEY (counsellor_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Optional: Link existing students to the first active counsellor found (for testing purposes)
-- NOTE: In production, this should be done manually or via a proper assignment UI.
UPDATE students 
SET counsellor_id = (SELECT user_id FROM users WHERE role = 'counsellor' AND is_active = TRUE LIMIT 1)
WHERE counsellor_id IS NULL;
