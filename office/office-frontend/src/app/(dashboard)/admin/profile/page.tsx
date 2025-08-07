'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    // Simple password strength rules
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 3) feedback.push('Use uppercase, lowercase, numbers, and symbols');
    if (password.length < 8) feedback.push('Password should be at least 8 characters');

    setPasswordStrength({ score, feedback: feedback.join('. ') });
  };

  // Update the handlePasswordChange function
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordStrength.score < 3) {
      showNotification('error', 'Please choose a stronger password');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
        method: 'PUT', // Changed from POST to PUT
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth header
        },
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      
      showNotification('success', 'Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength({ score: 0, feedback: '' });
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${currentUser?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
            {currentUser?.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 flex items-center p-2 bg-gray-50 rounded-md">
              <span className="text-gray-900 font-medium">{currentUser?.name || 'Not set'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 flex items-center p-2 bg-gray-50 rounded-md">
              <span className="text-gray-900 font-medium">{currentUser?.email || 'Not set'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <div className="mt-1 flex items-center p-2 bg-gray-50 rounded-md">
              <span className="text-gray-900 font-medium">{currentUser?.department || 'Not assigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => {
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value
                });
                checkPasswordStrength(e.target.value);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                text-gray-900 placeholder-gray-500"
              required
            />
            {passwordForm.newPassword && (
              <div className="mt-1">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-full rounded-full ${
                        i < passwordStrength.score ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.feedback && (
                  <p className="mt-1 text-sm text-gray-500">{passwordStrength.feedback}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || passwordStrength.score < 3}
            className="inline-flex justify-center rounded-md border border-transparent
              bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}