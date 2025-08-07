'use client';

// Added useEffect to imports
import { useState, useEffect } from 'react';
import { FiHash, FiLoader, FiAlertCircle, FiCheckCircle, FiCopy } from 'react-icons/fi';
import { useLogging } from '@/contexts/LoggingContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface ReservedNumber {
  id: string;
  number: string;
  type: 'IN' | 'OUT';
  department: string;  // Changed from compartment
  reservedAt: string;
  reservedBy: string;
  status: 'active' | 'used' | 'expired';
}

// Add this interface at the top with other interfaces
interface RawReservedNumber {
  id: string;
  number: string;
  type: 'IN' | 'OUT';
  department: string;
  reservedAt: string;
  reservedBy: string;
  status: 'active' | 'used' | 'expired';
}

export default function ReserveDocumentPage() {
  const { addLog } = useLogging();
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [reservedNumber, setReservedNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservedNumbers, setReservedNumbers] = useState<ReservedNumber[]>([]);
  const [fetchingNumbers, setFetchingNumbers] = useState(true);
  const [quantity, setQuantity] = useState<number>(1); // Add this state

  // Update the useEffect section with the correct endpoint
  useEffect(() => {
    const fetchReservedNumbers = async () => {
      setFetchingNumbers(true);
      try {
        // Changed endpoint from /documents/user/reserved-numbers to /documents/my-reservations
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/my-reservations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch your reserved numbers');
        }

        const data = await res.json();
        setReservedNumbers(data);
      } catch (error) {
        console.error('Error fetching reserved numbers:', error);
        showNotification('error', 
          error instanceof Error ? error.message : 'Failed to load your reserved numbers'
        );
      } finally {
        setFetchingNumbers(false);
      }
    };

    if (currentUser) {
      fetchReservedNumbers();
    }
  }, [showNotification, currentUser]);

  // Update the handleReserve function
  const handleReserve = async () => {
    if (!currentUser?.department) {
      setError('Department information not available');
      return;
    }

    if (quantity < 1 || quantity > 50) {
      setError('Please enter a quantity between 1 and 50');
      return;
    }

    setLoading(true);
    setError('');
    setReservedNumber('');

    try {
      const requestBody = {
        type,
        count: quantity // Changed from 'quantity' to 'count' to match API
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to reserve numbers');
      }

      const data = await res.json();
      // Update to handle multiple numbers
      const numbers = Array.isArray(data) ? data : [data];
      
      // Log the reservation
      addLog({
        user: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          role: currentUser?.role || '',
          department: currentUser?.department || ''
        },
        action: `Reserved ${quantity} document number(s)`,
        type: 'document'
      });

      // Refresh the reserved numbers list
      const updatedNumbers = [...reservedNumbers, ...numbers];
      setReservedNumbers(updatedNumbers);
      showNotification('success', `Successfully reserved ${quantity} document number(s)!`);
    } catch (err) {
      console.error('Error details:', err);
      setError('Could not reserve numbers. Please try again');
      showNotification('error', err instanceof Error ? err.message : 'Failed to reserve document numbers');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reservedNumber);
      showNotification('success', 'Number copied to clipboard!');
    } catch (err) {
      showNotification('error', 'Failed to copy number');
    }
  };

  // First, add FiCopy to your imports if not already present
  // import { FiHash, FiLoader, FiAlertCircle, FiCheckCircle, FiCopy } from 'react-icons/fi';

  // Add this function inside your component
  const copyNumber = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      showNotification('success', 'Number copied to clipboard!');
    } catch (err) {
      showNotification('error', 'Failed to copy number');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header - Removed max-width and adjusted spacing */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiHash className="text-blue-600" />
          Reserve Document Number
        </h1>
        <p className="text-gray-600 mt-1">
          Reserve a unique document number for your next registration
        </p>
      </div>

      {/* Form Card - Adjusted width and removed unnecessary spacing */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="grid gap-4">
          {/* Document Type and Quantity on same line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'IN' | 'OUT')}
                className="w-full p-2.5 border border-gray-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-900 bg-white"
              >
                <option value="IN">Incoming (IN)</option>
                <option value="OUT">Outgoing (OUT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (1-50)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full p-2.5 border border-gray-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-900 bg-white"
                placeholder="Enter number of documents to reserve"
              />
              <p className="mt-1 text-sm text-gray-500">
                You can reserve up to 50 numbers at once
              </p>
            </div>
          </div>

          {/* Department field remains unchanged */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <div className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              {currentUser?.department || 'Loading...'}
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          <button
            onClick={handleReserve}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors disabled:opacity-50 
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Reserving {quantity} number{quantity > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <FiHash className="w-5 h-5" />
                Reserve {quantity} Number{quantity > 1 ? 's' : ''}
              </>
            )}
          </button>

          {/* Success Message */}
          {reservedNumber && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <FiCheckCircle className="w-5 h-5" />
                <span className="font-medium">Number Reserved!</span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded border border-green-200">
                <span className="font-mono text-lg text-gray-900 tracking-wide">
                  {reservedNumber}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <FiCopy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Use this number when registering your document
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reserved Numbers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Reserved Numbers</h2>
        </div>
        
        {fetchingNumbers ? (
          <div className="p-4 flex items-center justify-center">
            <FiLoader className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : reservedNumbers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No reserved numbers found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserved At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservedNumbers.map((number) => (
                  <tr key={number.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{number.number}</span>
                        <button
                          onClick={() => copyNumber(number.number)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Copy number"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {number.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {number.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(number.reservedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${number.status ? 
                          (number.status === 'active' ? 'bg-green-100 text-green-800' : 
                           number.status === 'used' ? 'bg-gray-100 text-gray-800' : 
                           'bg-red-100 text-red-800')
                          : 'bg-gray-100 text-gray-800'}`}
                      >
                        {(number.status || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
