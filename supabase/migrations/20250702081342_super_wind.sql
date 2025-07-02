/*
  # Add RLS policies for users table

  1. Security Policies
    - Allow anonymous users to insert new user records (for registration)
    - Allow authenticated users to read their own user data
    - Allow authenticated users to update their own user data

  2. Changes
    - Add policy for INSERT operations (registration)
    - Add policy for SELECT operations (reading own data)
    - Add policy for UPDATE operations (updating own profile)
*/

-- Policy to allow anonymous users to register (INSERT)
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy to allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy to allow public read access for anonymous users (needed for login check)
CREATE POLICY "Allow anonymous users to check existing emails"
  ON users
  FOR SELECT
  TO anon
  USING (true);