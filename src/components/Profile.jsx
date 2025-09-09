import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Camera, Save, X, Edit3, Mail, Calendar } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import toast from 'react-hot-toast';

export default function Profile({ isOpen, onClose }) {
  const { currentUser, getUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    username: currentUser?.username || '',
    bio: currentUser?.bio || ''
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setLoading(true);
    try {
      // Create a reference to the file
      const imageRef = ref(storage, `profile-photos/${currentUser.uid}`);
      
      // Upload the file
      const snapshot = await uploadBytes(imageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user document with new photo URL
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl shadow-strong w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gradient">Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Profile Photo */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 profile-avatar text-2xl mx-auto">
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
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Click camera to change photo</p>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-800 mt-1">{currentUser?.displayName || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Enter your username"
                  />
                ) : (
                  <p className="text-gray-800 mt-1">@{currentUser?.username || 'notset'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="input-field mt-1 h-20 resize-none"
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-gray-800 mt-1">{currentUser?.bio || 'No bio yet'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center mt-1 text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{currentUser?.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <div className="flex items-center mt-1 text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(currentUser?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
