'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Aggressive session guard that ensures no stale data persists
 * This hook runs on every component mount to validate session integrity
 */
export function useSessionGuard() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser) return;

    const validateSession = () => {
      const storedUserId = localStorage.getItem('currentUserId');
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      // If no stored session data, clear everything
      if (!storedUserId || !storedUser || !token) {
        console.log('🚨 Session Guard: Missing session data, clearing cache');
        queryClient.clear();
        return;
      }

      // If stored user ID doesn't match current user, clear everything
      if (storedUserId !== currentUser.id) {
        console.log('🚨 Session Guard: User ID mismatch, clearing cache');
        console.log('Current User ID:', currentUser.id);
        console.log('Stored User ID:', storedUserId);
        queryClient.clear();
        localStorage.setItem('currentUserId', currentUser.id);
        localStorage.setItem('user', JSON.stringify(currentUser));
        return;
      }

      // Validate stored user data matches current user
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id !== currentUser.id || parsedUser.email !== currentUser.email) {
          console.log('🚨 Session Guard: Stored user data mismatch, clearing cache');
          queryClient.clear();
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } catch (error) {
        console.log('🚨 Session Guard: Invalid stored user data, clearing cache');
        queryClient.clear();
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    };    // Run validation immediately
    validateSession();

    // Run validation every 10 seconds (reduced frequency)
    const interval = setInterval(validateSession, 10000);

    return () => clearInterval(interval);
  }, [currentUser, queryClient]);
}
