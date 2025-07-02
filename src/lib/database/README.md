# AnonBridge Database Helper Functions

This directory contains helper functions for interacting with the Supabase database. All functions are designed to work with the existing database schema and provide a clean API for database operations.

## Setup Instructions

1. **Install Supabase Client**: The `@supabase/supabase-js` package has been added to package.json
2. **Configure Supabase**: Update `src/lib/supabaseClient.js` with your project details:
   - Replace `YOUR_SUPABASE_PROJECT_URL` with your actual Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your actual Supabase anon key

## Available Functions

### User Management (`registerUser.js`)
- `registerUser(userData)` - Creates a new user record
- `checkUserExists(email)` - Checks if a user already exists

### Chat Management (`startNewChat.js`)
- `startNewChat(chatData)` - Creates a new chat thread
- `getAvailableFaculty(department)` - Gets available faculty members

### Message Management (`appendMessage.js`)
- `appendMessage(messageData)` - Adds a message to existing chat
- `markMessagesAsRead(chatId, userRole)` - Marks messages as read
- `getChatMessages(chatId, limit, offset)` - Gets message history

### Chat Retrieval (`getUserChats.js`)
- `getUserChats(userId, role, options)` - Gets all chats for a user
- `getUserChatStats(userId, role)` - Gets chat statistics
- `searchUserChats(userId, role, searchTerm)` - Searches user's chats

## Usage Examples

```javascript
import { registerUser, startNewChat, appendMessage, getUserChats } from './lib/database'

// Register a new user
const { data: user, error } = await registerUser({
  email: 'student@manipal.edu',
  role: 'student',
  department: 'Computer Science Engineering',
  year: '2nd Year',
  theme: 'blue_neon'
})

// Start a new chat
const { data: chat, error } = await startNewChat({
  studentId: 'user-123',
  facultyId: 'faculty-456',
  subject: 'Assignment Help',
  department: 'Computer Science Engineering',
  firstMessage: {
    from: 'student',
    text: 'I need help with the data structures assignment'
  }
})

// Send a message
const { data: result, error } = await appendMessage({
  chatId: 'chat-789',
  from: 'faculty',
  text: 'I\'d be happy to help! What specific part are you struggling with?'
})

// Get user's chats
const { data: chats, error } = await getUserChats('user-123', 'student', {
  status: 'active',
  limit: 20,
  orderBy: 'last_message_at'
})
```

## Database Schema Requirements

These functions expect the following database structure:

### Users Table
- `id` (uuid, primary key)
- `email` (text, unique)
- `role` (text: 'student' or 'faculty')
- `department` (text)
- `year` (text, nullable)
- `anonymous_id` (text, unique)
- `preferred_theme` (text)
- `created_at` (timestamptz)
- `last_active` (timestamptz)
- `is_active` (boolean)

### Chats Table
- `id` (uuid, primary key)
- `student_id` (uuid, foreign key to users)
- `faculty_id` (uuid, foreign key to users)
- `subject` (text)
- `department` (text)
- `messages` (jsonb array)
- `status` (text: 'active', 'resolved', 'archived')
- `priority` (text: 'low', 'normal', 'high', 'urgent')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `last_message_at` (timestamptz)
- `student_unread_count` (integer)
- `faculty_unread_count` (integer)

## Error Handling

All functions return a consistent format:
```javascript
{
  data: Object|Array|null,  // Success data or null if error
  error: Object|null        // Error object or null if success
}
```

## Security Notes

- All functions use the Supabase client with Row Level Security (RLS)
- Anonymous IDs are automatically generated to protect user identity
- Email addresses are normalized (lowercase, trimmed)
- Input validation is performed on all user-provided data