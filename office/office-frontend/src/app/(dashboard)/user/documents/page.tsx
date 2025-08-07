'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { useCrossTabSync } from '@/hooks/useCrossTabSync';
import { useAuth } from '@/contexts/AuthContext';
import DocumentDetailsModal from '@/components/DocumentDetailsModal';
import { 
  FiFileText, 
  FiLoader, 
  FiAlertCircle, 
  FiDownload, 
  FiPlus, 
  FiSearch,
  FiFilter,
  FiUsers,
  FiEye
} from 'react-icons/fi';

interface Document {
  id: string;
  type: 'IN' | 'OUT';
  number: string;
  title: string;
  department: string;
  description?: string;
  sender?: string;
  recipient?: string;
  registeredAt: string;
  registeredBy: string;
  compartment?: string;
  attachments?: string[];
}

// Fetch user's own documents
const fetchUserDocuments = async (): Promise<Document[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/my-documents`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to load your documents');
  }

  return res.json();
};

// Fetch department documents
const fetchDepartmentDocuments = async (): Promise<Document[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/department-documents`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to load department documents');
  }

  return res.json();
};

// Fetch all documents (read-only)
const fetchAllDocuments = async (): Promise<Document[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/all-readonly`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to load all documents');
  }

  return res.json();
};

type TabType = 'my-documents' | 'department-documents' | 'all-documents';

export default function DocumentsList() {
  const [activeTab, setActiveTab] = useState<TabType>('my-documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { invalidateAcrossTabs } = useCrossTabSync();
  const { currentUser } = useAuth();

  // Query for user's own documents
  const { 
    data: myDocuments = [], 
    isLoading: loadingMyDocs, 
    error: myDocsError,
    refetch: refetchMyDocs
  } = useQuery<Document[], Error>({
    queryKey: ['user-documents'],
    queryFn: fetchUserDocuments,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });

  // Query for department documents
  const { 
    data: departmentDocuments = [], 
    isLoading: loadingDeptDocs, 
    error: deptDocsError,
    refetch: refetchDeptDocs
  } = useQuery<Document[], Error>({
    queryKey: ['department-documents'],
    queryFn: fetchDepartmentDocuments,
    // Always keep department documents query enabled for real-time updates
    enabled: true,
    refetchInterval: activeTab === 'department-documents' ? 30 * 1000 : 60 * 1000, // More frequent when active
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });

  // Query for all documents
  const { 
    data: allDocuments = [], 
    isLoading: loadingAllDocs, 
    error: allDocsError,
    refetch: refetchAllDocs
  } = useQuery<Document[], Error>({
    queryKey: ['all-documents'],
    queryFn: fetchAllDocuments,
    enabled: true,
    refetchInterval: activeTab === 'all-documents' ? 30 * 1000 : 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'my-documents':
        return { documents: myDocuments, isLoading: loadingMyDocs, error: myDocsError, refetch: refetchMyDocs };
      case 'department-documents':
        return { documents: departmentDocuments, isLoading: loadingDeptDocs, error: deptDocsError, refetch: refetchDeptDocs };
      case 'all-documents':
        return { documents: allDocuments, isLoading: loadingAllDocs, error: allDocsError, refetch: refetchAllDocs };
      default:
        return { documents: myDocuments, isLoading: loadingMyDocs, error: myDocsError, refetch: refetchMyDocs };
    }
  };

  const { documents: currentDocuments, isLoading, error, refetch } = getCurrentData();

  // Filter documents
  const filteredDocuments = currentDocuments.filter((doc: Document) => 
    (filter === 'ALL' || doc.type === filter) &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (doc.registeredBy && doc.registeredBy.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Export function
  const handleExport = () => {
    const csv = [
      ['Type', 'Date', 'Number', 'Title', 'Description', 'Sender', 'Recipient', 'Department', 'Registered By'],
      ...filteredDocuments.map((doc: Document) => [
        doc.type,
        new Date(doc.registeredAt).toLocaleDateString(),
        doc.number,
        doc.title,
        doc.description || '',
        doc.sender || '',
        doc.recipient || '',
        doc.department,
        doc.registeredBy
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle view details
  const handleViewDetails = (document: Document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === 'my-documents' 
              ? 'Manage and track your registered documents' 
              : `View all documents from ${currentUser?.department || 'your'} department`
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiLoader className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeTab === 'my-documents' && (
            <Link
              href="/user/register"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Register New
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('my-documents')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'my-documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <FiFileText className="w-4 h-4 mr-2" />
              My Documents
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {myDocuments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('department-documents')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'department-documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <FiUsers className="w-4 h-4 mr-2" />
              Department Documents
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {departmentDocuments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('all-documents')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'all-documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <FiEye className="w-4 h-4 mr-2" />
              All Documents
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {allDocuments.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Filters Section */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'ALL' | 'IN' | 'OUT')}
              className="px-3 py-2 border border-gray-200 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-gray-900 bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="IN">Incoming</option>
              <option value="OUT">Outgoing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg">
          <div className="flex items-center gap-2 text-gray-500">
            <FiLoader className="w-5 h-5 animate-spin" />
            <span>Loading documents...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <FiAlertCircle className="w-5 h-5 mr-2" />
          <span>{error.message}</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg">
          <FiFileText className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-600">
            {activeTab === 'my-documents' 
              ? 'No documents found' 
              : `No documents found in ${currentUser?.department || 'your'} department`
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  {activeTab === 'department-documents' && (
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered By</th>
                  )}
                  {activeTab === 'department-documents' && (
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${doc.type === 'IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{doc.number}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{doc.title}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{doc.department}</td>
                    {activeTab === 'department-documents' && (
                      <td className="px-4 py-4 text-sm text-gray-900">{doc.registeredBy}</td>
                    )}
                    {activeTab === 'department-documents' && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(doc)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Details Modal */}
      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
