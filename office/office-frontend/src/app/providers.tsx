"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LoggingProvider } from "@/contexts/LoggingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionManager } from "@/components/SessionManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000, // 10 seconds stale time - more aggressive refresh
      gcTime: 5 * 60 * 1000,   // 5 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 30 * 1000, // Poll every 30 seconds
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <SessionManager>
            <LoggingProvider>
              {children}
            </LoggingProvider>
          </SessionManager>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}