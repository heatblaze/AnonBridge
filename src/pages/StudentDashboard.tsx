import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, LogOut, Settings, Search, Filter, Archive, Star, Menu, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import ChatBox from '../components/ChatBox';
import Sidebar from '../components/Sidebar';
import ThemeSelector from '../components/ThemeSelector';
import AnimatedBackground from '../components/AnimatedBackground';
import { startNewChat, getUserChats, getAvailableFaculty } from '../lib/database';

interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  facultyId: string;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  department: string;
  subject: string;
  status: 'active' | 'waiting' | 'resolved';
  faculty?: {
    id: string;
    anonymous_id: string;
    department: string;
  };
}

const StudentDashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const { currentTheme, themes, currentBackground } = useTheme();
  const theme = themes.find(t => t.id === currentTheme) || themes[0];
  const navigate = useNavigate();
  
  const [selectedThread, setSelectedThread] = useState<string>('');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState(false);
  const [availableFaculty, setAvailableFaculty] = useState<any[]>([]);

  // Load available faculty on mount
  useEffect(() => {
    const loadAvailableFaculty = async () => {
      if (user) {
        const { data: faculty, error } = await getAvailableFaculty(user.department);
        if (faculty && !error) {
          setAvailableFaculty(faculty);
        }
      }
    };
    loadAvailableFaculty();
  }, [user]);

  // Load chat threads from Supabase
  useEffect(() => {
    const loadChatThreads = async () => {
      if (user) {
        const { data: chats, error } = await getUserChats(user.id, 'student', {
          orderBy: 'created_at',
          ascending: false
        });

        if (chats && !error) {
          const formattedChats: ChatThread[] = chats.map(chat => ({
            id: chat.id,
            title: chat.subject || 'General Question',
            lastMessage: chat.lastMessage || 'No messages yet',
            timestamp: new Date(chat.created_at),
            facultyId: chat.faculty?.anonymous_id || 'Faculty#Unknown',
            unreadCount: chat.unreadCount || 0,
            isArchived: chat.status === 'archived',
            isPinned: false, // You can add this field to your database if needed
            department: chat.department,
            subject: chat.subject || 'General Question',
            status: chat.status,
            faculty: chat.faculty
          }));
          setChatThreads(formattedChats);
        } else {
          // Initialize with 2 sample threads if no data
          const sampleThreads: ChatThread[] = [
            {
              id: 'sample_1',
              title: 'Assignment Questions',
              lastMessage: 'Thanks for the clarification on the algorithm!',
              timestamp: new Date(Date.now() - 180000),
              facultyId: 'Faculty#42',
              unreadCount: 0,
              isArchived: false,
              isPinned: true,
              department: user.department,
              subject: 'Data Structures',
              status: 'active'
            },
            {
              id: 'sample_2',
              title: 'Exam Preparation',
              lastMessage: 'Could you recommend some practice problems?',
              timestamp: new Date(Date.now() - 3600000),
              facultyId: 'Faculty#87',
              unreadCount: 1,
              isArchived: false,
              isPinned: false,
              department: user.department,
              subject: 'Algorithms',
              status: 'waiting'
            }
          ];
          setChatThreads(sampleThreads);
        }
      }
    };

    loadChatThreads();
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const startNewChatThread = async () => {
    if (!user) return;
    
    setIsCreatingThread(true);
    
    try {
      // Get a random available faculty member
      const randomFaculty = availableFaculty.length > 0 
        ? availableFaculty[Math.floor(Math.random() * availableFaculty.length)]
        : null;

      if (!randomFaculty) {
        console.error('No available faculty found');
        setIsCreatingThread(false);
        return;
      }

      const subjects = [
        'General Question', 'Assignment Help', 'Exam Preparation', 
        'Project Guidance', 'Career Advice', 'Course Content',
        'Technical Doubt', 'Study Material', 'Lab Work', 'Research'
      ];
      
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      
      // Create new chat in Supabase
      const { data: newChat, error } = await startNewChat({
        studentId: user.id,
        facultyId: randomFaculty.id,
        subject: randomSubject,
        department: user.department,
        firstMessage: {
          from: 'student',
          text: `Hello! I have a question about ${randomSubject.toLowerCase()}. Could you please help me?`,
          timestamp: new Date().toISOString()
        }
      });

      if (newChat && !error) {
        const newThread: ChatThread = {
          id: newChat.id,
          title: randomSubject,
          lastMessage: 'Chat started...',
          timestamp: new Date(),
          facultyId: newChat.faculty?.anonymous_id || randomFaculty.anonymous_id,
          unreadCount: 0,
          isArchived: false,
          isPinned: false,
          department: user.department,
          subject: randomSubject,
          status: 'waiting',
          faculty: newChat.faculty
        };

        setChatThreads(prev => [newThread, ...prev]);
        setSelectedThread(newThread.id);
      } else {
        console.error('Error creating new chat:', error);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    } finally {
      setIsCreatingThread(false);
    }
  };

  const togglePinThread = (threadId: string) => {
    setChatThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, isPinned: !thread.isPinned }
        : thread
    ));
  };

  const archiveThread = (threadId: string) => {
    setChatThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, isArchived: !thread.isArchived }
        : thread
    ));
  };

  const markAsRead = (threadId: string) => {
    setChatThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, unreadCount: 0 }
        : thread
    ));
  };

  const closeChat = () => {
    setSelectedThread('');
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

  const filteredThreads = chatThreads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.facultyId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && thread.unreadCount > 0) ||
      (filterStatus === 'pinned' && thread.isPinned) ||
      (filterStatus === 'archived' && thread.isArchived);
    
    return matchesSearch && matchesFilter && !thread.isArchived;
  });

  const totalUnreadCount = chatThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);
  const pinnedThreads = chatThreads.filter(thread => thread.isPinned && !thread.isArchived);

  // Check if background should show overlay
  const shouldShowOverlay = currentBackground === 'cyberpunk_cityscape' || 
                           currentBackground === 'neon_waves' || 
                           currentBackground === 'matrix_rain' ||
                           currentBackground === 'holographic_city' ||
                           currentBackground === 'pulsing_energy';

  return (
    <div className="min-h-screen theme-student relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Overlay for better visibility when sidebars are collapsed */}
      {(isChatSidebarCollapsed || !selectedThread) && shouldShowOverlay && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-5" />
      )}
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            role="student" 
            onThemeToggle={() => setIsThemeSelectorOpen(true)} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Chat Thread List */}
          <div className={`${isChatSidebarCollapsed ? 'w-16' : 'w-full lg:w-80'} bg-gray-900/40 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto transition-all duration-300 ${isChatSidebarCollapsed ? 'lg:block' : 'block'}`}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`${isChatSidebarCollapsed ? 'hidden' : 'block'}`}>
                  <h2 className="font-orbitron text-lg sm:text-xl font-bold" style={{ color: theme.primary }}>
                    Chat Threads
                  </h2>
                  <p className="text-xs sm:text-sm text-white mt-1">
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
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
                      <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white transition-colors" />
                    ) : (
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* New Chat Button */}
              {!isChatSidebarCollapsed && (
                <button
                  onClick={startNewChatThread}
                  disabled={isCreatingThread}
                  className="w-full font-rajdhani font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  style={{
                    background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: `0 0 20px ${theme.primary}40`
                  }}
                >
                  {isCreatingThread ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  {isCreatingThread ? 'Creating...' : 'Start New Chat'}
                </button>
              )}

              {/* Collapsed state - show only new chat icon */}
              {isChatSidebarCollapsed && (
                <div className="space-y-4">
                  <button
                    onClick={startNewChatThread}
                    disabled={isCreatingThread}
                    className="w-full p-2 sm:p-3 rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 0 20px ${theme.primary}40`
                    }}
                    title="Start New Chat"
                  >
                    {isCreatingThread ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setIsThemeSelectorOpen(true)}
                    className="w-full p-2 sm:p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center"
                    title="Theme Settings"
                  >
                    <Settings 
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white transition-colors" 
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
            </div>

            {/* Search and Filter */}
            {!isChatSidebarCollapsed && (
              <div className="p-3 sm:p-4 border-b border-gray-700/30">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-8 sm:pl-10 pr-4 py-2 text-white placeholder-white text-xs sm:text-sm focus:outline-none transition-colors"
                    style={{ 
                      focusBorderColor: theme.primary,
                      borderColor: `${theme.primary}30`
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = `${theme.primary}30`}
                  />
                </div>
                
                <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                  {['all', 'unread', 'pinned'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterStatus(filter as any)}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                        filterStatus === filter
                          ? 'text-black'
                          : 'text-white hover:text-white'
                      }`}
                      style={{
                        backgroundColor: filterStatus === filter ? theme.primary : 'rgba(75, 85, 99, 0.3)',
                        borderColor: filterStatus === filter ? theme.primary : 'transparent'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned Threads */}
            {!isChatSidebarCollapsed && pinnedThreads.length > 0 && (
              <div className="p-3 sm:p-4 border-b border-gray-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.primary }} />
                  <h3 className="font-rajdhani font-semibold text-xs sm:text-sm uppercase tracking-wide text-white">
                    Pinned
                  </h3>
                </div>
                <div className="space-y-2">
                  {pinnedThreads.slice(0, 3).map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThread(thread.id);
                        markAsRead(thread.id);
                      }}
                      className="p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 bg-gray-800/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white text-xs sm:text-sm truncate">{thread.title}</h4>
                        {thread.unreadCount > 0 && (
                          <span 
                            className="text-black text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-xs truncate">{thread.lastMessage}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Thread List */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {isChatSidebarCollapsed ? (
                // Collapsed state - show only icons
                <div className="space-y-2">
                  {filteredThreads.slice(0, 6).map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => {
                        setSelectedThread(thread.id);
                        markAsRead(thread.id);
                      }}
                      className="w-full p-2 sm:p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex items-center justify-center relative"
                      title={thread.title}
                    >
                      <MessageSquare 
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white transition-colors" 
                        style={{ color: selectedThread === thread.id ? theme.primary : undefined }}
                      />
                      {thread.unreadCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-xs font-bold rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: theme.primary, 
                            color: 'black'
                          }}
                        >
                          {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // Expanded state - show full thread list
                <>
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThread(thread.id);
                        markAsRead(thread.id);
                      }}
                      className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 border group ${
                        selectedThread === thread.id
                          ? 'border-opacity-100 bg-opacity-20'
                          : 'border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/50'
                      }`}
                      style={{
                        borderColor: selectedThread === thread.id ? theme.primary : undefined,
                        backgroundColor: selectedThread === thread.id ? `${theme.primary}10` : undefined
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white text-xs sm:text-sm truncate">{thread.title}</h3>
                            {thread.isPinned && (
                              <Star className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" style={{ color: theme.primary }} />
                            )}
                          </div>
                          <p className="text-white text-xs">{thread.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {thread.unreadCount > 0 && (
                            <span 
                              className="text-black text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                              style={{ backgroundColor: theme.primary }}
                            >
                              {thread.unreadCount}
                            </span>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinThread(thread.id);
                              }}
                              className="p-1 hover:bg-gray-700 rounded text-white hover:text-white transition-colors"
                              title={thread.isPinned ? 'Unpin' : 'Pin'}
                            >
                              <Star className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveThread(thread.id);
                              }}
                              className="p-1 hover:bg-gray-700 rounded text-white hover:text-white transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-white text-xs truncate mb-2">{thread.lastMessage}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: theme.accent }}>{thread.facultyId}</span>
                        <span className="text-white">{formatTime(thread.timestamp)}</span>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {filteredThreads.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-white font-rajdhani text-sm sm:text-base">
                        {searchTerm ? 'No chats found' : 'No chat threads yet'}
                      </p>
                      <p className="text-white text-xs sm:text-sm mt-1">
                        {searchTerm ? 'Try a different search term' : 'Start a new conversation with faculty'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <ChatBox 
                role="student" 
                threadId={selectedThread} 
                onClose={closeChat}
                onNewMessage={(message) => {
                  setChatThreads(prev => prev.map(thread => 
                    thread.id === selectedThread 
                      ? { ...thread, lastMessage: message, timestamp: new Date() }
                      : thread
                  ));
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-900/20 p-4">
                <div className="text-center max-w-md">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: `${theme.primary}50` }} />
                  <h3 className="font-orbitron text-lg sm:text-xl mb-2" style={{ color: theme.primary }}>
                    Welcome to AnonBridge
                  </h3>
                  <p className="text-white font-rajdhani text-sm sm:text-base mb-6">
                    Select a chat thread to continue your conversation or start a new one to connect with faculty anonymously.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm max-w-sm mx-auto">
                    <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                      <div className="font-bold text-base sm:text-lg" style={{ color: theme.primary }}>
                        {filteredThreads.length}
                      </div>
                      <div className="text-white text-xs sm:text-sm">Active Chats</div>
                    </div>
                    <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                      <div className="font-bold text-base sm:text-lg" style={{ color: theme.primary }}>
                        {totalUnreadCount}
                      </div>
                      <div className="text-white text-xs sm:text-sm">Unread Messages</div>
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

export default StudentDashboard;