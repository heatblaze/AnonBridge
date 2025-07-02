/*
  # Fix RLS Policies for Chats Table

  1. Security
    - Enable RLS on chats table
    - Add policies for students to create and read their own chats
    - Add policies for faculty to read and update assigned chats
    - Add policy for users to read user data needed for chat relationships

  2. Changes
    - Fixed INSERT policy syntax to use WITH CHECK instead of USING
    - Added proper RLS policies for all required operations
*/

-- Enable RLS on chats table if not already enabled
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policy for students to create new chats
CREATE POLICY "Students can create chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Policy for students to read their own chats
CREATE POLICY "Students can read own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Policy for faculty to read chats assigned to them
CREATE POLICY "Faculty can read assigned chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);

-- Policy for faculty to update chats assigned to them
CREATE POLICY "Faculty can update assigned chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

-- Policy for authenticated users to read user data for chat relationships
CREATE POLICY "Users can read user data for chats"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);