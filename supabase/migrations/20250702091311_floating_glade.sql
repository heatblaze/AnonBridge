/*
  # Fix Chat Creation RLS Policy

  1. Security Updates
    - Drop existing problematic INSERT policy for students
    - Create new INSERT policy that properly allows students to create chats
    - Ensure the policy correctly validates student_id matches authenticated user

  2. Policy Changes
    - Remove restrictive INSERT policy
    - Add proper INSERT policy for authenticated students
    - Maintain existing SELECT and UPDATE policies
*/

-- Drop the existing INSERT policy that might be causing issues
DROP POLICY IF EXISTS "Students can create chats" ON chats;

-- Create a new INSERT policy that allows students to create chats
-- The policy ensures that the student_id in the new chat matches the authenticated user's ID
CREATE POLICY "Students can create their own chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Ensure the policy for faculty to read assigned chats is still working
-- (This should already exist, but let's make sure it's properly defined)
DROP POLICY IF EXISTS "Faculty can read assigned chats" ON chats;
CREATE POLICY "Faculty can read assigned chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);

-- Ensure the policy for students to read their own chats is working
DROP POLICY IF EXISTS "Students can read own chats" ON chats;
CREATE POLICY "Students can read own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Ensure faculty can update their assigned chats
DROP POLICY IF EXISTS "Faculty can update assigned chats" ON chats;
CREATE POLICY "Faculty can update assigned chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);