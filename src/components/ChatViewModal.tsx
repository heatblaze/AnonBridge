import React, { useState, useEffect } from 'react';
import { X, User, Shield, Clock, MessageSquare, Flag, Archive, Star } from 'lucide-react';
import { getChatMessages } from '../lib/database';

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  type?: string;
  status?: string;
}

interface ChatViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  participants: string[];
  department?: string;
  messageCount?: number;
  createdAt?: string;
}

const ChatViewModal: React.FC<ChatViewModalProps> = ({
  isOpen,
  onClose,
  chatId,
  participants,
  department,
  messageCount,
  createdAt
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && chatId) {
      loadMessages();
    }
  }, [isOpen, chatId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data: chatMessages, error } = await getChatMessages(chatId);
      
      if (chatMessages && !error) {
        setMessages(chatMessages);
      } else {
        // Sample messages for demo
        const sampleMessages: Message[] = [
          {
            id: '1',
            from: 'student',
            text: 'Hello, I have a question about the upcoming assignment.',
            timestamp: new Date(Date.now() - 300000).toISOString(),
          },
          {
            id: '2',
            from: 'faculty',
            text: 'Sure! I\'d be happy to help. What specific part are you having trouble with?',
            timestamp: new Date(Date.now() - 240000).toISOString(),
          },
          {
            id: '3',
            from: 'student',
            text: 'I\'m struggling with understanding the algorithm complexity analysis.',
            timestamp: new Date(Date.now() - 180000).toISOString(),
          },
          {
            id: '4',
            from: 'faculty',
            text: 'Algorithm complexity can be tricky at first. Let me break it down for you...',
            timestamp: new Date(Date.now() - 120000).toISOString(),
          },
          {
            id: '5',
            from: 'student',
            text: 'Thank you for the explanation! That makes much more sense now.',
            timestamp: new Date(Date.now() - 60000).toISOString(),
          }
        ];
        setMessages(sampleMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getParticipantIcon = (from: string) => {
    return from === 'student' ? User : Shield;
  };

  const getParticipantColor = (from: string) => {
    return from === 'student' ? 'text-cyan-400' : 'text-red-400';
  };

  const getMessageBubbleStyle = (from: string) => {
    if (from === 'student') {
      return 'bg-cyan-500/20 border-cyan-500/50 ml-0 mr-12';
    } else {
      return 'bg-red-500/20 border-red-500/50 ml-12 mr-0';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900/95 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
              <h2 className="font-orbitron text-xl font-bold text-white">
                Chat Conversation
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {participants.map((participant, index) => (
                <React.Fragment key={participant}>
                  <span className="text-purple-400 font-mono text-sm">{participant}</span>
                  {index < participants.length - 1 && (
                    <span className="text-gray-500">↔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Chat Info */}
        <div className="p-4 border-b border-gray-700/30 bg-gray-800/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Department:</span>
              <p className="text-white font-medium">{department || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-400">Messages:</span>
              <p className="text-white font-medium">{messageCount || messages.length}</p>
            </div>
            <div>
              <span className="text-gray-400">Created:</span>
              <p className="text-white font-medium">
                {createdAt ? formatTime(createdAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-rajdhani">Loading messages...</p>
              </div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const ParticipantIcon = getParticipantIcon(message.from);
              return (
                <div key={message.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full border ${getParticipantColor(message.from)} bg-gray-800/50`}>
                    <ParticipantIcon className={`w-4 h-4 ${getParticipantColor(message.from)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-sm ${getParticipantColor(message.from)}`}>
                        {participants.find(p => p.toLowerCase().includes(message.from)) || 
                         (message.from === 'student' ? 'Student#128' : 'Faculty#42')}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border ${getMessageBubbleStyle(message.from)}`}>
                      <p className="text-white text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-rajdhani">No messages found</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm">
                <Flag className="w-4 h-4" />
                Report Chat
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
                <Star className="w-4 h-4" />
                Pin Chat
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Chat ID: {chatId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatViewModal;