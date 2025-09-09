import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Users, Search, Circle, UserPlus, UserMinus, Crown, Check, CheckCheck } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, followUser, unfollowUser } = useAuth();
  const { selectedUser, setSelectedUser } = useChat();

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('lastSeen', 'desc'));
    
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(user => user.uid !== currentUser?.uid);
        setUsers(usersData);
      },
      (error) => {
        console.error('UserList subscription error:', error);
        setUsers([]);
      }
    );

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

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">{searchTerm ? 'No users found' : 'No users available'}</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const unreadCount = getUnreadCountForUser ? getUnreadCountForUser(user.uid) : 0;
              return (
                <li
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`px-3 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedUser?.uid === user.uid ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-700">
                            {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {isOnline(user.lastSeen) && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`truncate text-sm ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                          {user.displayName || 'Unknown User'}
                        </p>
                        <PreviewTime user={user} />
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <PreviewText user={user} />
                        {unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleFollowToggle(e, user)}
                      className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                        isFollowing(user.uid)
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                      }`}
                      title={isFollowing(user.uid) ? 'Unfollow' : 'Follow'}
                    >
                      {isFollowing(user.uid) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function PreviewText({ user }) {
  const { currentUser } = useAuth();
  const { getLastMessageForUser } = useChat();
  const msg = getLastMessageForUser(user.uid);
  if (!msg) return null;
  const isMine = msg.senderId === currentUser?.uid;
  const read = (msg.readBy || []).includes(user.uid);
  return (
    <div className="flex items-center min-w-0 text-xs text-gray-500">
      {isMine && (read ? <CheckCheck className="w-3 h-3 text-blue-500 mr-1" /> : <Check className="w-3 h-3 text-gray-400 mr-1" />)}
      <p className="truncate max-w-[11rem]">{isMine ? 'You: ' : ''}{msg.text}</p>
    </div>
  );
}

function PreviewTime({ user }) {
  const { getLastMessageForUser } = useChat();
  const msg = getLastMessageForUser(user.uid);
  if (!msg) return <span className="text-[10px] text-gray-400"> </span>;
  return <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>;
}

