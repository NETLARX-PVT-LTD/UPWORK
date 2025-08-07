'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFileText, FiBookmark, FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import { useNotification } from '@/contexts/NotificationContext';
import { useCrossTabSync } from '@/hooks/useCrossTabSync';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  totalDocuments: number;
  inDocuments: number;
  outDocuments: number;
  reservedNumbers: number;
}

interface RecentDocument {
  id: number;
  type: 'IN' | 'OUT';
  number: string;
  title: string;
  registeredAt: string; // Change from timestamp to registeredAt.
}

// First, update the fetchUserStats function to properly handle the response
const fetchUserStats = async (): Promise<UserStats> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/user-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user statistics');
    }

    const data = await response.json();
    return {
      totalDocuments: data.totalDocuments || 0,
      inDocuments: data.inDocuments || 0,
      outDocuments: data.outDocuments || 0,
      reservedNumbers: data.reservedNumbers || 0
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

const defaultStats: UserStats = {
  totalDocuments: 0,
  inDocuments: 0,
  outDocuments: 0,
  reservedNumbers: 0
};

// First, add the fetch function for recent documents
const fetchRecentDocuments = async (): Promise<RecentDocument[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/my-documents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch recent documents');
    }

    const data = await response.json();
    return data.slice(0, 3); 
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    throw error;
  }
};

// Add date formatting utility function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function UserDashboard() {
  const { showNotification } = useNotification();
  const { invalidateAcrossTabs } = useCrossTabSync(); // Add cross-tab sync hook
  const { currentUser } = useAuth(); // Add auth hook for user-specific queries
  
  // Use user-specific query keys for complete isolation
  const userStatsKey = currentUser ? ['user-stats', currentUser.id] : ['user-stats'];
  const userDocumentsKey = currentUser ? ['user-documents', currentUser.id] : ['user-documents'];
  
  // Use standard query for user stats with user-specific key
  const { 
    data: stats = defaultStats,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: userStatsKey,
    queryFn: fetchUserStats,
    enabled: !!currentUser, // Only run when user is authenticated
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30 * 1000, // 30 seconds stale time
  });

  // Error handling
  useEffect(() => {
    if (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to fetch stats');
    }
  }, [error, showNotification]);

  // Use standard query for recent documents with user-specific key
  const { 
    data: recentDocuments = [],
    isLoading: loadingDocuments,
    error: documentsError,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: userDocumentsKey,
    queryFn: fetchRecentDocuments,
    enabled: !!currentUser, // Only run when user is authenticated
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30 * 1000, // 30 seconds stale time
  });

  // IMMEDIATE REFETCH when user changes - Force fresh data for new user
  useEffect(() => {
    if (currentUser) {
      console.log('📊 Dashboard: User changed, forcing immediate data refetch...');
      // Refetch both stats and documents immediately
      refetch();
      refetchDocuments();
    }
  }, [currentUser, refetch, refetchDocuments]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Here's an overview of your document activity</p>
        </div>
        {/* Add refresh button */}
        <button
          onClick={() => refetch()}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title="Refresh statistics"
        >
          <FiClock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Show error if any */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Total Documents</p>
            <span className="p-2 bg-blue-50 rounded-lg">
              <FiFileText className="w-5 h-5 text-blue-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-4">
            {loading ? '...' : stats.totalDocuments}
          </p>
          <p className="text-sm text-gray-500 mt-1">All registered documents</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">IN Documents</p>
            <span className="p-2 bg-green-50 rounded-lg">
              <FiArrowDown className="w-5 h-5 text-green-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-4">
            {loading ? '...' : stats.inDocuments}
          </p>
          <p className="text-sm text-gray-500 mt-1">Incoming documents</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">OUT Documents</p>
            <span className="p-2 bg-orange-50 rounded-lg">
              <FiArrowUp className="w-5 h-5 text-orange-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-4">
            {loading ? '...' : stats.outDocuments}
          </p>
          <p className="text-sm text-gray-500 mt-1">Outgoing documents</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Reserved Numbers</p>
            <span className="p-2 bg-purple-50 rounded-lg">
              <FiBookmark className="w-5 h-5 text-purple-600" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-4">
            {loading ? '...' : stats.reservedNumbers}
          </p>
          <p className="text-sm text-gray-500 mt-1">Available for use</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            <Link 
              href="/user/documents"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {loadingDocuments ? (
            <div className="p-6 text-center text-gray-500">
              Loading recent documents...
            </div>
          ) : documentsError ? (
            <div className="p-6 text-center text-red-500">
              Failed to load recent documents
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No documents found
            </div>
          ) : (
            recentDocuments.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${doc.type === 'IN' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                      }`}>
                      {doc.type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">#{doc.number}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    <FiClock className="w-4 h-4 inline mr-1" />
                    {formatDate(doc.registeredAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{doc.title}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link 
          href="/user/register"
          className="block p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm 
            hover:from-blue-700 hover:to-blue-800 transition-all group"
        >
          <h3 className="text-lg font-semibold text-white">Register New Document</h3>
          <p className="mt-1 text-blue-100">Add a new document to the registry</p>
        </Link>
        <Link 
          href="/user/reserve"
          className="block p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-sm 
            hover:from-purple-700 hover:to-purple-800 transition-all group"
        >
          <h3 className="text-lg font-semibold text-white">Reserve Document Number</h3>
          <p className="mt-1 text-purple-100">Get a number for future use</p>
        </Link>
      </div>
    </div>
  );
}
