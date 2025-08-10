/*
 * User Operations
 * 
 * Handles user registration, authentication, and profile management.
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
 * @param {string} [userData.contactNumber] - User's contact number
 * @param {string} [userData.theme] - Preferred theme (optional)
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function registerUser({ 
  email, 
  role, 
  department, 
  year = null, 
  contactNumber = null, 
  theme = 'blue_neon' 
}) {
  try {
    // Validate email domain
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@manipal.edu') && !emailLower.endsWith('@learner.manipal.edu')) {
      return {
        data: null,
        error: { message: 'Only Manipal University email addresses are allowed' }
      };
    }

    // Generate anonymous ID
    const prefix = role === 'student' ? 'Student' : 'Faculty';
    const randomNum = Math.floor(Math.random() * 899) + 100;
    const anonymousId = `${prefix}#${randomNum}`;

    // Check if anonymous ID already exists (very rare, but possible)
    const { data: existingUser } = await supabase
      .from('users')
      .select('anonymous_id')
      .eq('anonymous_id', anonymousId)
      .single();

    if (existingUser) {
      // Generate a new one if collision occurs
      const newRandomNum = Math.floor(Math.random() * 899) + 100;
      const newAnonymousId = `${prefix}#${newRandomNum}`;
      anonymousId = newAnonymousId;
    }

    // Prepare user data
    const userData = {
      email: emailLower,
      role,
      department,
      year: role === 'student' ? year : null,
      anonymous_id: anonymousId,
      theme,
      contact_number: contactNumber
    };

    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error registering user:', error);
      return { data: null, error };
    }

    console.log('User registered successfully:', data);
    return { data, error: null };

  } catch (err) {
    console.error('Unexpected error in registerUser:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred during registration',
        details: err.message 
      }
    };
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
      .maybeSingle();

    if (error) {
      console.error('Error checking user existence:', error);
      return { exists: false, user: null, error };
    }

    return { 
      exists: !!data, 
      user: data || null, 
      error: null 
    };

  } catch (err) {
    console.error('Unexpected error in checkUserExists:', err);
    return { 
      exists: false, 
      user: null, 
      error: { 
        message: 'An unexpected error occurred while checking user',
        details: err.message 
      }
    };
  }
}