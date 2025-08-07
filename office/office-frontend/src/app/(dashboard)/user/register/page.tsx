'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiSave, FiLoader, FiAlertCircle, FiHash, FiUpload, FiX, FiFile } from 'react-icons/fi';
import { useLogging } from '@/contexts/LoggingContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossTabSync } from '@/hooks/useCrossTabSync';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
}

interface FormData {
  type: 'IN' | 'OUT';
  title: string;
  department: string;
  description: string;
  sender: string;
  recipient: string;
  attachments?: FileList | null;
}

// Add ReservedNumber interface
interface ReservedNumber {
  id: string;
  number: string;
  type: 'IN' | 'OUT';
  status: 'active' | 'used' | 'expired';
}

export default function RegisterDocument() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addLog } = useLogging();
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();
  const { invalidateAcrossTabs } = useCrossTabSync();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Remove mock user data and fetch real user data
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch user details');
        }

        const user = await response.json();
        setUserDetails(user);
      } catch (error) {
        showNotification('error', 'Failed to load user information');
        console.error('Error fetching user details:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, [showNotification]);

  // Remove draft-related state and just keep the core form state
  const [form, setForm] = useState<FormData>({
    type: 'IN',
    title: '',
    department: '',
    description: '',
    sender: '',
    recipient: '',
    attachments: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [reservedNumbers, setReservedNumbers] = useState<ReservedNumber[]>([]);
  const [, setLoadingReserved] = useState(false);
  // Add new state for number selection modal
  const [showNumberSelectionModal, setShowNumberSelectionModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate file types
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const invalidFiles = fileArray.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError('Only PDF and image files (JPEG, JPG, PNG) are allowed');
        return;
      }
      
      // Validate file sizes (10MB per file)
      const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Limit to 5 files
      if (fileArray.length > 5) {
        setError('Maximum 5 files allowed');
        return;
      }
      
      setSelectedFiles(fileArray);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  // Update handleBlur function to remove number validation
  const handleBlur = async (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!form.sender.trim()) {
      setError('Sender is required');
      return false;
    }
    if (!form.recipient.trim()) {
      setError('Recipient is required');
      return false;
    }
    return true;
  };

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show number selection modal
    setShowNumberSelectionModal(true);
  };

  // Update the handleFinalSubmit function
  const handleFinalSubmit = async (selectedNumber?: string) => {
    if (!userDetails) {
      showNotification('error', 'User information not available');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let documentNumber = selectedNumber;
      
      // If no number selected, generate a new one
      if (!documentNumber) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/generate-number`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: form.type,
            department: userDetails.department,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate number');
        const data = await response.json();
        documentNumber = data.number;
      }

      // Submit the document with the selected/generated number
      if (!documentNumber) {
        throw new Error('Document number is required');
      }
      
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('number', documentNumber);
      formData.append('title', form.title);
      formData.append('department', userDetails.department);
      formData.append('description', form.description);
      formData.append('sender', form.sender);
      formData.append('recipient', form.recipient);
      
      // Add file attachments
      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type header when using FormData
        },
        body: formData
      });

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If it's HTML or other content, don't try to parse as JSON
            const errorText = await response.text();
            console.error('Non-JSON error response:', errorText);
            errorMessage = `Server error (${response.status}). Please check if the backend is running.`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Server error (${response.status}). Please check if the backend is running.`;
        }
        
        throw new Error(errorMessage);
      }

      // Parse the success response to check for warnings
      const responseData = await response.json();
      
      // Invalidate all relevant caches to ensure cross-panel sync
      const queryKeysToInvalidate = [
        ['user-documents'],
        ['department-documents'], // Add department documents for real-time updates
        ['all-documents'], // Add all documents for the new tab
        ['user-stats'], // Generic user stats key
        ['my-reservations']
      ];

      // Add user-specific query keys if we have currentUser
      if (currentUser) {
        queryKeysToInvalidate.push(
          ['user-stats', currentUser.id], // User-specific stats key used by dashboard
          ['user-documents', currentUser.id] // User-specific documents key used by dashboard
        );
      }

      // Add admin-specific keys for admin users
      if (currentUser?.role === 'admin') {
        queryKeysToInvalidate.push(
          ['admin-documents'],
          ['admin-dashboard-stats'],
          ['admin-recent-documents']
        );
      }
      
      // Local invalidation
      queryKeysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Cross-tab invalidation
      invalidateAcrossTabs(queryKeysToInvalidate);

      // Note: Audit logging is handled by the backend automatically
      
      showNotification('success', 'Document registered successfully!');
      router.push('/user/documents');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register document';
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
      setShowNumberSelectionModal(false);
    }
  };

  // Update the fetchReservedNumbers function with the correct endpoint
  const fetchReservedNumbers = async () => {
    setLoadingReserved(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/my-reservations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reserved numbers');
      }
      
      const data = await response.json();
      // Filter only active reserved numbers
      setReservedNumbers(data.filter((num: ReservedNumber) => num.status === 'active'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reserved numbers';
      showNotification('error', errorMessage);
      console.error('Error fetching reserved numbers:', error);
    } finally {
      setLoadingReserved(false);
    }
  };

  // Fetch reserved numbers when component mounts
  useEffect(() => {
    fetchReservedNumbers();
  }, []);

  // Update the return statement with a better layout
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center group"
        >
          <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Documents
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Register New Document</h1>
        <p className="text-gray-600 mt-1">Enter the document details below to register it in the system.</p>
      </div>

      {/* Main Form Card */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Document Information</h2>
            <p className="text-sm text-gray-500 mt-1">Fields marked with * are required</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Document Type and Department Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type*
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg 
                      bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="IN">Incoming Document</option>
                    <option value="OUT">Outgoing Document</option>
                  </select>
                </div>

                {/* Department - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={loadingUser ? 'Loading...' : userDetails?.department || 'Not assigned'}
                    className="w-full p-2.5 border border-gray-200 rounded-lg 
                      bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter document title"
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter document description"
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Sender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender*
                </label>
                <input
                  type="text"
                  name="sender"
                  value={form.sender}
                  onChange={handleChange}
                  placeholder="Enter sender name/organization"
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient*
                </label>
                <input
                  type="text"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleChange}
                  placeholder="Enter recipient name/organization"
                  className="w-full p-2.5 border border-gray-200 rounded-lg 
                    bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload PDF or image files (JPEG, JPG, PNG) - max 5 files, 10MB each
                </p>
                
                <div className="space-y-3">
                  {/* File Upload Input */}
                  <div className="relative">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="attachments"
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg 
                        hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer
                        flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
                    >
                      <FiUpload className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Click to upload files</span>
                      <span className="text-xs text-gray-500">or drag and drop</span>
                    </label>
                  </div>

                  {/* Selected Files Display */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Selected files ({selectedFiles.length}/5):
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <FiFile className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start">
                  <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 
                  hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors disabled:opacity-50 
                  disabled:cursor-not-allowed inline-flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5 mr-2" />
                    Register Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Number Selection Modal */}
      {showNumberSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div 
            className="bg-white/90 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col 
              backdrop-blur supports-[backdrop-filter]:bg-white/90"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Select Document Number</h3>
              <p className="text-sm text-gray-500 mt-1">Choose a reserved number or generate a new one</p>
            </div>
            
            <div className="p-6 flex-1 overflow-auto">
              <div className="space-y-4">
                {/* Generate New Number Option */}
                <button
                  onClick={() => handleFinalSubmit()}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg 
                    hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <FiHash className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Generate New Number</p>
                      <p className="text-sm text-gray-500">Create a new document number automatically</p>
                    </div>
                  </div>
                </button>

                {/* Reserved Numbers */}
                {reservedNumbers.length > 0 && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or use reserved number</span>
                      </div>
                    </div>

                    {reservedNumbers.map((num) => (
                      <button
                        key={num.id}
                        onClick={() => handleFinalSubmit(num.number)}
                        className="w-full p-4 text-left border border-gray-200 rounded-lg 
                          hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-lg font-medium text-gray-800">{num.number}</span>
                          <span className={`text-sm px-2.5 py-1 rounded-full font-medium
                            ${num.type === 'IN' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {num.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowNumberSelectionModal(false)}
                className="w-full px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 
                  hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
