import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Link2, BookOpen, Calculator, MessageSquare, CheckCircle, Search, Filter, FileQuestion } from 'lucide-react';
import { storage } from '../../utils/storage';

const QuestionInventory = ({ onSwitchToLinkGen }) => {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    question: '',
    type: 'text',
    category: 'general',
    passage: '',
    options: [''],
    correctAnswer: '',
    points: 1,
    difficulty: 'medium',
    explanation: ''
  });

  useEffect(() => {
    setQuestions(storage.getQuestions());
  }, []);

  const questionTypes = [
    { value: 'text', label: 'Text Answer', icon: MessageSquare },
    { value: 'mcq', label: 'Multiple Choice', icon: CheckCircle },
    { value: 'boolean', label: 'True/False', icon: CheckCircle },
    { value: 'reading-comprehension', label: 'Reading Comprehension', icon: BookOpen },
    { value: 'quantitative', label: 'Quantitative Aptitude', icon: Calculator }
  ];

  const categories = [
    { value: 'general', label: 'General Knowledge' },
    { value: 'technical', label: 'Technical Skills' },
    { value: 'logical', label: 'Logical Reasoning' },
    { value: 'verbal', label: 'Verbal Ability' },
    { value: 'numerical', label: 'Numerical Ability' },
    { value: 'analytical', label: 'Analytical Skills' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-emerald-700 bg-emerald-100' },
    { value: 'medium', label: 'Medium', color: 'text-amber-700 bg-amber-100' },
    { value: 'hard', label: 'Hard', color: 'text-rose-700 bg-rose-100' }
  ];

  const handleSave = () => {
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (formData.type === 'reading-comprehension' && !formData.passage.trim()) {
      alert('Please enter a passage for reading comprehension');
      return;
    }

    if ((formData.type === 'mcq' || formData.type === 'reading-comprehension' || formData.type === 'quantitative') &&
      formData.options.filter(opt => opt.trim()).length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    const newQuestion = {
      id: editingId || Date.now(),
      ...formData,
      createdAt: editingId ? questions.find(q => q.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedQuestions;
    if (editingId) {
      updatedQuestions = questions.map(q => q.id === editingId ? newQuestion : q);
    } else {
      updatedQuestions = [...questions, newQuestion];
    }

    setQuestions(updatedQuestions);
    storage.saveQuestions(updatedQuestions);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'text',
      category: 'general',
      passage: '',
      options: [''],
      correctAnswer: '',
      points: 1,
      difficulty: 'medium',
      explanation: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (question) => {
    setFormData(question);
    setEditingId(question.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      setQuestions(updatedQuestions);
      storage.saveQuestions(updatedQuestions);
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || question.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    const typeObj = questionTypes.find(t => t.value === type);
    const Icon = typeObj?.icon || MessageSquare;
    return <Icon size={16} className="text-gray-500" />;
  };

  const getDifficultyStyle = (difficulty) => {
    const safeDifficulty = difficulty || 'medium';
    const diff = difficulties.find(d => d.value === safeDifficulty);
    return diff?.color || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Question Inventory</h1>
                <p className="text-sm text-gray-600 mt-1">Manage and organize your interview questions</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Add Question
              </button>
              <button
                onClick={onSwitchToLinkGen}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                <Link2 size={16} />
                Generate Link
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search questions or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
              >
                <option value="all">All Types</option>
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Question Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      type: e.target.value,
                      options: [''],
                      correctAnswer: '',
                      passage: ''
                    }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              {/* Reading Comprehension Passage */}
              {formData.type === 'reading-comprehension' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passage</label>
                  <textarea
                    value={formData.passage}
                    onChange={(e) => setFormData(prev => ({ ...prev, passage: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                    rows="6"
                    placeholder="Enter the reading passage here..."
                  />
                </div>
              )}

              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.type === 'reading-comprehension' ? 'Question (Based on passage)' :
                    formData.type === 'quantitative' ? 'Mathematical Problem' : 'Question'}
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                  rows="4"
                  placeholder={
                    formData.type === 'reading-comprehension' ? 'What is the main theme of the passage?' :
                      formData.type === 'quantitative' ? 'If a train travels at 60 km/h for 2 hours, what distance does it cover?' :
                        'Enter your question...'
                  }
                />
              </div>

              {/* Options for MCQ, Reading Comprehension, and Quantitative */}
              {(formData.type === 'mcq' || formData.type === 'reading-comprehension' || formData.type === 'quantitative') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Options</label>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-rose-500 hover:text-rose-600 p-1 transition-colors duration-200"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.options.length < 6 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-200"
                      >
                        + Add Another Option
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              {formData.type !== 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer</label>
                  {formData.type === 'boolean' ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                    >
                      <option value="">Select answer</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                    >
                      <option value="">Select correct option</option>
                      {formData.options.filter(opt => opt.trim()).map((option, index) => (
                        <option key={index} value={option}>
                          {String.fromCharCode(65 + index)}. {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors duration-200"
                  rows="3"
                  placeholder="Provide an explanation for the answer..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                >
                  {editingId ? 'Update Question' : 'Save Question'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">
                    Questions ({filteredQuestions.length})
                  </h2>
                  <div className="text-sm text-indigo-100">
                    Total: {questions.length} questions
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {questions.length === 0 ? 'No questions added yet' : 'No questions match your search'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {questions.length === 0 ? 'Click "Add Question" to get started.' : 'Try adjusting your search or filters.'}
                </p>
                {questions.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Add Your First Question
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 bg-white">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(question.type)}
                            <span className="text-sm font-medium text-gray-600">
                              {questionTypes.find(t => t.value === question.type)?.label}
                            </span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyStyle(question.difficulty)}`}>
                            {question.difficulty ? question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) : 'N/A'}
                          </span>
                          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                            {categories.find(c => c.value === question.category)?.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {question.points} pt{question.points > 1 ? 's' : ''}
                          </span>
                        </div>

                        {question.passage && (
                          <div className="mb-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                            <p className="text-sm font-semibold text-indigo-800 mb-1">Passage:</p>
                            <p className="text-sm text-indigo-700 line-clamp-3">
                              {question.passage.substring(0, 200)}...
                            </p>
                          </div>
                        )}

                        <p className="font-medium text-gray-900 text-base mb-3">{question.question}</p>

                        {(question.type === 'mcq' || question.type === 'reading-comprehension' || question.type === 'quantitative') && (
                          <div className="mb-3">
                            <div className="text-sm font-semibold text-gray-600 mb-2">Options:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                <div key={optIndex} className={`text-sm p-2 rounded-lg ${option === question.correctAnswer
                                    ? 'bg-emerald-100 text-emerald-800 font-medium border border-emerald-200'
                                    : 'bg-gray-50 text-gray-600'
                                  }`}>
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span> {option}
                                  {option === question.correctAnswer && (
                                    <CheckCircle className="inline ml-2" size={14} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === 'boolean' && (
                          <div className="mb-3">
                            <div className="text-sm font-semibold text-gray-600 mb-2">Correct Answer:</div>
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                              <CheckCircle size={14} className="mr-1" />
                              {question.correctAnswer === 'true' ? 'True' : 'False'}
                            </span>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                            <p className="text-sm font-semibold text-amber-800 mb-1">Explanation:</p>
                            <p className="text-sm text-amber-700">{question.explanation}</p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          Created: {new Date(question.createdAt).toLocaleDateString()}
                          {question.updatedAt && question.updatedAt !== question.createdAt && (
                            <span className="ml-2">
                              • Updated: {new Date(question.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(question)}
                          className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors duration-200"
                          title="Edit question"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors duration-200"
                          title="Delete question"
                        >
                          <Trash2 size={16} />
                        </button>
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

export default QuestionInventory;