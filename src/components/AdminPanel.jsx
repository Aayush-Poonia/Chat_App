import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Shield, Users, MessageSquare, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel({ isOpen, onClose, currentUser }) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    });

    // Fetch messages
    const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, [isOpen]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteDoc(doc(db, 'messages', messageId));
        toast.success('Message deleted successfully');
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="glass-effect rounded-2xl shadow-strong w-full max-w-md p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this panel.</p>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-strong w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gradient">Admin Panel</h2>
                <p className="text-sm text-gray-600">Manage users and monitor messages</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Messages ({messages.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'users' ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 profile-avatar text-lg">
                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {user.displayName || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {formatTime(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.role === 'admin' && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.displayName)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">All Messages</h3>
                <button
                  onClick={() => setShowMessages(!showMessages)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {showMessages ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showMessages ? 'Hide' : 'Show'} Messages</span>
                </button>
              </div>
              
              {showMessages && (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-800">
                              {message.senderName || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-500">to</span>
                            <span className="font-medium text-gray-600">
                              {message.receiverId}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{message.text}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
