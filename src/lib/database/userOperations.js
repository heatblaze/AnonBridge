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
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User role ('student' or 'faculty')
 * @param {string} userData.department - User's department
 * @param {string} [userData.year] - Academic year (optional, for students)
 * @param {string} [userData.contactNumber] - User's contact number
 * @param {string} [userData.theme] - Preferred theme (optional)
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function registerUser({ 
  email, 
  password,
  role, 
  department, 
  year = null, 
  contactNumber = null, 
  theme = 'blue_neon' 
}) {
  try {
    // Validate required fields
    if (!password || password.length < 6) {
      return {
        data: null,
        error: { message: 'Password must be at least 6 characters long' }
      };
    }

    // Validate email domain
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@manipal.edu') && !emailLower.endsWith('@learner.manipal.edu')) {
      return {
        data: null,
        error: { message: 'Only Manipal University email addresses are allowed' }
      };
    }

    // First, create the auth user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailLower,
      password: password,
      options: {
        emailRedirectTo: undefined // Disable email confirmation
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return {
        data: null,
        error: { message: 'Failed to create user account' }
      };
    }

    // Generate anonymous ID
    const prefix = role === 'student' ? 'Student' : 'Faculty';
    const randomNum = Math.floor(Math.random() * 899) + 100;
    let anonymousId = `${prefix}#${randomNum}`;

    // Check if anonymous ID already exists (very rare, but possible)
    const { data: existingUser } = await supabase
      .from('users')
      .select('anonymous_id')
      .eq('anonymous_id', anonymousId)
      .single();

    if (existingUser) {
      // Generate a new one if collision occurs
      const newRandomNum = Math.floor(Math.random() * 899) + 100;
      anonymousId = `${prefix}#${newRandomNum}`;
    }

    // Prepare user data
    const userData = {
      id: authData.user.id, // Use the auth user's ID
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
      // If user profile creation fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
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
 * Authenticate user with email and password
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function authenticateUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (error) {
      console.error('Authentication error:', error);
      return { data: null, error };
    }

    // Get user profile data
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { data: null, error: profileError };
    }

    return { 
      data: { 
        user: data.user, 
        profile: userProfile 
      }, 
      error: null 
    };

  } catch (err) {
    console.error('Unexpected error in authenticateUser:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred during authentication',
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