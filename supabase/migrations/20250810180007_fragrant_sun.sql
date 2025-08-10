/*
  # Create Chats Table

  1. New Tables
    - `chats`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to users)
      - `faculty_id` (uuid, foreign key to users)
      - `subject` (text) - Chat topic/subject
      - `department` (text) - Department context
      - `messages` (jsonb array) - Message history
      - `status` (text) - Chat status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `chats` table
    - Students can create chats where they are the student
    - Students can read/update their own chats
    - Faculty can read/update chats where they are assigned
    - Allow authenticated users general access for admin functionality

  3. Relationships
    - Foreign key to users table for student_id
    - Foreign key to users table for faculty_id
*/

CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  faculty_id uuid,
  subject text DEFAULT 'General Question',
  department text,
  messages jsonb[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'resolved', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE chats 
ADD CONSTRAINT fk_chats_student_id 
FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chats 
ADD CONSTRAINT fk_chats_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policy 1: Students can create chats where they are the student
CREATE POLICY "Students can create their own chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Policy 2: Students can read their own chats
CREATE POLICY "Students can read own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Policy 3: Students can update their own chats
CREATE POLICY "Students can update own chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

-- Policy 4: Faculty can read assigned chats
CREATE POLICY "Faculty can read assigned chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);

-- Policy 5: Faculty can update assigned chats
CREATE POLICY "Faculty can update assigned chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = faculty_id);

-- Policy 6: Allow general authenticated access for admin functionality
CREATE POLICY "Allow authenticated users to view chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_student_id ON chats(student_id);
CREATE INDEX IF NOT EXISTS idx_chats_faculty_id ON chats(faculty_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chats_updated_at 
  BEFORE UPDATE ON chats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();