/*
  # Add Foreign Key Constraints to Chats Table

  1. Database Changes
    - Add foreign key constraint for `student_id` column referencing `users(id)`
    - Add foreign key constraint for `faculty_id` column referencing `users(id)`
    
  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity between chats and users tables
    
  3. Notes
    - These constraints will enable proper table joins in Supabase queries
    - Fixes the "Could not find a relationship" errors in the application
*/

-- Add foreign key constraint for student_id
ALTER TABLE chats
ADD CONSTRAINT fk_chats_student_id
FOREIGN KEY (student_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint for faculty_id  
ALTER TABLE chats
ADD CONSTRAINT fk_chats_faculty_id
FOREIGN KEY (faculty_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_student_id ON chats(student_id);
CREATE INDEX IF NOT EXISTS idx_chats_faculty_id ON chats(faculty_id);