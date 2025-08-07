'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Permission = 
  | 'documents.create'
  | 'documents.view'
  | 'documents.edit'
  | 'documents.delete'
  | 'numbers.reserve'
  | 'numbers.manage'
  | 'users.manage';

interface RolePermissions {
  admin: Permission[];
  user: Permission[];
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  admin: [
    'documents.create',
    'documents.view',
    'documents.edit',
    'documents.delete',
    'numbers.reserve',
    'numbers.manage',
    'users.manage'
  ],
  user: [
    'documents.create',
    'documents.view',
    'numbers.reserve'
  ]
};

interface AccessControlContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export function AccessControlProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return DEFAULT_PERMISSIONS[currentUser.role].includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  return (
    <AccessControlContext.Provider value={{
      hasPermission,
      hasAnyPermission,
      hasAllPermissions
    }}>
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
}