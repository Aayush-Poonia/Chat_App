import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Note: Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyD3ZoLpUQl6svHsqCP1FoATLeY96PKfdII",
  authDomain: "chat-app-fc629.firebaseapp.com",
  projectId: "chat-app-fc629",
  storageBucket: "chat-app-fc629.appspot.com",
  messagingSenderId: "627368849237",
  appId: "1:627368849237:web:abc48e538f7d5d0ff109dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
