'use client';

import { useLogging } from '@/contexts/LoggingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useCrossTabSync } from '@/hooks/useCrossTabSync';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiFile, FiPlus, FiX, FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';

type DocumentType = 'IN' | 'OUT';

interface DocumentEntry {
  id: number;
  type: DocumentType;
  number: string;
  title: string;
  compartment: string;
  description: string;
  sender: string;
  recipient: string;
  timestamp: string;
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function DocumentRegistryPage() {
  const { addLog } = useLogging();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { invalidateAcrossTabs } = useCrossTabSync();
  
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentEntry | null>(null);
  const [filters, setFilters] = useState({
    type: 'ALL',
    dateRange: 'ALL',
  });
  const [form, setForm] = useState({
    type: 'IN',
    number: '',
    title: '',
    compartment: '',
    description: '',
    sender: '',
    recipient: ''
  });

  // Use React Query to fetch documents
  const { data: documents = [], isLoading, error } = useQuery<DocumentEntry[]>({
    queryKey: ['admin-documents'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return response.json();
    },
  });

  // Mutation for updating documents
  const updateDocumentMutation = useMutation({
    mutationFn: async (updateData: { id: number; data: any }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${updateData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData.data)
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all document and stats queries to ensure cross-panel sync
      const queryKeysToInvalidate = [
        ['admin-documents'],
        ['admin-dashboard-stats'],
        ['admin-recent-documents'],
        ['user-documents'],
        ['user-stats'], // Fixed: Match the actual query key used in user dashboard
        ['user-dashboard-stats'] // Keep this for any other components that might use it
      ];
      
      // Local invalidation
      queryKeysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Cross-tab invalidation
      invalidateAcrossTabs(queryKeysToInvalidate);
      
      showNotification('success', 'Document updated successfully');
      setEditingDocument(null);
      setShowModal(false);
    },
    onError: (error) => {
      showNotification('error', 'Failed to update document');
    }
  });

  // Mutation for deleting documents
  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all document and stats queries to ensure cross-panel sync
      const queryKeysToInvalidate = [
        ['admin-documents'],
        ['admin-dashboard-stats'],
        ['admin-recent-documents'],
        ['user-documents'],
        ['user-stats'], // Fixed: Match the actual query key used in user dashboard
        ['user-dashboard-stats'] // Keep this for any other components that might use it
      ];
      
      // Local invalidation
      queryKeysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Cross-tab invalidation
      invalidateAcrossTabs(queryKeysToInvalidate);
      
      showNotification('success', 'Document deleted successfully');
      setDocumentToDelete(null);
    },
    onError: (error) => {
      showNotification('error', 'Failed to delete document');
    }
  });

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.compartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (doc: DocumentEntry) => {
    setEditingDocument(doc);
    setShowModal(true);
    setForm({
      type: doc.type,
      number: doc.number,
      title: doc.title,
      compartment: doc.compartment,
      description: doc.description || '',
      sender: doc.sender || '',
      recipient: doc.recipient || ''
    });
  };

  const handleDelete = async (docId: number) => {
    setDocumentToDelete(docId);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    // Note: Audit logging is handled by the backend automatically
    deleteDocumentMutation.mutate(documentToDelete);
  };

  const handleSave = async () => {
    if (!form.title || !form.type || !form.compartment || !form.description || !form.sender || !form.recipient) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    if (editingDocument) {
      // Update existing document
      updateDocumentMutation.mutate({
        id: editingDocument.id,
        data: {
          title: form.title,
          type: form.type,
          department: form.compartment,
          description: form.description,
          sender: form.sender,
          recipient: form.recipient
        }
      });

      // Note: Audit logging is handled by the backend automatically
    }
  };

  // Add export functionality
  const handleExport = () => {
    const csv = [
      ['Type', 'Number', 'Title', 'Department', 'Description', 'Sender', 'Recipient', 'Timestamp'],
      ...filteredDocuments.map(doc => [
        doc.type,
        doc.number,
        doc.title,
        doc.compartment,
        doc.description || '',
        doc.sender || '',
        doc.recipient || '',
        formatTimestamp(doc.timestamp)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Document Registry</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage all documents</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="p-2.5 border border-gray-200 rounded-lg text-gray-900"
            >
              <option value="ALL">All Types</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600">Loading documents...</div>
        </div>
      )}

      {/* Render documents table or cards here when not loading */}
      {!isLoading && (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${doc.type === 'IN' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {doc.type}
                    </span>
                    <span className="text-sm text-gray-500">{formatTimestamp(doc.timestamp)}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{doc.title}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Number:</span> {doc.number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Department:</span> {doc.compartment}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {doc.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Date:</span> {formatTimestamp(doc.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <FiEdit2 className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Number</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Title</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Department</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Description</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Timestamp</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${doc.type === 'IN' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{doc.number}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{doc.title}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{doc.compartment}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{doc.description || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{formatTimestamp(doc.timestamp)}</td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Register Document</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Inputs - Updated text colors */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 bg-white" // Darker text color
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Document Number</label>
                <input
                  type="text"
                  placeholder="Enter document number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder:text-gray-500" // Darker text, visible placeholder
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter document title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder:text-gray-500" // Darker text, visible placeholder
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Compartment</label>
                <input
                  type="text"
                  placeholder="Enter compartment"
                  value={form.compartment}
                  onChange={(e) => setForm({ ...form, compartment: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder:text-gray-500" // Darker text, visible placeholder
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Description*</label>
                <input
                  type="text"
                  placeholder="Enter document description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder:text-gray-500" // Darker text, visible placeholder
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Sender*</label>
                <input
                  type="text"
                  placeholder="Enter sender name/organization"
                  value={form.sender}
                  onChange={(e) => setForm({ ...form, sender: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Recipient*</label>
                <input
                  type="text"
                  placeholder="Enter recipient name/organization"
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg 
                  text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors order-1 sm:order-2"
              >
                {editingDocument ? 'Save Changes' : 'Register Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {documentToDelete !== null && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg 
                  text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg 
                  hover:bg-red-700 transition-colors order-1 sm:order-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
