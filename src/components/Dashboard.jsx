import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import UserList from './UserList';
import Chat from './Chat';
import Profile from './Profile';
import AdminPanel from './AdminPanel';
import { LogOut, Menu, X, MessageCircle, User, Settings, Shield, Crown } from 'lucide-react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { currentUser, logout } = useAuth();
  const { selectedUser, setSelectedUser } = useChat();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className={`h-screen flex flex-col ${dark ? 'dark' : ''}`}>
      {/* Header */}
      <header className="glass-effect border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 profile-avatar text-xl">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">ChatApp</h1>
                <p className="text-xs text-gray-500">Real-time messaging</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Admin Panel Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                title="Admin Panel"
              >
                <Shield className="w-5 h-5 text-red-500 group-hover:text-red-600" />
              </button>
            )}

            {/* Profile Button */}
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark(v => !v)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {dark ? (
                <span className="text-sm text-gray-700">Light</span>
              ) : (
                <span className="text-sm text-gray-700">Dark</span>
              )}
            </button>

            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser?.displayName || 'User'}
                  </p>
                  {isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-xs text-gray-500">@{currentUser?.username || 'notset'}</p>
              </div>
              
              <div className="w-10 h-10 profile-avatar text-lg">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentUser?.displayName?.charAt(0)?.toUpperCase() || 
                  currentUser?.email?.charAt(0)?.toUpperCase()
                )}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-30 lg:z-auto w-80 lg:w-96 h-full border-r border-gray-200 transition-transform duration-300 ease-in-out lg:transition-none bg-white`}
        >
          {/* Instagram-like left sidebar container */}
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Messages</h2>
              <p className="text-xs text-gray-500">Direct</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <UserList />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-0 lg:p-4 bg-gray-50">
          <Chat />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Modal */}
      <Profile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />

      {/* Admin Panel Modal */}
      <AdminPanel 
        isOpen={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

