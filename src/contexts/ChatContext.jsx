import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();

  const sendMessage = async (text, receiverId) => {
    if (!text.trim() || !currentUser || !receiverId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: text.trim(),
        senderId: currentUser.uid,
        receiverId: receiverId,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        readBy: [currentUser.uid]
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Subscribe to all messages to enable previews/unread counts
  useEffect(() => {
    if (!currentUser) {
      setAllMessages([]);
      return;
    }

    const allQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubAll = onSnapshot(allQuery, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllMessages(msgs);
    });

    return () => unsubAll();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    // Create a query for messages between current user and selected user
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter messages between current user and selected user
      const conversationMessages = allMessages.filter(msg => 
        (msg.senderId === currentUser.uid && msg.receiverId === selectedUser.uid) ||
        (msg.senderId === selectedUser.uid && msg.receiverId === currentUser.uid)
      );

      setMessages(conversationMessages);
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  // Compute last message preview for a given user id
  const getLastMessageForUser = useMemo(() => {
    return (userId) => {
      const conv = allMessages.filter(msg =>
        (msg.senderId === currentUser?.uid && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === currentUser?.uid)
      );
      if (conv.length === 0) return null;
      return conv[conv.length - 1];
    };
  }, [allMessages, currentUser]);

  // Compute unread count for a given user id
  const getUnreadCountForUser = useMemo(() => {
    return (userId) => {
      if (!currentUser) return 0;
      return allMessages.filter(msg =>
        msg.senderId === userId &&
        msg.receiverId === currentUser.uid &&
        !(msg.readBy || []).includes(currentUser.uid)
      ).length;
    };
  }, [allMessages, currentUser]);

  // Mark all messages from selected user to current user as read
  const markConversationRead = async (otherUserId) => {
    if (!currentUser || !otherUserId) return;
    try {
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', otherUserId),
        where('receiverId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(async (d) => {
        const data = d.data();
        const already = Array.isArray(data.readBy) && data.readBy.includes(currentUser.uid);
        if (!already) {
          await updateDoc(doc(db, 'messages', d.id), {
            readBy: arrayUnion(currentUser.uid)
          });
        }
      }));
    } catch (e) {
      console.error('Error marking messages read:', e);
    }
  };

  const value = {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getLastMessageForUser,
    getUnreadCountForUser,
    markConversationRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

