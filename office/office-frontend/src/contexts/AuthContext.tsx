'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  notifyUserSessionChange?: (action: 'login' | 'logout', user?: any) => void;
  setNotifyUserSessionChange?: (fn: (action: 'login' | 'logout', user?: any) => void) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cross-tab notification function (will be set by useCrossTabSync)
  const [notifyUserSessionChange, setNotifyUserSessionChange] = useState<((action: 'login' | 'logout', user?: any) => void) | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // Ensure currentUserId is always set when loading user
          const storedUserId = localStorage.getItem('currentUserId');
          if (!storedUserId || storedUserId !== user.id) {
            console.log('🔧 Setting currentUserId during user load');
            localStorage.setItem('currentUserId', user.id);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUserId');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // STEP 1: Clear cache and storage ONCE before login
      console.log('🧹 Step 1: Clearing previous user data...');
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      
      // STEP 2: Reset current user state
      console.log('🔄 Step 2: Resetting user state...');
      setCurrentUser(null);
      
      // STEP 3: Make the login request
      console.log('🔐 Step 3: Making login request...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token, user } = await response.json();
      
      // STEP 4: Store new user data
      console.log('👤 Step 4: Setting up new user session...');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('currentUserId', user.id);
      
      // STEP 5: Set current user
      setCurrentUser(user);
      
      // STEP 6: IMMEDIATE QUERY INVALIDATION - Force fresh data fetch
      console.log('🔄 Step 6: Forcing immediate data refresh...');
      await queryClient.invalidateQueries();
      
      // STEP 7: Notify other tabs about the login
      if (notifyUserSessionChange) {
        notifyUserSessionChange('login', user);
      }
      
      // STEP 8: Navigate to dashboard
      console.log('🎯 Step 8: Navigating to dashboard...');
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      // On error, ensure clean state
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // STEP 1: Notify other tabs about logout BEFORE clearing data
      if (notifyUserSessionChange) {
        notifyUserSessionChange('logout');
      }
      
      // STEP 2: Clear React Query cache completely
      console.log('🧹 Clearing React Query cache...');
      queryClient.clear();
      
      // STEP 3: Clear ALL storage
      console.log('🗑️ Clearing all storage...');
      localStorage.clear(); // Clear everything, not just specific items
      sessionStorage.clear();
      
      // STEP 4: Reset state
      console.log('🔄 Resetting user state...');
      setCurrentUser(null);
      
      // STEP 5: Force garbage collection of any remaining references
      if (window.gc) {
        window.gc();
      }
      
      // STEP 6: Navigate to login with replace to prevent back navigation
      console.log('🏠 Redirecting to login...');
      router.replace('/auth/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, forcefully clear everything
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      setCurrentUser(null);
      router.replace('/auth/login');
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    notifyUserSessionChange: notifyUserSessionChange || undefined,
    setNotifyUserSessionChange, // Allow useCrossTabSync to set the notification function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}