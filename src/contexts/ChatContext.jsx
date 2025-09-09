import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();

  // --- Send a message ---
  const sendMessage = async (text, receiverId) => {
    if (!text.trim() || !currentUser || !receiverId) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        senderId: currentUser.uid,
        receiverId,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        readBy: [currentUser.uid]
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // --- Subscribe to ALL messages (for previews/unread counts) ---
  useEffect(() => {
    if (!currentUser) {
      setAllMessages([]);
      return;
    }

    const allQuery = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubAll = onSnapshot(
      allQuery,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllMessages(msgs);
      },
      (error) => {
        console.error("Messages subscription error:", error);
        setAllMessages([]);
      }
    );

    return () => unsubAll();
  }, [currentUser]);

  // --- Subscribe to messages between current user & selected user ---
  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const allMsgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        const conversationMessages = allMsgs.filter(
          (msg) =>
            (msg.senderId === currentUser.uid &&
              msg.receiverId === selectedUser.uid) ||
            (msg.senderId === selectedUser.uid &&
              msg.receiverId === currentUser.uid)
        );

        setMessages(conversationMessages);
      },
      (error) => {
        console.error("Conversation subscription error:", error);
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  // --- Last message preview for a user ---
  const getLastMessageForUser = useMemo(() => {
    return (userId) => {
      if (!currentUser) return null;

      const conv = allMessages.filter(
        (msg) =>
          (msg.senderId === currentUser.uid && msg.receiverId === userId) ||
          (msg.senderId === userId && msg.receiverId === currentUser.uid)
      );

      return conv.length > 0 ? conv[conv.length - 1] : null;
    };
  }, [allMessages, currentUser]);

  // --- Unread count for a user ---
  const getUnreadCountForUser = useMemo(() => {
    return (userId) => {
      if (!currentUser) return 0;

      return allMessages.filter(
        (msg) =>
          msg.senderId === userId &&
          msg.receiverId === currentUser.uid &&
          !(msg.readBy || []).includes(currentUser.uid)
      ).length;
    };
  }, [allMessages, currentUser]);

  // --- Mark messages as read ---
  const markConversationRead = async (otherUserId) => {
    if (!currentUser || !otherUserId) return;

    try {
      const q = query(
        collection(db, "messages"),
        where("senderId", "==", otherUserId),
        where("receiverId", "==", currentUser.uid)
      );

      const snap = await getDocs(q);

      await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const alreadyRead =
            Array.isArray(data.readBy) && data.readBy.includes(currentUser.uid);

          if (!alreadyRead) {
            await updateDoc(doc(db, "messages", d.id), {
              readBy: arrayUnion(currentUser.uid)
            });
          }
        })
      );
    } catch (e) {
      console.error("Error marking messages read:", e);
    }
  };

  const value = {
    messages,
    allMessages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getLastMessageForUser,
    getUnreadCountForUser,
    markConversationRead
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}
