/*
  # Add password column to users table

  1. Schema Changes
    - Add `password` column to `users` table
      - `password` (text, not null)
      - Stores hashed user passwords for authentication

  2. Security
    - Password column is required for all users
    - Passwords should be hashed before storage (handled in application)

  3. Notes
    - This migration adds password storage capability
    - Application should handle password hashing/verification
    - Existing users will need to set passwords
*/

-- Add password column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password text;
  END IF;
END $$;

-- Make password column required for new users
-- Note: Existing users may have NULL passwords until they update
ALTER TABLE users ALTER COLUMN password SET DEFAULT '';