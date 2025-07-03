import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Filter, LogOut, Settings, AlertTriangle, User, Search, Clock, Star, Archive, Menu, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import ChatBox from '../components/ChatBox';
import Sidebar from '../components/Sidebar';
import ThemeSelector from '../components/ThemeSelector';
import AnimatedBackground from '../components/AnimatedBackground';
import { getUserChats, appendMessage } from '../lib/database';

interface StudentChat {
  id: string;
  anonymousId: string;
  department: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  threadTitle: string;
  subject: string;
  isArchived: boolean;
  isPinned: boolean;
  studentYear?: string;
  messageCount: number;
  status: 'active' | 'waiting' | 'resolved';
  student?: {
    id: string;
    anonymous_id: string;
    department: string;
    year?: string;
  };
}

const FacultyDashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const { currentTheme, themes, setCurrentTheme } = useTheme();
  const theme = themes.find(t => t.id === currentTheme) || themes[0];
  const navigate = useNavigate();
  
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [studentChats, setStudentChats] = useState<StudentChat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'normal' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'waiting' | 'resolved'>('all');
  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState(false);

  // Set faculty theme on mount
  useEffect(() => {
    if (user?.role === 'faculty' && currentTheme !== 'red_alert') {
      setCurrentTheme('red_alert');
    }
  }, [user, currentTheme, setCurrentTheme]);

  // Load student chats from Supabase
  useEffect(() => {
    const loadStudentChats = async () => {
      if (user) {
        const { data: chats, error } = await getUserChats(user.id, 'faculty', {
          orderBy: 'created_at',
          ascending: false
        });

        if (chats && !error) {
          const formattedChats: StudentChat[] = chats.map(chat => ({
            id: chat.id,
            anonymousId: chat.student?.anonymous_id || 'Student#Unknown',
            department: chat.department,
            lastMessage: chat.lastMessage || 'No messages yet',
            timestamp: new Date(chat.created_at),
            unreadCount: chat.unreadCount || 0,
            priority: 'normal', // You can add this field to your database if needed
            threadTitle: chat.subject || 'General Question',
            subject: chat.subject || 'General Question',
            isArchived: chat.status === 'archived',
            isPinned: false, // You can add this field to your database if needed
            studentYear: chat.student?.year,
            messageCount: chat.messageCount || 0,
            status: chat.status,
            student: chat.student
          }));
          setStudentChats(formattedChats);
        } else {
          // Initialize with 2 sample chats if no data
          const sampleChats: StudentChat[] = [
            {
              id: 'sample_faculty_1',
              anonymousId: 'Student#128',
              department: 'Computer Science Engineering',
              lastMessage: 'Thank you for the explanation about data structures!',
              timestamp: new Date(Date.now() - 180000),
              unreadCount: 1,
              priority: 'normal',
              threadTitle: 'Assignment Questions',
              subject: 'Data Structures',
              isArchived: false,
              isPinned: true,
              studentYear: '2nd Year',
              messageCount: 15,
              status: 'active'
            },
            {
              id: 'sample_faculty_2',
              anonymousId: 'Student#096',
              department: 'Computer Science Engineering',
              lastMessage: 'Could you help me understand the algorithm complexity?',
              timestamp: new Date(Date.now() - 1800000),
              unreadCount: 2,
              priority: 'high',
              threadTitle: 'Exam Preparation',
              subject: 'Algorithms',
              isArchived: false,
              isPinned: false,
              studentYear: '3rd Year',
              messageCount: 8,
              status: 'waiting'
            }
          ];
          setStudentChats(sampleChats);
        }
      }
    };

    loadStudentChats();
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const togglePinChat = (chatId: string) => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    ));
  };

  const archiveChat = (chatId: string) => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isArchived: !chat.isArchived }
        : chat
    ));
  };

  const markAsRead = (chatId: string) => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));
  };

  const updateChatStatus = (chatId: string, status: 'active' | 'waiting' | 'resolved') => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, status }
        : chat
    ));
  };

  const updateChatPriority = (chatId: string, priority: 'low' | 'normal' | 'high' | 'urgent') => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, priority }
        : chat
    ));
  };

  const closeChat = () => {
    setSelectedChat('');
  };

  const handleNewMessage = async (message: string) => {
    if (!user || !selectedChat) return;

    try {
      // Update local state immediately
      setStudentChats(prev => prev.map(chat => 
        chat.id === selectedChat 
          ? { 
              ...chat, 
              lastMessage: message, 
              timestamp: new Date(),
              messageCount: chat.messageCount + 1,
              status: 'active' as const
            }
          : chat
      ));

      // Send to Supabase
      const { data, error } = await appendMessage({
        chatId: selectedChat,
        from: 'faculty',
        text: message
      });

      if (error) {
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Error handling new message:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'normal': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'waiting': return 'text-yellow-400';
      case 'resolved': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const departments = [...new Set(studentChats.map(chat => chat.department))];

  const filteredChats = studentChats.filter(chat => {
    const matchesSearch = chat.anonymousId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.threadTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || chat.department === filterDepartment;
    const matchesPriority = filterPriority === 'all' || chat.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || chat.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesPriority && matchesStatus && !chat.isArchived;
  });

  const totalUnreadCount = filteredChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const urgentChats = filteredChats.filter(chat => chat.priority === 'urgent').length;
  const waitingChats = filteredChats.filter(chat => chat.status === 'waiting').length;
  const pinnedChats = filteredChats.filter(chat => chat.isPinned);

  return (
    <div className="min-h-screen theme-faculty relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex h-screen bg-black/50 z-[-1]">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            role="faculty" 
            onThemeToggle={() => setIsThemeSelectorOpen(true)} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Student Chat List */}
          <div className={`${isChatSidebarCollapsed ? 'w-16' : 'w-full lg:w-96'} bg-gray-900/40 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto transition-all duration-300`}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`${isChatSidebarCollapsed ? 'hidden' : 'block'}`}>
                  <h2 className="font-orbitron text-lg sm:text-xl font-bold text-red-400">
                    Student Chats
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {user.anonymousId} • {totalUnreadCount} unread
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isChatSidebarCollapsed && (
                    <>
                      <button
                        onClick={() => setIsThemeSelectorOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                        title="Theme Settings"
                      >
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-red-400"
                        title="Logout"
                      >
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setIsChatSidebarCollapsed(!isChatSidebarCollapsed)}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
                    title={isChatSidebarCollapsed ? 'Expand Chat Sidebar' : 'Collapse Chat Sidebar'}
                  >
                    {isChatSidebarCollapsed ? (
                      <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                    ) : (
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Stats */}
              {!isChatSidebarCollapsed && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-red-400 font-bold text-base sm:text-lg">{urgentChats}</div>
                    <div className="text-red-400 text-xs">Urgent</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-yellow-400 font-bold text-base sm:text-lg">{waitingChats}</div>
                    <div className="text-yellow-400 text-xs">Waiting</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-green-400 font-bold text-base sm:text-lg">{filteredChats.length}</div>
                    <div className="text-green-400 text-xs">Total</div>
                  </div>
                </div>
              )}

              {/* Collapsed state - show only icons */}
              {isChatSidebarCollapsed && (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsThemeSelectorOpen(true)}
                    className="w-full p-2 sm:p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center"
                    title="Theme Settings"
                  >
                    <Settings 
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" 
                      style={{ color: theme.primary }}
                    />
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full p-2 sm:p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  </button>
                </div>
              )}
              
              {/* Search */}
              {!isChatSidebarCollapsed && (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search student chats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-8 sm:pl-10 pr-4 py-2 text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors"
                    />
                  </div>

                  {/* Filters */}
                  <div className="space-y-2">
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors appearance-none"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept} className="bg-gray-800">
                          {dept}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as any)}
                        className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors appearance-none"
                      >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors appearance-none"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="waiting">Waiting</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pinned Chats */}
            {!isChatSidebarCollapsed && pinnedChats.length > 0 && (
              <div className="p-3 sm:p-4 border-b border-gray-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  <h3 className="font-rajdhani font-semibold text-xs sm:text-sm uppercase tracking-wide text-gray-300">
                    Pinned Chats
                  </h3>
                </div>
                <div className="space-y-2">
                  {pinnedChats.slice(0, 2).map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat.id);
                        markAsRead(chat.id);
                      }}
                      className="p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 bg-gray-800/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white text-xs sm:text-sm">{chat.anonymousId}</h4>
                        {chat.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs truncate">{chat.threadTitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Chat List */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {isChatSidebarCollapsed ? (
                // Collapsed state - show only icons
                <div className="space-y-2">
                  {filteredChats.slice(0, 6).map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat.id);
                        markAsRead(chat.id);
                      }}
                      className="w-full p-2 sm:p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center relative"
                      title={chat.anonymousId}
                    >
                      <User 
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" 
                        style={{ color: selectedChat === chat.id ? theme.primary : undefined }}
                      />
                      {chat.unreadCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-xs font-bold rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: theme.primary, 
                            color: 'black'
                          }}
                        >
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                      {chat.priority === 'urgent' && (
                        <AlertTriangle className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 text-red-400" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // Expanded state - show full chat list
                <>
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat.id);
                        markAsRead(chat.id);
                      }}
                      className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 border group ${
                        selectedChat === chat.id
                          ? 'bg-red-500/10 border-red-500/50'
                          : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-xs sm:text-sm">{chat.anonymousId}</h3>
                            <p className="text-gray-500 text-xs">{chat.threadTitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {chat.priority === 'urgent' && (
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          )}
                          {chat.isPinned && (
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          )}
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinChat(chat.id);
                              }}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                              title={chat.isPinned ? 'Unpin' : 'Pin'}
                            >
                              <Star className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveChat(chat.id);
                              }}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-xs truncate mb-2">{chat.lastMessage}</p>
                      
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500 truncate">{chat.department}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full border text-xs ${getPriorityColor(chat.priority)}`}>
                            {chat.priority}
                          </span>
                          <span className={`${getStatusColor(chat.status)} capitalize`}>
                            {chat.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-gray-500" />
                          <span className="text-gray-500">{formatTime(chat.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>{chat.messageCount} msgs</span>
                          {chat.studentYear && (
                            <>
                              <span>•</span>
                              <span>{chat.studentYear}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {filteredChats.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 font-rajdhani text-sm sm:text-base">No student chats found</p>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        {searchTerm || filterDepartment !== 'all' || filterPriority !== 'all' || filterStatus !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Students will appear here when they start conversations'
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <div className="flex flex-col h-full">
                {/* Chat Header with Controls */}
                <div className="p-3 sm:p-4 border-b border-gray-700/50 bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-semibold text-white text-sm sm:text-base">
                          {studentChats.find(c => c.id === selectedChat)?.anonymousId}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {studentChats.find(c => c.id === selectedChat)?.threadTitle}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={studentChats.find(c => c.id === selectedChat)?.priority || 'normal'}
                        onChange={(e) => updateChatPriority(selectedChat, e.target.value as any)}
                        className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-2 sm:px-3 py-1 text-white text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors appearance-none"
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </select>
                      
                      <select
                        value={studentChats.find(c => c.id === selectedChat)?.status || 'active'}
                        onChange={(e) => updateChatStatus(selectedChat, e.target.value as any)}
                        className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-2 sm:px-3 py-1 text-white text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="waiting">Waiting</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Chat Box */}
                <div className="flex-1">
                  <ChatBox 
                    role="faculty" 
                    threadId={selectedChat} 
                    recipientId={selectedChat}
                    onClose={closeChat}
                    onNewMessage={handleNewMessage}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-900/20 p-4">
                <div className="text-center max-w-md">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-red-400/50 mx-auto mb-4" />
                  <h3 className="font-orbitron text-lg sm:text-xl text-red-400 mb-2">
                    Faculty Support Center
                  </h3>
                  <p className="text-gray-400 font-rajdhani text-sm sm:text-base mb-6">
                    Select a student chat to view and respond to their questions. All conversations are anonymous and secure.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm max-w-sm mx-auto">
                    <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-red-400 font-bold text-base sm:text-lg">{filteredChats.length}</div>
                      <div className="text-gray-500 text-xs sm:text-sm">Active Chats</div>
                    </div>
                    <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-red-400 font-bold text-base sm:text-lg">{totalUnreadCount}</div>
                      <div className="text-gray-500 text-xs sm:text-sm">Unread Messages</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />
    </div>
  );
};

export default FacultyDashboard;