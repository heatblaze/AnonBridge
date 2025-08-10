/*
  # Add missing columns to chats table

  1. Schema Changes
    - Add `subject` column to store chat topic/subject
    - Add `department` column to store department context
    - Add `status` column to track chat status (active, waiting, resolved, archived)
    - Add `updated_at` column to track last modification time

  2. Constraints
    - Add check constraint for status values
    - Set appropriate default values

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Add missing columns to chats table
DO $$
BEGIN
  -- Add subject column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chats' AND column_name = 'subject'
  ) THEN
    ALTER TABLE chats ADD COLUMN subject text;
  END IF;

  -- Add department column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chats' AND column_name = 'department'
  ) THEN
    ALTER TABLE chats ADD COLUMN department text;
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chats' AND column_name = 'status'
  ) THEN
    ALTER TABLE chats ADD COLUMN status text DEFAULT 'active' 
    CHECK (status IN ('active', 'waiting', 'resolved', 'archived'));
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chats' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE chats ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing chats with default values
UPDATE chats 
SET 
  subject = COALESCE(subject, 'General Question'),
  status = COALESCE(status, 'active'),
  updated_at = COALESCE(updated_at, created_at)
WHERE subject IS NULL OR status IS NULL OR updated_at IS NULL;