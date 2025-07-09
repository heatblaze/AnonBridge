import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MessageSquare, AlertTriangle, Eye, Search, Filter, Download, ArrowLeft, FileText, Calendar } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { getUserChats, supabase } from '../lib/database';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin credentials
  const ADMIN_CREDENTIALS = {
    name: 'Overwatch',
    password: '********'
  };

  // Load real-time data
  useEffect(() => {
    if (isAuthenticated) {
      loadRealTimeData();
      
      // Set up real-time subscriptions
      const usersSubscription = supabase
        .channel('users_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          loadUsers();
        })
        .subscribe();

      const chatsSubscription = supabase
        .channel('chats_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
          loadChats();
        })
        .subscribe();

      const reportsSubscription = supabase
        .channel('reports_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
          loadReports();
        })
        .subscribe();

      return () => {
        usersSubscription.unsubscribe();
        chatsSubscription.unsubscribe();
        reportsSubscription.unsubscribe();
      };
    }
  }, [isAuthenticated]);

  const loadRealTimeData = async () => {
    setIsLoading(true);
    await Promise.all([loadUsers(), loadChats(), loadReports()]);
    setIsLoading(false);
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          student:student_id(id, anonymous_id, department, year),
          faculty:faculty_id(id, anonymous_id, department)
        `)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        const processedChats = data.map(chat => ({
          ...chat,
          participants: [
            chat.student?.anonymous_id || 'Student#Unknown',
            chat.faculty?.anonymous_id || 'Faculty#Unknown'
          ],
          messageCount: chat.messages ? chat.messages.length : 0,
          lastActivity: new Date(chat.created_at),
          status: 'active'
        }));
        setChats(processedChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (data && !error) {
        setReports(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name === ADMIN_CREDENTIALS.name && loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          year: user.year,
          anonymous_id: user.anonymous_id,
          created_at: user.created_at
        })),
        chats: chats.map(chat => ({
          id: chat.id,
          participants: chat.participants,
          department: chat.department,
          messageCount: chat.messageCount,
          created_at: chat.created_at,
          lastActivity: chat.lastActivity
        })),
        reports: reports.map(report => ({
          id: report.id,
          message_id: report.message_id,
          reason: report.reason,
          reported_by: report.reported_by,
          timestamp: report.timestamp
        })),
        exportedAt: new Date().toISOString(),
        totalUsers: users.length,
        totalChats: chats.length,
        totalReports: reports.length
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `anonbridge-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center">
        <AnimatedBackground />
        
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="font-orbitron text-2xl font-bold text-red-400 mb-2">
                Admin Access
              </h1>
              <p className="text-gray-400 text-sm">
                Restricted Area - Authorized Personnel Only
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={loginForm.name}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition-colors"
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <p className="text-red-400 text-sm text-center">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Access Admin Panel
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.anonymous_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    activeChats: chats.filter(c => c.status === 'active').length,
    pendingReports: reports.filter(r => !r.resolved).length,
    totalMessages: chats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-rajdhani text-lg">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <button 
                  onClick={handleExportData}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Export Data</span>
                  <span className="xs:hidden">Export</span>
                </button>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                >
                  Logout
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
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-300 text-sm sm:text-base hidden lg:table-cell">Created</th>
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
                          <td className="py-3 px-2 sm:px-4 text-purple-400 font-mono text-sm sm:text-base">{user.anonymous_id}</td>
                          <td className="py-3 px-2 sm:px-4 text-gray-400 text-xs sm:text-sm hidden lg:table-cell">
                            {formatTime(user.created_at)}
                          </td>
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
                            {chat.participants.map((participant: string, index: number) => (
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
                          <span className="text-gray-400">Messages:</span>
                          <p className="text-white">{chat.messageCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Created:</span>
                          <p className="text-white">{formatTime(chat.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Activity:</span>
                          <p className="text-white">{formatTime(chat.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {chats.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No chat data available</p>
                    </div>
                  )}
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
                          <p className="text-white font-medium mb-1 text-sm sm:text-base">Reason: {report.reason}</p>
                          <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                            <p>Message ID: <span className="text-purple-400 font-mono">{report.message_id}</span></p>
                            <p>Reported by: <span className="text-purple-400 font-mono">{report.reported_by}</span></p>
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
                  
                  {reports.length === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No reports available</p>
                    </div>
                  )}
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