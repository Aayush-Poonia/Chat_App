import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Check if this is the first user (admin)
      const usersSnapshot = await getDoc(doc(db, 'metadata', 'users'));
      const isFirstUser = !usersSnapshot.exists() || usersSnapshot.data().count === 0;
      
      // Save user data to Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName,
        username: displayName.toLowerCase().replace(/\s+/g, ''),
        photoURL: result.user.photoURL || '',
        bio: '',
        role: isFirstUser ? 'admin' : 'user',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      });

      // Update user count
      if (isFirstUser) {
        await setDoc(doc(db, 'metadata', 'users'), { count: 1 });
      } else {
        await updateDoc(doc(db, 'metadata', 'users'), {
          count: usersSnapshot.data().count + 1
        });
      }
      
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Ensure user document exists and update last seen
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        username: (result.user.displayName || result.user.email || 'user')
          .toLowerCase()
          .replace(/\s+/g, ''),
        photoURL: result.user.photoURL || '',
        role: 'user',
        followers: [],
        following: [],
        lastSeen: new Date().toISOString()
      }, { merge: true });
      
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async function followUser(targetUserId) {
    if (!currentUser) return;
    
    try {
      // Add target user to current user's following list
      await updateDoc(doc(db, 'users', currentUser.uid), {
        following: arrayUnion(targetUserId)
      });
      
      // Add current user to target user's followers list
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: arrayUnion(currentUser.uid)
      });
      
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        following: [...(prev.following || []), targetUserId]
      }));
      
      toast.success('User followed successfully!');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  }

  async function unfollowUser(targetUserId) {
    if (!currentUser) return;
    
    try {
      // Remove target user from current user's following list
      await updateDoc(doc(db, 'users', currentUser.uid), {
        following: arrayRemove(targetUserId)
      });
      
      // Remove current user from target user's followers list
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: arrayRemove(currentUser.uid)
      });
      
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        following: (prev.following || []).filter(id => id !== targetUserId)
      }));
      
      toast.success('User unfollowed successfully!');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  }

  async function updateUserProfile(updates) {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setCurrentUser(prev => ({ ...prev, ...updates }));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          // Guard against null to avoid runtime spread errors in production
          setCurrentUser({ ...user, ...(userData || {}) });
        } catch (e) {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getUserData,
    followUser,
    unfollowUser,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

