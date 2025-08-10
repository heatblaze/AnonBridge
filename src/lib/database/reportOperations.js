/*
 * Report Operations
 * 
 * Handles issue reporting and moderation functionality.
 */

import { supabase } from '../supabaseClient.js'

/**
 * Submit an issue report
 * 
 * @param {Object} reportData - Report data
 * @param {string} reportData.reason - Issue type/reason
 * @param {string} [reportData.comment] - Additional comments
 * @param {string} reportData.reportedBy - Anonymous ID of reporter
 * @param {string} [reportData.messageId] - Related message ID (if applicable)
 * @param {string} [reportData.threadId] - Related thread ID (if applicable)
 * @param {string} reportData.userRole - Role of the reporter ('student' or 'faculty')
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function reportIssue({ 
  reason, 
  comment = '', 
  reportedBy, 
  messageId = null, 
  threadId = null, 
  userRole 
}) {
  try {
    // Get the reporter's user ID
    const { data: reporter, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('anonymous_id', reportedBy)
      .single();

    if (userError) {
      console.error('Error finding reporter:', userError);
      // Continue with null reported_by if user not found
    }

    const reportData = {
      message_id: messageId || `${userRole}_report_${Date.now()}`,
      reason,
      comment,
      reported_by: reporter?.id || null,
      chat_id: threadId,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting report:', error);
      return { data: null, error };
    }

    console.log('Report submitted successfully:', data);
    return { data, error: null };

  } catch (err) {
    console.error('Unexpected error in reportIssue:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while submitting the report',
        details: err.message 
      }
    };
  }
}

/**
 * Get all reports (admin only)
 * 
 * @param {Object} [options] - Query options
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAllReports(options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'timestamp',
      ascending = false
    } = options;

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:reported_by(anonymous_id, role),
        chat:chat_id(id, subject, department)
      `)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return { data: null, error };
    }

    return { data, error: null };

  } catch (err) {
    console.error('Unexpected error in getAllReports:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while fetching reports',
        details: err.message 
      }
    };
  }
}

/**
 * Mark a report as resolved
 * 
 * @param {string} reportId - Report ID
 * @param {string} resolvedBy - Admin who resolved the report
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function resolveReport(reportId, resolvedBy) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update({
        resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('Error resolving report:', error);
      return { data: null, error };
    }

    return { data, error: null };

  } catch (err) {
    console.error('Unexpected error in resolveReport:', err);
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while resolving the report',
        details: err.message 
      }
    };
  }
}