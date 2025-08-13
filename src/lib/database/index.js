/*
 * Database Helper Functions Index
 * 
 * Central export file for all database helper functions.
 * Import from this file to access all database operations.
 */

// User management
export { registerUser, checkUserExists, authenticateUser } from './userOperations.js'

// Chat management
export { startNewChat, getAvailableFaculty } from './chatOperations.js'
export { appendMessage, markMessagesAsRead, getChatMessages } from './messageOperations.js'
export { getUserChats, getUserChatStats, searchUserChats } from './chatRetrieval.js'
export { reportIssue, getAllReports, resolveReport } from './reportOperations.js'

// Supabase client
export { supabase } from '../supabaseClient.js'