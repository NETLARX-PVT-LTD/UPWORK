'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { FiCheck, FiAlertCircle, FiX } from 'react-icons/fi';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string; // Change from number to string for more unique IDs
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: Notification['type'], message: string) => {
    // Generate a more unique ID using timestamp + random string
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setNotifications(prev => [...prev, { id, type, message }]);

    // Remove the notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Notification container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 
              ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 
                notification.type === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'}`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};