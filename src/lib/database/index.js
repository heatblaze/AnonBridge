/*
 * Database Helper Functions Index
 * 
 * Central export file for all database helper functions.
 * Import from this file to access all database operations.
 */

// User management
export { registerUser, checkUserExists } from './registerUser.js'

// Chat management
export { startNewChat, getAvailableFaculty } from './startNewChat.js'
export { appendMessage, markMessagesAsRead, getChatMessages } from './appendMessage.js'
export { getUserChats, getUserChatStats, searchUserChats } from './getUserChats.js'
export { reportIssue, getAllReports, resolveReport } from './reportIssue.js'

// Supabase client
export { supabase } from '../supabaseClient.js'

// Re-export default functions for convenience
export { default as registerUserDefault } from './registerUser.js'
export { default as startNewChatDefault } from './startNewChat.js'
export { default as appendMessageDefault } from './appendMessage.js'
export { default as getUserChatsDefault } from './getUserChats.js'
export { default as reportIssueDefault } from './reportIssue.js'