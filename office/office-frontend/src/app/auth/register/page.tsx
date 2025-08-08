'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiMail, FiLock, FiUser, FiBriefcase, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // The fix is here: pass the data object directly.
      // The apiRequest function will handle the JSON.stringify.
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password, department },
        requiresAuth: false,
      });

      setSuccess('Registration successful! Redirecting to login...');
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create an Account
          </h1>
          <p className="text-gray-600">
            Start your free demo account in minutes.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start mb-6">
            <FiAlertTriangle className="w-5 h-5 flex-shrink-0 mr-3" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm flex items-start mb-6">
            <FiCheckCircle className="w-5 h-5 flex-shrink-0 mr-3" />
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="John Doe"
                required
              />
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="you@example.com"
                required
              />
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="••••••••"
                required
              />
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="department">Department</label>
            <div className="relative">
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="e.g., Marketing"
                required
              />
              <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg
              hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
