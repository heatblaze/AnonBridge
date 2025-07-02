import React, { useState, useRef, useEffect } from 'react';
import { Send, Flag, MoreVertical, User, Shield, Clock, Paperclip, Smile, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { appendMessage, getChatMessages, markMessagesAsRead } from '../lib/database';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  anonymousId: string;
  reported?: boolean;
  type: 'text' | 'file' | 'image';
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatBoxProps {
  role: 'student' | 'faculty';
  threadId?: string;
  recipientId?: string;
  onNewMessage?: (message: string) => void;
  onClose?: () => void;
}

/**
 * Helper function to check if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const ChatBox: React.FC<ChatBoxProps> = ({ role, threadId, recipientId, onNewMessage, onClose }) => {
  const { currentTheme, themes } = useTheme();
  const { user } = useUser();
  const theme = themes.find(t => t.id === currentTheme) || themes[0];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for this thread
  useEffect(() => {
    const loadMessages = async () => {
      if (threadId && user) {
        setIsLoading(true);
        try {
          // Check if threadId is a valid UUID
          if (!isValidUUID(threadId)) {
            console.log('Using sample messages for non-UUID thread ID:', threadId);
            // Use sample messages for non-UUID thread IDs
            const sampleMessages: Message[] = [
              {
                id: '1',
                content: 'Hello, I have a question about the upcoming assignment.',
                sender: role === 'faculty' ? 'other' : 'user',
                timestamp: new Date(Date.now() - 300000),
                anonymousId: role === 'student' ? 'Faculty#42' : 'Student#128',
                type: 'text',
                status: 'read'
              },
              {
                id: '2',
                content: 'Sure! I\'d be happy to help. What specific part are you having trouble with?',
                sender: role === 'faculty' ? 'user' : 'other',
                timestamp: new Date(Date.now() - 240000),
                anonymousId: role === 'student' ? 'Student#128' : 'Faculty#42',
                type: 'text',
                status: 'read'
              }
            ];
            setMessages(sampleMessages);
            setIsLoading(false);
            return;
          }

          const { data: chatMessages, error } = await getChatMessages(threadId);
          
          if (chatMessages && !error) {
            const formattedMessages: Message[] = chatMessages.map((msg: any) => ({
              id: msg.id,
              content: msg.text,
              sender: msg.from === role ? 'user' : 'other',
              timestamp: new Date(msg.timestamp),
              anonymousId: msg.from === 'student' ? 'Student#128' : 'Faculty#42',
              type: msg.type || 'text',
              status: 'read'
            }));
            setMessages(formattedMessages);
          } else {
            // Initialize with sample messages if no data
            const sampleMessages: Message[] = [
              {
                id: '1',
                content: 'Hello, I have a question about the upcoming assignment.',
                sender: role === 'faculty' ? 'other' : 'user',
                timestamp: new Date(Date.now() - 300000),
                anonymousId: role === 'student' ? 'Faculty#42' : 'Student#128',
                type: 'text',
                status: 'read'
              },
              {
                id: '2',
                content: 'Sure! I\'d be happy to help. What specific part are you having trouble with?',
                sender: role === 'faculty' ? 'user' : 'other',
                timestamp: new Date(Date.now() - 240000),
                anonymousId: role === 'student' ? 'Student#128' : 'Faculty#42',
                type: 'text',
                status: 'read'
              }
            ];
            setMessages(sampleMessages);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMessages();
  }, [threadId, user, role]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    const markAsRead = async () => {
      if (threadId && user) {
        try {
          await markMessagesAsRead(threadId, role);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markAsRead();
  }, [threadId, user, role]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !threadId) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      anonymousId: user.anonymousId,
      type: 'text',
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Send to Supabase
      const { data, error } = await appendMessage({
        chatId: threadId,
        from: role,
        text: messageText
      });

      if (data && !error) {
        // Update message status to sent
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
        ));

        // Call parent callback
        if (onNewMessage) {
          onNewMessage(messageText);
        }

        // Simulate delivery status update
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id ? { ...msg, status: 'delivered' } : msg
          ));
        }, 1000);
      } else {
        console.error('Error sending message:', error);
        // Update message status to failed (you could add this status)
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    // Handle typing indicators (you can implement real-time typing with websockets)
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      // Clear typing indicator after 1 second of no typing
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const handleReportMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, reported: true } : msg
      )
    );
    
    // You can implement reporting functionality here
    console.log('Message reported:', messageId);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-rajdhani">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2"
            style={{ 
              borderColor: theme.primary,
              backgroundColor: `${theme.primary}20`
            }}
          >
            {role === 'student' ? <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.primary }} /> : <Shield className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.primary }} />}
          </div>
          <div>
            <h3 className="font-orbitron font-semibold text-white text-sm sm:text-base">
              {role === 'student' ? 'Faculty Support' : 'Anonymous Student'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {role === 'student' ? 'Faculty#42' : 'Student#128'} • 
              <span className="ml-1" style={{ color: theme.primary }}>Online</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse"
            style={{ backgroundColor: theme.primary }}
          />
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-red-400 hover:text-red-300"
              title="Close Chat"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md group ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`p-2 sm:p-3 rounded-lg relative ${
                  message.sender === 'user'
                    ? 'chat-bubble-sent text-white'
                    : 'chat-bubble-received text-gray-100'
                }`}
                style={{
                  background: message.sender === 'user' 
                    ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
                    : 'rgba(42, 42, 42, 0.8)',
                  borderColor: message.sender === 'other' ? theme.primary : 'transparent'
                }}
              >
                <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                
                {/* Message Actions - Only for other user's messages */}
                {message.sender === 'other' && (
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-2 right-2 flex gap-1 transition-opacity">
                    <button
                      onClick={() => handleReportMessage(message.id)}
                      className={`p-1 bg-gray-800 rounded text-xs hover:bg-gray-700 transition-colors ${
                        message.reported ? 'text-red-400' : 'text-gray-400'
                      }`}
                      title={message.reported ? 'Message reported' : 'Report message'}
                    >
                      <Flag className="w-2 h-2 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Timestamp, Anonymous ID, and Status */}
              <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <span className="font-mono text-xs" style={{ color: theme.accent }}>{message.anonymousId}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                  {formatTime(message.timestamp)}
                </span>
                {message.sender === 'user' && (
                  <>
                    <span>•</span>
                    <span className={`${message.status === 'read' ? 'text-blue-400' : 'text-gray-500'}`}>
                      {getStatusIcon(message.status)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 sm:p-3 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500">typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex items-end gap-2 sm:gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-opacity-100 transition-colors scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 text-sm sm:text-base"
              style={{ 
                borderColor: `${theme.primary}50`,
                maxHeight: '120px',
                minHeight: '48px'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.primary}
              onBlur={(e) => e.target.style.borderColor = `${theme.primary}50`}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: newMessage.trim() 
                ? `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`
                : 'rgba(75, 85, 99, 0.5)',
              boxShadow: newMessage.trim() ? `0 0 20px ${theme.primary}40` : 'none'
            }}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
        
        {/* Character count and status */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>End-to-end encrypted • Anonymous chat</span>
          <span>{newMessage.length}/2000</span>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;