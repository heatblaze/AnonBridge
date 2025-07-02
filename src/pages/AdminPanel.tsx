import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MessageSquare, AlertTriangle, Eye, Search, Filter, Download, ArrowLeft } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Mock data for admin panel
  const users = [
    {
      id: '1',
      email: 'student1@manipal.edu',
      role: 'student',
      department: 'Computer Science Engineering',
      year: '2nd Year',
      anonymousId: 'Student#128',
      lastActive: new Date(Date.now() - 180000),
      status: 'online'
    },
    {
      id: '2',
      email: 'prof.smith@manipal.edu',
      role: 'faculty',
      department: 'Computer Science Engineering',
      anonymousId: 'Faculty#42',
      lastActive: new Date(Date.now() - 300000),
      status: 'online'
    },
    {
      id: '3',
      email: 'student2@manipal.edu',
      role: 'student',
      department: 'Information Technology',
      year: '3rd Year',
      anonymousId: 'Student#096',
      lastActive: new Date(Date.now() - 3600000),
      status: 'offline'
    }
  ];

  const reports = [
    {
      id: '1',
      messageId: 'msg_123',
      reportedBy: 'Student#215',
      reportedUser: 'Faculty#87',
      reason: 'Inappropriate language',
      timestamp: new Date(Date.now() - 1800000),
      status: 'pending',
      severity: 'medium'
    },
    {
      id: '2',
      messageId: 'msg_456',
      reportedBy: 'Faculty#23',
      reportedUser: 'Student#342',
      reason: 'Spam messages',
      timestamp: new Date(Date.now() - 7200000),
      status: 'resolved',
      severity: 'low'
    }
  ];

  const chats = [
    {
      id: 'chat_1',
      participants: ['Student#128', 'Faculty#42'],
      department: 'Computer Science Engineering',
      messageCount: 15,
      lastActivity: new Date(Date.now() - 180000),
      status: 'active'
    },
    {
      id: 'chat_2',
      participants: ['Student#096', 'Faculty#87'],
      department: 'Information Technology',
      messageCount: 8,
      lastActivity: new Date(Date.now() - 3600000),
      status: 'active'
    }
  ];

  const stats = {
    totalUsers: users.length,
    activeChats: chats.filter(c => c.status === 'active').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    totalMessages: chats.reduce((sum, chat) => sum + chat.messageCount, 0)
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-gray-500';
      case 'pending': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      case 'active': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.anonymousId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                  <div>
                    <h1 className="font-orbitron text-lg sm:text-2xl font-bold text-red-400">
                      Admin Panel
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm">AnonBridge System Control</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export Data</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Active Chats</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.activeChats}</p>
                </div>
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Pending Reports</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Messages</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalMessages}</p>
                </div>
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl mb-6 overflow-x-auto">
            <div className="flex min-w-max">
              {[
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'chats', label: 'Chat Logs', icon: MessageSquare },
                { id: 'reports', label: 'Abuse Reports', icon: AlertTriangle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'text-red-400 border-b-2 border-red-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-orbitron text-lg sm:text-xl font-bold text-white">User Management</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700/50 border border-gray-600/50 rounded-lg pl-8 sm:pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors text-sm sm:text-base w-full sm:w-auto"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-gray-700/50 border border-gray-600/50 rounded-lg pl-8 sm:pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-400 transition-colors appearance-none text-sm sm:text-base w-full sm:w-auto"
                      >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base">User</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base">Role</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base hidden sm:table-cell">Department</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base">Anonymous ID</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base">Status</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base hidden lg:table-cell">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                          <td className="py-3 px-2 sm:px-4">
                            <div>
                              <p className="text-white font-medium text-sm sm:text-base">{user.email}</p>
                              {user.year && <p className="text-gray-400 text-xs sm:text-sm">{user.year}</p>}
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'student' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-300 text-sm sm:text-base hidden sm:table-cell">{user.department}</td>
                          <td className="py-3 px-2 sm:px-4 text-purple-400 font-mono text-sm sm:text-base">{user.anonymousId}</td>
                          <td className="py-3 px-2 sm:px-4">
                            <span className={`${getStatusColor(user.status)} font-medium text-sm sm:text-base`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-400 text-xs sm:text-sm hidden lg:table-cell">{formatTime(user.lastActive)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Chat Logs Tab */}
            {activeTab === 'chats' && (
              <div className="p-4 sm:p-6">
                <h2 className="font-orbitron text-lg sm:text-xl font-bold text-white mb-6">Chat Monitoring</h2>
                <div className="space-y-3 sm:space-y-4">
                  {chats.map((chat) => (
                    <div key={chat.id} className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            {chat.participants.map((participant, index) => (
                              <React.Fragment key={participant}>
                                <span className="text-purple-400 font-mono text-xs sm:text-sm">{participant}</span>
                                {index < chat.participants.length - 1 && (
                                  <span className="text-gray-500">↔</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                        </div>
                        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors text-xs sm:text-sm">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          View Chat
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-400">Department:</span>
                          <p className="text-white">{chat.department}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Messages:</span>
                          <p className="text-white">{chat.messageCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Activity:</span>
                          <p className="text-white">{formatTime(chat.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="p-4 sm:p-6">
                <h2 className="font-orbitron text-lg sm:text-xl font-bold text-white mb-6">Abuse Reports</h2>
                <div className="space-y-3 sm:space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(report.severity)}`}>
                              {report.severity} priority
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-1 text-sm sm:text-base">Reason: {report.reason}</p>
                          <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                            <p>Reported by: <span className="text-purple-400 font-mono">{report.reportedBy}</span></p>
                            <p>Reported user: <span className="text-purple-400 font-mono">{report.reportedUser}</span></p>
                            <p>Time: {formatTime(report.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                          <button className="flex-1 lg:flex-none px-2 sm:px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg hover:bg-green-600/30 transition-colors text-xs sm:text-sm">
                            Resolve
                          </button>
                          <button className="flex-1 lg:flex-none px-2 sm:px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors text-xs sm:text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;