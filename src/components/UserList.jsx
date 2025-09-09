import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Users, Search, Circle, UserPlus, UserMinus, Crown } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, followUser, unfollowUser } = useAuth();
  const { selectedUser, setSelectedUser } = useChat();

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('lastSeen', 'desc'));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(user => user.uid !== currentUser?.uid);
      
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Online';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    return diffInMinutes < 5; // Consider online if last seen within 5 minutes
  };

  const isFollowing = (userId) => {
    return currentUser?.following?.includes(userId) || false;
  };

  const handleFollowToggle = (e, user) => {
    e.stopPropagation();
    if (isFollowing(user.uid)) {
      unfollowUser(user.uid);
    } else {
      followUser(user.uid);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-500" />
          Users
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No users found' : 'No users available'}
          </div>
        ) : (
          <div className="p-2">
            {filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-50 card-hover ${
                  selectedUser?.uid === user.uid ? 'bg-blue-50 border-2 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 profile-avatar text-lg">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    {isOnline(user.lastSeen) && (
                      <Circle className="online-indicator" />
                    )}
                    {user.role === 'admin' && (
                      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {user.displayName || 'Unknown User'}
                      </h3>
                      {user.role === 'admin' && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username || 'notset'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isOnline(user.lastSeen) ? 'Online' : `Last seen ${getLastSeenText(user.lastSeen)}`}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleFollowToggle(e, user)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFollowing(user.uid)
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    title={isFollowing(user.uid) ? 'Unfollow' : 'Follow'}
                  >
                    {isFollowing(user.uid) ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

