import React, { useState, useEffect } from 'react';
import { Eye, Users, Trash2, ArrowLeft, Calendar, User, Mail, Clock, Target, Award, CheckCircle, XCircle, AlertTriangle, Link2 } from 'lucide-react';
import { storage } from '../../utils/storage';

const InterviewHistory = ({ onSwitchToInventory, onSwitchToLinkGen }) => {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    setInterviews(storage.getInterviews());
  }, []);

  const viewDetails = (interview) => {
    setSelectedInterview(interview);
  };

  const deleteInterview = (index) => {
    if (storage.removeInterview) {
      storage.removeInterview(index);
    }
    const updatedInterviews = interviews.filter((_, i) => i !== index);
    setInterviews(updatedInterviews);
    setShowDeleteConfirm(null);
  };

  const confirmDelete = (index) => {
    setShowDeleteConfirm(index);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-teal-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-teal-50 border-teal-200';
    if (percentage >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight">
                  Interview History
                </h1>
                <p className="text-gray-600 text-sm">Review and manage completed interviews</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onSwitchToInventory}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <Target className="w-4 h-4" />
                Questions
              </button>
              <button
                onClick={onSwitchToLinkGen}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <Link2 className="w-4 h-4" />
                Generate Link
              </button>
            </div>
          </div>
        </div>

        {selectedInterview ? (
          /* Interview Details View */
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Details Header */}
            <div className="bg-teal-600 p-5 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">Interview Details - {selectedInterview.candidateName}</h2>
                    <p className="text-teal-100 flex items-center gap-2 text-sm mt-1">
                      <Mail className="w-4 h-4" />
                      {selectedInterview.candidateEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" />
                    Candidate Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-16">Name:</span>
                      <span className="text-gray-800">{selectedInterview.candidateName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-16">Email:</span>
                      <span className="text-gray-800">{selectedInterview.candidateEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-16">Completed:</span>
                      <span className="text-gray-800">{new Date(selectedInterview.completedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-teal-600" />
                    Test Results
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-16">Score:</span>
                      <span className={`font-semibold ${getScoreColor(selectedInterview.score, selectedInterview.totalPoints)}`}>
                        {selectedInterview.score}/{selectedInterview.totalPoints}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-16">Time Taken:</span>
                      <span className="text-gray-800">{selectedInterview.timeTaken}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-16">Questions:</span>
                      <span className="text-gray-800">{selectedInterview.answers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Answers Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  Answers
                </h3>
                <div className="space-y-4">
                  {selectedInterview.answers.map((answer, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                            {answer.question}
                          </p>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                            answer.isCorrect 
                              ? 'bg-teal-100 text-teal-700 border border-teal-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {answer.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {/* <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                            <p className="text-xs font-medium text-blue-800 mb-1">Answer:</p>
                            <p className="text-gray-800 text-sm">{answer.answer}</p>
                          </div>
                          
                          {answer.correctAnswer && (
                            <div className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-r-lg">
                              <p className="text-xs font-medium text-teal-800 mb-1">Correct Answer:</p>
                              <p className="text-gray-800 text-sm">{answer.correctAnswer}</p>
                            </div>
                          )} */}
                          
                          <div className="flex items-center justify-end">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                              {answer.points} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Interview List View */
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Completed Interviews ({interviews.length})</h2>
                  <p className="text-gray-300 text-sm">{interviews.length} interviews completed</p>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {interviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">No Completed Interviews</h3>
                  <p className="text-gray-500 text-sm">Completed interviews will appear here once candidates finish their tests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-teal-300">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {interview.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-800">{interview.candidateName}</h3>
                              <p className="text-gray-600 flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4" />
                                {interview.candidateEmail}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getScoreBg(interview.score, interview.totalPoints)} ${getScoreColor(interview.score, interview.totalPoints)}`}>
                                  Score: {interview.score}/{interview.totalPoints} ({Math.round((interview.score/interview.totalPoints)*100)}%)
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 text-xs">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(interview.completedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewDetails(interview)}
                              className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => confirmDelete(index)}
                              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                              title="Delete Interview"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="bg-red-600 p-4 text-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 text-sm mb-4">
                  Are you sure you want to delete the interview record for{' '}
                  <span className="font-semibold text-gray-800">
                    {interviews[showDeleteConfirm]?.candidateName}
                  </span>? This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteInterview(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;