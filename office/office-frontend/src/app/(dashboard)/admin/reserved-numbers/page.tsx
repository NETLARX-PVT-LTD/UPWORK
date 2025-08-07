'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiTrash2, FiCalendar, FiCheck, FiX, FiHash } from 'react-icons/fi';
import { useNotification } from '@/contexts/NotificationContext';

interface ReservedNumber {
  id: string;
  number: string;
  type: 'IN' | 'OUT';
  department: string;
  reservedBy: string;
  reservedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'used';
}

export default function ReservedNumbersPage() {
  const { showNotification } = useNotification();
  const [numbers, setNumbers] = useState<ReservedNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'used'>('all');
  const [numberToDelete, setNumberToDelete] = useState<ReservedNumber | null>(null);

  useEffect(() => {
    fetchReservedNumbers();
  }, []);

  const fetchReservedNumbers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/reserved-numbers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch numbers');
      }

      const data = await response.json();
      setNumbers(data);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to load reserved numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (number: ReservedNumber) => {
    setNumberToDelete(number);
  };

  const confirmDelete = async () => {
    if (!numberToDelete) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/reserved-numbers/${numberToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete');
      }
      
      setNumbers(numbers.filter(n => n.id !== numberToDelete.id));
      showNotification('success', 'Reserved number deleted successfully');
      setNumberToDelete(null);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete reserved number');
    }
  };

  const filteredNumbers = numbers.filter(number => {
    const matchesSearch = 
      number.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      number.reservedBy.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    return matchesSearch && number.status === filter;
  });

  const getStatusBadgeColor = (status: ReservedNumber['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'used': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reserved Numbers</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage document number reservations</p>
        </div>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search reserved numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border text-gray-500 border-gray-200 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="w-full sm:w-auto px-3 py-2.5 border text-gray-500 border-gray-200 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {filteredNumbers.map((number) => (
          <div key={number.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getStatusBadgeColor(number.status)}`}>
                  {number.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Expires: {new Date(number.expiresAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FiHash className="text-gray-400" />
                <span className="font-mono text-lg text-gray-900">{number.number}</span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {number.type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reserved By:</span> {number.reservedBy}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reserved At:</span>{' '}
                  {new Date(number.reservedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => handleDelete(number)}
                className="inline-flex items-center text-red-600 hover:text-red-900"
              >
                <FiTrash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNumbers.map((number) => (
                <tr key={number.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {number.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {number.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {number.reservedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(number.reservedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${getStatusBadgeColor(number.status)}`}>
                      {number.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(number.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(number)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal - Already Responsive */}
      {numberToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete reserved number {numberToDelete.number}? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setNumberToDelete(null)}
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