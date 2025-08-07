"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNotification } from "@/contexts/NotificationContext";

interface LogEntry {
  id: string;
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
  action: string;
  type: "document" | "auth" | "system";
  timestamp: string;
}

// interface PaginationInfo {
//   currentPage: number;
//   totalPages: number;
//   itemsPerPage: number;
// }

export default function AuditTrailPage() {
  const { showNotification } = useNotification();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Show 30 items per page

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch logs");
        }

        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
        // Add better error handling with a notification
        if (error instanceof Error) {
          showNotification?.("error", error.message);
        } else {
          showNotification?.("error", "Failed to load audit logs");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs =
    logs
      ?.filter((log) => {
        const userString = log.user?.name || "";
        const actionString = String(log.action || "");
        const searchTermLower = searchTerm.toLowerCase();

        const matchesSearch =
          userString.toLowerCase().includes(searchTermLower) ||
          actionString.toLowerCase().includes(searchTermLower);

        if (dateRange === "all") return matchesSearch;

        const logDate = new Date(log.timestamp);
        const now = new Date();

        switch (dateRange) {
          case "today":
            return (
              matchesSearch &&
              logDate.toDateString() === now.toDateString()
            );
          case "week":
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return matchesSearch && logDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return matchesSearch && logDate >= monthAgo;
          default:
            return matchesSearch;
        }
      }) ?? [];

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2 text-gray-600">
            <FiLoader className="w-5 h-5 animate-spin" />
            <span>Loading audit logs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-gray-900"
            />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-gray-900 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user?.name || "Unknown User"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        log.type === "document"
                          ? "bg-blue-100 text-blue-800"
                          : log.type === "auth"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)}
              </span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{filteredLogs.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
              >
                <span className="sr-only">Previous</span>
                <FiChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 1)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                      ${currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
              >
                <span className="sr-only">Next</span>
                <FiChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
