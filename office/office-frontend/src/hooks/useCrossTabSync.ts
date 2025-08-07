'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function useCrossTabSync() {
  const queryClient = useQueryClient();
  const { currentUser, setCurrentUser, setNotifyUserSessionChange } = useAuth();

  useEffect(() => {
    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (event: StorageEvent) => {
      // Handle cache invalidation
      if (event.key === 'cache-invalidation' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          const { queryKeys, timestamp } = data;
          
          // Only process recent events (within last 5 seconds)
          if (Date.now() - timestamp < 5000) {
            console.log('📨 Received cross-tab cache invalidation:', queryKeys);
            queryKeys.forEach((queryKey: string[]) => {
              queryClient.invalidateQueries({ queryKey });
            });
          }
        } catch (error) {
          console.error('Error processing cache invalidation:', error);
        }
      }
        // Handle user session changes
      if (event.key === 'user-session-change' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          const { action, user, timestamp } = data;
          
          // Only process recent events (within last 3 seconds)
          if (Date.now() - timestamp < 3000) {
            console.log('🔄 User session change detected:', action, user);            if (action === 'login') {
              // New user logged in - update session if different
              const currentStoredUserId = localStorage.getItem('currentUserId');
              if (!currentUser || currentUser.id !== user.id || currentStoredUserId !== user.id) {
                console.log('🔄 Cross-tab: Switching to new user session');
                
                // Clear cache and update user session
                queryClient.clear();
                sessionStorage.clear();
                
                // Update user session
                setCurrentUser(user);
                localStorage.setItem('currentUserId', user.id);
                localStorage.setItem('user', JSON.stringify(user));
                
                // IMMEDIATE INVALIDATION - Force fresh data for new user
                setTimeout(() => {
                  queryClient.invalidateQueries();
                }, 100);
              }
            } else if (action === 'logout') {
              // User logged out - clear session
              console.log('🔄 Cross-tab: Clearing user session');
              queryClient.clear();
              sessionStorage.clear();
              setCurrentUser(null);
              localStorage.removeItem('currentUserId');
            }
          }
        } catch (error) {
          console.error('Error processing user session change:', error);
        }
      }
      
      // Handle forced session validation
      if (event.key === 'force-session-validation' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          const { timestamp } = data;
          
          if (Date.now() - timestamp < 2000) {
            console.log('🔍 Force session validation triggered');
            const currentStoredUserId = localStorage.getItem('currentUserId');
            const currentStoredUser = localStorage.getItem('user');
            
            if (!currentStoredUser || !currentStoredUserId) {
              console.log('🚨 No valid session found during validation - clearing');
              queryClient.clear();
              setCurrentUser(null);
            } else if (currentUser && currentUser.id !== currentStoredUserId) {
              console.log('🚨 Session mismatch during validation - updating');
              try {
                const parsedUser = JSON.parse(currentStoredUser);
                setCurrentUser(parsedUser);
                queryClient.clear();
              } catch (e) {
                console.error('Error parsing stored user:', e);
                queryClient.clear();
                setCurrentUser(null);
              }
            }
          }
        } catch (error) {
          console.error('Error in force session validation:', error);
        }
      }
    };    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient, currentUser, setCurrentUser]);

  // Connect the notification function to AuthContext
  useEffect(() => {
    if (setNotifyUserSessionChange) {
      setNotifyUserSessionChange(notifyUserSessionChange);
    }
  }, [setNotifyUserSessionChange]);// Function to trigger cross-tab cache invalidation
  const invalidateAcrossTabs = (queryKeys: string[][]) => {
    const data = {
      queryKeys,
      timestamp: Date.now()
    };
    
    console.log('🔄 Triggering cross-tab cache invalidation:', queryKeys);
    
    // Store in localStorage to trigger storage event in other tabs
    localStorage.setItem('cache-invalidation', JSON.stringify(data));
    
    // Remove immediately to allow future events
    setTimeout(() => {
      localStorage.removeItem('cache-invalidation');
    }, 100);
  };
  // Function to notify other tabs about user session changes
  const notifyUserSessionChange = (action: 'login' | 'logout', user?: any) => {
    const data = {
      action,
      user,
      timestamp: Date.now()
    };
    
    console.log('🔄 Notifying user session change:', action, user);
    
    // Store in localStorage to trigger storage event in other tabs
    localStorage.setItem('user-session-change', JSON.stringify(data));
    
    // Remove immediately to allow future events
    setTimeout(() => {
      localStorage.removeItem('user-session-change');
    }, 100);
  };

  // Function to force session validation across all tabs
  const forceSessionValidation = () => {
    const data = {
      timestamp: Date.now()
    };
    
    console.log('🔍 Forcing session validation across tabs');
    
    localStorage.setItem('force-session-validation', JSON.stringify(data));
    
    setTimeout(() => {
      localStorage.removeItem('force-session-validation');
    }, 100);
  };

  return { invalidateAcrossTabs, notifyUserSessionChange, forceSessionValidation };
}
