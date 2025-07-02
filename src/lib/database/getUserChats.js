/*
 * Get User Chats Helper
 * 
 * Fetches all chat threads for a given user based on their role.
 * Returns chats where the user is either the student or faculty participant.
 */

import { supabase } from '../supabaseClient.js'

/**
 * Fetches all chat threads for a specific user
 * 
 * @param {string} userId - User's ID
 * @param {string} role - User's role ('student' or 'faculty')
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Maximum number of chats to return
 * @param {number} [options.offset] - Number of chats to skip (for pagination)
 * @param {string} [options.orderBy] - Order by field ('created_at')
 * @param {boolean} [options.ascending] - Sort order (true for ascending, false for descending)
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getUserChats(userId, role, options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      ascending = false
    } = options

    // Build query based on user role
    let query = supabase
      .from('chats')
      .select(`
        *,
        student_id(*),
        faculty_id(*)
      `)

    // Filter by user role
    if (role === 'student') {
      query = query.eq('student_id', userId)
    } else if (role === 'faculty') {
      query = query.eq('faculty_id', userId)
    } else {
      throw new Error('Invalid role. Must be "student" or "faculty"')
    }

    // Apply ordering and pagination
    query = query
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user chats:', error)
      return { data: null, error }
    }

    // Process and enrich chat data
    const processedChats = data.map(chat => ({
      ...chat,
      // Add convenience fields
      lastMessage: getLastMessageText(chat.messages),
      lastMessageTime: chat.created_at, // Using created_at since we don't have last_message_at
      unreadCount: 0, // Placeholder since we don't have unread count columns yet
      otherParticipant: role === 'student' ? chat.faculty_id : chat.student_id,
      messageCount: chat.messages ? chat.messages.length : 0,
      status: 'active', // Default status since we don't have this column yet
      subject: 'General Question', // Default subject since we don't have this column yet
      // Add formatted timestamps
      createdAtFormatted: new Date(chat.created_at).toLocaleString(),
      last_message_at: chat.created_at, // Use created_at as fallback
      // Map the nested user data for backward compatibility
      student: chat.student_id,
      faculty: chat.faculty_id
    }))

    console.log(`Fetched ${processedChats.length} chats for ${role} ${userId}`)
    return { data: processedChats, error: null }

  } catch (err) {
    console.error('Unexpected error in getUserChats:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while fetching chats',
        details: err.message 
      }
    }
  }
}

/**
 * Get chat statistics for a user
 * 
 * @param {string} userId - User's ID
 * @param {string} role - User's role ('student' or 'faculty')
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getUserChatStats(userId, role) {
  try {
    // Build query based on user role
    let query = supabase
      .from('chats')
      .select('created_at, messages')

    if (role === 'student') {
      query = query.eq('student_id', userId)
    } else if (role === 'faculty') {
      query = query.eq('faculty_id', userId)
    } else {
      throw new Error('Invalid role. Must be "student" or "faculty"')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching chat stats:', error)
      return { data: null, error }
    }

    // Calculate statistics
    const stats = {
      totalChats: data.length,
      activeChats: data.length, // All chats are considered active for now
      resolvedChats: 0,
      archivedChats: 0,
      totalUnreadMessages: 0, // Placeholder
      chatsThisWeek: data.filter(chat => {
        const chatDate = new Date(chat.created_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return chatDate > weekAgo
      }).length,
      chatsThisMonth: data.filter(chat => {
        const chatDate = new Date(chat.created_at)
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return chatDate > monthAgo
      }).length
    }

    return { data: stats, error: null }

  } catch (err) {
    console.error('Unexpected error in getUserChatStats:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while fetching chat statistics',
        details: err.message 
      }
    }
  }
}

/**
 * Search user's chats by content
 * 
 * @param {string} userId - User's ID
 * @param {string} role - User's role ('student' or 'faculty')
 * @param {string} searchTerm - Search term to look for
 * @param {Object} [options] - Search options
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function searchUserChats(userId, role, searchTerm, options = {}) {
  try {
    const { limit = 20 } = options

    // Get all user chats first
    const { data: chats, error } = await getUserChats(userId, role, { limit: 1000 })

    if (error) {
      return { data: null, error }
    }

    // Filter chats based on search term
    const searchResults = chats.filter(chat => {
      const searchLower = searchTerm.toLowerCase()
      
      // Search in messages
      if (chat.messages && Array.isArray(chat.messages)) {
        return chat.messages.some(message => 
          message.text && message.text.toLowerCase().includes(searchLower)
        )
      }
      
      return false
    }).slice(0, limit)

    return { data: searchResults, error: null }

  } catch (err) {
    console.error('Unexpected error in searchUserChats:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while searching chats',
        details: err.message 
      }
    }
  }
}

/**
 * Helper function to extract last message text from messages array
 * 
 * @param {Array} messages - Array of message objects
 * @returns {string} Last message text or default message
 */
function getLastMessageText(messages) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return 'No messages yet'
  }
  
  const lastMessage = messages[messages.length - 1]
  return lastMessage.text || 'Message content unavailable'
}

export default getUserChats