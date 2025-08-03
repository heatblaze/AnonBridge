/*
  # Fix Chat Creation RLS Policy

  1. Security Changes
    - Drop the existing overly restrictive INSERT policy on chats table
    - Create a new simplified INSERT policy that allows authenticated users to create chats
    - Policy allows INSERT if the user's auth.uid() matches either student_id or faculty_id

  2. Policy Details
    - Name: "Allow authenticated users to create chats as participants"
    - Allows INSERT operations for authenticated users
    - Condition: User must be either the student or faculty in the chat
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create chats as participants" ON chats;

-- Create a new, simpler INSERT policy
CREATE POLICY "Allow authenticated users to create chats as participants"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR auth.uid() = faculty_id
  );