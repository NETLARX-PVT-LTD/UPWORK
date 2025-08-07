'use client';

import { useState } from 'react';
import { FiX, FiDownload, FiLoader } from 'react-icons/fi';

interface GenerateReportModalProps {
  onClose: () => void;
  onGenerate: (options: ReportOptions) => void;
  isGenerating?: boolean;
}

export interface ReportOptions {
  type: 'documents' | 'audit';
  dateRange: 'all' | 'today' | 'week' | 'month';
  format: 'csv' | 'xls';
}

export default function GenerateReportModal({ 
  onClose, 
  onGenerate, 
  isGenerating = false 
}: GenerateReportModalProps) {
  const [options, setOptions] = useState<ReportOptions>({
    type: 'documents',
    dateRange: 'all',
    format: 'csv'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Generate Report</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={options.type}
              onChange={(e) => setOptions({ ...options, type: e.target.value as ReportOptions['type'] })}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-900"
            >
              <option value="documents">Document Registry</option>
              <option value="audit">Audit Trail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={options.dateRange}
              onChange={(e) => setOptions({ ...options, dateRange: e.target.value as ReportOptions['dateRange'] })}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-900"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value as ReportOptions['format'] })}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-900"
            >
              <option value="csv">CSV</option>
              <option value="xls">Excel (XLS)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 
                hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                hover:bg-blue-700 transition-colors inline-flex items-center
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiDownload className="w-5 h-5 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}