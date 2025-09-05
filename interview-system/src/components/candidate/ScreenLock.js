import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, CheckCircle, Shield, AlertTriangle, Eye, Lock, AlertCircle } from 'lucide-react';
import { LinkDeactivationManager } from '../../utils/linkDeactivation';

const ScreenLock = ({ 
  onUnlock, 
  onTestTerminate,
  onLinkDeactivated, // New prop to handle deactivated state
  isTestActive = false,
  candidateName = '',
  testTitle = 'Technical Assessment',
  linkId = null,
  linkData = null
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationCountdown, setTerminationCountdown] = useState(null);
  
  const violationTimeoutRef = useRef(null);
  const terminationTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const testStartTimeRef = useRef(null);
  const hasTriggeredTerminationRef = useRef(false);

  // Mock functions - replace with your actual network utility functions
  const getClientIP = () => Promise.resolve('192.168.1.100');
  const isOfficeNetwork = (ip) => ip.startsWith('192.168.1');

  const checkNetwork = async () => {
    setIsChecking(true);
    try {
      const ip = await getClientIP();
      const isOffice = isOfficeNetwork(ip);
      setNetworkStatus(isOffice);
      
      if (isOffice) {
        setTimeout(() => onUnlock(), 1000);
      }
    } catch (error) {
      setNetworkStatus(false);
    }
    setIsChecking(false);
  };

  // Main function to terminate test and deactivate link permanently
  const terminateTestAndDeactivateLink = (terminationData) => {
    if (hasTriggeredTerminationRef.current) {
      console.log('Termination already in progress, ignoring duplicate call');
      return;
    }

    hasTriggeredTerminationRef.current = true;
    
    const testDuration = testStartTimeRef.current 
      ? Date.now() - testStartTimeRef.current 
      : terminationData.testDuration || 0;

    const finalTerminationData = {
      linkId: linkId,
      candidateName: candidateName || terminationData.candidateName,
      testTitle: testTitle || terminationData.testTitle,
      reason: terminationData.reason || 'Security violation detected',
      violations: [...violations, ...(terminationData.violations || [])],
      testDuration: testDuration,
      terminatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      totalWarnings: warningCount,
      autoDeactivated: true
    };

    console.log('Terminating test and deactivating link:', finalTerminationData);

    // Immediately deactivate the link using the manager
    const deactivationSuccess = LinkDeactivationManager.deactivateLink(linkId, finalTerminationData);
    
    if (deactivationSuccess) {
      console.log('Link successfully deactivated');
    } else {
      console.error('Failed to deactivate link');
    }

    // Call the parent component's termination handler
    if (onTestTerminate) {
      try {
        onTestTerminate(finalTerminationData);
      } catch (error) {
        console.error('Error calling onTestTerminate:', error);
      }
    }

    // Call the link deactivation handler
    if (onLinkDeactivated) {
      try {
        onLinkDeactivated(finalTerminationData);
      } catch (error) {
        console.error('Error calling onLinkDeactivated:', error);
      }
    }

    // Try to notify the LinkGenerator component
    try {
      if (window.handleTestTermination) {
        window.handleTestTermination(finalTerminationData);
      }
    } catch (error) {
      console.error('Failed to notify LinkGenerator:', error);
    }

    // Store termination data locally as backup
    try {
      const existingTerminations = JSON.parse(localStorage.getItem('test_terminations') || '[]');
      existingTerminations.push(finalTerminationData);
      localStorage.setItem('test_terminations', JSON.stringify(existingTerminations));
    } catch (error) {
      console.error('Failed to store termination record:', error);
    }

    // Clear all session data to prevent re-entry
    try {
      sessionStorage.clear();
      localStorage.removeItem('active_test_link_id');
      localStorage.removeItem('test_candidate');
      localStorage.removeItem('test_start_time');
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }

    // Show final termination message before closing
    setTimeout(() => {
      alert(`TEST TERMINATED\n\nThis interview has been terminated due to security violations.\nThe link has been permanently deactivated.\n\nReason: ${finalTerminationData.reason}\nTime: ${new Date().toLocaleString()}`);
      
      // Close the window or redirect
      setTimeout(() => {
        try {
          if (window.opener) {
            window.close();
          } else {
            window.location.href = 'about:blank';
          }
        } catch (error) {
          console.error('Could not close window:', error);
        }
      }, 2000);
    }, 1000);
  };

  // Enhanced violation handling with stricter rules for tab switching
  const handleViolation = (type, description, isCritical = false) => {
    // Check if link is already deactivated before processing violations
    if (linkId && LinkDeactivationManager.isLinkDeactivated(linkId)) {
      console.log('Link already deactivated, ignoring violation');
      return;
    }

    const violation = {
      id: Date.now(),
      type,
      description,
      timestamp: new Date().toLocaleTimeString(),
      count: warningCount + 1,
      isCritical,
      linkId: linkId,
      candidateName: candidateName,
      userAgent: navigator.userAgent,
      url: window.location.href,
      fullTimestamp: new Date().toISOString()
    };

    console.log('Security violation detected:', violation);

    setViolations(prev => [...prev, violation]);
    setWarningCount(prev => prev + 1);
    setShowViolationModal(true);

    // Clear any existing timeouts
    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
    }

    // For tab switching or any critical violation, terminate immediately
    if (type === 'Tab Switch/Window Switch Detected' || isCritical) {
      console.log('Critical violation detected, terminating immediately');
      setIsTerminating(true);
      startTerminationCountdown(violation);
    } else if (warningCount + 1 >= 2) {
      // For other violations, terminate after 2 warnings
      console.log('Maximum warnings reached, terminating');
      setIsTerminating(true);
      startTerminationCountdown(violation);
    } else {
      // Auto-hide modal after 5 seconds for first warning of non-critical violations
      violationTimeoutRef.current = setTimeout(() => {
        setShowViolationModal(false);
      }, 5000);
    }

    // Log violation for audit trail
    try {
      const existingViolations = JSON.parse(localStorage.getItem('test_violations') || '[]');
      existingViolations.push(violation);
      localStorage.setItem('test_violations', JSON.stringify(existingViolations));
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  };

  const startTerminationCountdown = (violation) => {
    setTerminationCountdown(10); // 10 second countdown
    
    countdownIntervalRef.current = setInterval(() => {
      setTerminationCountdown(prev => {
        if (prev <= 1) {
          // Clear the interval and terminate
          clearInterval(countdownIntervalRef.current);
          terminateTestAndDeactivateLink({
            reason: violation.isCritical || violation.type === 'Tab Switch/Window Switch Detected' 
              ? 'Critical Security Violation: Tab Switching Detected' 
              : 'Multiple Security Violations',
            violations: [...violations, violation],
            primaryViolation: violation,
            warningCount: warningCount + 1
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Also set a timeout as backup
    terminationTimeoutRef.current = setTimeout(() => {
      terminateTestAndDeactivateLink({
        reason: violation.isCritical || violation.type === 'Tab Switch/Window Switch Detected'
          ? 'Critical Security Violation: Tab Switching Detected'
          : 'Multiple Security Violations',
        violations: [...violations, violation],
        primaryViolation: violation,
        warningCount: warningCount + 1
      });
    }, 10000);
  };

  // Enhanced monitoring when test is active
  useEffect(() => {
    if (!isTestActive || !linkId) return;

    // Record test start time
    testStartTimeRef.current = Date.now();
    sessionStorage.setItem('test_start_time', testStartTimeRef.current.toString());

    // Check if link is deactivated at the start
    if (LinkDeactivationManager.isLinkDeactivated(linkId)) {
      console.log('Link is already deactivated, calling onLinkDeactivated');
      if (onLinkDeactivated) {
        onLinkDeactivated({
          reason: 'Link was previously deactivated',
          linkId: linkId
        });
      }
      return;
    }

    console.log('Starting enhanced monitoring for linkId:', linkId);

    let tabSwitchDetected = false;
    let focusLostTime = null;

    // CRITICAL: Enhanced visibility change detection for tab switching
    const handleVisibilityChange = () => {
      if (document.hidden && !tabSwitchDetected) {
        tabSwitchDetected = true;
        console.log('Tab switch detected - immediate termination');
        handleViolation(
          'Tab Switch/Window Switch Detected', 
          `Candidate switched away from the assessment tab at ${new Date().toLocaleTimeString()} - CRITICAL VIOLATION`,
          true // Critical violation - immediate termination
        );
      }
    };

    // Enhanced blur detection
    const handleBlur = () => {
      if (document.hidden && !tabSwitchDetected) {
        tabSwitchDetected = true;
        console.log('Window focus lost with tab hidden - treating as tab switch');
        handleViolation(
          'Tab Switch/Window Switch Detected',
          `Browser window lost focus and tab became hidden at ${new Date().toLocaleTimeString()} - CRITICAL VIOLATION`,
          true
        );
      } else if (!focusLostTime) {
        focusLostTime = Date.now();
        setTimeout(() => {
          if (focusLostTime && Date.now() - focusLostTime > 3000) {
            handleViolation(
              'Window Focus Lost', 
              `Browser window lost focus for extended period (${Math.round((Date.now() - focusLostTime) / 1000)}s)`,
              false
            );
          }
        }, 3000);
      }
    };

    const handleFocus = () => {
      focusLostTime = null;
    };

    // Enhanced page visibility API monitoring
    const handlePageShow = (event) => {
      // Detect if page was restored from cache (back/forward navigation)
      if (event.persisted) {
        console.log('Page restored from cache - possible navigation attempt');
        handleViolation(
          'Page Navigation Detected',
          'Page was restored from browser cache - possible back/forward navigation attempt',
          true
        );
      }
    };

    const handlePageHide = () => {
      if (!tabSwitchDetected) {
        console.log('Page hide detected - possible tab switch');
        handleViolation(
          'Tab Switch/Window Switch Detected',
          `Page became hidden at ${new Date().toLocaleTimeString()} - possible tab switch`,
          true
        );
      }
    };

    // Prevent common cheating attempts
    const handleContextMenu = (e) => {
      e.preventDefault();
      handleViolation(
        'Right Click Detected', 
        `Attempted to open context menu at ${new Date().toLocaleTimeString()}`,
        false
      );
    };

    const handleKeyDown = (e) => {
      const prohibitedKeys = [
        'F12',
        { ctrl: true, shift: true, key: 'I' }, // DevTools
        { ctrl: true, key: 'u' }, // View Source
        { ctrl: true, shift: true, key: 'C' }, // DevTools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { alt: true, key: 'Tab' }, // Alt+Tab - CRITICAL
        { ctrl: true, key: 'Tab' }, // Ctrl+Tab - CRITICAL
        { ctrl: true, shift: true, key: 'Tab' }, // Ctrl+Shift+Tab - CRITICAL
        { ctrl: true, key: 'r' }, // Refresh
        { key: 'F5' }, // Refresh
        { ctrl: true, key: 'F5' }, // Hard Refresh
        { ctrl: true, shift: true, key: 'R' }, // Hard Refresh
        { ctrl: true, key: 'w' }, // Close Tab
        { ctrl: true, key: 't' }, // New Tab - CRITICAL
        { ctrl: true, key: 'n' }, // New Window - CRITICAL
        { ctrl: true, shift: true, key: 'N' }, // New Incognito - CRITICAL
      ];

      const isProhibited = prohibitedKeys.some(combo => {
        if (typeof combo === 'string') {
          return e.key === combo;
        }
        return (!combo.ctrl || e.ctrlKey) &&
               (!combo.shift || e.shiftKey) &&
               (!combo.alt || e.altKey) &&
               e.key === combo.key;
      });

      if (isProhibited) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        const keyCombo = [
          e.ctrlKey ? 'Ctrl+' : '',
          e.altKey ? 'Alt+' : '',
          e.shiftKey ? 'Shift+' : '',
          e.key
        ].join('');
        
        const isCriticalKey = keyCombo.includes('Tab') || keyCombo.includes('t') || keyCombo.includes('n');
        
        handleViolation(
          'Prohibited Keyboard Shortcut', 
          `Attempted to use prohibited keyboard shortcut: ${keyCombo}`,
          isCriticalKey
        );
      }
    };

    // Enhanced beforeunload handling
    const handleBeforeUnload = (e) => {
      const message = 'WARNING: Leaving this page will terminate your assessment and deactivate the link permanently.';
      e.returnValue = message;
      
      handleViolation(
        'Page Unload Attempt',
        'Attempted to close or navigate away from assessment page',
        true
      );
      
      return message;
    };

    const handleUnload = () => {
      console.log('Page unload detected - terminating test');
      terminateTestAndDeactivateLink({
        reason: 'Page Closed/Navigated Away',
        violations: violations,
        warningCount: warningCount
      });
    };

    // Multi-tab detection using BroadcastChannel
    const channel = new BroadcastChannel(`test_session_${linkId}`);
    const sessionId = `${linkId}_${Date.now()}`;
    
    channel.postMessage({ 
      type: 'SESSION_START', 
      sessionId, 
      linkId, 
      candidateName,
      timestamp: new Date().toISOString()
    });
    
    const handleChannelMessage = (event) => {
      if (event.data.type === 'SESSION_START' && event.data.sessionId !== sessionId && event.data.linkId === linkId) {
        console.log('Multiple test sessions detected for same link');
        handleViolation(
          'Multiple Test Sessions Detected',
          `Multiple test sessions detected for the same interview link - potential cheating attempt`,
          true
        );
      }
    };
    
    channel.addEventListener('message', handleChannelMessage);

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Periodic monitoring
    const monitoringInterval = setInterval(() => {
      // Check if link was deactivated externally
      if (LinkDeactivationManager.isLinkDeactivated(linkId)) {
        console.log('Link was deactivated externally');
        clearInterval(monitoringInterval);
        if (onLinkDeactivated) {
          onLinkDeactivated({
            reason: 'Link deactivated externally',
            linkId: linkId
          });
        }
        return;
      }

      // Check for suspicious patterns
      if (!document.hasFocus() && document.hidden) {
        console.log('Document hidden and not focused - monitoring...');
      }
    }, 2000);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      
      channel.removeEventListener('message', handleChannelMessage);
      channel.close();
      clearInterval(monitoringInterval);
      
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
      if (terminationTimeoutRef.current) {
        clearTimeout(terminationTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isTestActive, warningCount, violations, candidateName, testTitle, linkId]);

  const dismissViolation = () => {
    if (!isTerminating) {
      setShowViolationModal(false);
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
        violationTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!isTestActive) {
      checkNetwork();
    }
  }, [isTestActive]);

  // Enhanced Violation Modal
  const ViolationModal = () => {
    if (!showViolationModal || violations.length === 0) return null;
    
    const latestViolation = violations[violations.length - 1];
    const isTabSwitchViolation = latestViolation.type === 'Tab Switch/Window Switch Detected';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-98 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-2xl p-8 max-w-lg w-full text-center ${
          isTerminating ? 'border-4 border-red-500 animate-pulse' : 'border-4 border-orange-500'
        }`}>
          <div className="mb-6">
            {isTerminating ? (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={48} className="text-red-600" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={48} className="text-orange-600" />
              </div>
            )}
            
            <h2 className={`text-3xl font-bold mb-2 ${
              isTerminating ? 'text-red-800' : 'text-orange-800'
            }`}>
              {isTerminating ? 'TEST TERMINATION' : 'SECURITY VIOLATION'}
            </h2>
            
            <div className={`p-4 rounded-lg mb-4 ${
              isTerminating ? 'bg-red-50 border-2 border-red-200' : 'bg-orange-50 border-2 border-orange-200'
            }`}>
              <p className={`font-semibold text-lg ${
                isTerminating ? 'text-red-800' : 'text-orange-800'
              }`}>
                {latestViolation.type}
              </p>
              <p className={`text-sm mt-2 ${
                isTerminating ? 'text-red-600' : 'text-orange-600'
              }`}>
                {latestViolation.description}
              </p>
              <p className={`text-xs mt-2 font-mono ${
                isTerminating ? 'text-red-500' : 'text-orange-500'
              }`}>
                {latestViolation.timestamp}
              </p>
              {linkId && (
                <p className={`text-xs mt-1 font-mono ${
                  isTerminating ? 'text-red-400' : 'text-orange-400'
                }`}>
                  Session ID: {linkId.substring(0, 8)}...
                </p>
              )}
            </div>

            {isTerminating ? (
              <div className="space-y-4">
                <div className="bg-red-600 text-white p-4 rounded-lg">
                  <p className="text-2xl font-bold mb-2">
                    TERMINATING IN: {terminationCountdown}s
                  </p>
                  <p className="text-sm">
                    {isTabSwitchViolation 
                      ? 'Tab switching detected! Your assessment is being terminated immediately.'
                      : 'Your assessment is being terminated due to security violations.'
                    }
                    <br />The interview link has been permanently deactivated.
                  </p>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Violations Detected:</strong> {warningCount}/2
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All activity has been logged and reported to the administrator.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This link can never be used again.
                  </p>
                </div>
                
                <div className="w-full bg-red-200 rounded-full h-4">
                  <div 
                    className="bg-red-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-center"
                    style={{ width: `${((10 - (terminationCountdown || 0)) / 10) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {terminationCountdown > 0 ? terminationCountdown : ''}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`text-xl font-semibold flex items-center justify-center space-x-2 ${
                  warningCount >= 2 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  <Shield size={24} />
                  <span>Warning {warningCount}/2</span>
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <p className="text-yellow-800 text-lg font-bold">
                    FINAL WARNING
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    One more violation will result in immediate test termination 
                    and permanent link deactivation.
                  </p>
                  <p className="text-yellow-600 text-xs mt-2">
                    Please focus on the assessment and avoid any suspicious activities.
                  </p>
                </div>
                
                <button
                  onClick={dismissViolation}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 font-semibold text-lg"
                >
                  I Understand - Continue Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isTestActive) {
    return (
      <>
        {/* Enhanced Monitoring Indicators */}
        <div className="fixed top-4 right-4 z-40 space-y-2">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <Lock size={16} className="mr-2" />
            <span className="text-sm font-medium">Secure Mode Active</span>
            <div className="ml-2 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
          </div>
          
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <Eye size={16} className="mr-2" />
            <span className="text-sm font-medium">Anti-Cheat Monitor</span>
            <div className="ml-2 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          </div>

          {linkId && (
            <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
              ID: {linkId.substring(0, 8)}...
            </div>
          )}
        </div>

        {/* Violations Count */}
        {violations.length > 0 && (
          <div className="fixed top-4 left-4 z-40">
            <div className={`px-4 py-2 rounded-lg shadow-lg text-white ${
              warningCount >= 2 ? 'bg-red-600 animate-pulse' : 'bg-orange-600'
            }`}>
              <span className="text-sm font-medium">
                Violations: {warningCount}/2 
                {warningCount >= 2 && ' - CRITICAL'}
              </span>
            </div>
          </div>
        )}

        {/* Security Warning Banner */}
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-3 text-center text-sm z-40">
          <div className="max-w-4xl mx-auto">
            <strong>SECURE ASSESSMENT MODE:</strong> Do NOT switch tabs, open new windows, use shortcuts, or attempt to copy/paste. 
            Tab switching will result in immediate test termination and permanent link deactivation.
          </div>
        </div>

        <ViolationModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-6">
      <div className="text-center max-w-lg w-full">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            {isChecking ? (
              <div className="animate-spin mx-auto">
                <Wifi size={64} className="text-blue-400" />
              </div>
            ) : networkStatus === true ? (
              <div className="animate-bounce">
                <CheckCircle size={64} className="text-green-400 mx-auto" />
              </div>
            ) : networkStatus === false ? (
              <WifiOff size={64} className="text-red-400 mx-auto" />
            ) : (
              <Wifi size={64} className="text-gray-400 mx-auto" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Network Verification</h1>

          {isChecking && (
            <div>
              <p className="text-blue-300 mb-4">Checking network connectivity...</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {networkStatus === true && (
            <div className="space-y-4">
              <p className="text-green-400 text-lg">Connected to office network</p>
              <p className="text-gray-300">Initializing secure environment...</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {networkStatus === false && (
            <div className="space-y-6">
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-2">Access Denied</p>
                <p className="text-red-300 text-sm">Office network connection required</p>
              </div>
              
              <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  Please connect to the authorized office Wi-Fi network to access this secure interview platform.
                </p>
              </div>
              
              <button
                onClick={checkNetwork}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>

        {/* Security Features List */}
        <div className="mt-8 bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Shield size={20} className="mr-2" />
            Anti-Cheat Security Features
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Real-time tab switching detection
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Instant termination on violations
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Permanent link deactivation
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Multiple session prevention
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Keyboard shortcut blocking
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Copy/paste prevention
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
            <p className="text-red-300 text-xs font-semibold">
              WARNING: Tab switching will result in immediate test termination and permanent link deactivation
            </p>
          </div>

          {linkId && (
            <div className="mt-4 p-3 bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg">
              <p className="text-blue-300 text-xs">
                <strong>Session ID:</strong> {linkId}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                This session is monitored for security violations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenLock;