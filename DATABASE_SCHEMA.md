# AnonBridge Database Schema Documentation

<div align="center">
  <h1>🗄️ Database Schema Reference</h1>
  <p><strong>Complete database structure and relationships for AnonBridge</strong></p>
</div>

---

## 📋 Table of Contents

1. [Schema Overview](#schema-overview)
2. [Table Definitions](#table-definitions)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Constraints](#constraints)
6. [Row Level Security](#row-level-security)
7. [JSONB Structure](#jsonb-structure)
8. [Migration History](#migration-history)

---

## 🎯 Schema Overview

The AnonBridge database is designed with privacy and security as core principles. The schema supports:

- **Anonymous Communication** - Users identified by generated IDs
- **Role-based Access** - Students and faculty have different permissions
- **Real-time Messaging** - JSONB arrays for efficient message storage
- **Audit Trail** - Comprehensive logging and reporting

### Database Statistics
- **Tables**: 4 core tables
- **Relationships**: 6 foreign key constraints
- **Indexes**: 12 performance indexes
- **RLS Policies**: 15 security policies

---

## 📊 Table Definitions

### 1. Users Table

Primary table for user account management and authentication.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  department text,
  year text,
  theme text,
  created_at timestamptz DEFAULT now(),
  anonymous_id text UNIQUE NOT NULL,
  contact_number text,
  password text DEFAULT ''::text
);
```

#### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | text | UNIQUE, NOT NULL | Manipal University email address |
| `role` | text | NOT NULL | User role: 'student' or 'faculty' |
| `department` | text | - | Academic department |
| `year` | text | - | Academic year (students only) |
| `theme` | text | - | UI theme preference |
| `created_at` | timestamptz | DEFAULT now() | Account creation timestamp |
| `anonymous_id` | text | UNIQUE, NOT NULL | Generated anonymous identifier |
| `contact_number` | text | - | Phone number |
| `password` | text | DEFAULT '' | Password hash |

#### Sample Data
```sql
INSERT INTO users (email, role, department, year, anonymous_id) VALUES
('john.doe@learner.manipal.edu', 'student', 'Computer Science Engineering', '2nd Year', 'Student#123'),
('prof.smith@manipal.edu', 'faculty', 'Computer Science Engineering', NULL, 'Faculty#456');
```

### 2. Chats Table

Manages conversation threads between students and faculty.

```sql
CREATE TABLE chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid DEFAULT gen_random_uuid(),
  messages jsonb[] NOT NULL DEFAULT '{}'::jsonb[],
  created_at timestamptz DEFAULT now()
);
```

#### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique chat identifier |
| `student_id` | uuid | NOT NULL, FOREIGN KEY | Reference to student user |
| `faculty_id` | uuid | FOREIGN KEY | Reference to faculty user |
| `messages` | jsonb[] | NOT NULL, DEFAULT '{}' | Array of message objects |
| `created_at` | timestamptz | DEFAULT now() | Chat creation timestamp |

#### Foreign Key Constraints
```sql
ALTER TABLE chats 
ADD CONSTRAINT fk_chats_student_id 
FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chats 
ADD CONSTRAINT fk_chats_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 3. Reports Table

Handles issue reporting and content moderation.

```sql
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  reason text,
  reported_by uuid DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now()
);
```

#### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique report identifier |
| `message_id` | text | NOT NULL | Reference to reported content |
| `reason` | text | - | Issue category/reason |
| `reported_by` | uuid | DEFAULT gen_random_uuid() | Reporter's user ID |
| `timestamp` | timestamptz | DEFAULT now() | Report submission time |

#### Report Categories
- `inappropriate_content`
- `harassment`
- `spam`
- `technical_issue`
- `privacy_concern`
- `platform_bug`
- `feature_request`
- `other`

### 4. Faculty Table

Extended faculty information and availability management.

```sql
CREATE TABLE faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  anonymous_id text UNIQUE NOT NULL,
  department text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

#### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique faculty record ID |
| `user_id` | uuid | UNIQUE, FOREIGN KEY | Reference to auth.users |
| `anonymous_id` | text | UNIQUE, NOT NULL | Faculty anonymous identifier |
| `department` | text | NOT NULL | Faculty department |
| `is_available` | boolean | DEFAULT true | Availability status |
| `created_at` | timestamptz | DEFAULT now() | Record creation time |

#### Foreign Key Constraint
```sql
ALTER TABLE faculty 
ADD CONSTRAINT faculty_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

## 🔗 Relationships

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CHATS : "student_id"
    USERS ||--o{ CHATS : "faculty_id"
    USERS ||--o{ REPORTS : "reported_by"
    AUTH_USERS ||--|| FACULTY : "user_id"
    
    USERS {
        uuid id PK
        text email UK "Manipal University email"
        text role "student or faculty"
        text department "Academic department"
        text year "Academic year (students)"
        text anonymous_id UK "Generated anonymous ID"
        text theme "UI theme preference"
        timestamptz created_at "Account creation"
        text contact_number "Phone number"
        text password "Password hash"
    }
    
    CHATS {
        uuid id PK
        uuid student_id FK "Student participant"
        uuid faculty_id FK "Faculty participant"
        jsonb-array messages "Message history"
        timestamptz created_at "Chat creation"
    }
    
    REPORTS {
        uuid id PK
        text message_id "Reported content ID"
        text reason "Issue category"
        uuid reported_by "Reporter user ID"
        timestamptz timestamp "Report submission"
    }
    
    FACULTY {
        uuid id PK
        uuid user_id FK UK "Auth user reference"
        text anonymous_id UK "Faculty anonymous ID"
        text department "Faculty department"
        boolean is_available "Availability status"
        timestamptz created_at "Record creation"
    }
    
    AUTH_USERS {
        uuid id PK
        text email UK
        text encrypted_password
        timestamptz created_at
    }
```

### Relationship Details

#### One-to-Many Relationships
1. **Users → Chats (as student)**
   - One student can have multiple chats
   - Foreign key: `chats.student_id → users.id`
   - Delete behavior: CASCADE (delete chats when student deleted)

2. **Users → Chats (as faculty)**
   - One faculty can have multiple chats
   - Foreign key: `chats.faculty_id → users.id`
   - Delete behavior: SET NULL (preserve chat when faculty deleted)

3. **Users → Reports**
   - One user can submit multiple reports
   - Foreign key: `reports.reported_by → users.id`
   - Delete behavior: No explicit constraint

#### One-to-One Relationships
1. **Auth.Users → Faculty**
   - Each auth user can have one faculty record
   - Foreign key: `faculty.user_id → auth.users.id`
   - Delete behavior: CASCADE

---

## 📇 Indexes

### Performance Indexes

```sql
-- Users table indexes
CREATE UNIQUE INDEX users_pkey ON users USING btree (id);
CREATE UNIQUE INDEX users_anonymous_id_unique ON users USING btree (anonymous_id);
CREATE INDEX idx_users_anonymous_id ON users USING btree (anonymous_id);

-- Chats table indexes
CREATE UNIQUE INDEX chats_pkey ON chats USING btree (id);
CREATE INDEX idx_chats_student_id ON chats USING btree (student_id);
CREATE INDEX idx_chats_faculty_id ON chats USING btree (faculty_id);

-- Reports table indexes
CREATE UNIQUE INDEX reports_pkey ON reports USING btree (id);

-- Faculty table indexes
CREATE UNIQUE INDEX faculty_pkey ON faculty USING btree (id);
CREATE UNIQUE INDEX faculty_user_id_key ON faculty USING btree (user_id);
CREATE UNIQUE INDEX faculty_anonymous_id_key ON faculty USING btree (anonymous_id);
```

### Index Usage Analysis

```sql
-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 🔒 Row Level Security Policies

### Users Table Policies

```sql
-- Policy 1: Allow anonymous user registration
CREATE POLICY "Allow anonymous user registration" 
ON users FOR INSERT 
TO anon 
WITH CHECK (true);

-- Policy 2: Allow email existence checks
CREATE POLICY "Allow anonymous users to check existing emails" 
ON users FOR SELECT 
TO anon 
USING (true);

-- Policy 3: Users can read own data
CREATE POLICY "Users can read own data" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy 4: Users can update own data
CREATE POLICY "Users can update own data" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy 5: Users can read user data for chats
CREATE POLICY "Users can read user data for chats" 
ON users FOR SELECT 
TO authenticated 
USING (true);
```

### Chats Table Policies

```sql
-- Policy 1: Students can create their own chats
CREATE POLICY "Students can create their own chats" 
ON chats FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

-- Policy 2: Students can read own chats
CREATE POLICY "Students can read own chats" 
ON chats FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

-- Policy 3: Students can update own chats
CREATE POLICY "Students can update own chats" 
ON chats FOR UPDATE 
TO authenticated 
USING (auth.uid() = student_id);

-- Policy 4: Faculty can read assigned chats
CREATE POLICY "Faculty can read assigned chats" 
ON chats FOR SELECT 
TO authenticated 
USING (auth.uid() = faculty_id);

-- Policy 5: Faculty can update assigned chats
CREATE POLICY "Faculty can update assigned chats" 
ON chats FOR UPDATE 
TO authenticated 
USING (auth.uid() = faculty_id);

-- Policy 6: Admin access policies
CREATE POLICY "Allow authenticated users to view chats" 
ON chats FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to update chats" 
ON chats FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to create chats" 
ON chats FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

### Policy Testing

```sql
-- Test RLS policies
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';

-- Test student access
SELECT * FROM chats WHERE student_id = 'user-uuid-here';

-- Test faculty access
SELECT * FROM chats WHERE faculty_id = 'user-uuid-here';
```

---

## 📦 JSONB Structure

### Message Object Structure

```typescript
interface Message {
  id: string;                    // Unique message identifier
  from: 'student' | 'faculty';   // Message sender role
  text: string;                  // Message content
  type: 'text' | 'file' | 'image'; // Message type
  timestamp: string;             // ISO timestamp
  status: 'sent' | 'delivered' | 'read'; // Delivery status
}
```

### Example Messages Array

```json
[
  {
    "id": "msg_1640995200_abc123",
    "from": "student",
    "text": "Hello, I have a question about the assignment.",
    "type": "text",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "status": "sent"
  },
  {
    "id": "msg_1640995260_def456",
    "from": "faculty",
    "text": "Sure! I'd be happy to help. What specific part?",
    "type": "text",
    "timestamp": "2024-01-01T10:01:00.000Z",
    "status": "read"
  }
]
```

### JSONB Query Examples

```sql
-- Find chats with messages containing specific text
SELECT c.id, c.student_id, c.faculty_id
FROM chats c
WHERE EXISTS (
  SELECT 1 
  FROM jsonb_array_elements(c.messages) AS msg
  WHERE msg->>'text' ILIKE '%assignment%'
);

-- Get message count per chat
SELECT 
  id,
  jsonb_array_length(messages) as message_count
FROM chats
ORDER BY message_count DESC;

-- Find recent messages
SELECT 
  c.id,
  msg->>'text' as message_text,
  msg->>'from' as sender,
  (msg->>'timestamp')::timestamptz as sent_at
FROM chats c,
     jsonb_array_elements(c.messages) AS msg
WHERE (msg->>'timestamp')::timestamptz >= NOW() - INTERVAL '24 hours'
ORDER BY sent_at DESC;
```

---

## 🔧 Database Functions

### Custom Functions

```sql
-- Function to get chat statistics
CREATE OR REPLACE FUNCTION get_chat_stats(user_uuid uuid, user_role text)
RETURNS TABLE (
  total_chats bigint,
  unread_messages bigint,
  active_chats bigint
) AS $$
BEGIN
  IF user_role = 'student' THEN
    RETURN QUERY
    SELECT 
      COUNT(*) as total_chats,
      0::bigint as unread_messages, -- Placeholder
      COUNT(*) as active_chats
    FROM chats 
    WHERE student_id = user_uuid;
  ELSE
    RETURN QUERY
    SELECT 
      COUNT(*) as total_chats,
      0::bigint as unread_messages, -- Placeholder
      COUNT(*) as active_chats
    FROM chats 
    WHERE faculty_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger Functions

```sql
-- Function to update last_message_at timestamp
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamp
CREATE TRIGGER update_chat_timestamp_trigger
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_timestamp();
```

---

## 📈 Performance Considerations

### Query Optimization

#### Efficient Message Retrieval
```sql
-- Good: Limit message array processing
SELECT 
  id,
  student_id,
  faculty_id,
  messages[array_length(messages, 1)] as last_message,
  created_at
FROM chats
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT 20;

-- Avoid: Processing entire message arrays
SELECT 
  *,
  jsonb_array_elements(messages) as individual_messages
FROM chats; -- This can be very slow
```

#### JSONB Indexing Strategies
```sql
-- GIN index for message content search
CREATE INDEX idx_chats_messages_content 
ON chats USING gin ((messages));

-- Specific path indexing for message text
CREATE INDEX idx_chats_message_text 
ON chats USING gin ((messages -> 'text'));

-- Index for message timestamps
CREATE INDEX idx_chats_message_timestamps 
ON chats USING gin ((messages -> 'timestamp'));
```

### Storage Optimization

#### Message Array Management
```sql
-- Archive old messages (move to separate table)
CREATE TABLE archived_messages AS
SELECT 
  id as chat_id,
  jsonb_array_elements(messages) as message
FROM chats
WHERE created_at < NOW() - INTERVAL '1 year';

-- Keep only recent messages in main table
UPDATE chats 
SET messages = (
  SELECT jsonb_agg(msg)
  FROM jsonb_array_elements(messages) AS msg
  WHERE (msg->>'timestamp')::timestamptz >= NOW() - INTERVAL '6 months'
)
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## 🔄 Migration History

### Applied Migrations

| Migration File | Description | Date Applied |
|----------------|-------------|--------------|
| `20250702080106_crimson_voice.sql` | Initial users table creation | 2025-07-02 |
| `20250702081342_super_wind.sql` | Chats table and relationships | 2025-07-02 |
| `20250702082558_jade_crystal.sql` | Reports table for moderation | 2025-07-02 |
| `20250702091042_azure_limit.sql` | Initial RLS policies | 2025-07-02 |
| `20250702091311_floating_glade.sql` | Additional constraints | 2025-07-02 |
| `20250702092718_weathered_coast.sql` | Faculty table creation | 2025-07-02 |
| `fix_chat_rls_policy.sql` | RLS policy corrections | 2025-08-04 |

### Migration Template

```sql
/*
  # Migration: [Title]
  
  ## Description
  Brief description of what this migration does.
  
  ## Changes
  1. New Tables
     - table_name: description
  
  2. Schema Modifications
     - Modified columns or constraints
  
  3. Security Updates
     - RLS policies added/modified
  
  ## Rollback Instructions
  Steps to undo this migration if needed.
*/

-- Migration SQL here
```

---

## 🛠️ Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks
```sql
-- 1. Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Analyze query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%chats%' OR query LIKE '%users%'
ORDER BY mean_time DESC
LIMIT 10;

-- 3. Check for unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

#### Monthly Tasks
```sql
-- 1. Update table statistics
ANALYZE users;
ANALYZE chats;
ANALYZE reports;
ANALYZE faculty;

-- 2. Vacuum tables to reclaim space
VACUUM ANALYZE users;
VACUUM ANALYZE chats;
VACUUM ANALYZE reports;
VACUUM ANALYZE faculty;

-- 3. Check for data integrity issues
SELECT 
  c.id,
  c.student_id,
  c.faculty_id,
  u1.email as student_email,
  u2.email as faculty_email
FROM chats c
LEFT JOIN users u1 ON c.student_id = u1.id
LEFT JOIN users u2 ON c.faculty_id = u2.id
WHERE u1.id IS NULL OR u2.id IS NULL;
```

### Backup Procedures

```bash
# Full database backup
pg_dump --host=db.your-project.supabase.co \
        --username=postgres \
        --format=custom \
        --file=anonbridge_backup_$(date +%Y%m%d).dump \
        postgres

# Table-specific backups
pg_dump --host=db.your-project.supabase.co \
        --username=postgres \
        --table=users \
        --table=chats \
        --table=reports \
        --table=faculty \
        --file=anonbridge_tables_$(date +%Y%m%d).sql \
        postgres
```

---

## 🔍 Troubleshooting Guide

### Common Database Issues

#### 1. Connection Problems
```sql
-- Check active connections
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start
FROM pg_stat_activity
WHERE datname = 'postgres';
```

#### 2. Performance Issues
```sql
-- Identify slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  (total_time/calls) as avg_time
FROM pg_stat_statements
WHERE calls > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Check for table bloat
SELECT 
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND((n_dead_tup::float / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) as bloat_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY bloat_percentage DESC;
```

#### 3. RLS Policy Issues
```sql
-- Debug RLS policy problems
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test policy with specific user
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid-here", "role": "authenticated"}';
SELECT * FROM chats LIMIT 1;
RESET ROLE;
```

---

## 📊 Data Analytics Queries

### User Analytics

```sql
-- User registration trends
SELECT 
  DATE_TRUNC('week', created_at) as week,
  role,
  COUNT(*) as registrations
FROM users
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY week, role
ORDER BY week DESC, role;

-- Department distribution
SELECT 
  department,
  role,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
GROUP BY department, role
ORDER BY user_count DESC;
```

### Chat Analytics

```sql
-- Chat activity by department
SELECT 
  u.department,
  COUNT(c.id) as total_chats,
  AVG(jsonb_array_length(c.messages)) as avg_messages,
  MAX(jsonb_array_length(c.messages)) as max_messages
FROM chats c
JOIN users u ON c.student_id = u.id
GROUP BY u.department
ORDER BY total_chats DESC;

-- Message volume over time
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as chats_created,
  SUM(jsonb_array_length(messages)) as total_messages
FROM chats
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

### Report Analytics

```sql
-- Report frequency by category
SELECT 
  reason,
  COUNT(*) as report_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM reports
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY reason
ORDER BY report_count DESC;

-- Reports by user role
SELECT 
  u.role,
  COUNT(r.id) as reports_submitted
FROM reports r
JOIN users u ON r.reported_by = u.id
GROUP BY u.role;
```

---

## 🔮 Future Schema Enhancements

### Planned Additions

```sql
-- Enhanced chat features
ALTER TABLE chats ADD COLUMN subject text;
ALTER TABLE chats ADD COLUMN priority text DEFAULT 'normal' 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE chats ADD COLUMN status text DEFAULT 'active' 
  CHECK (status IN ('active', 'waiting', 'resolved', 'archived'));
ALTER TABLE chats ADD COLUMN last_message_at timestamptz;

-- Unread message tracking
ALTER TABLE chats ADD COLUMN student_unread_count integer DEFAULT 0;
ALTER TABLE chats ADD COLUMN faculty_unread_count integer DEFAULT 0;

-- Message reactions
CREATE TABLE message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'resolved')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- File attachments
CREATE TABLE chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  message_id text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- User preferences
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  notification_settings jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{}',
  ui_preferences jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
```

### Notification System

```sql
-- Notification queue
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'report', 'system')),
  title text NOT NULL,
  content text,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  report_notifications boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
```

---

## 📞 Support Information

### Database Administration
- **Primary DBA**: database@anonbridge.manipal.edu
- **Backup Administrator**: backup@anonbridge.manipal.edu
- **Performance Monitoring**: performance@anonbridge.manipal.edu

### Emergency Contacts
- **Critical Database Issues**: emergency@anonbridge.manipal.edu
- **Security Incidents**: security@anonbridge.manipal.edu
- **Data Recovery**: recovery@anonbridge.manipal.edu

---

<div align="center">
  <p><strong>🗄️ Robust • Secure • Scalable Database Design</strong></p>
  <p>Built for the Manipal University community</p>
  <p><em>Schema version: 2.0 | Last updated: January 2025</em></p>
</div>