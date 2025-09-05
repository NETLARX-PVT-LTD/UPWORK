import React, { useState, useEffect } from 'react';
import { Users, Clock, Building, Plus, ExternalLink, History, AlertCircle } from 'lucide-react';
import './App.css';

// Admin Components
import QuestionInventory from './components/admin/QuestionInventory';
import LinkGenerator from './components/admin/LinkGenerator';
import InterviewHistory from './components/admin/InterviewHistory';

// Candidate Components
import ScreenLock from './components/candidate/ScreenLock';
import TestInstructions from './components/candidate/TestInstructions';
import QuestionForm from './components/candidate/QuestionForm';
import ReportCard from './components/candidate/ReportCard';
import LinkDeactivated from './components/candidate/LinkDeactivated';

// Utils
import { storage } from './utils/storage';
import { LinkDeactivationManager } from './utils/linkDeactivation';

function App() {
  const [appState, setAppState] = useState('loading');
  const [view, setView] = useState('admin'); 
  const [adminView, setAdminView] = useState('history'); 
  const [candidateView, setCandidateView] = useState('screenlock'); 
  const [linkData, setLinkData] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testResults, setTestResults] = useState(null);

  // Handler for when link gets deactivated due to violations
  const handleLinkDeactivation = (terminationData) => {
    console.log('App: Link deactivation triggered', terminationData);
    
    // Update app state to show deactivated screen
    setAppState('deactivated');
    
    // Update the link data with termination info
    if (linkData) {
      setLinkData(prev => ({
        ...prev,
        status: 'terminated',
        terminatedAt: terminationData.terminatedAt || new Date().toISOString(),
        terminationReason: terminationData.reason,
        violations: terminationData.violations || []
      }));
    }
  };

  // Main test termination handler
  const handleTestTermination = (terminationData) => {
    console.log('App: Test termination received', terminationData);
    
    // Save the termination record
    if (terminationData.linkId) {
      try {
        const links = storage.getLinks();
        const updatedLinks = links.map(link => 
          link.id === terminationData.linkId 
            ? { 
                ...link, 
                status: 'terminated',
                terminatedAt: terminationData.terminatedAt || new Date().toISOString(),
                terminationReason: terminationData.reason,
                violations: terminationData.violations || [],
                completed: false
              }
            : link
        );
        storage.saveLinks(updatedLinks);
        console.log('App: Link status updated in storage');
      } catch (error) {
        console.error('App: Failed to update link status:', error);
      }
    }

    // Trigger deactivation UI
    handleLinkDeactivation(terminationData);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const interviewId = urlParams.get('interview');
    
    if (interviewId) {
      console.log('App: Interview ID detected:', interviewId);
      
      // First check if the link is deactivated
      if (LinkDeactivationManager.isLinkDeactivated(interviewId)) {
        console.log('App: Link is deactivated, showing deactivated screen');
        setAppState('deactivated');
        setView('candidate');
        
        // Try to get link data anyway for display purposes
        const links = storage.getLinks();
        const link = links.find(l => l.id === interviewId);
        if (link) {
          setLinkData(link);
        }
        return;
      }

      // Check if link exists and is valid
      const links = storage.getLinks();
      const link = links.find(l => l.id === interviewId);
      
      if (link) {
        console.log('App: Link found:', link);
        
        // Validate link access comprehensively
        const accessValidation = LinkDeactivationManager.validateLinkAccess(interviewId);
        
        if (accessValidation.valid) {
          console.log('App: Link access granted');
          setLinkData(link);
          setView('candidate');
          setAppState('network-check');
        } else {
          console.log('App: Link access denied:', accessValidation.reason);
          alert(`Access Denied: ${accessValidation.reason}`);
          setAppState('deactivated');
          setView('candidate');
          setLinkData(link);
        }
      } else {
        console.log('App: Link not found');
        alert('Invalid interview link - link not found');
        // Don't change the app state, stay on admin view
      }
    }
  }, []);

  const handleUnlock = () => {
    console.log('App: Network unlocked, showing instructions');
    setCandidateView('instructions');
  };

  const handleStartTest = (testData) => {
    console.log('App: Starting test with data:', testData);
    
    // Double-check link is still valid before starting test
    if (linkData && LinkDeactivationManager.isLinkDeactivated(linkData.id)) {
      console.log('App: Link was deactivated, cannot start test');
      setAppState('deactivated');
      return;
    }

    const allQuestions = storage.getQuestions();
    const selectedQuestions = allQuestions.filter(q => 
      linkData.selectedQuestions.includes(q.id)
    );
    setTestQuestions(selectedQuestions);
    setCandidateView('test');
  };

  const handleTestComplete = (results) => {
    console.log('App: Test completed with results:', results);
    
    storage.saveInterview(results);
    const links = storage.getLinks();
    const updatedLinks = links.map(link => 
      link.id === linkData.id ? { ...link, completed: true, status: 'completed' } : link
    );
    storage.saveLinks(updatedLinks);
    
    setTestResults(results);
    setCandidateView('results');
  };

  /** ------------------ ADMIN UI ------------------ **/
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo + Title */}
              <div className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Interview Management</h1>
                  <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-6">
                {/* Navigation Tabs */}
                <nav className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setAdminView('inventory')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      adminView === 'inventory'
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Questions</span>
                  </button>
                  
                  <button
                    onClick={() => setAdminView('links')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      adminView === 'links'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Links</span>
                  </button>

                  <button
                    onClick={() => setAdminView('history')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      adminView === 'history'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </button>
                </nav>

                {/* Date + User */}
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="relative group">
                    <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full mx-auto ">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 min-h-[600px]">
            {adminView === 'inventory' && <QuestionInventory onSwitchToLinkGen={() => setAdminView('links')} />}
            {adminView === 'links' && <LinkGenerator onSwitchToInventory={() => setAdminView('inventory')} onSwitchToHistory={() => setAdminView('history')} />}
            {adminView === 'history' && <InterviewHistory onSwitchToInventory={() => setAdminView('inventory')} onSwitchToLinkGen={() => setAdminView('links')} />}
          </div>
        </main>
      </div>
    );
  }

  /** ------------------ CANDIDATE UI ------------------ **/
  if (view === 'candidate') {
    // Show deactivated screen
    if (appState === 'deactivated') {
      return <DeactivatedLinkScreen linkData={linkData} />;
    }

    if (candidateView === 'screenlock') {
      return (
        <ScreenLock 
          onUnlock={handleUnlock} 
          onTestTerminate={handleTestTermination}
          onLinkDeactivated={handleLinkDeactivation}
          isTestActive={false}
          candidateName={linkData?.candidateName}
          testTitle="Technical Assessment"
          linkId={linkData?.id}
          linkData={linkData}
        />
      );
    }

    if (candidateView === 'instructions') {
      return (
        <TestInstructions 
          linkData={linkData} 
          onStartTest={handleStartTest}
          onTestTerminate={handleTestTermination}
          onLinkDeactivated={handleLinkDeactivation}
        />
      );
    }

    if (candidateView === 'test') {
      return (
        <QuestionForm 
          linkData={linkData} 
          questions={testQuestions} 
          onComplete={handleTestComplete}
          onTestTerminate={handleTestTermination}
          onLinkDeactivated={handleLinkDeactivation}
        />
      );
    }

    if (candidateView === 'results') {
      return <ReportCard results={testResults} />;
    }

    if (candidateView === 'deactivated') {
      return <DeactivatedLinkScreen linkData={linkData} />;
    }
  }

  return null;
}

// Component for deactivated link screen
const DeactivatedLinkScreen = ({ linkData }) => {
  const terminationDetails = linkData 
    ? LinkDeactivationManager.getTerminationDetails(linkData.id)
    : [];
  const latestTermination = terminationDetails.length > 0 
    ? terminationDetails[terminationDetails.length - 1] 
    : null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Interview Link Deactivated
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold mb-2">
              Access Permanently Revoked
            </p>
            <p className="text-red-600 text-sm">
              This interview link has been permanently deactivated due to security violations detected during the assessment.
            </p>
          </div>

          {latestTermination && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Termination Details:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Reason:</strong> {latestTermination.reason}</p>
                <p><strong>Time:</strong> {new Date(latestTermination.timestamp).toLocaleString()}</p>
                {latestTermination.candidateName && (
                  <p><strong>Candidate:</strong> {latestTermination.candidateName}</p>
                )}
                {latestTermination.violations && latestTermination.violations.length > 0 && (
                  <p><strong>Violations:</strong> {latestTermination.violations.length} security violation(s) detected</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>What this means:</strong>
            </p>
            <ul className="text-yellow-700 text-sm mt-2 text-left list-disc list-inside">
              <li>This link can never be used again</li>
              <li>All test attempts are permanently blocked</li>
              <li>The violation has been logged and reported</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500 space-y-2">
            <p>Contact your HR representative or the assessment administrator for assistance.</p>
            {linkData?.id && (
              <p className="font-mono text-xs">
                Link ID: {linkData.id.substring(0, 8)}...
              </p>
            )}
          </div>
          
          <button
            onClick={() => window.close()}
            className="mt-6 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;