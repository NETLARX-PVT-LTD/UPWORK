'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiEdit2, FiTrash2, FiPaperclip } from 'react-icons/fi';
import { useNotification } from '@/contexts/NotificationContext';

interface Document {
  id: string;
  type: 'IN' | 'OUT';
  number: string;
  title: string;
  compartment: string;
  description?: string;
  attachments?: string[];
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  createdBy: string;
}

export default function AdminDocumentDetails() {
  const router = useRouter();
  const params = useParams();
  const { showNotification } = useNotification();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // Replace with actual API call
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) throw new Error('Document not found');
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        showNotification('error', 'Failed to load document');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id, router, showNotification]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete document');
      
      showNotification('success', 'Document deleted successfully');
      router.back();
    } catch (error) {
      showNotification('error', 'Failed to delete document');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!document) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with full admin controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 text-gray-600 hover:text-gray-900 inline-flex items-center"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Document #{document.number}</p>
        </div>
        
        {/* Admin Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 text-sm font-medium 
              text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
          <Link
            href={`/admin/documents/${params.id}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium 
              text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Document Details - full admin view */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Document Type</h2>
            <p className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${document.type === 'IN' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'}`}>
                {document.type}
              </span>
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <p className="mt-1 text-sm text-gray-900 capitalize">{document.status}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Compartment</h2>
            <p className="mt-1 text-sm text-gray-900">{document.compartment}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Created By</h2>
            <p className="mt-1 text-sm text-gray-900">{document.createdBy}</p>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-gray-500">Description</h2>
            <p className="mt-1 text-sm text-gray-900">{document.description || 'No description'}</p>
          </div>

          {document.attachments && document.attachments.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="text-sm font-medium text-gray-500">Attachments</h2>
              <div className="mt-2 space-y-2">
                {document.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    className="inline-flex items-center px-3 py-2 text-sm text-gray-600 
                      bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiPaperclip className="w-4 h-4 mr-2" />
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}