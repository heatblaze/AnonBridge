import React, { useState } from 'react';
import { Pin, Zap, Bell, Settings, Users, Shield, BookOpen, Calendar, HelpCircle, Star, ChevronDown, ChevronRight, AlertTriangle, Clock, FileText, Video, MessageCircle, Award, TrendingUp, Menu, X, Flag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { reportIssue } from '../lib/database';

interface SidebarProps {
  role: 'student' | 'faculty';
  onThemeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onThemeToggle }) => {
  const { currentTheme, themes } = useTheme();
  const { user } = useUser();
  const theme = themes.find(t => t.id === currentTheme) || themes[0];

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');

  // Collapsible section states
  const [sectionsExpanded, setSectionsExpanded] = useState({
    notices: true,
    pinned: true,
    quickLinks: true
  });

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleReportIssue = async () => {
    if (!reportReason.trim()) return;
    
    try {
      const { data, error } = await reportIssue({
        reason: reportReason,
        comment: reportComment,
        reportedBy: user?.anonymousId || 'Unknown',
        userRole: role
      });

      if (error) {
        throw new Error(error.message);
      }
      
      setReportReason('');
      setReportComment('');
      setShowReportModal(false);
      
      alert('Issue reported successfully. Our team will review it shortly.');
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Failed to report issue. Please try again.');
    }
  };

  const notices = role === 'student'
    ? [
        { 
          type: 'info', 
          title: 'New Course Material Available', 
          content: 'Data Structures - Chapter 5 uploaded',
          time: '2h ago', 
          icon: BookOpen,
          priority: 'normal'
        },
        { 
          type: 'warning', 
          title: 'Assignment Deadline Reminder', 
          content: 'Project submission due in 3 days',
          time: '4h ago', 
          icon: Calendar,
          priority: 'high'
        },
        { 
          type: 'success', 
          title: 'Grade Published', 
          content: 'Midterm exam results are now available',
          time: '1d ago', 
          icon: Award,
          priority: 'normal'
        },
        { 
          type: 'info', 
          title: 'System Maintenance', 
          content: 'Scheduled downtime: Sunday 2-4 AM',
          time: '2d ago', 
          icon: Settings,
          priority: 'low'
        },
        { 
          type: 'warning', 
          title: 'Library Hours Extended', 
          content: 'Open until 11 PM during exam week',
          time: '3d ago', 
          icon: Clock,
          priority: 'normal'
        }
      ]
    : [
        { 
          type: 'warning', 
          title: 'Student Report Pending', 
          content: 'Inappropriate message flagged for review',
          time: '1h ago', 
          icon: Shield,
          priority: 'high'
        },
        { 
          type: 'info', 
          title: 'New Student Query', 
          content: '3 students waiting for response',
          time: '3h ago', 
          icon: Users,
          priority: 'normal'
        },
        { 
          type: 'success', 
          title: 'Feedback Submitted', 
          content: 'Student evaluation completed',
          time: '1d ago', 
          icon: Star,
          priority: 'normal'
        },
        { 
          type: 'info', 
          title: 'Department Meeting', 
          content: 'Faculty meeting scheduled for Friday',
          time: '2d ago', 
          icon: Calendar,
          priority: 'normal'
        },
        { 
          type: 'warning', 
          title: 'Grade Submission Deadline', 
          content: 'Final grades due by March 25th',
          time: '3d ago', 
          icon: FileText,
          priority: 'high'
        }
      ];

  const pinnedMessages = role === 'student' 
    ? [
        { 
          id: 1, 
          title: 'Office Hours Schedule', 
          preview: 'Available Mon-Fri 2-4 PM in Room 301', 
          priority: 'high',
          sender: 'Faculty#42',
          timestamp: '2h ago',
          category: 'schedule'
        },
        { 
          id: 2, 
          title: 'Assignment Guidelines', 
          preview: 'Project 3 requirements and submission format', 
          priority: 'urgent',
          sender: 'Faculty#87',
          timestamp: '1d ago',
          category: 'assignment'
        },
        { 
          id: 3, 
          title: 'Exam Schedule Released', 
          preview: 'Midterm on March 15th, Final on April 20th', 
          priority: 'normal',
          sender: 'Faculty#23',
          timestamp: '2d ago',
          category: 'exam'
        },
        { 
          id: 4, 
          title: 'Study Group Formation', 
          preview: 'Join our weekend study sessions for algorithms', 
          priority: 'normal',
          sender: 'Faculty#156',
          timestamp: '3d ago',
          category: 'study'
        },
        { 
          id: 5, 
          title: 'Research Opportunities', 
          preview: 'Undergraduate research positions available', 
          priority: 'normal',
          sender: 'Faculty#91',
          timestamp: '1w ago',
          category: 'research'
        }
      ]
    : [
        { 
          id: 1, 
          title: 'Department Meeting Notes', 
          preview: 'Faculty meeting agenda and action items', 
          priority: 'high',
          sender: 'Admin',
          timestamp: '1d ago',
          category: 'meeting'
        },
        { 
          id: 2, 
          title: 'Grade Submission Reminder', 
          preview: 'Final grades deadline: March 25th', 
          priority: 'urgent',
          sender: 'Admin',
          timestamp: '2d ago',
          category: 'deadline'
        },
        { 
          id: 3, 
          title: 'Student Feedback Summary', 
          preview: 'Review pending course evaluations', 
          priority: 'normal',
          sender: 'Admin',
          timestamp: '3d ago',
          category: 'feedback'
        },
        { 
          id: 4, 
          title: 'New Curriculum Guidelines', 
          preview: 'Updated course structure for next semester', 
          priority: 'normal',
          sender: 'Admin',
          timestamp: '1w ago',
          category: 'curriculum'
        }
      ];

  const quickLinks = role === 'student' 
    ? [
        { 
          icon: BookOpen, 
          label: 'Course Materials', 
          count: 12, 
          color: theme.primary,
          description: 'Lecture notes, slides, resources'
        },
        { 
          icon: Users, 
          label: 'Study Groups', 
          count: 3, 
          color: theme.accent,
          description: 'Join collaborative study sessions'
        },
        { 
          icon: Calendar, 
          label: 'Academic Calendar', 
          count: 5, 
          color: theme.secondary,
          description: 'Upcoming deadlines and events'
        },
        { 
          icon: HelpCircle, 
          label: 'Help Center', 
          count: 0, 
          color: theme.primary,
          description: 'FAQs and support resources'
        },
        { 
          icon: Star, 
          label: 'Favorites', 
          count: 8, 
          color: theme.accent,
          description: 'Bookmarked conversations'
        },
        { 
          icon: Award, 
          label: 'Achievements', 
          count: 4, 
          color: theme.secondary,
          description: 'Academic milestones'
        },
        { 
          icon: Video, 
          label: 'Recorded Lectures', 
          count: 15, 
          color: theme.primary,
          description: 'Video content library'
        },
        { 
          icon: TrendingUp, 
          label: 'Progress Tracker', 
          count: 0, 
          color: theme.accent,
          description: 'Academic performance insights'
        }
      ]
    : [
        { 
          icon: Users, 
          label: 'Student Chats', 
          count: 18, 
          color: theme.primary,
          description: 'Active student conversations'
        },
        { 
          icon: Bell, 
          label: 'Reports & Alerts', 
          count: 3, 
          color: theme.secondary,
          description: 'Flagged content and notifications'
        },
        { 
          icon: Shield, 
          label: 'Moderation Tools', 
          count: 1, 
          color: theme.accent,
          description: 'Content review and management'
        },
        { 
          icon: BookOpen, 
          label: 'Course Resources', 
          count: 25, 
          color: theme.primary,
          description: 'Teaching materials and guides'
        },
        { 
          icon: Calendar, 
          label: 'Schedule Manager', 
          count: 7, 
          color: theme.secondary,
          description: 'Office hours and appointments'
        },
        { 
          icon: FileText, 
          label: 'Grade Management', 
          count: 12, 
          color: theme.accent,
          description: 'Student assessments and feedback'
        },
        { 
          icon: MessageCircle, 
          label: 'Announcements', 
          count: 2, 
          color: theme.primary,
          description: 'Class and department updates'
        },
        { 
          icon: TrendingUp, 
          label: 'Analytics Dashboard', 
          count: 0, 
          color: theme.secondary,
          description: 'Student engagement metrics'
        }
      ];

  const getNoticeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'normal': return `border-l-[${theme.primary}] bg-[${theme.primary}]/5`;
      case 'low': return 'border-l-gray-500 bg-gray-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 animate-pulse';
      case 'high': return 'bg-yellow-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const SectionHeader: React.FC<{
    title: string;
    icon: React.ComponentType<any>;
    count?: number;
    isExpanded: boolean;
    onToggle: () => void;
  }> = ({ title, icon: Icon, count, isExpanded, onToggle }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: theme.primary }} />
        {!isCollapsed && (
          <>
            <h3 className="font-rajdhani font-semibold text-sm uppercase tracking-wide text-gray-300 group-hover:text-white transition-colors">
              {title}
            </h3>
            {count !== undefined && count > 0 && (
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full animate-pulse"
                style={{ 
                  backgroundColor: `${theme.primary}20`, 
                  color: theme.primary 
                }}
              >
                {count}
              </span>
            )}
          </>
        )}
      </div>
      {!isCollapsed && (
        <div className="text-gray-400 group-hover:text-white transition-colors">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      )}
    </button>
  );

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 transition-all duration-300`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <h2 className="font-orbitron text-xl font-bold" style={{ color: theme.primary }}>
              {role === 'student' ? 'STUDENT' : 'FACULTY'} PANEL
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {user?.department} • {user?.anonymousId}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <button
                onClick={onThemeToggle}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
                title="Theme Settings"
              >
                <Settings 
                  className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors group-hover:rotate-90 duration-300" 
                />
              </button>
            )}
            
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
              title="Report Issue"
            >
              <Flag className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            </button>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              ) : (
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsed state - show only icons */}
        {isCollapsed ? (
          <div className="space-y-4">
            <button
              onClick={onThemeToggle}
              className="w-full p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center"
              title="Theme Settings"
            >
              <Settings 
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
                style={{ color: theme.primary }}
              />
            </button>
            
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center"
              title="Report Issue"
            >
              <Flag className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            </button>
            
            <div className="space-y-2">
              {quickLinks.slice(0, 6).map((link, index) => (
                <button
                  key={index}
                  className="w-full p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center relative"
                  title={link.label}
                >
                  <link.icon 
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
                    style={{ color: link.color }}
                  />
                  {link.count > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: link.color, 
                        color: 'black'
                      }}
                    >
                      {link.count > 9 ? '9+' : link.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Notices Section */}
            <div className="mb-6">
              <SectionHeader
                title="Recent Notices"
                icon={Bell}
                count={notices.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
                isExpanded={sectionsExpanded.notices}
                onToggle={() => toggleSection('notices')}
              />
              
              {sectionsExpanded.notices && (
                <div className="mt-3 space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {notices.map((notice, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-1 rounded border ${getNoticeColor(notice.type)}`}>
                            <notice.icon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-white truncate group-hover:text-gray-100">
                              {notice.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notice.content}</p>
                            <p className="text-xs text-gray-500 mt-1">{notice.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full ${getPriorityIndicator(notice.priority)}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pinned Messages Section */}
            <div className="mb-6">
              <SectionHeader
                title="Pinned Messages"
                icon={Pin}
                count={pinnedMessages.length}
                isExpanded={sectionsExpanded.pinned}
                onToggle={() => toggleSection('pinned')}
              />
              
              {sectionsExpanded.pinned && (
                <div className="mt-3 space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {pinnedMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg border-l-4 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${getPriorityColor(msg.priority)}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-white truncate">{msg.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{msg.preview}</p>
                        </div>
                        <div 
                          className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${getPriorityIndicator(msg.priority)}`}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-purple-400 font-mono">{msg.sender}</span>
                        <span className="text-gray-500">{msg.timestamp}</span>
                      </div>
                      <div className="mt-1">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: `${theme.accent}20`, 
                            color: theme.accent 
                          }}
                        >
                          {msg.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links Section */}
            <div className="mb-6">
              <SectionHeader
                title="Quick Links"
                icon={Zap}
                count={quickLinks.filter(link => link.count > 0).length}
                isExpanded={sectionsExpanded.quickLinks}
                onToggle={() => toggleSection('quickLinks')}
              />
              
              {sectionsExpanded.quickLinks && (
                <div className="mt-3 space-y-2">
                  {quickLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="p-2 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${link.color}20` }}
                        >
                          <link.icon 
                            className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" 
                            style={{ color: link.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                            {link.label}
                          </span>
                          <p className="text-xs text-gray-500 mt-1 truncate">{link.description}</p>
                        </div>
                      </div>
                      {link.count > 0 && (
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full animate-pulse flex-shrink-0"
                          style={{ 
                            backgroundColor: `${link.color}20`, 
                            color: link.color 
                          }}
                        >
                          {link.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  🔒 Secure • Anonymous • Encrypted
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <span>AnonBridge v2.0</span>
                  <span>•</span>
                  <span>Online</span>
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.primary }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-gray-900/95 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-yellow-400" />
                Report Issue
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issue Type
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                >
                  <option value="">Select issue type</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="harassment">Harassment</option>
                  <option value="spam">Spam</option>
                  <option value="technical_issue">Technical Issue</option>
                  <option value="privacy_concern">Privacy Concern</option>
                  <option value="platform_bug">Platform Bug</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Provide additional details about the issue..."
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                disabled={!reportReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;