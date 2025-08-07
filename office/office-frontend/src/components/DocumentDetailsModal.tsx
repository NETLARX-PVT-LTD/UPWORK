'use client';

import { useState } from 'react';
import { FiX, FiFileText, FiUser, FiCalendar, FiHash, FiType, FiHome, FiSend, FiInbox, FiPaperclip, FiDownload, FiFile, FiEye } from 'react-icons/fi';

// deployment

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

interface DocumentDetailsModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentDetailsModal({ document, isOpen, onClose }: DocumentDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };  const handleDownload = async (attachment: string) => {
    try {
      let downloadUrl;
      let fileName;
      
      // Check if it's a Cloudinary URL
      if (attachment.includes('cloudinary.com')) {
        // For Cloudinary files, URL encode the attachment for the API call
        const encodedAttachment = encodeURIComponent(attachment);
        downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/files/${encodedAttachment}`;
        // Extract filename from Cloudinary URL
        const urlParts = attachment.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        // Handle both versioned and non-versioned Cloudinary URLs
        if (fileWithExt.includes('.')) {
          const nameParts = fileWithExt.split('.');
          const extension = nameParts.pop();
          fileName = `document.${extension}`;
        } else {
          fileName = 'document';
        }
      } else {
        // Local file - use the full path for the API call
        const encodedAttachment = encodeURIComponent(attachment);
        downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/files/${encodedAttachment}`;
        
        // Extract just the filename for download
        fileName = attachment.split(/[/\\]/).pop() || 'download';
      }
        
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };  const handleView = async (attachment: string) => {
    try {
      let viewUrl;
      
      // Check if it's a Cloudinary URL
      if (attachment.includes('cloudinary.com')) {
        // For Cloudinary files, URL encode the attachment for the API call
        const encodedAttachment = encodeURIComponent(attachment);
        viewUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/view/${encodedAttachment}`;
      } else {
        // Local file - use the full path for the API call
        const encodedAttachment = encodeURIComponent(attachment);
        viewUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/view/${encodedAttachment}`;
      }
      
      // For PDFs and other documents, try to open directly with authentication
      const response = await fetch(viewUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load file');
      }
      
      // Check if it's a redirect response (Cloudinary URLs)
      if (response.redirected || response.url !== viewUrl) {
        // If it's a redirect, open the final URL directly
        window.open(response.url, '_blank');
        return;
      }
      
      // For blob responses, create blob and open in new tab
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.location.href = url;
        
        // Clean up the blob URL after a delay to allow the browser to load it
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // Fallback if popup is blocked
        window.URL.revokeObjectURL(url);
        alert('Please allow popups to view files, or use the download button instead.');
      }
    } catch (error) {
      console.error('View error:', error);
      alert('Failed to view file. Please try again or use the download button.');
    }
  };return (
    <div className="fixed inset-0 bg-white-20 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] sm:max-h-[75vh] overflow-y-auto mx-2 sm:mx-0 animate-slideUp">{/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              document.type === 'IN' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Document Details</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{document.number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">          {/* Document Type & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <FiType className="w-4 h-4" />
                <span>Document Type</span>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${document.type === 'IN' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                  {document.type === 'IN' ? 'Incoming' : 'Outgoing'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <FiHash className="w-4 h-4" />
                <span>Document Number</span>
              </div>              <div className="font-mono text-lg font-semibold text-gray-900">
                {document.number}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
              <FiFileText className="w-4 h-4" />
              <span>Title</span>
            </div>
            <div className="text-lg font-medium text-gray-900">
              {document.title}
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <FiFileText className="w-4 h-4" />
                <span>Description</span>
              </div>
              <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {document.description}
              </div>
            </div>
          )}

          {/* Attachments */}
          {document.attachments && document.attachments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <FiPaperclip className="w-4 h-4" />
                <span>Attachments</span>
              </div>
              <div className="space-y-2">                {document.attachments.map((attachment, index) => {
                  const fileName = attachment.split(/[/\\]/).pop() || attachment;
                  const fileExtension = fileName.split('.').pop()?.toLowerCase();
                  const isPdf = fileExtension === 'pdf';
                  const isImage = ['jpg', 'jpeg'].includes(fileExtension || '');
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {isPdf ? (
                          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <FiFileText className="w-4 h-4" />
                          </div>
                        ) : isImage ? (
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FiFile className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                            <FiFile className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{fileName}</p>
                          <p className="text-xs text-gray-500">
                            {isPdf ? 'PDF Document' : isImage ? 'Image File' : 'File'}
                          </p>
                        </div>                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(attachment)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(attachment)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FiDownload className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sender & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {document.sender && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                  <FiSend className="w-4 h-4" />
                  <span>Sender</span>
                </div>
                <div className="text-gray-900">
                  {document.sender}
                </div>
              </div>
            )}

            {document.recipient && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                  <FiInbox className="w-4 h-4" />
                  <span>Recipient</span>
                </div>
                <div className="text-gray-900">
                  {document.recipient}
                </div>
              </div>
            )}
          </div>          {/* Department & Registration Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <FiHome className="w-4 h-4" />
                <span>Department</span>
              </div>
              <div className="text-gray-900">
                {document.department}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <FiUser className="w-4 h-4" />
                <span>Registered By</span>
              </div>
              <div className="text-gray-900">
                {document.registeredBy}
              </div>
            </div>
          </div>

          {/* Registration Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
              <FiCalendar className="w-4 h-4" />
              <span>Registration Date</span>
            </div>
            <div className="text-gray-900">
              {formatDate(document.registeredAt)}
            </div>
          </div>
        </div>        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
