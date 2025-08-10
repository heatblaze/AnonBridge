/*
  # Create Reports Table

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `message_id` (text) - Reference to reported content
      - `reason` (text) - Issue category
      - `comment` (text) - Additional details
      - `reported_by` (uuid) - Reporter's user ID
      - `chat_id` (uuid) - Related chat ID
      - `resolved` (boolean) - Resolution status
      - `resolved_by` (text) - Admin who resolved
      - `resolved_at` (timestamp) - Resolution time
      - `timestamp` (timestamp) - Report creation time

  2. Security
    - Enable RLS on `reports` table
    - Allow authenticated users to create reports
    - Allow authenticated users to view reports (for admin)
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  reason text NOT NULL,
  comment text,
  reported_by uuid,
  chat_id uuid,
  resolved boolean DEFAULT false,
  resolved_by text,
  resolved_at timestamptz,
  timestamp timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE reports 
ADD CONSTRAINT fk_reports_chat_id 
FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE SET NULL;

ALTER TABLE reports 
ADD CONSTRAINT fk_reports_reported_by 
FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create reports
CREATE POLICY "Allow authenticated users to create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view reports (for admin functionality)
CREATE POLICY "Allow authenticated users to view reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update reports (for admin functionality)
CREATE POLICY "Allow authenticated users to update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_reports_reason ON reports(reason);
CREATE INDEX IF NOT EXISTS idx_reports_chat_id ON reports(chat_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by);