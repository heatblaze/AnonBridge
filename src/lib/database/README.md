# AnonBridge Database Helper Functions

This directory contains helper functions for interacting with the Supabase database. All functions are designed to work with the existing database schema and provide a clean API for database operations.

## 🚀 Quick Start

### Setup Instructions

1. **Configure Supabase**: Update `src/lib/supabaseClient.js` with your project details
2. **Apply Migrations**: Run all migration files in `supabase/migrations/` in order
3. **Import Functions**: Use the centralized import from `index.js`

```javascript
import { registerUser, startNewChat, appendMessage, getUserChats } from './lib/database'
```

## 📚 Available Functions

### User Management (`userOperations.js`)
- `registerUser(userData)` - Creates a new user record with anonymous ID
- `checkUserExists(email)` - Checks if a user already exists

### Chat Management (`chatOperations.js`)
- `startNewChat(chatData)` - Creates a new chat thread between student and faculty
- `getAvailableFaculty(department)` - Gets available faculty members

### Message Management (`messageOperations.js`)
- `appendMessage(messageData)` - Adds a message to existing chat
- `markMessagesAsRead(chatId, userRole)` - Marks messages as read
- `getChatMessages(chatId, limit, offset)` - Gets message history

### Chat Retrieval (`chatRetrieval.js`)
- `getUserChats(userId, role, options)` - Gets all chats for a user
- `getUserChatStats(userId, role)` - Gets chat statistics
- `searchUserChats(userId, role, searchTerm)` - Searches user's chats

### Report Management (`reportOperations.js`)
- `reportIssue(reportData)` - Submit an issue report
- `getAllReports(options)` - Get all reports (admin only)
- `resolveReport(reportId, resolvedBy)` - Mark report as resolved

## 🔒 Security Features

- **Row Level Security (RLS)** - All tables have proper RLS policies
- **Anonymous IDs** - User privacy protection
- **Email Validation** - Restricted to Manipal University domains
- **Role-based Access** - Students and faculty have different permissions

## 📊 Database Schema

### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- role (text: 'student' or 'faculty')
- department (text)
- year (text, nullable for faculty)
- anonymous_id (text, unique)
- theme (text)
- contact_number (text)
- created_at (timestamptz)
```

### Chats Table
```sql
- id (uuid, primary key)
- student_id (uuid, foreign key to users)
- faculty_id (uuid, foreign key to users)
- subject (text)
- department (text)
- messages (jsonb array)
- status (text: 'active', 'waiting', 'resolved', 'archived')
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Reports Table
```sql
- id (uuid, primary key)
- message_id (text)
- reason (text)
- comment (text)
- reported_by (uuid, foreign key to users)
- chat_id (uuid, foreign key to chats)
- resolved (boolean)
- resolved_by (text)
- resolved_at (timestamptz)
- timestamp (timestamptz)
```

## 🛠️ Usage Examples

### Register a New User
```javascript
const { data: user, error } = await registerUser({
  email: 'student@learner.manipal.edu',
  role: 'student',
  department: 'Computer Science Engineering',
  year: '2nd Year',
  contactNumber: '9876543210',
  theme: 'blue_neon'
});
```

### Start a New Chat
```javascript
const { data: chat, error } = await startNewChat({
  studentId: 'user-123-uuid',
  facultyId: 'faculty-456-uuid',
  subject: 'Assignment Help',
  department: 'Computer Science Engineering',
  firstMessage: {
    from: 'student',
    text: 'I need help with the data structures assignment'
  }
});
```

### Send a Message
```javascript
const { data: result, error } = await appendMessage({
  chatId: 'chat-789-uuid',
  from: 'faculty',
  text: 'I\'d be happy to help! What specific part are you struggling with?'
});
```

### Get User's Chats
```javascript
const { data: chats, error } = await getUserChats('user-123-uuid', 'student', {
  limit: 20,
  orderBy: 'updated_at',
  ascending: false
});
```

## 🔧 Error Handling

All functions return a consistent format:
```javascript
{
  data: Object|Array|null,  // Success data or null if error
  error: Object|null        // Error object or null if success
}
```

## 📝 Migration Order

Apply migrations in this order:
1. `001_create_users_table.sql`
2. `002_create_chats_table.sql`
3. `003_create_reports_table.sql`

## 🆘 Support

For technical issues or questions about the database functions, refer to the main project documentation or contact the development team.