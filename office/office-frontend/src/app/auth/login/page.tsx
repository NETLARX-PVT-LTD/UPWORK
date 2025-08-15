'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiUser } from 'react-icons/fi';
import { apiRequest } from '@/lib/api';

interface LoginResponse {
  token: string;
  user: {
    name: string;
    email: string;
    department: string;
    role: 'admin' | 'user';
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // New state for guest modal
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // Guest login handler
  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    setError('');

    try {
      const response = await apiRequest<LoginResponse>('/auth/guest', {
        method: 'POST',
        requiresAuth: false
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to the user dashboard for guests
      router.push('/admin/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during guest login. Please try again.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  // Form validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(form.email);
  const isPasswordValid = form.password.length >= 6;

  const errors = {
    email:
      touched.email && !isEmailValid
        ? 'Please enter a valid email address'
        : '',
    password:
      touched.password && !isPasswordValid
        ? 'Password must be at least 6 characters'
        : '',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
        },
        requiresAuth: false
      });

      // Access token and user directly from response
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Login successful:', response.user);
      
      // Redirect based on role
      router.push(response.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Left side: Login form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-900 mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                OfficeReg
              </span>
            </h1>
            <p className="text-gray-600 text-base">
              Sign in to access your workspace
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start border border-red-100">
              <svg
                className="w-5 h-5 flex-shrink-0 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-3.5 border text-gray-700 rounded-xl focus:outline-none focus:ring-2 transition-all
                    ${errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full pr-12 px-4 py-3.5 border text-gray-700 rounded-xl focus:outline-none focus:ring-2 transition-all
                    ${errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium text-base rounded-xl
                relative flex items-center justify-center shadow-lg shadow-blue-500/30
                hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Updated "Try the App" section */}
          {/* <div className="flex items-center justify-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowGuestModal(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium text-base rounded-xl border border-gray-200
              hover:from-gray-200 hover:to-gray-100 hover:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
              transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FiUser className="h-5 w-5 text-gray-500 group-hover:text-gray-600 transition-colors" />
            Try the App as Guest
          </button> */}
        </div>
      </div>

      {/* Right side: Illustration */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="relative h-full">
          <Image
            src="/authpageimage.jpg"
            alt="Office registration illustration"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          {/* Updated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent z-10" />
          
          {/* Text overlay - updated z-index to appear above gradient */}
          <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Efficient Document Management
            </h2>
            <p className="text-white/90 text-lg">
              Streamline your registration process with our secure and organized system
            </p>
          </div>
        </div>
      </div>

      {/* Guest Login Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
               onClick={() => setShowGuestModal(false)} />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform transition-all">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                {/* Close button */}
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isGuestLoading}
                >
                  <FiX className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiUser className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Try as Guest
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Explore OfficeReg without creating an account
                  </p>
                </div>

                {/* Features list */}
                <div className="mb-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Access to basic features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      No registration required
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Explore the interface
                    </li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleGuestLogin}
                    disabled={isGuestLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium text-base rounded-xl
                      hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isGuestLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <FiUser className="mr-2 h-5 w-5" />
                        Continue as Guest
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowGuestModal(false)}
                    disabled={isGuestLoading}
                    className="w-full py-3 px-4 text-gray-600 font-medium text-sm hover:text-gray-800 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}