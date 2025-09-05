import React, { useState, useEffect } from 'react';
import { Plus, Link2, Clock, Users, CheckCircle, XCircle, Shield, Wifi, WifiOff, Copy, Mail, Calendar, AlertTriangle, Eye, Settings, Ban, ExternalLink, Trash, Trash2 } from 'lucide-react';
import { storage } from '../../utils/storage';
import { getClientIP, isOfficeNetwork, validateLinkIP, generateSecureID } from '../../utils/network';

const LinkGenerator = ({ onSwitchToInventory, onSwitchToHistory }) => {
  const [officeIPRanges, setOfficeIPRanges] = useState(storage.getOfficeIPRanges());
  const [newRange, setNewRange] = useState('');
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIP, setCurrentIP] = useState(null);
  const [isValidNetwork, setIsValidNetwork] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    selectedQuestions: [],
    timeLimit: 30,
    instructions: '',
    requireOfficeNetwork: true,
    expiryDate: '',
    maxAttempts: 1
  });

  useEffect(() => {
    setLinks(storage.getLinks());
    setQuestions(storage.getQuestions());
    setOfficeIPRanges(storage.getOfficeIPRanges());
    checkNetworkStatus();
  }, []);

  const deleteLink = (linkId) => {
    if (window.confirm('Are you sure you want to permanently delete this interview link? This action cannot be undone.')) {
      const updatedLinks = links.filter(link => link.id !== linkId);
      setLinks(updatedLinks);
      storage.saveLinks(updatedLinks);
      alert('Link deleted successfully!');
    }
  };

  const handleTestTermination = (terminationData) => {
    const { linkId, reason, violations, terminatedAt, candidateName, testTitle } = terminationData;
    const updatedLinks = links.map(link => {
      if (link.id === linkId) {
        return {
          ...link,
          status: 'terminated',
          terminatedAt: terminatedAt,
          terminationReason: reason,
          violations: violations,
          completed: false,
          accessLog: [
            ...(link.accessLog || []),
            {
              timestamp: terminatedAt,
              action: 'TEST_TERMINATED',
              reason: reason,
              violationCount: violations?.length || 0,
              details: violations
            }
          ]
        };
      }
      return link;
    });

    setLinks(updatedLinks);
    storage.saveLinks(updatedLinks);

    const auditLog = {
      linkId,
      candidateName,
      testTitle,
      terminatedAt,
      reason,
      violations: violations || [],
      adminNotified: true
    };

    const existingAuditLogs = JSON.parse(localStorage.getItem('test_termination_audit') || '[]');
    localStorage.setItem('test_termination_audit', JSON.stringify([...existingAuditLogs, auditLog]));
    console.warn('Test terminated:', auditLog);
  };

  useEffect(() => {
    window.handleTestTermination = handleTestTermination;
    return () => {
      delete window.handleTestTermination;
    };
  }, [links]);

  const checkNetworkStatus = async () => {
    setNetworkLoading(true);
    try {
      const ip = await getClientIP();
      setCurrentIP(ip);
      setIsValidNetwork(isOfficeNetwork(ip, officeIPRanges));
    } catch (error) {
      console.error('Network check failed:', error);
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleSaveRanges = () => {
    storage.saveOfficeIPRanges(officeIPRanges);
    alert('Office IP ranges saved successfully!');
    setShowNetworkSettings(false);
    checkNetworkStatus();
  };

  const handleAddRange = () => {
    if (newRange.trim() !== '' && !officeIPRanges.includes(newRange.trim())) {
      setOfficeIPRanges([...officeIPRanges, newRange.trim()]);
      setNewRange('');
    }
  };

  const handleRemoveRange = (rangeToRemove) => {
    setOfficeIPRanges(officeIPRanges.filter(range => range !== rangeToRemove));
  };

  const handleGenerate = async () => {
    if (!formData.candidateName.trim() || !formData.candidateEmail.trim()) {
      alert('Please fill in candidate name and email');
      return;
    }

    if (formData.selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    const generatedIP = await getClientIP();

    const newLink = {
      id: generateSecureID(),
      ...formData,
      generatedAt: new Date().toISOString(),
      generatedIP: generatedIP,
      status: 'active',
      accessed: false,
      completed: false,
      accessAttempts: 0,
      accessLog: [],
      terminatedAt: null,
      terminationReason: null,
      violations: []
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    storage.saveLinks(updatedLinks);

    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      candidateEmail: '',
      selectedQuestions: [],
      timeLimit: 30,
      instructions: '',
      requireOfficeNetwork: true,
      expiryDate: '',
      maxAttempts: 1
    });
  };

  const copyLink = (linkId) => {
    const url = `${window.location.origin}${window.location.pathname}?interview=${linkId}`;
    navigator.clipboard.writeText(url).then(() => {
      const button = document.querySelector(`[data-link-id="${linkId}"]`);
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="text-green-600">✓ Copied!</span>';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      }
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

  const deactivateLink = (linkId) => {
    if (window.confirm('Are you sure you want to deactivate this interview link?')) {
      const updatedLinks = links.map(link =>
        link.id === linkId ? {
          ...link,
          status: 'deactivated',
          deactivatedAt: new Date().toISOString(),
          accessLog: [
            ...(link.accessLog || []),
            {
              timestamp: new Date().toISOString(),
              action: 'MANUALLY_DEACTIVATED',
              reason: 'Manual deactivation by admin'
            }
          ]
        } : link
      );
      setLinks(updatedLinks);
      storage.saveLinks(updatedLinks);
    }
  };

  const reactivateLink = (linkId) => {
    if (window.confirm('Are you sure you want to reactivate this interview link?')) {
      const updatedLinks = links.map(link =>
        link.id === linkId ? {
          ...link,
          status: 'active',
          reactivatedAt: new Date().toISOString(),
          accessLog: [
            ...(link.accessLog || []),
            {
              timestamp: new Date().toISOString(),
              action: 'REACTIVATED',
              reason: 'Manual reactivation by admin'
            }
          ]
        } : link
      );
      setLinks(updatedLinks);
      storage.saveLinks(updatedLinks);
    }
  };

  const sendEmail = (link) => {
    const subject = encodeURIComponent(`Interview Link - ${link.candidateName}`);
    const body = encodeURIComponent(`
Dear ${link.candidateName},

You have been invited to participate in an online interview assessment.

Interview Details:
- Time Limit: ${link.timeLimit} minutes
- Questions: ${link.selectedQuestions.length} questions
- ${link.requireOfficeNetwork ? 'Network Requirement: Office Wi-Fi only' : 'No network restrictions'}
${link.expiryDate ? `- Expires: ${new Date(link.expiryDate).toLocaleDateString()}` : ''}

Interview Link: ${window.location.origin}${window.location.pathname}?interview=${link.id}

${link.instructions ? `Special Instructions:\n${link.instructions}` : ''}

IMPORTANT SECURITY NOTICE:
- Do not switch tabs or open other applications during the test
- Do not use browser shortcuts or right-click
- Any security violations will result in automatic test termination
- Ensure stable internet connection throughout the assessment

Best regards,
HR Team
    `);

    window.open(`mailto:${link.candidateEmail}?subject=${subject}&body=${body}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'deactivated': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'terminated': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-emerald-600" />;
      case 'completed': return <CheckCircle size={16} className="text-blue-600" />;
      case 'expired': return <Clock size={16} className="text-amber-600" />;
      case 'deactivated': return <XCircle size={16} className="text-rose-600" />;
      case 'terminated': return <Ban size={16} className="text-purple-600" />;
      default: return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const viewTerminationDetails = (link) => {
    const details = `
Termination Details for ${link.candidateName}:

Terminated At: ${new Date(link.terminatedAt).toLocaleString()}
Reason: ${link.terminationReason}
Total Violations: ${link.violations?.length || 0}

Violation Details:
${link.violations?.map(v => `- ${v.type}: ${v.description} (${v.timestamp})`).join('\n') || 'No detailed violations recorded'}

Access Log:
${link.accessLog?.map(log => `- ${log.action}: ${log.reason || 'N/A'} (${new Date(log.timestamp).toLocaleString()})`).join('\n') || 'No access log available'}
    `;
    alert(details);
  };

  const totalPoints = questions
    .filter(q => formData.selectedQuestions.includes(q.id))
    .reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Link Generator</h1>
                <p className="text-gray-600 text-sm mt-1">Create secure interview links with advanced network validation</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onSwitchToInventory}
                className="inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
              >
                <Settings size={16} />
                Question Inventory
              </button>
              <button
                onClick={onSwitchToHistory}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                <Users size={16} />
                Interview History
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm font-medium"
              >
                <Link2 size={16} />
                New Link
              </button>
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isValidNetwork ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                {networkLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                ) : isValidNetwork ? (
                  <Wifi className="h-5 w-5 text-emerald-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-rose-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Network: {networkLoading ? 'Checking...' : isValidNetwork ? 'Office Network' : 'External Network'}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  IP Address: {currentIP || 'Detecting...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNetworkSettings(!showNetworkSettings)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
            >
              Configure Network
            </button>
          </div>

          {/* Network Settings UI */}
          {showNetworkSettings && (
            <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 text-base mb-3">Office Network Configuration</h4>
              <p className="text-gray-600 text-sm mb-4">
                Configure allowed IP ranges for secure office network validation.
              </p>
              <div className="space-y-3">
                {officeIPRanges.map(range => (
                  <div key={range} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-mono text-gray-800">{range}</span>
                    <button onClick={() => handleRemoveRange(range)} className="text-rose-600 hover:text-rose-800 text-lg">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <input
                  type="text"
                  value={newRange}
                  onChange={(e) => setNewRange(e.target.value)}
                  placeholder="e.g., 192.168.2."
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <button onClick={handleAddRange} className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                  Add Range
                </button>
              </div>
              <button onClick={handleSaveRanges} className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium">
                Save Configuration
              </button>
            </div>
          )}
        </div>

        {/* Link Generation Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Interview Link</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Candidate Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    value={formData.candidateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Enter candidate's full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Candidate Email *
                  </label>
                  <input
                    type="email"
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="candidate@email.com"
                    required
                  />
                </div>
              </div>

              {/* Test Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    min="5"
                    max="180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <select
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value={1}>1 Attempt</option>
                    <option value={2}>2 Attempts</option>
                    <option value={3}>3 Attempts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              {/* Network Security */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requireOfficeNetwork}
                      onChange={(e) => setFormData(prev => ({ ...prev, requireOfficeNetwork: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-indigo-900 text-sm">
                      Require Office Wi-Fi Network Access
                    </span>
                  </label>
                </div>
                <p className="text-sm text-indigo-700 mt-2 ml-8">
                  Restrict interview access to office network IP ranges for enhanced security.
                </p>
              </div>

              {/* Question Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Questions * ({formData.selectedQuestions.length} selected)
                  </label>
                  {formData.selectedQuestions.length > 0 && (
                    <span className="text-sm text-indigo-600 font-medium">
                      Total Points: {totalPoints}
                    </span>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg p-5 max-h-80 overflow-y-auto bg-gray-50">
                  {questions.length === 0 ? (
                    <div className="text-center py-10">
                      <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-3" />
                      <p className="text-gray-600 text-sm">No questions available.</p>
                      <button
                        onClick={onSwitchToInventory}
                        className="text-indigo-600 text-sm font-medium hover:text-indigo-800 mt-2 transition-colors duration-200"
                      >
                        Add Questions
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <div key={question.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors duration-200">
                          <input
                            type="checkbox"
                            id={`q-${question.id}`}
                            checked={formData.selectedQuestions.includes(question.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedQuestions: [...prev.selectedQuestions, question.id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedQuestions: prev.selectedQuestions.filter(id => id !== question.id)
                                }));
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={`q-${question.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium text-gray-900 text-sm">{question.question}</div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {question.type?.toUpperCase()}
                              </span>
                              <span>{question.points || 1} pt{(question.points || 1) > 1 ? 's' : ''}</span>
                              <span className={`px-2 py-1 rounded ${question.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                  question.difficulty === 'hard' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                {question.difficulty || 'Medium'}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  rows="4"
                  placeholder="Add any special instructions for the candidate..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleGenerate}
                  disabled={formData.selectedQuestions.length === 0 || !formData.candidateName.trim() || !formData.candidateEmail.trim()}
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                >
                  Generate Secure Link
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">
                  Generated Links ({links.length})
                </h2>
              </div>
              {links.length > 0 && (
                <div className="text-sm text-indigo-100">
                  Active: {links.filter(l => l.status === 'active').length} •
                  Completed: {links.filter(l => l.status === 'completed').length} •
                  Terminated: {links.filter(l => l.status === 'terminated').length}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {links.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No links generated yet</h3>
                <p className="text-gray-600 text-sm mb-4">Create your first interview link to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                >
                  Generate First Link
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 bg-white">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 text-base">{link.candidateName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(link.status)}`}>
                            {getStatusIcon(link.status)}
                            {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                          </span>
                          {link.completed && <CheckCircle size={16} className="text-emerald-600" />}
                          {link.requireOfficeNetwork && (
                            <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                              <Shield size={12} />
                              <span>Secure</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{link.candidateEmail}</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{link.timeLimit} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{link.selectedQuestions.length} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Generated: {new Date(link.generatedAt).toLocaleDateString()}</span>
                          </div>
                          {link.expiryDate && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle size={14} />
                              <span>Expires: {new Date(link.expiryDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {link.status === 'terminated' && link.terminationReason && (
                          <div className="mt-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                            <p className="text-sm text-purple-800">
                              <strong>Terminated:</strong> {link.terminationReason}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              {new Date(link.terminatedAt).toLocaleString()} •
                              {link.violations?.length || 0} violation(s) detected
                            </p>
                            <button
                              onClick={() => viewTerminationDetails(link)}
                              className="text-purple-700 text-xs hover:text-purple-900 underline mt-1"
                            >
                              View Details
                            </button>
                          </div>
                        )}

                        {link.instructions && (
                          <div className="mt-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                            <p className="text-sm text-amber-800">
                              <strong>Instructions:</strong> {link.instructions}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {link.status === 'active' && (
                          <>
                            <button
                              onClick={() => sendEmail(link)}
                              className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors duration-200"
                              title="Send Email"
                            >
                              <Mail size={16} />
                            </button>
                            <button
                              onClick={() => copyLink(link.id)}
                              data-link-id={link.id}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                              title="Copy Link"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deactivateLink(link.id)}
                              className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors duration-200"
                              title="Deactivate Link"
                            >
                              <XCircle size={16} />
                            </button>
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors duration-200"
                              title="Delete Link"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}

                        {link.status === 'terminated' && (
                          <button
                            onClick={() => reactivateLink(link.id)}
                            className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200"
                            title="Reactivate Link"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {(link.status === 'deactivated' || link.status === 'expired') && (
                          <button
                            onClick={() => reactivateLink(link.id)}
                            className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200"
                            title="Reactivate Link"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkGenerator;