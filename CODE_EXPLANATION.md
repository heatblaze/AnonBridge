# AnonBridge - Code Architecture & Implementation Guide

This document provides a comprehensive explanation of how the AnonBridge codebase works, covering all major components, patterns, and architectural decisions.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Core Components](#core-components)
4. [Database Layer](#database-layer)
5. [Authentication System](#authentication-system)
6. [Theme System](#theme-system)
7. [Responsive Design](#responsive-design)
8. [State Management](#state-management)
9. [Security Implementation](#security-implementation)
10. [Performance Optimizations](#performance-optimizations)

---

## 🏗️ Project Overview

AnonBridge is a React-based single-page application (SPA) built with TypeScript, featuring a cyberpunk-themed UI for anonymous communication between students and faculty at Manipal University.

### Key Technologies
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context + useState/useEffect hooks

---

## 🏛️ Architecture & Design Patterns

### 1. Component Architecture

```
App.tsx (Root)
├── Router (React Router)
├── UserProvider (Authentication Context)
├── ThemeProvider (Theme Context)
└── Pages/
    ├── Homepage
    ├── Login
    ├── StudentDashboard
    ├── FacultyDashboard
    ├── AdminPanel
    └── ContactSupport
```

### 2. Design Patterns Used

#### **Context Pattern**
```typescript
// UserContext.tsx - Global user state management
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
```

#### **Custom Hook Pattern**
```typescript
// Custom hooks for context consumption
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

#### **Compound Component Pattern**
```typescript
// GlitchButton.tsx - Reusable button with multiple variants
interface GlitchButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glitchIntensity?: 'low' | 'medium' | 'high';
}
```

---

## 🧩 Core Components

### 1. App.tsx - Application Root

```typescript
function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-900">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/contact-support" element={<ContactSupport />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}
```

**Key Features:**
- Wraps entire app with context providers
- Sets up routing with React Router
- Provides global styling foundation

### 2. Homepage.tsx - Landing Page

```typescript
const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [useVideoBackground, setUseVideoBackground] = useState(false);
  
  // Features, stats, and UI elements
  const features = [
    { icon: Shield, title: 'Secure & Anonymous', description: '...' },
    { icon: Zap, title: 'Real-time Chat', description: '...' },
    { icon: Users, title: 'Student-Faculty Bridge', description: '...' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      {/* Navigation, Hero, Features, Footer */}
    </div>
  );
};
```

**Key Features:**
- Dynamic background switching (video/animated)
- Responsive navigation
- Feature showcase with statistics
- Role-based login routing

### 3. Login.tsx - Authentication Page

```typescript
const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    role: searchParams.get('role') || '',
    department: '',
    year: ''
  });

  const validateEmail = (email: string) => {
    // Manipal University email validation
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@manipal.edu') && !emailLower.endsWith('@learner.manipal.edu')) {
      return 'Only Manipal University email addresses are allowed';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Check existing user or register new user
    const { exists, user: existingUser } = await checkUserExists(formData.email);
    
    if (exists && existingUser) {
      // Login existing user
      setUser(existingUser);
    } else {
      // Register new user
      const { data: newUser } = await registerUser(formData);
      setUser(newUser);
    }
  };
};
```

**Key Features:**
- Email domain validation (Manipal University only)
- Role-based form fields
- Dynamic theme styling based on role
- User registration and login handling

### 4. StudentDashboard.tsx - Student Interface

```typescript
const StudentDashboard: React.FC = () => {
  const [selectedThread, setSelectedThread] = useState<string>('');
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [isMobileChatListOpen, setIsMobileChatListOpen] = useState(true);

  // Load chat threads from Supabase
  useEffect(() => {
    const loadChatThreads = async () => {
      const { data: chats } = await getUserChats(user.id, 'student');
      setChatThreads(formatChats(chats));
    };
    loadChatThreads();
  }, [user]);

  const startNewChatThread = async () => {
    const randomFaculty = availableFaculty[Math.floor(Math.random() * availableFaculty.length)];
    const { data: newChat } = await startNewChat({
      studentId: user.id,
      facultyId: randomFaculty.id,
      subject: randomSubject,
      department: user.department
    });
    setChatThreads(prev => [newChat, ...prev]);
  };
};
```

**Key Features:**
- Chat thread management
- New conversation creation
- Mobile-responsive layout
- Real-time message updates

### 5. FacultyDashboard.tsx - Faculty Interface

```typescript
const FacultyDashboard: React.FC = () => {
  const [studentChats, setStudentChats] = useState<StudentChat[]>([]);
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high'>('all');

  const updateChatPriority = (chatId: string, priority: 'low' | 'normal' | 'high' | 'urgent') => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, priority } : chat
    ));
  };

  const updateChatStatus = (chatId: string, status: 'active' | 'waiting' | 'resolved') => {
    setStudentChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, status } : chat
    ));
  };
};
```

**Key Features:**
- Student conversation management
- Priority and status controls
- Advanced filtering and search
- Faculty-specific UI theme (red/orange)

### 6. ChatBox.tsx - Real-time Chat Component

```typescript
const ChatBox: React.FC<ChatBoxProps> = ({ role, threadId, onNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    const tempMessage: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    
    // Send to Supabase
    const { data } = await appendMessage({
      chatId: threadId,
      from: role,
      text: newMessage
    });

    // Update message status
    setMessages(prev => prev.map(msg => 
      msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
    ));
  };
};
```

**Key Features:**
- Real-time message display
- Message status indicators
- Typing indicators
- File attachment support
- Issue reporting functionality

---

## 🗄️ Database Layer

### 1. Supabase Client Configuration

```javascript
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

### 2. Database Helper Functions

#### **User Registration**
```javascript
// registerUser.js
export async function registerUser({ email, role, department, year, theme }) {
  const anonymousId = `${role === 'student' ? 'Student' : 'Faculty'}#${Math.floor(Math.random() * 899) + 100}`;
  
  const userData = {
    email: email.toLowerCase().trim(),
    role,
    department,
    year: role === 'student' ? year : null,
    anonymous_id: anonymousId,
    theme
  };

  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  return { data, error };
}
```

#### **Chat Management**
```javascript
// startNewChat.js
export async function startNewChat({ studentId, facultyId, subject, firstMessage }) {
  const chatData = {
    student_id: studentId,
    faculty_id: facultyId,
    messages: [firstMessage] // JSONB array
  };

  const { data, error } = await supabase
    .from('chats')
    .insert([chatData])
    .select(`
      *,
      student:student_id(id, anonymous_id, department, year),
      faculty:faculty_id(id, anonymous_id, department)
    `)
    .single();

  return { data, error };
}
```

#### **Message Handling**
```javascript
// appendMessage.js
export async function appendMessage({ chatId, from, text, type = 'text' }) {
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    from,
    text: text.trim(),
    type,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };

  // Get current messages and append new one
  const { data: currentChat } = await supabase
    .from('chats')
    .select('messages')
    .eq('id', chatId)
    .single();

  const updatedMessages = [...(currentChat.messages || []), newMessage];

  const { data, error } = await supabase
    .from('chats')
    .update({ messages: updatedMessages })
    .eq('id', chatId)
    .select()
    .single();

  return { data: { chat: data, message: newMessage }, error };
}
```

### 3. Database Schema

#### **Users Table**
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  department text,
  year text,
  anonymous_id text UNIQUE NOT NULL,
  theme text,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

#### **Chats Table**
```sql
CREATE TABLE chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  faculty_id uuid REFERENCES users(id) ON DELETE SET NULL,
  messages jsonb[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own chats"
  ON chats FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Faculty can read assigned chats"
  ON chats FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);
```

---

## 🔐 Authentication System

### 1. Email Validation

```typescript
const validateEmail = (email: string) => {
  if (!email.includes('@')) {
    return 'Please enter a valid email address';
  }
  
  const emailLower = email.toLowerCase();
  if (!emailLower.endsWith('@manipal.edu') && !emailLower.endsWith('@learner.manipal.edu')) {
    return 'Only Manipal University email addresses are allowed';
  }
  
  const emailRegex = /^[^\s@]+@(manipal\.edu|learner\.manipal\.edu)$/i;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid Manipal University email address';
  }
  
  return '';
};
```

### 2. User Context Management

```typescript
// UserContext.tsx
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
```

### 3. Protected Routes

```typescript
// Route protection in dashboard components
const StudentDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Dashboard content...
};
```

### 4. Anonymous ID Generation

```typescript
const generateAnonymousId = (role: string) => {
  const prefix = role === 'student' ? 'Student' : 'Faculty';
  const randomNum = Math.floor(Math.random() * 899) + 100; // 100-999
  return `${prefix}#${randomNum}`;
};
```

---

## 🎨 Theme System

### 1. Theme Context

```typescript
// ThemeContext.tsx
interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}

const themes: ThemeOption[] = [
  {
    id: 'blue_neon',
    name: 'Blue/Purple Neon',
    primary: '#00d4ff',
    secondary: '#7c3aed',
    accent: '#06b6d4',
    description: 'Classic cyberpunk blue with purple accents'
  },
  // ... more themes
];

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue_neon');
  const [currentBackground, setCurrentBackground] = useState('pulsing_energy');

  // Apply CSS variables when theme changes
  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.primary);
      root.style.setProperty('--theme-secondary', theme.secondary);
      root.style.setProperty('--theme-accent', theme.accent);
      root.style.setProperty('--theme-glow', `${theme.primary}80`);
    }
  }, [currentTheme]);
};
```

### 2. CSS Variables & Theme Classes

```css
/* App.css */
:root {
  --theme-primary: #00d4ff;
  --theme-secondary: #7c3aed;
  --theme-accent: #06b6d4;
  --theme-glow: #00d4ff80;
}

.theme-blue_neon {
  --theme-primary: #00d4ff;
  --theme-secondary: #7c3aed;
  --theme-accent: #06b6d4;
}

.theme-red_alert {
  --theme-primary: #ff4444;
  --theme-secondary: #ff8800;
  --theme-accent: #ff6b35;
}
```

### 3. Dynamic Styling

```typescript
// Component using theme
const GlitchButton: React.FC<GlitchButtonProps> = ({ variant, children }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes.find(t => t.id === currentTheme) || themes[0];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
          borderColor: theme.primary,
          boxShadow: `0 0 20px ${theme.primary}40`
        };
      // ... other variants
    }
  };

  return (
    <button style={getVariantStyles()}>
      {children}
    </button>
  );
};
```

### 4. Background System

```typescript
// Background options with animations
const backgroundOptions = [
  {
    id: 'cyberpunk_cityscape',
    name: 'Cyberpunk Cityscape',
    description: 'Live animated cityscape with buildings and vehicles'
  },
  {
    id: 'matrix_rain',
    name: 'Matrix Rain',
    description: 'Falling green characters like The Matrix'
  }
  // ... more backgrounds
];

const applyBackgroundStyle = (backgroundId: string) => {
  const body = document.body;
  body.classList.remove('bg-animated', 'bg-static', 'bg-grid', 'bg-waves');
  
  switch (backgroundId) {
    case 'cyberpunk_cityscape':
      body.classList.add('bg-animated');
      break;
    case 'matrix_rain':
      body.classList.add('bg-matrix');
      break;
  }
};
```

---

## 📱 Responsive Design

### 1. Mobile-First Approach

```typescript
// Responsive state management
const [isMobileChatListOpen, setIsMobileChatListOpen] = useState(true);

// Mobile header for small screens
<div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900/90">
  <div className="flex items-center justify-between p-4">
    <button onClick={() => setIsMobileChatListOpen(!isMobileChatListOpen)}>
      <Menu className="w-5 h-5 text-white" />
    </button>
    {/* Header content */}
  </div>
</div>
```

### 2. Responsive Layout Classes

```typescript
// Adaptive sidebar width
<div className={`
  ${isMobileChatListOpen ? 'translate-x-0' : '-translate-x-full'} 
  lg:translate-x-0 
  ${isChatSidebarCollapsed ? 'lg:w-16' : 'w-full lg:w-96'} 
  fixed lg:relative inset-y-0 left-0 z-20 lg:z-auto
`}>
```

### 3. Touch-Friendly Interface

```css
/* Touch targets minimum 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Responsive text sizing */
.text-responsive {
  @apply text-xs sm:text-sm md:text-base lg:text-lg;
}

/* Adaptive spacing */
.spacing-responsive {
  @apply p-2 sm:p-3 md:p-4 lg:p-6;
}
```

### 4. Breakpoint Management

```typescript
// Screen size detection
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      setIsMobileChatListOpen(false);
    }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 🔄 State Management

### 1. Local Component State

```typescript
// useState for component-specific state
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

// useEffect for side effects
useEffect(() => {
  const loadMessages = async () => {
    setIsLoading(true);
    const { data } = await getChatMessages(threadId);
    setMessages(data);
    setIsLoading(false);
  };
  
  if (threadId) {
    loadMessages();
  }
}, [threadId]);
```

### 2. Global State with Context

```typescript
// User state management
const { user, setUser, isAuthenticated } = useUser();

// Theme state management
const { currentTheme, setCurrentTheme, themes } = useTheme();
```

### 3. State Updates and Optimistic UI

```typescript
const handleSendMessage = async () => {
  // Optimistic update
  const tempMessage = {
    id: Date.now().toString(),
    content: newMessage,
    status: 'sending'
  };
  
  setMessages(prev => [...prev, tempMessage]);
  
  try {
    // Send to server
    const { data } = await appendMessage({
      chatId: threadId,
      text: newMessage
    });
    
    // Update with server response
    setMessages(prev => prev.map(msg => 
      msg.id === tempMessage.id 
        ? { ...msg, status: 'sent' }
        : msg
    ));
  } catch (error) {
    // Handle error - revert optimistic update
    setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
  }
};
```

### 4. State Persistence

```typescript
// Theme persistence
useEffect(() => {
  const savedTheme = localStorage.getItem('anonbridge_theme');
  if (savedTheme && themes.find(t => t.id === savedTheme)) {
    setCurrentTheme(savedTheme);
  }
}, []);

useEffect(() => {
  localStorage.setItem('anonbridge_theme', currentTheme);
}, [currentTheme]);
```

---

## 🛡️ Security Implementation

### 1. Input Validation

```typescript
// Email validation with domain restriction
const validateEmail = (email: string) => {
  const emailLower = email.toLowerCase();
  if (!emailLower.endsWith('@manipal.edu') && !emailLower.endsWith('@learner.manipal.edu')) {
    return 'Only Manipal University email addresses are allowed';
  }
  return '';
};

// Message content sanitization
const sanitizeMessage = (message: string) => {
  return message.trim().substring(0, 2000); // Limit length
};
```

### 2. Anonymous ID System

```typescript
// Generate anonymous identifiers
const generateAnonymousId = (role: string) => {
  const prefix = role === 'student' ? 'Student' : 'Faculty';
  const randomNum = Math.floor(Math.random() * 899) + 100;
  return `${prefix}#${randomNum}`;
};

// Never expose real user data in chat
const formatChatData = (chat: any) => ({
  id: chat.id,
  anonymousId: chat.student?.anonymous_id || 'Student#Unknown',
  lastMessage: chat.lastMessage,
  // Real email/name never included
});
```

### 3. Row Level Security (RLS)

```sql
-- Students can only see their own chats
CREATE POLICY "Students can read own chats"
  ON chats FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Faculty can only see assigned chats
CREATE POLICY "Faculty can read assigned chats"
  ON chats FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);
```

### 4. Issue Reporting System

```typescript
const reportIssue = async ({ reason, comment, reportedBy, messageId }) => {
  const reportData = {
    message_id: messageId || `report_${Date.now()}`,
    reason,
    reported_by: reportedBy, // Anonymous ID, not real identity
    timestamp: new Date().toISOString(),
    metadata: { comment, reportType: 'general_issue' }
  };

  const { data, error } = await supabase
    .from('reports')
    .insert([reportData]);

  return { data, error };
};
```

---

## ⚡ Performance Optimizations

### 1. Code Splitting & Lazy Loading

```typescript
// Lazy load components
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ContactSupport = lazy(() => import('./pages/ContactSupport'));

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <AdminPanel />
</Suspense>
```

### 2. Memoization

```typescript
// Memoize expensive calculations
const filteredChats = useMemo(() => {
  return chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || chat.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
}, [chats, searchTerm, filterStatus]);

// Memoize callback functions
const handleChatSelect = useCallback((chatId: string) => {
  setSelectedChat(chatId);
  markAsRead(chatId);
}, []);
```

### 3. Virtual Scrolling (for large lists)

```typescript
// Implement pagination for large chat lists
const [chatPage, setChatPage] = useState(0);
const CHATS_PER_PAGE = 20;

const loadMoreChats = useCallback(async () => {
  const { data } = await getUserChats(user.id, role, {
    limit: CHATS_PER_PAGE,
    offset: chatPage * CHATS_PER_PAGE
  });
  
  setChats(prev => [...prev, ...data]);
  setChatPage(prev => prev + 1);
}, [chatPage, user.id, role]);
```

### 4. Debounced Search

```typescript
// Debounce search input
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);

// Use debounced term for filtering
const filteredChats = useMemo(() => {
  return chats.filter(chat => 
    chat.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );
}, [chats, debouncedSearchTerm]);
```

### 5. Image Optimization

```typescript
// Lazy load images with intersection observer
const ImageWithLazyLoading: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
```

---

## 🎯 Key Implementation Details

### 1. Real-time Updates

```typescript
// Supabase real-time subscriptions
useEffect(() => {
  if (isAuthenticated) {
    const chatsSubscription = supabase
      .channel('chats_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats' 
      }, (payload) => {
        // Handle real-time chat updates
        if (payload.eventType === 'INSERT') {
          setChats(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setChats(prev => prev.map(chat => 
            chat.id === payload.new.id ? payload.new : chat
          ));
        }
      })
      .subscribe();

    return () => {
      chatsSubscription.unsubscribe();
    };
  }
}, [isAuthenticated]);
```

### 2. Error Handling

```typescript
// Comprehensive error handling
const handleAsyncOperation = async (operation: () => Promise<any>) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const result = await operation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    
    // Show user-friendly error message
    toast.error('Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Accessibility Features

```typescript
// Keyboard navigation
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};

// Screen reader support
<button
  aria-label={`Send message to ${recipientName}`}
  aria-describedby="message-input"
  onClick={handleSendMessage}
>
  <Send className="w-5 h-5" />
</button>

// Focus management
useEffect(() => {
  if (selectedChat) {
    messageInputRef.current?.focus();
  }
}, [selectedChat]);
```

### 4. Testing Considerations

```typescript
// Component testing setup
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProvider } from '../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </UserProvider>
  );
};

// Example test
test('should send message when send button is clicked', async () => {
  const mockSendMessage = jest.fn();
  
  renderWithProviders(
    <ChatBox onSendMessage={mockSendMessage} />
  );
  
  const input = screen.getByPlaceholderText('Type your message...');
  const sendButton = screen.getByRole('button', { name: /send/i });
  
  fireEvent.change(input, { target: { value: 'Hello world' } });
  fireEvent.click(sendButton);
  
  await waitFor(() => {
    expect(mockSendMessage).toHaveBeenCalledWith('Hello world');
  });
});
```

---

## 🚀 Deployment & Build Process

### 1. Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react']
        }
      }
    }
  }
});
```

### 2. Environment Configuration

```typescript
// Environment variables handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}
```

### 3. Production Optimizations

```typescript
// Service worker registration (if implemented)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js');
}

// Error boundary for production
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service in production
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

---

This comprehensive code explanation covers all major aspects of the AnonBridge implementation. The codebase follows modern React patterns, implements robust security measures, and provides a scalable architecture for anonymous communication between students and faculty.