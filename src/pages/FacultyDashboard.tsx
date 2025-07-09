import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Filter, LogOut, Settings, AlertTriangle, User, Search, Clock, Star, Archive, Menu, X, ArrowLeft } from 'lucide-react';
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
  // ... rest of the component code ...

  return (
    <div className="min-h-screen theme-faculty relative overflow-hidden">
      <AnimatedBackground />

      {/* Overlay for better visibility when sidebars are collapsed */}
      {(isChatSidebarCollapsed || !selectedChat) && shouldShowOverlay && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-5" />
      )}

      <div className="relative z-10 flex h-screen">
        {/* ... rest of the JSX ... */}

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${
            selectedChat ? 'block' : 'hidden lg:flex'
          }`}>
            {selectedChat ? (
              <div className="flex flex-col h-full">
                {/* Mobile back button */}
                <div className="lg:hidden p-4 border-b border-gray-700/50 bg-gray-800/30">
                  <button
                    onClick={() => setSelectedChat('')}
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Chats
                  </button>
                </div>
                
                {/* Chat Header with Controls */}
                <div className="p-3 sm:p-4 border-b border-gray-700/50 bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    {/* ... rest of the chat header ... */}
                  </div>
                </div>

                {/* ... rest of the chat content ... */}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-900/20 p-4 hidden lg:flex">
                <div className="text-center max-w-md">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-red-400/50 mx-auto mb-4" />
                  <h3 className="font-orbitron text-lg sm:text-xl text-red-400 mb-2">
                    Faculty Support Center
                  </h3>
                  <p className="text-white font-rajdhani text-sm sm:text-base mb-6">
                    Select a student chat to view and respond to their questions. All conversations are anonymous and secure.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm max-w-sm mx-auto">
                    <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-red-400 font-bold text-base sm:text-lg">{filteredChats.length}</div>
                      <div className="text-white text-xs sm:text-sm">Active Chats</div>
                    </div>
                    <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-red-400 font-bold text-base sm:text-lg">{totalUnreadCount}</div>
                      <div className="text-white text-xs sm:text-sm">Unread Messages</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat List Overlay */}
        <div className={`lg:hidden fixed inset-0 z-20 ${
          selectedChat ? 'hidden' : 'block'
        }`}>
          <div className="h-full bg-gray-900/40 backdrop-blur-sm">
            {/* Mobile optimized chat list */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-orbitron text-lg font-bold text-red-400">
                    Student Chats
                  </h2>
                  <p className="text-xs text-white mt-1">
                    {user?.anonymousId} • {totalUnreadCount} unread
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsThemeSelectorOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                    title="Theme Settings"
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-red-400"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Student Chat List */}
            <div className="p-4 space-y-3 overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }}>
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat.id);
                    markAsRead(chat.id);
                  }}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-300 border bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-sm">{chat.anonymousId}</h3>
                        <p className="text-white text-xs">{chat.threadTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {chat.priority === 'urgent' && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-white text-xs truncate mb-2">{chat.lastMessage}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white truncate">{chat.department}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-white">{formatTime(chat.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
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