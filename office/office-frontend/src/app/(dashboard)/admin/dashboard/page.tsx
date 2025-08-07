'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { FiUsers, FiFileText, FiActivity, FiArrowUp, FiArrowDown, FiDownload } from 'react-icons/fi';
import GenerateReportModal, { ReportOptions } from '@/components/GenerateReportModal';
import { useNotification } from '@/contexts/NotificationContext';

// Add interfaces for type safety
interface DocumentData {
  type: 'IN' | 'OUT';
  number: string;
  title: string;
  compartment: string;
  registeredBy: string;
  timestamp: string;
}

interface AuditData {
  user: string;
  action: string;
  timestamp: string;
  type: string;
}

interface AuditLog {
  id: string;
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
  action: string;
  type: string;
  timestamp: string;
}

interface DashboardStats {
  users: {
    total: number;
    percentageChange: number;
  };
  documentsIn: {
    total: number;
    percentageChange: number;
  };
  documentsOut: {
    total: number;
    percentageChange: number;
  };
}

export default function AdminDashboard() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Fetch dashboard stats using React Query
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch dashboard statistics');
      }

      return response.json();
    },
    retry: 2,
    refetchOnMount: true,
  });

  // Fetch recent documents using React Query
  const { data: recentDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['admin-recent-documents'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents?limit=5&sort=desc`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent documents');
      }

      return response.json();
    },
    retry: 2,
  });

  // Fetch recent audit logs using React Query
  const { data: recentAuditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['admin-recent-audit-logs'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs?limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      return response.json();
    },
    retry: 2,
  });



  const filterByDateRange = (date: string, range: string): boolean => {
    const itemDate = new Date(date);
    const today = new Date();
    
    switch (range) {
      case 'today':
        return itemDate.toDateString() === today.toDateString();
      
      case 'week': {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return itemDate >= weekAgo;
      }
      
      case 'month': {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return itemDate >= monthAgo;
      }
      
      default:
        return true;
    }
  };

  const handleGenerateReport = async (options: ReportOptions) => {
    try {
      setIsGenerating(true);

      if (options.type === 'audit') {
        // Fetch audit logs from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch audit logs');
        }

        const auditLogs: AuditLog[] = await response.json();
        
        // Filter by date range if needed
        const filteredLogs = options.dateRange === 'all'
          ? auditLogs
          : auditLogs.filter((log: AuditLog) => filterByDateRange(log.timestamp, options.dateRange));

        // Generate CSV for audit logs
        const headers = ['User', 'Action', 'Type', 'Timestamp'];
        const csv = [
          headers,
          ...filteredLogs.map((log: AuditLog) => [
            log.user.name,
            log.action,
            log.type,
            new Date(log.timestamp).toLocaleString()
          ])
        ].map(row => row.join(',')).join('\n');

        // Create and trigger download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

      } else {
        // Handle documents report
        const documentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!documentsResponse.ok) {
          throw new Error('Failed to fetch documents');
        }

        const documentsData = await documentsResponse.json();
        
        // Filter by date range if needed
        const filteredDocs = options.dateRange === 'all'
          ? documentsData
          : documentsData.filter((doc: any) => filterByDateRange(doc.timestamp, options.dateRange));

        // Generate CSV for documents
        const headers = ['Type', 'Number', 'Title', 'Description', 'Sender', 'Recipient', 'Compartment', 'Registered By', 'Timestamp'];
        const csv = [
          headers,
          ...filteredDocs.map((doc: any) => [
            doc.type,
            doc.number,
            doc.title,
            doc.description || '',
            doc.sender || '',
            doc.recipient || '',
            doc.compartment,
            doc.registeredBy,
            new Date(doc.timestamp).toLocaleString()
          ])
        ].map(row => row.join(',')).join('\n');

        // Create and trigger download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Error generating report:', error);
      // You might want to show an error toast/notification here
    } finally {
      setIsGenerating(false);
      setShowReportModal(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-0">
      {/* Header Section - Made responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Back, Admin</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Here's what's happening today</p>
        </div>
        <button 
          onClick={() => setShowReportModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base inline-flex items-center justify-center"
        >
          <FiDownload className="w-5 h-5 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Stats Grid - Improved responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {isLoading ? '...' : stats?.users.total || 0}
              </h3>
              <div className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm
                ${(stats?.users.percentageChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.users.percentageChange ?? 0) >= 0 ? 
                  <FiArrowUp className="mr-1" /> : 
                  <FiArrowDown className="mr-1" />
                }
                <span>{Math.abs(stats?.users.percentageChange ?? 0)}% vs last month</span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
              <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Documents IN Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Documents (IN)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {isLoading ? '...' : stats?.documentsIn.total || 0}
              </h3>
              <div className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm
                ${(stats?.documentsIn.percentageChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.documentsIn.percentageChange ?? 0) >= 0 ? 
                  <FiArrowUp className="mr-1" /> : 
                  <FiArrowDown className="mr-1" />
                }
                <span>{Math.abs(stats?.documentsIn.percentageChange ?? 0)}% vs last month</span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Documents OUT Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Documents (OUT)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {isLoading ? '...' : stats?.documentsOut.total || 0}
              </h3>
              <div className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm
                ${(stats?.documentsOut.percentageChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.documentsOut.percentageChange ?? 0) >= 0 ? 
                  <FiArrowUp className="mr-1" /> : 
                  <FiArrowDown className="mr-1" />
                }
                <span>{Math.abs(stats?.documentsOut.percentageChange ?? 0)}% vs last month</span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-red-50 rounded-lg">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section - Improved mobile layout */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/admin/users"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiUsers className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">Manage Users</h4>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Add, edit, or remove users</p>
            </div>
          </Link>

          <Link 
            href="/admin/documents"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiFileText className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">Document Activity</h4>
              <p className="text-xs sm:text-sm text-gray-600 truncate">View all document records</p>
            </div>
          </Link>

          <Link 
            href="/admin/audit"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiActivity className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">Audit Trail</h4>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Review system activity</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <GenerateReportModal
          onClose={() => setShowReportModal(false)}
          onGenerate={handleGenerateReport}
        />
      )}
    </div>
  );
}
