/*
 * Message Operations
 * 
 * Handles message sending, retrieval, and status management.
 */

import { supabase } from '../supabaseClient.js'

/**
 * Helper function to check if a string is a valid UUID
 */
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Appends a new message to an existing chat thread
 * 
 * @param {Object} messageData - Message data to append
 * @param {string} messageData.chatId - Chat thread ID
 * @param {string} messageData.from - Sender ('student' or 'faculty')
 * @param {string} messageData.text - Message content
 * @param {string} [messageData.type] - Message type ('text', 'file', 'image')
 * @param {string} [messageData.timestamp] - Message timestamp
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function appendMessage({ 
  chatId, 
  from, 
  text, 
  type = 'text', 
  timestamp = null 
}) {
  try {
    // Check if chatId is a valid UUID
    if (!isValidUUID(chatId)) {
      console.log('Skipping Supabase update for sample chat ID:', chatId);
      // Return a mock success response for sample data
      const mockMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from,
        text: text.trim(),
        type,
        timestamp: timestamp || new Date().toISOString(),
        status: 'sent'
      };
      return { 
        data: { 
          chat: { id: chatId }, 
          message: mockMessage 
        }, 
        error: null 
      };
    }

    // Create message object
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      text: text.trim(),
      type,
      timestamp: timestamp || new Date().toISOString(),
      status: 'sent'
    };

    // First, get the current chat to access existing messages
    const { data: currentChat, error: fetchError } = await supabase
      .from('chats')
      .select('messages')
      .eq('id', chatId)
      .single();

    if (fetchError) {
      console.error('Error fetching current chat:', fetchError);
      return { data: null, error: fetchError };
    }

    // Append new message to existing messages array
    const updatedMessages = [...(currentChat.messages || []), newMessage];

    // Update chat with new message
    const { data, error } = await supabase
      .from('chats')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .select(`
        *,
        student:student_id(id, anonymous_id, department, year),
        faculty:faculty_id(id, anonymous_id, department)
      `)
      .single();

    if (error) {
      console.error('Error appending message:', error);
      return { data: null, error };
    }

    console.log('Message appended successfully:', newMessage);
    return { 
      data: { 
        chat: data, 
        message: newMessage 
      }, 
      error: null 
    };

  } catch (err) {
    console.error('Unexpected error in appendMessage:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while sending message',
        details: err.message 
      }
    };
  }
}

/**
 * Get message history for a chat
 * 
 * @param {string} chatId - Chat thread ID
 * @param {number} [limit] - Maximum number of messages to return
 * @param {number} [offset] - Number of messages to skip (for pagination)
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getChatMessages(chatId, limit = 50, offset = 0) {
  try {
    // Check if chatId is a valid UUID
    if (!isValidUUID(chatId)) {
      console.log('Skipping Supabase query for sample chat ID:', chatId);
      // Return empty messages array for sample data
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('chats')
      .select('messages')
      .eq('id', chatId)
      .single();

    if (error) {
      console.error('Error fetching chat messages:', error);
      return { data: null, error };
    }

    // Extract and paginate messages
    const messages = data.messages || [];
    const paginatedMessages = messages
      .slice(offset, offset + limit)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return { data: paginatedMessages, error: null };

  } catch (err) {
    console.error('Unexpected error in getChatMessages:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while fetching messages',
        details: err.message 
      }
    };
  }
}

/**
 * Mark messages as read for a specific user
 * 
 * @param {string} chatId - Chat thread ID
 * @param {string} userRole - User role ('student' or 'faculty')
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function markMessagesAsRead(chatId, userRole) {
  try {
    // For sample IDs, just return success
    if (!isValidUUID(chatId)) {
      return { data: { success: true }, error: null };
    }

    // For now, just return success since we don't have unread count columns
    // This can be implemented when you add those columns to your schema
    return { data: { success: true }, error: null };

  } catch (err) {
    console.error('Unexpected error in markMessagesAsRead:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while marking messages as read',
        details: err.message 
      }
    };
  }
}