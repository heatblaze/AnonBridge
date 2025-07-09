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