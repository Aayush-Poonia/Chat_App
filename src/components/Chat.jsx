import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, ArrowLeft, MoreVertical, Smile, Paperclip, Phone, Video } from 'lucide-react';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const { messages, selectedUser, sendMessage } = useChat();
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      sendMessage(message, selectedUser.uid);
      setMessage('');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    return diffInMinutes < 5;
  };

  if (!selectedUser) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Welcome to ChatApp</h3>
          <p className="text-gray-500 mb-4">Select a user from the sidebar to start chatting</p>
          <div className="flex justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time messaging</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure & private</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 profile-avatar text-lg">
              {selectedUser.photoURL ? (
                <img
                  src={selectedUser.photoURL}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                selectedUser.displayName?.charAt(0)?.toUpperCase() || 
                selectedUser.email?.charAt(0)?.toUpperCase()
              )}
            </div>
            {isOnline(selectedUser.lastSeen) && (
              <div className="online-indicator"></div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800 text-lg">
                {selectedUser.displayName || 'Unknown User'}
              </h3>
              {selectedUser.role === 'admin' && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              @{selectedUser.username || 'notset'}
            </p>
            <p className="text-xs text-gray-400">
              {isOnline(selectedUser.lastSeen) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voice Call">
            <Phone className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Video Call">
            <Video className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p>Start the conversation by sending a message below</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUser?.uid;
            const showDate = index === 0 || 
              formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
            
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-white text-gray-500 text-xs font-medium rounded-full shadow-sm">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isCurrentUser ? 'chat-bubble-sent' : 'chat-bubble-received'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-2 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field pr-12 py-3 resize-none"
              rows="1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Emoji"
              >
                <Smile className="w-4 h-4 text-gray-400" />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

