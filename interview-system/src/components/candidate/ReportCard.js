// report card component
import React, { useState, useRef } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Trophy, Target, BookOpen, ChevronDown, ChevronUp, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportCard = ({ results, companyName }) => {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [activeTab, setActiveTab] = useState('summary');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef(null);
  
  const percentage = Math.round((results.score / results.totalPoints) * 100);
  const correctAnswers = results.answers.filter(answer => answer.isCorrect).length;
  const totalQuestions = results.answers.length;

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (percentage >= 60) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (percentage >= 50) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const gradeInfo = getGradeInfo(percentage);

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return '📋';
      case 'boolean': return '✓✗';
      case 'text': return '📝';
      case 'reading-comprehension': return '📖';
      case 'quantitative': return '🔢';
      default: return '❓';
    }
  };

  // Enhanced PDF generation with better formatting and complete content
  const downloadDetailedPdf = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add a new page if needed
      const addPageIfNeeded = (requiredHeight) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrapping
      const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.4); // Approximate line height
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      if (companyName) {
        pdf.text(companyName, pageWidth/2, yPosition, { align: 'center' });
        yPosition += 10;
      }
      
      pdf.setFontSize(16);
      pdf.text('Interview Assessment Report', pageWidth/2, yPosition, { align: 'center' });
      yPosition += 15;

      // Candidate Information
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Candidate Information', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Name: ${results.candidateName}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Email: ${results.candidateEmail}`, margin, yPosition);
      yPosition += 6;
      if (results.candidateDetails?.phone) {
        pdf.text(`Phone: ${results.candidateDetails.phone}`, margin, yPosition);
        yPosition += 6;
      }
      if (results.candidateDetails?.experience) {
        pdf.text(`Experience: ${results.candidateDetails.experience} years`, margin, yPosition);
        yPosition += 6;
      }
      if (results.candidateDetails?.position) {
        pdf.text(`Position: ${results.candidateDetails.position}`, margin, yPosition);
        yPosition += 6;
      }
      pdf.text(`Completed: ${new Date(results.completedAt).toLocaleString()}`, margin, yPosition);
      pdf.text(`Time Taken: ${results.timeTaken}`, margin + 100, yPosition);
      yPosition += 12;

      // Performance Summary
      addPageIfNeeded(40);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Performance Summary', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Create a summary box
      pdf.rect(margin, yPosition, contentWidth, 35);
      yPosition += 8;
      
      pdf.text(`Overall Grade: ${gradeInfo.grade} (${percentage}%)`, margin + 5, yPosition);
      pdf.text(`Points Scored: ${results.score} / ${results.totalPoints}`, margin + 100, yPosition);
      yPosition += 6;
      
      pdf.text(`Questions Correct: ${correctAnswers} / ${totalQuestions}`, margin + 5, yPosition);
      pdf.text(`Accuracy: ${Math.round((correctAnswers / totalQuestions) * 100)}%`, margin + 100, yPosition);
      yPosition += 6;
      
      // Question type breakdown
      const mcqCount = results.answers.filter(a => a.type === 'mcq').length;
      const textCount = results.answers.filter(a => a.type === 'text').length;
      const booleanCount = results.answers.filter(a => a.type === 'boolean').length;
      const readingCount = results.answers.filter(a => a.type === 'reading-comprehension').length;
      const quantCount = results.answers.filter(a => a.type === 'quantitative').length;
      
      pdf.text(`Question Types - MCQ: ${mcqCount}, Text: ${textCount}, Boolean: ${booleanCount}`, margin + 5, yPosition);
      yPosition += 6;
      if (readingCount > 0 || quantCount > 0) {
        pdf.text(`Reading: ${readingCount}, Quantitative: ${quantCount}`, margin + 5, yPosition);
        yPosition += 6;
      }
      
      yPosition += 15;

      // Detailed Question Review
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Detailed Question Review', margin, yPosition);
      yPosition += 10;

      results.answers.forEach((answer, index) => {
        // Check if we need a new page for this question
        addPageIfNeeded(60);
        
        // Question header
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        const questionHeader = `Question ${index + 1} ${getQuestionTypeIcon(answer.type)} - ${answer.isCorrect ? 'CORRECT' : 'INCORRECT'} (${answer.points} pts)`;
        pdf.text(questionHeader, margin, yPosition);
        yPosition += 8;

        // Question text
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const questionHeight = addWrappedText(`Q: ${answer.question}`, margin, yPosition, contentWidth, 10);
        yPosition += questionHeight + 4;

        // Show passage for reading comprehension
        if (answer.passage) {
          addPageIfNeeded(30);
          pdf.setFont(undefined, 'italic');
          pdf.text('Reading Passage:', margin, yPosition);
          yPosition += 5;
          const passageHeight = addWrappedText(answer.passage, margin, yPosition, contentWidth, 9);
          yPosition += passageHeight + 4;
        }

        // Candidate's answer
        addPageIfNeeded(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('Your Answer:', margin, yPosition);
        yPosition += 5;
        pdf.setFont(undefined, 'normal');
        const answerText = answer.answer || 'No answer provided';
        const answerHeight = addWrappedText(answerText, margin, yPosition, contentWidth, 10);
        yPosition += answerHeight + 4;

        // Correct answer (if not text type)
        if (answer.correctAnswer && answer.type !== 'text') {
          pdf.setFont(undefined, 'bold');
          pdf.text('Correct Answer:', margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, 'normal');
          const correctHeight = addWrappedText(answer.correctAnswer, margin, yPosition, contentWidth, 10);
          yPosition += correctHeight + 4;
        }

        // Show options for MCQ questions
        if (answer.options && answer.options.length > 0) {
          addPageIfNeeded(20);
          pdf.setFont(undefined, 'bold');
          pdf.text('Options:', margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, 'normal');
          answer.options.forEach((option, optIndex) => {
            if (option.trim()) {
              const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`;
              const optionHeight = addWrappedText(optionText, margin + 5, yPosition, contentWidth - 5, 9);
              yPosition += optionHeight + 2;
            }
          });
          yPosition += 2;
        }

        // Result indicator
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        if (answer.isCorrect) {
          pdf.text(`✓ CORRECT (+${answer.points} points)`, margin, yPosition);
        } else {
          pdf.text(`✗ INCORRECT (0 points)`, margin, yPosition);
        }
        yPosition += 10;

        // Add separator line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      });

      // Footer
      addPageIfNeeded(20);
      yPosition += 10;
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Assessment ID: #${Date.now().toString().slice(-6)}`, margin, yPosition);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 50, yPosition);
      yPosition += 5;
      pdf.text('This report contains confidential information and should be handled accordingly.', pageWidth/2, yPosition, { align: 'center' });

      // Save the PDF
      const fileName = `interview-report-${results.candidateName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Original HTML-to-PDF method (kept as backup)
  const downloadHtmlToPdf = async () => {
    setIsGeneratingPdf(true);
    
    // Store original state
    const originalExpanded = new Set(expandedQuestions);
    const originalTab = activeTab;
    
    try {
      // Expand all questions and switch to details tab for complete capture
      const allQuestions = new Set(Array.from(Array(results.answers.length).keys()));
      setExpandedQuestions(allQuestions);
      setActiveTab('details');

      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 500));

      const reportElement = reportRef.current;
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`interview-report-${results.candidateName.replace(/\s+/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Restore original state
      setExpandedQuestions(originalExpanded);
      setActiveTab(originalTab);
      setIsGeneratingPdf(false);
    }
  };

  const QuestionReview = ({ answer, index }) => {
    const isExpanded = expandedQuestions.has(index);
    
    return (
      <div className={`border rounded-lg ${answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div 
          className="p-4 cursor-pointer"
          onClick={() => toggleQuestion(index)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                answer.isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {answer.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Question {index + 1} {getQuestionTypeIcon(answer.type)}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    answer.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {answer.points} point{answer.points > 1 ? 's' : ''}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    answer.type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                    answer.type === 'boolean' ? 'bg-green-100 text-green-700' :
                    answer.type === 'reading-comprehension' ? 'bg-purple-100 text-purple-700' :
                    answer.type === 'quantitative' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {answer.type === 'mcq' ? 'Multiple Choice' :
                     answer.type === 'boolean' ? 'True/False' :
                     answer.type === 'reading-comprehension' ? 'Reading' :
                     answer.type === 'quantitative' ? 'Quantitative' :
                     'Text Response'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`text-lg font-bold mr-2 ${
                answer.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {answer.isCorrect ? `+${answer.points}` : '0'}
              </span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t p-4 bg-white">
            <div className="space-y-4">
              {/* Reading Passage */}
              {answer.passage && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Reading Passage:</h4>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-line">
                    {answer.passage}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Question:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{answer.question}</p>
              </div>

              {/* Show options for MCQ questions */}
              {answer.options && answer.options.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Options:</h4>
                  <div className="space-y-2">
                    {answer.options.map((option, optIndex) => (
                      option.trim() && (
                        <div key={optIndex} className={`p-2 rounded border ${
                          option === answer.answer ? 'bg-blue-50 border-blue-300' : 
                          option === answer.correctAnswer ? 'bg-green-50 border-green-300' : 
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <span className="font-mono text-sm mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                          {option}
                          {option === answer.answer && (
                            <span className="ml-2 text-xs text-blue-600 font-medium">(Your choice)</span>
                          )}
                          {option === answer.correctAnswer && option !== answer.answer && (
                            <span className="ml-2 text-xs text-green-600 font-medium">(Correct answer)</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Your Answer:</h4>
                  <div className={`p-3 rounded-lg border-2 ${
                    answer.isCorrect 
                      ? 'bg-green-50 border-green-300 text-green-800' 
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}>
                    {answer.answer || 'No answer provided'}
                  </div>
                </div>
                
                {answer.correctAnswer && answer.type !== 'text' && !answer.options && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Correct Answer:</h4>
                    <div className="p-3 rounded-lg bg-green-50 border-2 border-green-300 text-green-800">
                      {answer.correctAnswer}
                    </div>
                  </div>
                )}
              </div>

              {answer.type === 'text' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Text answers require manual review by the evaluation team.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={reportRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {companyName && (
            <h2 className="text-xl font-bold text-gray-600 mb-2">{companyName}</h2>
          )}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${gradeInfo.bg} ${gradeInfo.border} border-4`}>
            <Trophy size={48} className={gradeInfo.color} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Assessment Complete!</h1>
          <p className="text-xl text-gray-600">Thank you for your participation, {results.candidateName}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium rounded-tl-lg ${
                activeTab === 'summary' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'details' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Question Review
            </button>
            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-6 py-3 font-medium rounded-tr-lg ${
                activeTab === 'candidate' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Candidate Info
            </button>
          </div>

          <div className="p-6">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Grade Card */}
                <div className={`${gradeInfo.bg} ${gradeInfo.border} border-2 rounded-2xl p-8 text-center`}>
                  <div className={`text-6xl font-bold mb-2 ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </div>
                  <div className="text-2xl font-semibold text-gray-800 mb-1">
                    {percentage}%
                  </div>
                  <div className="text-gray-600">
                    Overall Performance
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {results.score}
                    </div>
                    <div className="text-gray-600 text-sm">Points Scored</div>
                    <div className="text-xs text-gray-500 mt-1">
                      out of {results.totalPoints}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {correctAnswers}
                    </div>
                    <div className="text-gray-600 text-sm">Correct</div>
                    <div className="text-xs text-gray-500 mt-1">
                      out of {totalQuestions}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {totalQuestions - correctAnswers}
                    </div>
                    <div className="text-gray-600 text-sm">Incorrect</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(((totalQuestions - correctAnswers) / totalQuestions) * 100)}%
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {results.timeTaken}
                    </div>
                    <div className="text-gray-600 text-sm">Time Taken</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Duration
                    </div>
                  </div>
                </div>

                {/* Performance Analysis */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Target size={24} className="mr-2 text-blue-600" />
                    Performance Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Accuracy Rate</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold">
                          {Math.round((correctAnswers / totalQuestions) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Question Types</span>
                      <div className="flex space-x-4 text-sm">
                        <span>MCQ: {results.answers.filter(a => a.type === 'mcq').length}</span>
                        <span>Text: {results.answers.filter(a => a.type === 'text').length}</span>
                        <span>Boolean: {results.answers.filter(a => a.type === 'boolean').length}</span>
                        <span>Reading: {results.answers.filter(a => a.type === 'reading-comprehension').length}</span>
                        <span>Quant: {results.answers.filter(a => a.type === 'quantitative').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Question Review Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <BookOpen size={24} className="mr-2 text-blue-600" />
                    Detailed Question Review
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedQuestions(new Set(Array.from(Array(results.answers.length).keys())))}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={() => setExpandedQuestions(new Set())}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {results.answers.map((answer, index) => (
                    <QuestionReview key={index} answer={answer} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Info Tab */}
            {activeTab === 'candidate' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <User size={24} className="mr-2 text-blue-600" />
                  Candidate Information
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <User size={20} className="text-gray-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Full Name</div>
                          <div className="font-semibold">{results.candidateName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail size={20} className="text-gray-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Email Address</div>
                          <div className="font-semibold">{results.candidateEmail}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {results.candidateDetails?.phone && (
                        <div className="flex items-center">
                          <Phone size={20} className="text-gray-600 mr-3" />
                          <div>
                            <div className="text-sm text-gray-600">Phone Number</div>
                            <div className="font-semibold">{results.candidateDetails.phone}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Clock size={20} className="text-gray-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Assessment Completed</div>
                          <div className="font-semibold">{new Date(results.completedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {results.candidateDetails && (
                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Additional Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <span className="ml-2 font-medium">{results.candidateDetails.experience} years</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Position:</span>
                        <span className="ml-2 font-medium">{results.candidateDetails.position}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Steps</h3>
            <p className="text-gray-600 mb-4">
              Your assessment has been successfully submitted and recorded. Our evaluation team will review your responses and contact you regarding the next steps in the interview process.
            </p>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                Assessment ID: #{Date.now().toString().slice(-6)} | Completed on {new Date(results.completedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This window can now be safely closed. Thank you for your time and effort!
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FileText size={20} />
              <span>Print Results</span>
            </button>
            
            <button
              onClick={downloadDetailedPdf}
              disabled={isGeneratingPdf}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                isGeneratingPdf 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Download size={20} />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Detailed PDF'}</span>
            </button>
            
            <button
              onClick={downloadHtmlToPdf}
              disabled={isGeneratingPdf}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                isGeneratingPdf 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <Download size={20} />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Visual Report'}</span>
            </button>
          </div>

          {/* PDF Generation Status */}
          {isGeneratingPdf && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 text-sm">Generating comprehensive PDF report... Please wait.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;