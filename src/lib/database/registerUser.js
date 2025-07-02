/*
 * Register User Helper
 * 
 * Creates a new user record in the users table with the provided information.
 * Generates an anonymous ID and handles role-specific data.
 */

import { supabase } from '../supabaseClient.js'

/**
 * Registers a new user in the database
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email address
 * @param {string} userData.role - User role ('student' or 'faculty')
 * @param {string} userData.department - User's department
 * @param {string} [userData.year] - Academic year (optional, for students)
 * @param {string} [userData.theme] - Preferred theme (optional)
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function registerUser({ email, role, department, year = null, theme = 'blue_neon' }) {
  try {
    // Generate anonymous ID
    const prefix = role === 'student' ? 'Student' : 'Faculty'
    const randomNum = Math.floor(Math.random() * 899) + 100
    const anonymousId = `${prefix}#${randomNum}`

    // Prepare user data - only include columns that exist in the schema
    const userData = {
      email: email.toLowerCase().trim(),
      role,
      department,
      year: role === 'student' ? year : null,
      anonymous_id: anonymousId,
      theme
    }

    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      console.error('Error registering user:', error)
      return { data: null, error }
    }

    console.log('User registered successfully:', data)
    return { data, error: null }

  } catch (err) {
    console.error('Unexpected error in registerUser:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred during registration',
        details: err.message 
      }
    }
  }
}

/**
 * Check if a user already exists with the given email
 * 
 * @param {string} email - Email to check
 * @returns {Promise<{exists: boolean, user: Object|null, error: Object|null}>}
 */
export async function checkUserExists(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (error) {
      console.error('Error checking user existence:', error)
      return { exists: false, user: null, error }
    }

    return { 
      exists: !!data, 
      user: data || null, 
      error: null 
    }

  } catch (err) {
    console.error('Unexpected error in checkUserExists:', err)
    return { 
      exists: false, 
      user: null, 
      error: { 
        message: 'An unexpected error occurred while checking user',
        details: err.message 
      }
    }
  }
}

export default registerUser