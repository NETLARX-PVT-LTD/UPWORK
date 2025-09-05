import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, User, Shield, ChevronLeft, ChevronRight, Eye, Lock, AlertCircle, Timer } from 'lucide-react';
import { LinkDeactivationManager } from '../../utils/linkDeactivation';

const QuestionForm = ({ linkData, questions, onComplete, onTestTerminate, onLinkDeactivated }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(linkData.timeLimit * 60);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Security monitoring states
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationCountdown, setTerminationCountdown] = useState(null);
  
  // Security refs
  const violationTimeoutRef = useRef(null);
  const terminationTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const testActiveTabRef = useRef(false);
  const hasTriggeredTerminationRef = useRef(false);
  const testStartTimeRef = useRef(Date.now());

  // Enhanced termination handler that deactivates the link
  const terminateTestAndDeactivateLink = (terminationData) => {
    if (hasTriggeredTerminationRef.current) {
      console.log('Termination already in progress, ignoring duplicate call');
      return;
    }

    hasTriggeredTerminationRef.current = true;
    
    const testDuration = Date.now() - testStartTimeRef.current;

    const finalTerminationData = {
      linkId: linkData.id,
      candidateName: linkData.candidateDetails?.name || linkData.candidateName,
      testTitle: 'Technical Assessment',
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

    // Immediately deactivate the link
    const deactivationSuccess = LinkDeactivationManager.deactivateLink(linkData.id, finalTerminationData);
    
    if (deactivationSuccess) {
      console.log('Link successfully deactivated');
    } else {
      console.error('Failed to deactivate link');
    }

    // Call parent handlers
    if (onTestTerminate) {
      try {
        onTestTerminate(finalTerminationData);
      } catch (error) {
        console.error('Error calling onTestTerminate:', error);
      }
    }

    if (onLinkDeactivated) {
      try {
        onLinkDeactivated(finalTerminationData);
      } catch (error) {
        console.error('Error calling onLinkDeactivated:', error);
      }
    }

    // Clear session data
    try {
      sessionStorage.clear();
      localStorage.removeItem('active_test_link_id');
      localStorage.removeItem('test_candidate');
      localStorage.removeItem('test_start_time');
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }

    // Show termination alert and close
    setTimeout(() => {
      alert(`TEST TERMINATED\n\nThis assessment has been terminated due to security violations.\nThe link has been permanently deactivated.\n\nReason: ${finalTerminationData.reason}\nTime: ${new Date().toLocaleString()}`);
      
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

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load current answer when question changes
  useEffect(() => {
    setCurrentAnswer(answers[currentQuestion] || '');
  }, [currentQuestion, answers]);

  // Enhanced security violation handler
  const handleViolation = (type, description, isCritical = false) => {
    // Check if link is already deactivated
    if (linkData.id && LinkDeactivationManager.isLinkDeactivated(linkData.id)) {
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
      fullTimestamp: new Date().toISOString(),
      linkId: linkData.id,
      candidateName: linkData.candidateDetails?.name || linkData.candidateName
    };

    console.log('Security violation detected:', violation);

    setViolations(prev => [...prev, violation]);
    const newWarningCount = warningCount + 1;
    setWarningCount(newWarningCount);
    setShowViolationModal(true);

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
    }

    // For tab switching (critical) or 2+ warnings, terminate immediately
    if (type === 'Tab Switch Detected' || isCritical || newWarningCount >= 2) {
      console.log('Critical violation or max warnings reached - terminating');
      setIsTerminating(true);
      startTerminationCountdown(violation);
    } else {
      violationTimeoutRef.current = setTimeout(() => {
        setShowViolationModal(false);
      }, 8000);
    }

    // Log violation for audit
    try {
      const existingViolations = JSON.parse(localStorage.getItem('test_violations') || '[]');
      existingViolations.push(violation);
      localStorage.setItem('test_violations', JSON.stringify(existingViolations));
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  };

  const startTerminationCountdown = (violation) => {
    setTerminationCountdown(10);
    
    countdownIntervalRef.current = setInterval(() => {
      setTerminationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          terminateTestAndDeactivateLink({
            reason: violation.type === 'Tab Switch Detected' || violation.isCritical 
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

    terminationTimeoutRef.current = setTimeout(() => {
      terminateTestAndDeactivateLink({
        reason: violation.type === 'Tab Switch Detected' || violation.isCritical
          ? 'Critical Security Violation: Tab Switching Detected'
          : 'Multiple Security Violations',
        violations: [...violations, violation],
        primaryViolation: violation,
        warningCount: warningCount + 1
      });
    }, 10000);
  };

  // Enhanced security monitoring effect
  useEffect(() => {
    console.log('Starting enhanced security monitoring for linkId:', linkData.id);
    
    // Check if link is already deactivated
    if (linkData.id && LinkDeactivationManager.isLinkDeactivated(linkData.id)) {
      console.log('Link is already deactivated');
      if (onLinkDeactivated) {
        onLinkDeactivated({
          reason: 'Link was previously deactivated',
          linkId: linkData.id
        });
      }
      return;
    }

    let focusLostTime = null;
    testActiveTabRef.current = true;
    let tabSwitchDetected = false;

    // CRITICAL: Enhanced tab switching detection
    const handleVisibilityChange = () => {
      if (document.hidden && !tabSwitchDetected) {
        tabSwitchDetected = true;
        console.log('CRITICAL: Tab switch detected - immediate termination');
        handleViolation(
          'Tab Switch Detected', 
          `Candidate switched to another tab/window at ${new Date().toLocaleTimeString()} - CRITICAL VIOLATION`,
          true // Critical - immediate termination
        );
      }
    };

    const handleBlur = () => {
      console.log('Window blur detected');
      if (document.hidden && !tabSwitchDetected) {
        tabSwitchDetected = true;
        console.log('Window focus lost with tab hidden - treating as tab switch');
        handleViolation(
          'Tab Switch Detected',
          `Browser window lost focus and tab became hidden at ${new Date().toLocaleTimeString()} - CRITICAL VIOLATION`,
          true
        );
      } else if (!focusLostTime) {
        focusLostTime = Date.now();
        setTimeout(() => {
          if (focusLostTime && Date.now() - focusLostTime > 3000) {
            handleViolation(
              'Window Focus Lost', 
              'Browser window lost focus for extended period',
              false
            );
          }
        }, 3000);
      }
    };

    const handleFocus = () => {
      console.log('Window focus gained');
      focusLostTime = null;
    };

    const handlePageShow = (event) => {
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
          'Tab Switch Detected',
          `Page became hidden at ${new Date().toLocaleTimeString()} - possible tab switch`,
          true
        );
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleViolation(
        'Right Click Detected', 
        'Attempted to open context menu during assessment',
        false
      );
    };

    const handleKeyDown = (e) => {
      const prohibitedKeys = [
        { key: 'F12' },
        { ctrl: true, shift: true, key: 'I' },
        { ctrl: true, shift: true, key: 'i' },
        { ctrl: true, key: 'U' },
        { ctrl: true, key: 'u' },
        { ctrl: true, shift: true, key: 'C' },
        { ctrl: true, shift: true, key: 'c' },
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'j' },
        { alt: true, key: 'Tab' }, // CRITICAL
        { ctrl: true, key: 'Tab' }, // CRITICAL
        { ctrl: true, shift: true, key: 'Tab' }, // CRITICAL
        { ctrl: true, key: 'R' },
        { ctrl: true, key: 'r' },
        { key: 'F5' },
        { ctrl: true, key: 'F5' },
        { ctrl: true, shift: true, key: 'R' },
        { ctrl: true, shift: true, key: 'r' },
        { ctrl: true, key: 'W' },
        { ctrl: true, key: 'w' },
        { ctrl: true, key: 'T' }, // CRITICAL
        { ctrl: true, key: 't' }, // CRITICAL
        { ctrl: true, key: 'N' }, // CRITICAL
        { ctrl: true, key: 'n' }, // CRITICAL
        { ctrl: true, shift: true, key: 'N' }, // CRITICAL
        { ctrl: true, shift: true, key: 'n' }, // CRITICAL
      ];

      const isProhibited = prohibitedKeys.some(combo => {
        return (!combo.ctrl || e.ctrlKey) &&
               (!combo.shift || e.shiftKey) &&
               (!combo.alt || e.altKey) &&
               (e.key === combo.key || e.code === combo.key);
      });

      if (isProhibited) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const keyCombo = [
          e.ctrlKey ? 'Ctrl+' : '',
          e.altKey ? 'Alt+' : '',
          e.shiftKey ? 'Shift+' : '',
          e.key
        ].join('');
        
        const isCriticalKey = keyCombo.includes('Tab') || keyCombo.includes('t') || keyCombo.includes('n');
        
        handleViolation(
          'Prohibited Shortcut', 
          `Attempted to use prohibited keyboard shortcut: ${keyCombo}`,
          isCriticalKey
        );
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
      handleViolation(
        'Copy Attempt Detected',
        'Attempted to copy content during assessment',
        false
      );
    };

    const handlePaste = (e) => {
      e.preventDefault();
      handleViolation(
        'Paste Attempt Detected',
        'Attempted to paste content during assessment - may indicate external assistance',
        true
      );
    };

    const handleBeforeUnload = (e) => {
      const message = 'WARNING: Leaving this page will terminate your assessment and deactivate the link permanently.';
      e.preventDefault();
      e.returnValue = message;
      
      handleViolation(
        'Page Exit Attempt',
        'Attempted to leave or refresh the page during test',
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

    const preventDragDrop = (e) => {
      e.preventDefault();
      handleViolation(
        'Drag & Drop Detected',
        'Attempted drag and drop operation',
        false
      );
    };

    const preventSelection = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // Multi-tab detection using BroadcastChannel
    const channel = new BroadcastChannel(`test_session_${linkData.id}`);
    const sessionId = `${linkData.id}_${Date.now()}`;
    
    channel.postMessage({ 
      type: 'SESSION_START', 
      sessionId, 
      linkId: linkData.id, 
      candidateName: linkData.candidateDetails?.name || linkData.candidateName,
      timestamp: new Date().toISOString()
    });
    
    const handleChannelMessage = (event) => {
      if (event.data.type === 'SESSION_START' && 
          event.data.sessionId !== sessionId && 
          event.data.linkId === linkData.id) {
        console.log('Multiple test sessions detected for same link');
        handleViolation(
          'Multiple Test Sessions Detected',
          'Multiple test sessions detected for the same interview link - potential cheating attempt',
          true
        );
      }
    };
    
    channel.addEventListener('message', handleChannelMessage);

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: false });
    window.addEventListener('blur', handleBlur, { passive: false });
    window.addEventListener('focus', handleFocus, { passive: false });
    window.addEventListener('pageshow', handlePageShow, { passive: false });
    window.addEventListener('pagehide', handlePageHide, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    document.addEventListener('keydown', handleKeyDown, { passive: false, capture: true });
    document.addEventListener('copy', handleCopy, { passive: false });
    document.addEventListener('paste', handlePaste, { passive: false });
    window.addEventListener('beforeunload', handleBeforeUnload, { passive: false });
    window.addEventListener('unload', handleUnload, { passive: false });
    document.addEventListener('dragover', preventDragDrop, { passive: false });
    document.addEventListener('drop', preventDragDrop, { passive: false });
    document.addEventListener('selectstart', preventSelection, { passive: false });

    // Periodic monitoring
    const monitoringInterval = setInterval(() => {
      // Check if link was deactivated externally
      if (LinkDeactivationManager.isLinkDeactivated(linkData.id)) {
        console.log('Link was deactivated externally');
        clearInterval(monitoringInterval);
        if (onLinkDeactivated) {
          onLinkDeactivated({
            reason: 'Link deactivated externally',
            linkId: linkData.id
          });
        }
        return;
      }

      // Update last activity timestamp
      window.testLastActivity = Date.now();
    }, 2000);

    // Cleanup
    return () => {
      console.log('Cleaning up security monitoring...');
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('dragover', preventDragDrop);
      document.removeEventListener('drop', preventDragDrop);
      document.removeEventListener('selectstart', preventSelection);
      
      channel.removeEventListener('message', handleChannelMessage);
      channel.close();
      clearInterval(monitoringInterval);
      testActiveTabRef.current = false;
      window.testLastActivity = null;
      
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
  }, [warningCount, violations, linkData, onTestTerminate, onLinkDeactivated]);

  const dismissViolation = () => {
    if (!isTerminating) {
      setShowViolationModal(false);
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
        violationTimeoutRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds) => {
    const totalTime = linkData.timeLimit * 60;
    const percentage = seconds / totalTime;
    
    if (percentage > 0.5) return 'text-teal-600';
    if (percentage > 0.25) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTimeBackgroundColor = (seconds) => {
    const totalTime = linkData.timeLimit * 60;
    const percentage = seconds / totalTime;
    
    if (percentage > 0.5) return 'bg-teal-50 border-teal-200';
    if (percentage > 0.25) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const handleNext = () => {
    // Check if link is still active before proceeding
    if (linkData.id && LinkDeactivationManager.isLinkDeactivated(linkData.id)) {
      if (onLinkDeactivated) {
        onLinkDeactivated({
          reason: 'Link deactivated during test',
          linkId: linkData.id
        });
      }
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion]: currentAnswer
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrevious = () => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: currentAnswer
    };
    setAnswers(newAnswers);

    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = (finalAnswers = answers) => {
    if (isSubmitting) return;
    
    // Final check if link is still active
    if (linkData.id && LinkDeactivationManager.isLinkDeactivated(linkData.id)) {
      if (onLinkDeactivated) {
        onLinkDeactivated({
          reason: 'Link deactivated during completion',
          linkId: linkData.id
        });
      }
      return;
    }

    setIsSubmitting(true);
    
    const results = questions.map((question, index) => {
      const userAnswer = finalAnswers[index] || '';
      let isCorrect = false;
      
      if (question.type === 'mcq' || question.type === 'boolean' || question.type === 'reading-comprehension' || question.type === 'quantitative') {
        isCorrect = userAnswer === question.correctAnswer;
      }

      return {
        question: question.question,
        passage: question.passage || '',
        answer: userAnswer,
        correctAnswer: question.correctAnswer || '',
        options: question.options || [],
        isCorrect,
        points: isCorrect ? question.points : 0,
        type: question.type,
        category: question.category || 'general'
      };
    });

    const score = results.reduce((sum, result) => sum + result.points, 0);
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const timeTaken = `${Math.floor((linkData.timeLimit * 60 - timeLeft) / 60)}:${((linkData.timeLimit * 60 - timeLeft) % 60).toString().padStart(2, '0')}`;

    onComplete({
      candidateName: linkData.candidateDetails?.name || linkData.candidateName,
      candidateEmail: linkData.candidateDetails?.email || linkData.candidateEmail,
      candidateDetails: linkData.candidateDetails,
      answers: results,
      score,
      totalPoints,
      timeTaken,
      completedAt: new Date().toISOString()
    });
  };

  const handleConfirmSubmit = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestion]: currentAnswer
    };
    setShowConfirmModal(false);
    handleComplete(finalAnswers);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => answers[key] && answers[key].trim()).length;
  const currentAnswerProvided = currentAnswer && currentAnswer.trim();

  // Enhanced Security Violation Modal
  const ViolationModal = () => {
    if (!showViolationModal || violations.length === 0) return null;
    
    const latestViolation = violations[violations.length - 1];
    const isTabSwitchViolation = latestViolation.type === 'Tab Switch Detected';

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-6 transition-opacity duration-300">
        <div className={`bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-2 ${
          isTerminating ? 'border-red-500 animate-pulse' : 'border-amber-400'
        } transform transition-all duration-300 scale-100`}>
          <div className="mb-6">
            {isTerminating ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-amber-600" />
              </div>
            )}
            
            <h2 className={`text-2xl font-bold mb-4 tracking-tight ${
              isTerminating ? 'text-red-800' : 'text-amber-800'
            }`}>
              {isTerminating ? 'TEST TERMINATION' : 'SECURITY VIOLATION'}
            </h2>
            
            <div className={`p-5 rounded-xl mb-6 border ${
              isTerminating ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <p className={`font-semibold text-lg mb-2 ${
                isTerminating ? 'text-red-800' : 'text-amber-800'
              }`}>
                {latestViolation.type}
              </p>
              <p className={`text-sm mb-2 ${
                isTerminating ? 'text-red-600' : 'text-amber-600'
              }`}>
                {latestViolation.description}
              </p>
              <p className={`text-xs font-mono ${
                isTerminating ? 'text-red-500' : 'text-amber-500'
              }`}>
                Time: {latestViolation.timestamp}
              </p>
              {linkData.id && (
                <p className={`text-xs mt-1 font-mono ${
                  isTerminating ? 'text-red-400' : 'text-amber-400'
                }`}>
                  Session: {linkData.id.substring(0, 8)}...
                </p>
              )}
            </div>

            {isTerminating ? (
              <div className="space-y-4">
                <div className="bg-red-600 text-white p-5 rounded-xl shadow-md">
                  <p className="text-xl font-bold mb-2">
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
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Total Violations:</strong> {warningCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    All activity has been logged and reported.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This link can never be used again.
                  </p>
                </div>
                
                <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - (terminationCountdown || 0)) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`text-lg font-semibold flex items-center justify-center space-x-2 ${
                  warningCount >= 2 ? 'text-red-600' : 'text-amber-600'
                }`}>
                  <Shield size={20} />
                  <span>Warning {warningCount}/2</span>
                </div>
                
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <p className="text-amber-800 text-sm font-semibold mb-1">
                    {warningCount === 1 ? 'FINAL WARNING' : 'Security Alert'}
                  </p>
                  <p className="text-amber-700 text-xs">
                    {warningCount === 1 
                      ? 'One more violation will result in immediate test termination and permanent link deactivation.'
                      : 'Follow test security protocols to avoid termination.'
                    }
                  </p>
                </div>
                
                <button
                  onClick={dismissViolation}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 font-medium transition-all duration-200 transform hover:scale-105"
                >
                  I Understand - Continue Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Modal
  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-6 transition-opacity duration-300">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200 transform transition-all duration-300 scale-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">Submit Assessment?</h2>
          <p className="text-gray-600 text-sm">
            You are about to submit your interview assessment. This action cannot be undone.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{questions.length}</div>
              <div className="text-xs text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-teal-600">{answeredCount + (currentAnswerProvided ? 1 : 0)}</div>
              <div className="text-xs text-gray-600">Answered</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Continue Test
          </button>
          <button
            onClick={handleConfirmSubmit}
            className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all duration-200 text-sm font-medium"
          >
            Submit Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Secure Assessment</div>
                  <div className="text-xs text-gray-500">Anti-Cheat Active</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>{linkData.candidateDetails?.name || linkData.candidateName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm text-gray-600">
                <div>Question {currentQuestion + 1} of {questions.length}</div>
                <div className="text-xs text-gray-500">{Math.round(progress)}% Complete</div>
              </div>
              <div className={`px-4 py-2 rounded-lg border ${getTimeBackgroundColor(timeLeft)} shadow-sm`}>
                <div className="flex items-center space-x-2">
                  <Timer size={16} className={getTimeColor(timeLeft)} />
                  <div className={`text-lg font-semibold ${getTimeColor(timeLeft)}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="text-xs text-center text-gray-500">Time Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Monitoring Indicators */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-md flex items-center">
          <Lock size={14} className="mr-2" />
          <span className="text-xs font-medium">Test Secured</span>
          <div className="ml-2 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
        </div>
        <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md flex items-center">
          <Eye size={14} className="mr-2" />
          <span className="text-xs font-medium">AI Monitoring</span>
          <div className="ml-2 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
        {linkData.id && (
          <div className="bg-gray-600 text-white px-3 py-1 rounded text-xs">
            ID: {linkData.id.substring(0, 8)}...
          </div>
        )}
      </div>

      {/* Violations Counter */}
      {violations.length > 0 && (
        <div className="fixed top-4 left-4 z-40">
          <div className={`px-4 py-2 rounded-lg shadow-md text-white ${
            warningCount >= 2 ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
          }`}>
            <span className="text-xs font-medium">
              Violations: {warningCount}/2
              {warningCount >= 2 && ' - CRITICAL'}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Interview Assessment</h1>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`text-lg font-semibold ${getTimeColor(timeLeft)}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Time Remaining
                </div>
              </div>
              {timeLeft <= 300 && (
                <div className="flex items-center text-red-600 text-xs font-medium">
                  <AlertTriangle size={14} className="mr-1" />
                  Low Time!
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Answered: {answeredCount}</span>
              <span>Remaining: {questions.length - answeredCount - (currentAnswerProvided ? 1 : 0)}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                question.type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                question.type === 'boolean' ? 'bg-green-100 text-green-700' :
                question.type === 'reading-comprehension' ? 'bg-purple-100 text-purple-700' :
                question.type === 'quantitative' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {question.type === 'mcq' ? 'Multiple Choice' :
                 question.type === 'boolean' ? 'True/False' :
                 question.type === 'reading-comprehension' ? 'Reading Comprehension' :
                 question.type === 'quantitative' ? 'Quantitative Aptitude' :
                 'Text Response'}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {question.points} point{question.points > 1 ? 's' : ''}
              </span>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">#{currentQuestion + 1}</div>
            </div>

            {(question.type === 'reading-comprehension' && question.passage) && (
              <div className="mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Reading Passage</h3>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {question.passage}
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-lg font-medium text-gray-800 leading-relaxed mb-2">
              {question.question}
            </h2>
            
            {question.description && (
              <p className="text-gray-600 text-sm">
                {question.description}
              </p>
            )}
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            {question.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                  rows="6"
                  placeholder="Type your detailed answer here..."
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Be specific and detailed</span>
                  <span>{currentAnswer.length} characters</span>
                </div>
              </div>
            )}

            {(question.type === 'mcq' || question.type === 'reading-comprehension' || question.type === 'quantitative') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select the best answer:
                </label>
                <div className="space-y-2">
                  {question.options && question.options.filter(opt => opt.trim()).map((option, index) => (
                    <label 
                      key={index} 
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        currentAnswer === option 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mcq-answer"
                        value={option}
                        checked={currentAnswer === option}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        className="mr-3 mt-1 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex items-center">
                        <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-2">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-gray-800 text-sm">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {question.type === 'boolean' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose True or False:
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    currentAnswer === 'true' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="boolean-answer"
                      value="true"
                      checked={currentAnswer === 'true'}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold mr-2">
                        T
                      </span>
                      <span className="text-gray-800 text-sm font-medium">True</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    currentAnswer === 'false' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="boolean-answer"
                      value="false"
                      checked={currentAnswer === 'false'}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-semibold mr-2">
                        F
                      </span>
                      <span className="text-gray-800 text-sm font-medium">False</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {currentAnswerProvided ? '✓ Answer saved' : 'No answer yet'}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0 || isSubmitting}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentQuestion === 0 || isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : 
                 currentQuestion < questions.length - 1 ? (
                   <>
                     Next Question
                     <ChevronRight size={16} className="ml-1" />
                   </>
                 ) : 'Complete Assessment'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Guidelines */}
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            Critical Security Notice
          </h3>
          <ul className="text-red-700 text-xs space-y-1">
            <li>• <strong>Tab switching will result in immediate test termination</strong></li>
            <li>• Do not open new windows or use keyboard shortcuts</li>
            <li>• Avoid right-click or copy/paste operations</li>
            <li>• Keep this window in focus at all times</li>
            <li>• Your progress is automatically saved</li>
          </ul>
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800 text-xs font-semibold">
              ⚠️ WARNING: Security violations will permanently deactivate this interview link
            </p>
          </div>
        </div>
      </div>

      {/* Security Warning Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-xs font-medium z-40 shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <Shield size={14} />
          <span>SECURE MODE: Tab switching will result in immediate test termination and permanent link deactivation</span>
          <Shield size={14} />
        </div>
      </div>

      {/* Modals */}
      {showViolationModal && <ViolationModal />}
      {showConfirmModal && <ConfirmationModal />}
    </div>
  );
};

export default QuestionForm;