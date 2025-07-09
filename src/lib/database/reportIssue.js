/*
 * Report Issue Helper
 * 
 * Handles issue reporting functionality for the AnonBridge platform.
 * Stores reports in the reports table for admin review.
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
    const reportData = {
      message_id: messageId || `${userRole}_report_${Date.now()}`,
      reason,
      reported_by: reportedBy,
      timestamp: new Date().toISOString(),
      // Store additional context in a JSON field if needed
      metadata: {
        comment,
        threadId,
        userRole,
        reportType: messageId ? 'message_report' : 'general_issue'
      }
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single()

    if (error) {
      console.error('Error submitting report:', error)
      return { data: null, error }
    }

    console.log('Report submitted successfully:', data)
    return { data, error: null }

  } catch (err) {
    console.error('Unexpected error in reportIssue:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while submitting the report',
        details: err.message 
      }
    }
  }
}

/**
 * Get all reports (admin only)
 * 
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Maximum number of reports to return
 * @param {number} [options.offset] - Number of reports to skip
 * @param {string} [options.orderBy] - Order by field
 * @param {boolean} [options.ascending] - Sort order
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAllReports(options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'timestamp',
      ascending = false
    } = options

    let query = supabase
      .from('reports')
      .select('*')
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return { data: null, error }
    }

    return { data, error: null }

  } catch (err) {
    console.error('Unexpected error in getAllReports:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while fetching reports',
        details: err.message 
      }
    }
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
      .single()

    if (error) {
      console.error('Error resolving report:', error)
      return { data: null, error }
    }

    return { data, error: null }

  } catch (err) {
    console.error('Unexpected error in resolveReport:', err)
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred while resolving the report',
        details: err.message 
      }
    }
  }
}

export default reportIssue