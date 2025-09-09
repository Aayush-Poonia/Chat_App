import React, { useState } from 'react';
import { Mail, User as UserIcon, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      let emailToSend = identifier.trim();
      // If user entered a username, look up the email
      if (!identifier.includes('@')) {
        const q = query(collection(db, 'users'), where('username', '==', identifier.trim()), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          setError('No user found with that username');
          setLoading(false);
          return;
        }
        const userDoc = snap.docs[0].data();
        emailToSend = userDoc.email;
      }
      await resetPassword(emailToSend);
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-black flex items-center justify-center mb-3">
            <Send className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your email or username to receive a reset link.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <div className="relative">
              {identifier.includes('@') ? (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              ) : (
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              )}
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or username"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {sent && <p className="text-sm text-green-600">Reset link sent. Check your inbox.</p>}

          <button
            type="submit"
            disabled={loading || !identifier.trim()}
            className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}


