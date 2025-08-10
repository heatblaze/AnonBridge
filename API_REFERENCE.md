# AnonBridge API Reference

<div align="center">
  <h1>📡 API Reference Documentation</h1>
  <p><strong>Complete guide to AnonBridge backend functions and database operations</strong></p>
</div>

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Chat Operations](#chat-operations)
4. [Message Handling](#message-handling)
5. [Reporting System](#reporting-system)
6. [Admin Functions](#admin-functions)
7. [Error Codes](#error-codes)
8. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### Overview
AnonBridge uses Supabase Auth with email/password authentication restricted to Manipal University domains.

### Supported Email Domains
- `@manipal.edu` - Faculty and staff
- `@learner.manipal.edu` - Students

### Authentication Flow
```javascript
import { supabase } from './lib/supabaseClient';

// Sign up new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@manipal.edu',
  password: 'securepassword'
});

// Sign in existing user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@manipal.edu',
  password: 'securepassword'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## 👥 User Management

### `registerUser(userData)`

Creates a new user account with anonymous ID generation.

**Endpoint:** Database function  
**Method:** INSERT into `users` table

#### Parameters
```typescript
interface UserRegistrationData {
  email: string;           // Required: Manipal University email
  role: 'student' | 'faculty';  // Required: User role
  department: string;      // Required: Academic department
  year?: string;          // Optional: Academic year (students only)
  contactNumber?: string; // Optional: Phone number
  theme?: string;         // Optional: UI theme preference
}
```

#### Example Usage
```javascript
import { registerUser } from './lib/database';

const userData = {
  email: 'john.doe@learner.manipal.edu',
  role: 'student',
  department: 'Computer Science Engineering',
  year: '2nd Year',
  contactNumber: '9876543210',
  theme: 'blue_neon'
};

const { data, error } = await registerUser(userData);

if (error) {
  console.error('Registration failed:', error);
} else {
  console.log('User registered:', data);
}
```

#### Response Format
```typescript
interface RegisterUserResponse {
  data: {
    id: string;
    email: string;
    role: string;
    department: string;
    year?: string;
    anonymous_id: string;
    theme: string;
    created_at: string;
  } | null;
  error: {
    message: string;
    details?: string;
  } | null;
}
```

### `checkUserExists(email)`

Verifies if a user account exists for the given email address.

#### Parameters
```typescript
email: string  // Manipal University email address
```

#### Example Usage
```javascript
import { checkUserExists } from './lib/database';

const { exists, user, error } = await checkUserExists('john.doe@manipal.edu');

if (exists) {
  console.log('User found:', user);
} else {
  console.log('User not found');
}
```

#### Response Format
```typescript
interface CheckUserResponse {
  exists: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    department: string;
    anonymous_id: string;
    // ... other user fields
  } | null;
  error: {
    message: string;
    details?: string;
  } | null;
}
```

---

## 💬 Chat Operations

### `startNewChat(chatData)`

Initializes a new conversation thread between a student and faculty member.

**Endpoint:** Database function  
**Method:** INSERT into `chats` table

#### Parameters
```typescript
interface ChatInitializationData {
  studentId: string;      // Required: Student's user ID
  facultyId: string;      // Required: Faculty's user ID
  subject: string;        // Required: Chat topic/subject
  department?: string;    // Optional: Department context
  firstMessage?: {        // Optional: Initial message
    from: 'student' | 'faculty';
    text: string;
    timestamp?: string;
  };
}
```

#### Example Usage
```javascript
import { startNewChat } from './lib/database';

const chatData = {
  studentId: 'user-123-uuid',
  facultyId: 'faculty-456-uuid',
  subject: 'Data Structures Assignment',
  department: 'Computer Science Engineering',
  firstMessage: {
    from: 'student',
    text: 'I need help understanding binary trees.',
    timestamp: new Date().toISOString()
  }
};

const { data, error } = await startNewChat(chatData);
```

#### Response Format
```typescript
interface StartChatResponse {
  data: {
    id: string;
    student_id: string;
    faculty_id: string;
    messages: Message[];
    created_at: string;
    student: UserProfile;
    faculty: UserProfile;
  } | null;
  error: {
    message: string;
    details?: string;
  } | null;
}
```

### `getUserChats(userId, role, options)`

Retrieves all chat threads for a specific user based on their role.

#### Parameters
```typescript
interface GetUserChatsParams {
  userId: string;         // Required: User's ID
  role: 'student' | 'faculty';  // Required: User's role
  options?: {
    limit?: number;       // Optional: Max chats to return (default: 50)
    offset?: number;      // Optional: Pagination offset (default: 0)
    orderBy?: string;     // Optional: Sort field (default: 'created_at')
    ascending?: boolean;  // Optional: Sort order (default: false)
  };
}
```

#### Example Usage
```javascript
import { getUserChats } from './lib/database';

// Get recent chats for a student
const { data: chats, error } = await getUserChats(
  'user-123-uuid', 
  'student', 
  {
    limit: 20,
    orderBy: 'created_at',
    ascending: false
  }
);

// Get all faculty chats
const { data: facultyChats, error } = await getUserChats(
  'faculty-456-uuid', 
  'faculty'
);
```

#### Response Format
```typescript
interface GetChatsResponse {
  data: ChatThread[] | null;
  error: {
    message: string;
    details?: string;
  } | null;
}

interface ChatThread {
  id: string;
  student_id: string;
  faculty_id: string;
  messages: Message[];
  created_at: string;
  student: UserProfile;
  faculty: UserProfile;
  lastMessage: string;
  messageCount: number;
  status: 'active' | 'archived';
  unreadCount: number;
}
```

### `getAvailableFaculty(department)`

Retrieves available faculty members for a specific department.

#### Parameters
```typescript
department?: string  // Optional: Filter by department
```

#### Example Usage
```javascript
import { getAvailableFaculty } from './lib/database';

// Get all available faculty
const { data: allFaculty, error } = await getAvailableFaculty();

// Get faculty from specific department
const { data: csFaculty, error } = await getAvailableFaculty(
  'Computer Science Engineering'
);
```

---

## 📨 Message Handling

### `appendMessage(messageData)`

Adds a new message to an existing chat thread.

#### Parameters
```typescript
interface MessageData {
  chatId: string;         // Required: Chat thread ID
  from: 'student' | 'faculty';  // Required: Message sender
  text: string;           // Required: Message content
  type?: 'text' | 'file' | 'image';  // Optional: Message type
  timestamp?: string;     // Optional: Custom timestamp
}
```

#### Example Usage
```javascript
import { appendMessage } from './lib/database';

const messageData = {
  chatId: 'chat-789-uuid',
  from: 'faculty',
  text: 'I\'d be happy to help! What specific part are you struggling with?',
  type: 'text'
};

const { data, error } = await appendMessage(messageData);
```

#### Message Structure
```typescript
interface Message {
  id: string;             // Unique message identifier
  from: 'student' | 'faculty';  // Message sender
  text: string;           // Message content
  type: 'text' | 'file' | 'image';  // Message type
  timestamp: string;      // ISO timestamp
  status: 'sent' | 'delivered' | 'read';  // Delivery status
}
```

### `getChatMessages(chatId, limit, offset)`

Retrieves message history for a specific chat thread.

#### Parameters
```typescript
chatId: string    // Required: Chat thread ID
limit?: number    // Optional: Max messages (default: 50)
offset?: number   // Optional: Pagination offset (default: 0)
```

#### Example Usage
```javascript
import { getChatMessages } from './lib/database';

// Get recent messages
const { data: messages, error } = await getChatMessages('chat-789-uuid', 20, 0);

// Get older messages (pagination)
const { data: olderMessages, error } = await getChatMessages('chat-789-uuid', 20, 20);
```

### `markMessagesAsRead(chatId, userRole)`

Marks messages as read for a specific user in a chat thread.

#### Parameters
```typescript
chatId: string              // Required: Chat thread ID
userRole: 'student' | 'faculty'  // Required: User's role
```

#### Example Usage
```javascript
import { markMessagesAsRead } from './lib/database';

const { data, error } = await markMessagesAsRead('chat-789-uuid', 'student');
```

---

## 🚨 Reporting System

### `reportIssue(reportData)`

Submits an issue report for administrative review.

#### Parameters
```typescript
interface ReportData {
  reason: string;         // Required: Issue category
  comment?: string;       // Optional: Additional details
  reportedBy: string;     // Required: Reporter's anonymous ID
  messageId?: string;     // Optional: Related message ID
  threadId?: string;      // Optional: Related chat thread ID
  userRole: 'student' | 'faculty';  // Required: Reporter's role
}
```

#### Report Categories
- `inappropriate_content` - Offensive or inappropriate messages
- `harassment` - Bullying or harassment behavior
- `spam` - Unwanted or repetitive content
- `technical_issue` - Platform bugs or technical problems
- `privacy_concern` - Privacy or security issues
- `platform_bug` - Software bugs or glitches
- `feature_request` - Suggestions for new features
- `other` - Other issues not covered above

#### Example Usage
```javascript
import { reportIssue } from './lib/database';

const reportData = {
  reason: 'inappropriate_content',
  comment: 'User sent offensive language in chat',
  reportedBy: 'Student#123',
  messageId: 'msg_1234567890',
  threadId: 'chat-789-uuid',
  userRole: 'student'
};

const { data, error } = await reportIssue(reportData);
```

### `getAllReports(options)` (Admin Only)

Retrieves all issue reports for administrative review.

#### Parameters
```typescript
interface GetReportsOptions {
  limit?: number;         // Optional: Max reports (default: 50)
  offset?: number;        // Optional: Pagination offset (default: 0)
  orderBy?: string;       // Optional: Sort field (default: 'timestamp')
  ascending?: boolean;    // Optional: Sort order (default: false)
}
```

#### Example Usage
```javascript
import { getAllReports } from './lib/database';

// Get recent reports
const { data: reports, error } = await getAllReports({
  limit: 25,
  orderBy: 'timestamp',
  ascending: false
});
```

---

## 👨‍💼 Admin Functions

### User Statistics

```javascript
// Get user count by role
const getUserStats = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .then(result => {
      const stats = result.data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      return { data: stats, error: result.error };
    });
  
  return { data, error };
};
```

### Chat Analytics

```javascript
// Get chat activity metrics
const getChatAnalytics = async () => {
  const { data, error } = await supabase
    .from('chats')
    .select('created_at, messages')
    .then(result => {
      if (result.error) return result;
      
      const analytics = {
        totalChats: result.data.length,
        totalMessages: result.data.reduce((sum, chat) => 
          sum + (chat.messages?.length || 0), 0),
        chatsToday: result.data.filter(chat => {
          const today = new Date().toDateString();
          return new Date(chat.created_at).toDateString() === today;
        }).length
      };
      
      return { data: analytics, error: null };
    });
  
  return { data, error };
};
```

### Data Export

```javascript
// Export all platform data (admin only)
const exportPlatformData = async () => {
  try {
    const [usersResult, chatsResult, reportsResult] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('chats').select('*'),
      supabase.from('reports').select('*')
    ]);

    const exportData = {
      users: usersResult.data?.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        anonymous_id: user.anonymous_id,
        created_at: user.created_at
      })),
      chats: chatsResult.data?.map(chat => ({
        id: chat.id,
        student_id: chat.student_id,
        faculty_id: chat.faculty_id,
        messageCount: chat.messages?.length || 0,
        created_at: chat.created_at
      })),
      reports: reportsResult.data,
      exportedAt: new Date().toISOString(),
      totalUsers: usersResult.data?.length || 0,
      totalChats: chatsResult.data?.length || 0,
      totalReports: reportsResult.data?.length || 0
    };

    return { data: exportData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
```

---

## ❌ Error Codes

### Common Error Types

#### Authentication Errors
- `INVALID_EMAIL_DOMAIN` - Email not from Manipal University
- `USER_NOT_FOUND` - No account exists for email
- `INVALID_CREDENTIALS` - Wrong password
- `EMAIL_ALREADY_EXISTS` - Account already registered

#### Database Errors
- `RLS_POLICY_VIOLATION` - Row Level Security policy blocked operation
- `FOREIGN_KEY_VIOLATION` - Referenced record doesn't exist
- `UNIQUE_CONSTRAINT_VIOLATION` - Duplicate value in unique field
- `INVALID_JSON_FORMAT` - Malformed JSONB data

#### Chat Errors
- `CHAT_NOT_FOUND` - Chat thread doesn't exist
- `UNAUTHORIZED_ACCESS` - User can't access this chat
- `MESSAGE_TOO_LONG` - Message exceeds character limit
- `INVALID_PARTICIPANT` - User not part of conversation

#### Validation Errors
- `REQUIRED_FIELD_MISSING` - Required parameter not provided
- `INVALID_ROLE` - Role must be 'student' or 'faculty'
- `INVALID_DEPARTMENT` - Department not recognized
- `INVALID_YEAR` - Academic year format incorrect

### Error Response Format
```typescript
interface ErrorResponse {
  message: string;        // Human-readable error message
  code?: string;         // Error code for programmatic handling
  details?: string;      // Additional technical details
  field?: string;        // Field that caused validation error
  timestamp: string;     // When error occurred
}
```

---

## ⏱️ Rate Limiting

### Current Limits

#### Message Sending
- **Students**: 60 messages per minute
- **Faculty**: 100 messages per minute
- **Burst Limit**: 10 messages per 10 seconds

#### Chat Creation
- **Students**: 5 new chats per hour
- **Faculty**: No limit

#### Report Submission
- **All Users**: 10 reports per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

---

## 🔄 Real-time Subscriptions

### Chat Message Updates

```javascript
// Subscribe to new messages in a specific chat
const subscribeToChat = (chatId, callback) => {
  return supabase
    .channel(`chat_${chatId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'chats',
      filter: `id=eq.${chatId}`
    }, callback)
    .subscribe();
};

// Usage
const subscription = subscribeToChat('chat-123', (payload) => {
  console.log('Chat updated:', payload.new);
  // Update UI with new messages
});

// Cleanup
subscription.unsubscribe();
```

### User Status Updates

```javascript
// Subscribe to user status changes
const subscribeToUserUpdates = (callback) => {
  return supabase
    .channel('user_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users'
    }, callback)
    .subscribe();
};
```

### Report Notifications (Admin)

```javascript
// Subscribe to new reports (admin only)
const subscribeToReports = (callback) => {
  return supabase
    .channel('reports_updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'reports'
    }, callback)
    .subscribe();
};
```

---

## 🔍 Advanced Queries

### Search Functionality

#### Search User Chats
```javascript
import { searchUserChats } from './lib/database';

const { data: results, error } = await searchUserChats(
  'user-123-uuid',
  'student',
  'assignment help',
  { limit: 10 }
);
```

#### Search Messages in Chat
```sql
-- Search within message content (PostgreSQL)
SELECT c.id, c.messages
FROM chats c
WHERE c.messages @> '[{"text": "assignment"}]'::jsonb
AND (c.student_id = $1 OR c.faculty_id = $1);
```

### Analytics Queries

#### User Activity Report
```sql
-- Users registered in last 30 days
SELECT 
  DATE(created_at) as date,
  role,
  COUNT(*) as registrations
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), role
ORDER BY date DESC;
```

#### Chat Volume Analysis
```sql
-- Message volume by department
SELECT 
  u.department,
  COUNT(c.id) as total_chats,
  SUM(jsonb_array_length(c.messages)) as total_messages,
  AVG(jsonb_array_length(c.messages)) as avg_messages_per_chat
FROM chats c
JOIN users u ON c.student_id = u.id
GROUP BY u.department
ORDER BY total_messages DESC;
```

#### Response Time Metrics
```sql
-- Average response time between student and faculty messages
WITH message_pairs AS (
  SELECT 
    c.id as chat_id,
    jsonb_array_elements(c.messages) as message
  FROM chats c
)
SELECT 
  AVG(
    EXTRACT(EPOCH FROM (
      (next_message->>'timestamp')::timestamp - 
      (message->>'timestamp')::timestamp
    )) / 60
  ) as avg_response_time_minutes
FROM (
  SELECT 
    chat_id,
    message,
    LEAD(message) OVER (
      PARTITION BY chat_id 
      ORDER BY (message->>'timestamp')::timestamp
    ) as next_message
  FROM message_pairs
) t
WHERE 
  message->>'from' = 'student' 
  AND next_message->>'from' = 'faculty';
```

---

## 🧪 Testing

### Unit Tests for Database Functions

```javascript
// Example test for registerUser function
describe('registerUser', () => {
  test('should create user with valid data', async () => {
    const userData = {
      email: 'test@manipal.edu',
      role: 'student',
      department: 'Computer Science Engineering',
      year: '2nd Year'
    };

    const { data, error } = await registerUser(userData);
    
    expect(error).toBeNull();
    expect(data).toHaveProperty('id');
    expect(data.anonymous_id).toMatch(/^Student#\d{3}$/);
  });

  test('should reject invalid email domain', async () => {
    const userData = {
      email: 'test@gmail.com',
      role: 'student',
      department: 'Computer Science Engineering'
    };

    const { data, error } = await registerUser(userData);
    
    expect(data).toBeNull();
    expect(error).toHaveProperty('message');
  });
});
```

### Integration Tests

```javascript
// Test complete chat flow
describe('Chat Flow Integration', () => {
  test('should create chat and send messages', async () => {
    // 1. Register student and faculty
    const student = await registerUser({
      email: 'student@learner.manipal.edu',
      role: 'student',
      department: 'Computer Science Engineering'
    });

    const faculty = await registerUser({
      email: 'faculty@manipal.edu',
      role: 'faculty',
      department: 'Computer Science Engineering'
    });

    // 2. Start new chat
    const { data: chat } = await startNewChat({
      studentId: student.data.id,
      facultyId: faculty.data.id,
      subject: 'Test Chat'
    });

    expect(chat).toHaveProperty('id');

    // 3. Send message
    const { data: message } = await appendMessage({
      chatId: chat.id,
      from: 'student',
      text: 'Hello, I need help!'
    });

    expect(message).toHaveProperty('message');
  });
});
```

---

## 📊 Performance Monitoring

### Database Performance Queries

```sql
-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries taking more than 100ms
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Monitor connection usage
SELECT 
  state,
  COUNT(*) as connections
FROM pg_stat_activity
GROUP BY state;
```

### Application Metrics

```javascript
// Track API response times
const trackApiCall = async (functionName, apiCall) => {
  const startTime = Date.now();
  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;
    
    console.log(`${functionName} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${functionName} failed after ${duration}ms:`, error);
    throw error;
  }
};

// Usage
const result = await trackApiCall('getUserChats', () => 
  getUserChats(userId, role)
);
```

---

## 🔧 Configuration

### Supabase Client Configuration

```javascript
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Additional configuration
VITE_APP_NAME=AnonBridge
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production
```

---

## 🚀 Deployment Checklist

### Pre-deployment Steps

- [ ] All migrations applied to production database
- [ ] RLS policies tested and verified
- [ ] Environment variables configured
- [ ] Real-time subscriptions tested
- [ ] Error handling implemented
- [ ] Performance benchmarks met

### Post-deployment Verification

```javascript
// Health check function
const healthCheck = async () => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;

    // Test real-time connection
    const channel = supabase.channel('health-check');
    const subscription = await channel.subscribe();
    
    if (subscription === 'SUBSCRIBED') {
      channel.unsubscribe();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } else {
      throw new Error('Real-time connection failed');
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly Tasks**
   - Monitor database performance
   - Review error logs
   - Check storage usage
   - Verify backup integrity

2. **Monthly Tasks**
   - Analyze user growth metrics
   - Review and resolve reports
   - Update documentation
   - Performance optimization

3. **Quarterly Tasks**
   - Security audit
   - Database cleanup
   - Feature usage analysis
   - Capacity planning

### Emergency Procedures

#### Database Recovery
```bash
# Restore from backup (if needed)
pg_restore --host=db.your-project.supabase.co \
           --username=postgres \
           --dbname=postgres \
           --clean \
           backup.sql
```

#### RLS Policy Reset
```sql
-- Emergency: Disable RLS temporarily
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;

-- Re-enable with corrected policies
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-- Add corrected policies here
```

---

## 📚 Additional Resources

### Documentation Links
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Code Examples
- [Database Helper Functions](./src/lib/database/)
- [Migration Examples](./supabase/migrations/)
- [Real-time Implementation](./src/components/ChatBox.tsx)

---

<div align="center">
  <p><strong>🔒 Secure • Scalable • Well-Documented</strong></p>
  <p>For technical support: <a href="mailto:technical@anonbridge.manipal.edu">technical@anonbridge.manipal.edu</a></p>
  <p><em>Last updated: January 2025</em></p>
</div>