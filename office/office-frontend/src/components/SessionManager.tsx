'use client';

import { useEffect } from 'react';
import { useCrossTabSync } from '@/hooks/useCrossTabSync';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Component that manages cross-tab synchronization for session management
 * This ensures session isolation when users switch (simplified version)
 */
export function SessionManager({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { forceSessionValidation } = useCrossTabSync();
  const queryClient = useQueryClient();
  
  // Temporarily disable aggressive session guard for testing
  // useSessionGuard();

  // Force validation and immediate data refresh when user changes
  useEffect(() => {
    if (currentUser) {
      console.log('👤 Session Manager: User changed, forcing immediate data refresh...');
      
      // Force validation across tabs
      forceSessionValidation();
      
      // IMMEDIATE QUERY INVALIDATION for new user data
      setTimeout(() => {
        console.log('🔄 Session Manager: Invalidating queries for fresh user data...');
        queryClient.invalidateQueries();
      }, 200); // Small delay to ensure user state is set
    }
  }, [currentUser, forceSessionValidation, queryClient]);

  return <>{children}</>;
}
