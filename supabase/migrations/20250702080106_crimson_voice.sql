/*
  # Add anonymous_id column to users table

  1. Schema Changes
    - Add `anonymous_id` column to `users` table
    - Set column as TEXT type with UNIQUE constraint
    - Add NOT NULL constraint with default value generation
    - Create index for better query performance

  2. Data Migration
    - Generate anonymous IDs for existing users (if any)
    - Ensure all existing records have valid anonymous IDs

  3. Security
    - Maintain existing RLS policies
    - No changes to security model required
*/

-- Add the anonymous_id column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'anonymous_id'
  ) THEN
    -- Add the column as nullable first
    ALTER TABLE users ADD COLUMN anonymous_id text;
    
    -- Generate anonymous IDs for any existing users
    UPDATE users 
    SET anonymous_id = CASE 
      WHEN role = 'student' THEN 'Student#' || (100 + (random() * 899)::int)
      WHEN role = 'faculty' THEN 'Faculty#' || (100 + (random() * 899)::int)
      ELSE 'User#' || (100 + (random() * 899)::int)
    END
    WHERE anonymous_id IS NULL;
    
    -- Now make it NOT NULL and UNIQUE
    ALTER TABLE users ALTER COLUMN anonymous_id SET NOT NULL;
    ALTER TABLE users ADD CONSTRAINT users_anonymous_id_unique UNIQUE (anonymous_id);
    
    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(anonymous_id);
    
    -- Add comment for documentation
    COMMENT ON COLUMN users.anonymous_id IS 'Unique anonymous identifier for user privacy (e.g., Student#123, Faculty#456)';
  END IF;
END $$;