import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
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
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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

  const value = {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

