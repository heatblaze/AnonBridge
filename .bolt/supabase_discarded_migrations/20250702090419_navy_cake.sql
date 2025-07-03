/*
  # Add RLS policies for chats table

  1. Security
    - Enable RLS on chats table (already enabled)
    - Add policies for students to create and read their own chats
    - Add policies for faculty to read and update chats assigned to them
    - Add policies for authenticated users to read chat data with proper filtering

  2. Policies
    - Students can insert new chats where they are the student
    - Students can read chats where they are the student
    - Faculty can read chats where they are the faculty
    - Faculty can update chats where they are the faculty (for status updates)
*/

-- Policy for students to create new chats
CREATE POLICY "Students can create chats"
  ON chats
  FOR INSERT
  TO authenticated
  USING (auth.uid() = student_id);

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