'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useNotification } from './NotificationContext';

interface LogEntry {
  id: string;
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
  action: string;
  type: 'document' | 'auth' | 'system';
  timestamp: string;
}

interface LoggingContextType {
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => Promise<void>;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

export function LoggingProvider({ children }: { children: ReactNode }) {
  const { showNotification } = useNotification();
  
  const addLog = async (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/add`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...entry,
            timestamp: new Date().toISOString(),
          }),
        });

        // Check if response is HTML (error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Invalid response type from server');
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add log entry');
        }

        // Success - exit retry loop
        return;

      } catch (error) {
        attempt++;
        console.error(`Error adding log entry (attempt ${attempt}/${maxRetries}):`, 
          error instanceof Error ? error.message : 'Unknown error');
        
        if (attempt === maxRetries) {
          showNotification?.('error', 'Failed to log action. Please try again later.');
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
  };

  return (
    <LoggingContext.Provider value={{ addLog }}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogging() {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context;
}