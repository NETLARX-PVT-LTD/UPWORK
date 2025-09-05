import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Clock, FileText, AlertCircle, WifiOff, ShieldOff } from 'lucide-react';
import { getClientIP, validateLinkIP } from '../../utils/network'; // Ensure the path is correct
import { LinkDeactivationManager } from '../../utils/linkDeactivation';

const TestInstructions = ({ linkData, onStartTest }) => {
  const [candidateDetails, setCandidateDetails] = useState({
    name: linkData.candidateName || '',
    email: linkData.candidateEmail || '',
    phone: '',
    experience: '',
    position: linkData.position || ''
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [accessStatus, setAccessStatus] = useState('checking'); // 'checking', 'granted', 'denied'
  const [currentIP, setCurrentIP] = useState(null);

  // Enhanced function to handle test termination with automatic link deactivation
  const handleTestTermination = (terminationData) => {
    const { reason, violations, candidateName, testTitle } = terminationData;
    
    // Automatically deactivate the link
    if (linkData.linkId) {
      LinkDeactivationManager.deactivateLink(linkData.linkId, {
        reason: 'AUTOMATIC_DEACTIVATION_ON_TERMINATION',
        details: reason,
        terminatedAt: new Date().toISOString(),
        violations: violations || [],
        candidateName: candidateName || linkData.candidateName,
        testTitle: testTitle || 'Technical Assessment'
      });

      // Store termination record for audit trail
      const terminationRecord = {
        linkId: linkData.linkId,
        candidateName: candidateName || linkData.candidateName,
        terminatedAt: new Date().toISOString(),
        reason: reason,
        violations: violations || [],
        userAgent: navigator.userAgent,
        url: window.location.href,
        ip: currentIP,
        autoDeactivated: true
      };

      try {
        const existingTerminations = JSON.parse(localStorage.getItem('test_terminations') || '[]');
        existingTerminations.push(terminationRecord);
        localStorage.setItem('test_terminations', JSON.stringify(existingTerminations));
      } catch (error) {
        console.error('Failed to store termination record:', error);
      }

      // Notify the LinkGenerator component about the termination
      if (window.handleTestTermination) {
        try {
          window.handleTestTermination({
            ...terminationData,
            linkId: linkData.linkId,
            autoDeactivated: true
          });
        } catch (error) {
          console.error('Failed to notify LinkGenerator:', error);
        }
      }

      // Clear session to prevent re-entry attempts
      sessionStorage.clear();
      
      // Optional: Clear any cached link data
      try {
        localStorage.removeItem(`link_${linkData.linkId}`);
      } catch (error) {
        console.error('Failed to clear cached link data:', error);
      }

      console.log('Link automatically deactivated due to test termination:', {
        linkId: linkData.linkId,
        reason: reason,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Expose the termination handler for ScreenLock component
  useEffect(() => {
    // Make the termination handler globally available
    window.handleTestTerminationFromInstructions = handleTestTermination;
    
    return () => {
      // Clean up the global handler
      delete window.handleTestTerminationFromInstructions;
    };
  }, [linkData.linkId, currentIP]);

  useEffect(() => {
    const checkAccess = async () => {
      // Check if link is deactivated first (highest priority check)
      if (linkData.linkId && LinkDeactivationManager.isLinkDeactivated(linkData.linkId)) {
        const deactivationInfo = LinkDeactivationManager.getDeactivationInfo(linkData.linkId);
        
        // Set different status based on deactivation reason
        if (deactivationInfo && deactivationInfo.reason === 'AUTOMATIC_DEACTIVATION_ON_TERMINATION') {
          setAccessStatus('terminated');
        } else {
          setAccessStatus('deactivated');
        }
        return;
      }

      // Then check IP validation if needed
      if (linkData.generatedIP) {
        const clientIP = await getClientIP();
        setCurrentIP(clientIP);

        if (validateLinkIP(clientIP, linkData.generatedIP)) {
          setAccessStatus('granted');
        } else {
          setAccessStatus('denied');
        }
      } else {
        setAccessStatus('granted');
      }
    };
    checkAccess();
  }, [linkData]);

  const handleInputChange = (field, value) => {
    const updatedDetails = { ...candidateDetails, [field]: value };
    setCandidateDetails(updatedDetails);
    
    // Validate form fields to enable the button.
    const isValid = updatedDetails.name.trim() && 
                    updatedDetails.email.trim() && 
                    updatedDetails.phone.trim() && 
                    updatedDetails.experience.trim();
    setIsFormValid(isValid);
  };

  const handleFormSubmit = () => {
    if (isFormValid) {
      // Double-check if link is still active before proceeding
      if (linkData.linkId && LinkDeactivationManager.isLinkDeactivated(linkData.linkId)) {
        setAccessStatus('terminated');
        return;
      }
      setShowForm(false);
    }
  };

  const handleStartTest = () => {
    // Final check before starting the test
    if (linkData.linkId && LinkDeactivationManager.isLinkDeactivated(linkData.linkId)) {
      setAccessStatus('terminated');
      return;
    }

    // Store test start information
    if (linkData.linkId) {
      try {
        sessionStorage.setItem('active_test_link_id', linkData.linkId);
        sessionStorage.setItem('test_start_time', Date.now().toString());
        sessionStorage.setItem('test_candidate', JSON.stringify(candidateDetails));
      } catch (error) {
        console.error('Failed to store test session data:', error);
      }
    }

    onStartTest({
      ...linkData,
      candidateDetails,
      // Pass the termination handler to the test component
      onTestTerminate: handleTestTermination
    });
  };

  // --- Conditional Rendering based on accessStatus ---
  if (accessStatus === 'terminated') {
    const deactivationInfo = LinkDeactivationManager.getDeactivationInfo(linkData.linkId) || {};
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Test Access Terminated</h1>
          <p className="text-gray-600 text-sm mb-4">
            This interview link has been permanently deactivated due to a security violation during a previous test attempt. 
            You can no longer access this assessment.
          </p>
          {deactivationInfo.details && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-xs font-medium">Reason:</p>
              <p className="text-red-600 text-sm">{deactivationInfo.details}</p>
              {deactivationInfo.terminatedAt && (
                <p className="text-red-500 text-xs mt-1">
                  Terminated: {new Date(deactivationInfo.terminatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-700 text-sm">
              Please contact your HR representative or the assessment administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (accessStatus === 'deactivated') {
    const deactivationInfo = LinkDeactivationManager.getDeactivationInfo(linkData.linkId) || {};
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-orange-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Interview Link Deactivated</h1>
          <p className="text-gray-600 text-sm mb-4">
            This interview link has been deactivated and is no longer accessible.
          </p>
          {deactivationInfo.details && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-orange-700 text-xs font-medium">Details:</p>
              <p className="text-orange-600 text-sm">{deactivationInfo.details}</p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              Please contact your HR representative for a new interview link if needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (accessStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-teal-500 border-gray-200 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Validating access permissions...</p>
          {linkData.linkId && (
            <p className="text-gray-400 text-xs mt-2">Link ID: {linkData.linkId.substring(0, 8)}...</p>
          )}
        </div>
      </div>
    );
  }

  if (accessStatus === 'denied') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldOff size={24} className="text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 text-sm mb-4">
            This interview link is restricted. You must be on the same network that generated this link to access the test.
          </p>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <WifiOff size={16} className="mr-2" />
            <span>Your current IP: <strong className="text-gray-800">{currentIP || 'Unknown'}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // --- Render the original component content if access is 'granted' ---
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={24} className="text-teal-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800 mb-2">Candidate Information</h1>
              <p className="text-gray-600 text-sm">Please provide your details to begin the interview</p>
              {linkData.linkId && (
                <p className="text-gray-400 text-xs mt-2">Session: {linkData.linkId.substring(0, 8)}...</p>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User size={16} className="mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={candidateDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Mail size={16} className="mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={candidateDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Phone size={16} className="mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={candidateDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={16} className="mr-2" />
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    value={candidateDetails.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FileText size={16} className="mr-2" />
                  Position Applied For
                </label>
                <input
                  type="text"
                  value={candidateDetails.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Position/Role"
                />
              </div>
              <div className="flex justify-center pt-3">
                <button
                  onClick={handleFormSubmit}
                  disabled={!isFormValid}
                  className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                    isFormValid 
                      ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-md' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Test Instructions</h1>
            <p className="text-gray-600 text-sm">Welcome, {candidateDetails.name}!</p>
            {linkData.linkId && (
              <p className="text-gray-400 text-xs mt-1">Session: {linkData.linkId.substring(0, 8)}...</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Candidate Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium text-gray-800">{candidateDetails.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-800">{candidateDetails.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <p className="font-medium text-gray-800">{candidateDetails.experience} years</p>
              </div>
              <div>
                <span className="text-gray-600">Position:</span>
                <p className="font-medium text-gray-800">{candidateDetails.position}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="flex items-center mb-3">
                <Clock size={20} className="text-teal-600 mr-2" />
                <h3 className="text-sm font-semibold text-teal-800">Test Details</h3>
              </div>
              <ul className="space-y-2 text-sm text-teal-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span><strong>{linkData.selectedQuestions?.length || 'Multiple'}</strong> Questions</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span><strong>{linkData.timeLimit}</strong> minutes time limit</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span>No going back to previous questions</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span>Auto-save enabled</span>
                </li>
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center mb-3">
                <AlertCircle size={20} className="text-red-600 mr-2" />
                <h3 className="text-sm font-semibold text-red-800">Critical Guidelines</h3>
              </div>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Maintain stable internet connection</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Do not refresh or close browser</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span><strong>No tab switching allowed</strong></span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Complete in one session</span>
                </li>
              </ul>
            </div>
          </div>
          {linkData.instructions && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Special Instructions</h3>
              <p className="text-amber-700 text-sm">{linkData.instructions}</p>
            </div>
          )}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">Security & Monitoring</h3>
            <p className="text-purple-700 text-sm mb-3">
              This interview is monitored for security purposes. Switching tabs, using external tools, 
              or any suspicious activity will result in automatic test termination and permanent link deactivation.
            </p>
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <p className="text-red-700 text-sm font-semibold">
                WARNING: Security violations will permanently deactivate this interview link, 
                preventing any future access attempts.
              </p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleStartTest}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all duration-200 hover:shadow-md"
            >
              Start Interview Assessment
            </button>
            <p className="text-xs text-gray-600 mt-3">
              By starting this test, you acknowledge that you have read and understood all instructions 
              and security policies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions;