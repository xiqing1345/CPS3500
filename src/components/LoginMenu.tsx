'use client';

import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';

interface LoginMenuProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginMenu({ onLoginSuccess }: LoginMenuProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: isSignup ? name : undefined,
          action: isSignup ? 'signup' : 'signin'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dorm Communication System
          </h1>
          <p className="text-gray-600 mt-2">
            {isSignup ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={18} />
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                required
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="ml-2 text-purple-600 font-semibold hover:underline"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Demo Users */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-3 font-semibold">Demo Accounts:</p>
          <button
            onClick={() => {
              setEmail('user1@example.com');
              setPassword('password123');
              setIsSignup(false);
            }}
            className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition mb-2"
          >
            👤 user1@example.com / password123
          </button>
          <button
            onClick={() => {
              setEmail('user2@example.com');
              setPassword('password123');
              setIsSignup(false);
            }}
            className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            👤 user2@example.com / password123
          </button>
        </div>
      </div>
    </div>
  );
}
