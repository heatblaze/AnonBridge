/*
  # Fix Chat Creation RLS Policy

  1. Security Updates
    - Update RLS policy to allow students to create chats with any faculty member
    - Ensure students can only set themselves as the student_id
    - Allow faculty_id to be set to any faculty member during chat creation

  2. Changes
    - Modify the INSERT policy for students to allow setting faculty_id
    - Keep the restriction that student_id must match the authenticated user
*/

-- Drop the existing INSERT policy for students
DROP POLICY IF EXISTS "Students can create their own chats" ON chats;

-- Create a new INSERT policy that allows students to create chats with any faculty
CREATE POLICY "Students can create chats with faculty"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = chats.faculty_id 
      AND role = 'faculty'
    )
  );

-- Also ensure we have a policy for faculty to create chats (if they need to initiate)
CREATE POLICY "Faculty can create chats with students"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = faculty_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = chats.student_id 
      AND role = 'student'
    )
  );