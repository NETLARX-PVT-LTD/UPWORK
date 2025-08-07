'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiEdit2, FiPaperclip } from 'react-icons/fi';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext'; // Add this for currentUser

interface Document {
  id: string;
  type: 'IN' | 'OUT';
  number: string;
  title: string;
  compartment: string;
  description?: string;
  attachments?: string[];
  createdAt: string;
  createdBy: string;
}

interface User {
  email: string;
  name: string;
  department: string;
}

export default function UserDocumentDetails() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!document) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 text-gray-600 hover:text-gray-900 inline-flex items-center"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to My Documents
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Document #{document.number}</p>
        </div>
        
        {/* Only show edit if user is the creator */}
        {document.createdBy === currentUser?.email && (
          <Link
            href={`/user/documents/${params.id}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 
              bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit Document
          </Link>
        )}
      </div>

      {/* Document Details - simplified view for users */}
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
            <h2 className="text-sm font-medium text-gray-500">Document Number</h2>
            <p className="mt-1 text-sm font-mono text-gray-900">{document.number}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Compartment</h2>
            <p className="mt-1 text-sm text-gray-900">{document.compartment}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Created At</h2>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(document.createdAt).toLocaleString()}
            </p>
          </div>

          {document.description && (
            <div className="md:col-span-2">
              <h2 className="text-sm font-medium text-gray-500">Description</h2>
              <p className="mt-1 text-sm text-gray-900">{document.description}</p>
            </div>
          )}

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