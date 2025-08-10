/*
  # Fix Chat RLS Policy for INSERT Operations

  1. Security Changes
    - Drop existing restrictive INSERT policies on chats table
    - Create new simplified INSERT policy that allows authenticated users to create chats
    - Policy allows INSERT if the user's auth.uid() matches either student_id or faculty_id

  2. Changes Made
    - Remove overly complex INSERT policies that were blocking chat creation
    - Add simple policy: authenticated users can create chats where they are a participant
    - Maintain existing SELECT and UPDATE policies
*/

-- Drop existing INSERT policies that are too restrictive
DROP POLICY IF EXISTS "Faculty can create chats with students" ON chats;
DROP POLICY IF EXISTS "Students can create chats with faculty" ON chats;

-- Create a simple INSERT policy that allows authenticated users to create chats
-- where they are either the student or faculty participant
CREATE POLICY "Authenticated users can create chats as participants"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR auth.uid() = faculty_id
  );