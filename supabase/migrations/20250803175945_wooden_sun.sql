/*
  # Fix Chat Insert RLS Policy

  1. Security Updates
    - Update RLS policy for students to create chats
    - Allow authenticated users to insert chats where they are participants
    - Ensure proper validation for student and faculty roles

  2. Changes
    - Drop existing restrictive insert policies
    - Add new policy allowing authenticated users to create chats for themselves
    - Maintain security by checking user roles and participation
*/

-- Drop existing restrictive insert policies
DROP POLICY IF EXISTS "Students can create chats with faculty" ON chats;
DROP POLICY IF EXISTS "Faculty can create chats with students" ON chats;

-- Create a unified insert policy that allows authenticated users to create chats
-- where they are one of the participants
CREATE POLICY "Allow authenticated users to create chats for themselves"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR auth.uid() = faculty_id
  );

-- Additional policy to ensure proper role validation during insert
CREATE POLICY "Validate chat participant roles"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure student_id belongs to a user with 'student' role
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = student_id AND role = 'student'
    )
    AND
    -- Ensure faculty_id belongs to a user with 'faculty' role (if provided)
    (
      faculty_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = faculty_id AND role = 'faculty'
      )
    )
  );