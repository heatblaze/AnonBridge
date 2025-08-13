/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Manipal University email
      - `role` (text) - 'student' or 'faculty'
      - `department` (text) - Academic department
      - `year` (text) - Academic year (students only)
      - `anonymous_id` (text, unique) - Generated anonymous identifier
      - `theme` (text) - UI theme preference
      - `contact_number` (text) - Phone number
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Allow anonymous registration
    - Allow users to read their own data
    - Allow users to update their own data
    - Allow reading user data for chat functionality
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'faculty')),
  department text,
  year text,
  anonymous_id text UNIQUE NOT NULL,
  theme text DEFAULT 'blue_neon',
  contact_number text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous user registration
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to check existing emails
CREATE POLICY "Allow anonymous users to check existing emails"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow reading user data for chat functionality
CREATE POLICY "Users can read user data for chats"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(anonymous_id);