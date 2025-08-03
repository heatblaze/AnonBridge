/*
  # Fix Chat Creation RLS Policy

  This migration fixes the Row Level Security policy issue that prevents users from creating new chats.
  
  ## Changes Made
  
  1. **Updated INSERT Policy**: Allow authenticated users to create chats where they are participants
  2. **Role Validation**: Ensure student_id corresponds to users with 'student' role and faculty_id to 'faculty' role
  3. **Participant Validation**: Users can only create chats where they are either the student or faculty participant
  
  ## Security
  
  - Users can only create chats where they are a participant (student_id = auth.uid() OR faculty_id = auth.uid())
  - Role validation ensures data integrity (students can't be assigned as faculty and vice versa)
  - Maintains existing SELECT and UPDATE policies
*/

-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "Allow authenticated users to create chats for themselves" ON chats;
DROP POLICY IF EXISTS "Validate chat participant roles" ON chats;

-- Create new INSERT policy that allows chat creation
CREATE POLICY "Users can create chats as participants"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be either the student or faculty in the chat
    (auth.uid() = student_id OR auth.uid() = faculty_id)
    AND
    -- Validate that student_id corresponds to a user with 'student' role
    (
      student_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = student_id 
        AND users.role = 'student'
      )
    )
    AND
    -- Validate that faculty_id corresponds to a user with 'faculty' role
    (
      faculty_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = faculty_id 
        AND users.role = 'faculty'
      )
    )
  );

-- Ensure the existing SELECT policies are still in place
-- (These should already exist, but we'll recreate them to be safe)

-- Drop and recreate SELECT policies
DROP POLICY IF EXISTS "Students can read own chats" ON chats;
DROP POLICY IF EXISTS "Faculty can read assigned chats" ON chats;

CREATE POLICY "Students can read own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Faculty can read assigned chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);

-- Ensure UPDATE policies exist
DROP POLICY IF EXISTS "Faculty can update assigned chats" ON chats;

CREATE POLICY "Faculty can update assigned chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

-- Allow students to update their own chats (for adding messages)
CREATE POLICY "Students can update own chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);