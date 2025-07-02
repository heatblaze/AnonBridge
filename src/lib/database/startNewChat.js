/*
 * Start New Chat Helper
 * 
 * Creates a new chat thread between a student and faculty member.
 * Initializes the chat with a first message and sets up the conversation.
 */

import { supabase } from '../supabaseClient.js'

/**
 * Creates a new chat thread between student and faculty
 * 
 * @param {Object} chatData - Chat initialization data
 * @param {string} chatData.studentId - Student's user ID
 * @param {string} chatData.facultyId - Faculty's user ID  
 * @param {string} chatData.subject - Chat subject/topic
 * @param {string} [chatData.department] - Department context
 * @param {Object} [chatData.firstMessage] - Initial message object
 * @param {string} chatData.firstMessage.from - Sender ('student' or 'faculty')
 * @param {string} chatData.firstMessage.text - Message content
 * @param {string} [chatData.firstMessage.timestamp] - Message timestamp
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function startNewChat({ 
  studentId, 
  facultyId, 
  subject, 
  department = null,
  firstMessage = null 
}) {
  try {
    // Validate required parameters
    if (!studentId) {
      return { 
        data: null, 
        error: { message: 'Student ID is required' }
      }
    }

    if (!facultyId) {
      return { 
        data: null, 
        error: { message: 'Faculty ID is required' }
      }
    }

    // Create default first message if none provided
    const defaultMessage = {
      from: 'student',
      text: 'Hello, I have a question and would appreciate your guidance.',
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}`,
      type: 'text',
      status: 'sent'
    }

    const initialMessage = firstMessage || defaultMessage

    // Prepare chat data - explicitly setting the IDs to override defaults
    const chatData = {
      student_id: studentId,
      faculty_id: facultyId,
      messages: [initialMessage] // JSONB array with first message
    }

    // Insert chat into database
    const { data, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select(`
        *,
        student:student_id(id, anonymous_id, department, year),
        faculty:faculty_id(id, anonymous_id, department)
      `)
      .single()

    if (error) {
      console.error('Error creating new chat:', error)
      return { data: null, error }
    }

    console.log('New chat created successfully:', data)
    return { data, error: null }

  } catch (err) {
    console.error('Unexpected error in startNewChat:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while creating chat',
        details: err.message 
      }
    }
  }
}

/**
 * Get available faculty members for a department
 * 
 * @param {string} department - Department to filter by
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAvailableFaculty(department = null) {
  try {
    let query = supabase
      .from('users')
      .select('id, anonymous_id, department')
      .eq('role', 'faculty')

    if (department) {
      query = query.eq('department', department)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching available faculty:', error)
      return { data: null, error }
    }

    return { data, error: null }

  } catch (err) {
    console.error('Unexpected error in getAvailableFaculty:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while fetching faculty',
        details: err.message 
      }
    }
  }
}

export default startNewChat