'use client';

import { useRouter } from 'next/navigation';
import { FiArrowRight, FiUser, FiX, FiCheckCircle, FiFileText, FiUsers, FiShield } from 'react-icons/fi';
import { useState } from 'react';
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

export default function LandingPage() {
  const router = useRouter();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState('');

  // Proper guest login handler using the same logic as login page
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
      router.push('/user/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during guest login. Please try again.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 p-4 md:px-8 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              OfficeReg
            </span>
          </h1>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => setShowGuestModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <FiUser className="h-4 w-4" />
              Try the App
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
            >
              Sign Up
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/30"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="text-center max-w-6xl mx-auto space-y-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6">
              <FiShield className="h-4 w-4 mr-2" />
              Secure & Efficient Document Management
            </div>
            
            <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
              Seamless{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                Document
              </span>{' '}
              Management
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simplify your workflow, register new documents, and manage your office tasks with our intuitive and efficient platform designed for modern workplaces.
            </p>
          </div>

          {/* CTA Buttons */}
          {/* <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button
              onClick={() => router.push('/auth/register')}
              className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl
                bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 
                transition-all duration-300 transform hover:scale-105
                hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/40
                focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Get Started Free
              <FiArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowGuestModal(true)}
              disabled={isGuestLoading}
              className={`
                flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl
                bg-white text-gray-700 border-2 border-gray-200 shadow-lg
                hover:bg-gray-50 hover:border-gray-300 hover:shadow-xl
                focus:outline-none focus:ring-4 focus:ring-gray-300
                transition-all duration-300
                ${isGuestLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isGuestLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-700"
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
                  Getting Started...
                </>
              ) : (
                <>
                  <FiUser className="h-5 w-5" />
                  Try the App
                </>
              )}
            </button>
          </div> */}

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FiFileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Document Registration</h3>
              <p className="text-gray-600 leading-relaxed">
                Easily register and organize all your important documents with our streamlined process and secure storage system.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <FiUsers className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work seamlessly with your team members, share documents, and maintain organized workflows across departments.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <FiShield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Compliant</h3>
              <p className="text-gray-600 leading-relaxed">
                Your documents are protected with enterprise-grade security and compliance with industry standards.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 p-6 md:px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              © 2024 OfficeReg. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Guest Login Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
               onClick={() => !isGuestLoading && setShowGuestModal(false)} />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform transition-all">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Close button */}
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={isGuestLoading}
                >
                  <FiX className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FiUser className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Try as Guest
                  </h2>
                  <p className="text-gray-600">
                    Explore OfficeReg's features without creating an account
                  </p>
                </div>

                {/* Error display */}
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

                {/* Features list */}
                <div className="mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Access to core features</div>
                        <div className="text-gray-600 text-xs mt-1">Explore document management and basic workflows</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">No registration required</div>
                        <div className="text-gray-600 text-xs mt-1">Start using immediately without signing up</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Full interface access</div>
                        <div className="text-gray-600 text-xs mt-1">Navigate through all sections and features</div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleGuestLogin}
                    disabled={isGuestLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-base rounded-xl
                      hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 
                      flex items-center justify-center shadow-lg shadow-blue-500/30"
                  >
                    {isGuestLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        <FiArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowGuestModal(false)}
                    disabled={isGuestLoading}
                    className="w-full py-3 px-4 text-gray-600 font-medium text-sm hover:text-gray-800 transition-colors
                      hover:bg-gray-50 rounded-lg"
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