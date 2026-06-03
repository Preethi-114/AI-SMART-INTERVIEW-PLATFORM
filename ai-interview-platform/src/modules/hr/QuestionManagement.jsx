import React, { useState, useEffect } from 'react';
import { questionApi, roleApi } from '../services/api';
import "../../styles/shared-styles.css";
export default function QuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    mcq: 0,
    trueFalse: 0,
    shortAnswer: 0,
    coding: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    type: '',
    status: 'active'
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Current question state
  const [currentQuestion, setCurrentQuestion] = useState({
    id: '',
    title: '',
    description: '',
    type: 'MCQ',
    points: 1,
    timeLimit: 5,
    isActive: true,
    roles: [],
    correctAnswer: '',
    options: [
      { id: 1, text: '', isCorrect: false },
      { id: 2, text: '', isCorrect: false },
      { id: 3, text: '', isCorrect: false },
      { id: 4, text: '', isCorrect: false }
    ],
    optionType: 'single'
  });
  
  const questionTypes = [
    { id: 'MCQ', name: 'Multiple Choice (MCQ)', icon: 'bi-list-check' },
    { id: 'True/False', name: 'True/False', icon: 'bi-check2-circle' },
    { id: 'Short-Answer', name: 'Short Answer', icon: 'bi-chat-text' },
    { id: 'Coding', name: 'Coding', icon: 'bi-code-slash' }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filters, pagination.page]);

  const fetchRoles = async () => {
    try {
      const response = await roleApi.getAll();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status })
      };

      const response = await questionApi.getAll(params);
      
      if (response.success) {
        setQuestions(response.data);
        setFilteredQuestions(response.data);
        setStats(response.stats);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchQuestions();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const getQuestionTypeBadge = (type) => {
    const qType = questionTypes.find(t => t.id === type);
    return (
      <span className="consistent-badge info">
        <i className={`bi ${qType?.icon} me-1`}></i>
        {qType?.name}
      </span>
    );
  };
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...currentQuestion.options];
    
    if (field === 'text') {
      newOptions[index].text = value;
    } else if (field === 'isCorrect') {
      if (currentQuestion.optionType === 'single' && value) {
        newOptions.forEach((opt, i) => {
          newOptions[i].isCorrect = i === index;
        });
      } else {
        newOptions[index].isCorrect = value;
      }
    }
    
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };
  
  const addOption = () => {
    const newId = currentQuestion.options.length > 0 
      ? Math.max(...currentQuestion.options.map(o => o.id)) + 1 
      : 1;
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: '', isCorrect: false }]
    }));
  };
  
  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };
  
  const handleRoleToggle = (roleId) => {
    setCurrentQuestion(prev => {
      const newRoles = prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId];
      
      return { ...prev, roles: newRoles };
    });
  };
  
  const handleCreate = () => {
    setCurrentQuestion({
      id: '',
      title: '',
      description: '',
      type: 'MCQ',
      points: 1,
      timeLimit: 5,
      isActive: true,
      roles: [],
      correctAnswer: '',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      optionType: 'single'
    });
    setModalMode('create');
    setShowModal(true);
  };
  
  const transformQuestionData = (apiQuestion) => {
    return {
      id: apiQuestion._id || apiQuestion.id,
      title: apiQuestion.title,
      description: apiQuestion.description || '',
      type: apiQuestion.type,
      points: apiQuestion.points,
      timeLimit: apiQuestion.timeLimit,
      isActive: apiQuestion.isActive,
      roles: apiQuestion.roles.map(role => {
        if (typeof role === 'object' && role._id) {
          return role._id;
        }
        return role;
      }),
      correctAnswer: apiQuestion.correctAnswer || '',
      options: apiQuestion.options || [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      optionType: apiQuestion.optionType || 'single'
    };
  };

  const handleEdit = (question) => {
    const transformedQuestion = transformQuestionData(question);
    setCurrentQuestion(transformedQuestion);
    setModalMode('edit');
    setShowModal(true);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    setLoading(true);
    try {
      const response = await questionApi.delete(id);
      if (response.success) {
        alert('Question deleted successfully');
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!currentQuestion.title.trim()) {
      alert('Question title is required');
      return;
    }
    
    if (currentQuestion.roles.length === 0) {
      alert('Please select at least one role');
      return;
    }
    
    if (currentQuestion.type === 'MCQ') {
      const validOptions = currentQuestion.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert('At least 2 options are required for MCQ');
        return;
      }
      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        alert('Select at least one correct answer for MCQ');
        return;
      }
    } else {
      if (!currentQuestion.correctAnswer.trim()) {
        alert('Correct answer is required');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      let response;
      if (modalMode === 'create') {
        response = await questionApi.create(currentQuestion);
      } else {
        response = await questionApi.update(currentQuestion.id, currentQuestion);
      }
      
      if (response.success) {
        alert(`Question ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
        setShowModal(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert(error.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleStatus = async (id) => {
    try {
      const response = await questionApi.toggleStatus(id);
      if (response.success) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle question status');
    }
  };
  
  const getCorrectAnswerDisplay = (question) => {
    if (question.type === 'MCQ') {
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) return 'No correct answer';
      
      if (correctOptions.length === 1) {
        return (
          <div className="text-success">
            <i className="bi bi-check-circle me-1"></i>
            {correctOptions[0].text.substring(0, 40)}
            {correctOptions[0].text.length > 40 ? '...' : ''}
          </div>
        );
      } else {
        return (
          <div className="text-success">
            <i className="bi bi-check-circle me-1"></i>
            {correctOptions.length} correct options
          </div>
        );
      }
    } else if (question.type === 'True/False') {
      return (
        <span className={`badge ${question.correctAnswer === 'true' ? 'bg-success' : 'bg-danger'}`}>
          {question.correctAnswer === 'true' ? 'TRUE' : 'FALSE'}
        </span>
      );
    } else {
      return (
        <div className="text-truncate" style={{ maxWidth: '200px' }}>
          {question.correctAnswer.substring(0, 40)}
          {question.correctAnswer.length > 40 ? '...' : ''}
        </div>
      );
    }
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: '',
      type: '',
      status: 'active'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Modal */}
      {showModal && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '700px' }}>
            <div className="consistent-modal-header">
              <h5>
                <i className={`bi ${modalMode === 'create' ? 'bi-plus-circle' : 'bi-pencil'} me-2`} style={{ color: '#4f46e5' }}></i>
                {modalMode === 'create' ? 'Create New Question' : 'Edit Question'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="consistent-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  {/* Question Title */}
                  <div className="col-12">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Question Title *</label>
                      <input
                        type="text"
                        className="consistent-form-control"
                        value={currentQuestion.title}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter question title"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="col-12">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Description</label>
                      <textarea
                        className="consistent-form-control"
                        rows="2"
                        value={currentQuestion.description}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter question description (optional)"
                      />
                    </div>
                  </div>
                  
                  {/* Type */}
                  <div className="col-md-12">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Question Type *</label>
                      <select
                        className="consistent-form-control"
                        value={currentQuestion.type}
                        onChange={(e) => setCurrentQuestion(prev => ({ 
                          ...prev, 
                          type: e.target.value,
                          options: e.target.value === 'MCQ' ? [
                            { id: 1, text: '', isCorrect: false },
                            { id: 2, text: '', isCorrect: false },
                            { id: 3, text: '', isCorrect: false },
                            { id: 4, text: '', isCorrect: false }
                          ] : [],
                          correctAnswer: e.target.value === 'MCQ' ? '' : currentQuestion.correctAnswer
                        }))}
                      >
                        {questionTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Roles */}
                  <div className="col-12">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Target Roles *</label>
                      <div className="border rounded p-3" style={{ borderColor: '#e2e8f0' }}>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {currentQuestion.roles.map(roleId => {
                            const role = roles.find(r => r._id === roleId);
                            return role ? (
                              <span key={roleId} className="consistent-badge primary" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                                {role.name}
                                <button
                                  type="button"
                                  className="btn btn-link p-0 ms-1"
                                  onClick={() => handleRoleToggle(roleId)}
                                  style={{ color: '#dc2626', fontSize: '14px', textDecoration: 'none' }}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </span>
                            ) : null;
                          })}
                          {currentQuestion.roles.length === 0 && (
                            <div className="text-muted small">No roles selected</div>
                          )}
                        </div>
                        
                        <select
                          className="consistent-form-control"
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !currentQuestion.roles.includes(e.target.value)) {
                              handleRoleToggle(e.target.value);
                            }
                          }}
                        >
                          <option value="">Select roles from dropdown...</option>
                          {roles.map(role => (
                            <option 
                              key={role._id} 
                              value={role._id} 
                              disabled={currentQuestion.roles.includes(role._id)}
                            >
                              {role.name} {currentQuestion.roles.includes(role._id) ? '(Selected)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Multiple Choice Options */}
                  {currentQuestion.type === 'MCQ' && (
                    <>
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <label className="consistent-form-label mb-0">MCQ Options *</label>
                          <div className="d-flex gap-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="optionType"
                                id="singleChoice"
                                checked={currentQuestion.optionType === 'single'}
                                onChange={() => setCurrentQuestion(prev => ({ ...prev, optionType: 'single' }))}
                              />
                              <label className="form-check-label" htmlFor="singleChoice" style={{ fontSize: '13px' }}>
                                Single Answer
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="optionType"
                                id="multipleChoice"
                                checked={currentQuestion.optionType === 'multiple'}
                                onChange={() => setCurrentQuestion(prev => ({ ...prev, optionType: 'multiple' }))}
                              />
                              <label className="form-check-label" htmlFor="multipleChoice" style={{ fontSize: '13px' }}>
                                Multiple Answers
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {currentQuestion.options.map((option, index) => (
                          <div key={option.id} className="card mb-2 border" style={{ borderColor: '#e2e8f0' }}>
                            <div className="card-body p-3">
                              <div className="row align-items-center g-2">
                                <div className="col-auto">
                                  {currentQuestion.optionType === 'single' ? (
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="correctOption"
                                      checked={option.isCorrect}
                                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                    />
                                  ) : (
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={option.isCorrect}
                                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                    />
                                  )}
                                </div>
                                <div className="col">
                                  <input
                                    type="text"
                                    className="consistent-form-control"
                                    placeholder={`Option ${index + 1}`}
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="col-auto">
                                  {currentQuestion.options.length > 2 && (
                                    <button
                                      type="button"
                                      className="consistent-btn consistent-btn-outline p-2"
                                      onClick={() => removeOption(index)}
                                      style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                              {option.isCorrect && (
                                <div className="mt-2 text-success small">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Marked as correct answer
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          className="consistent-btn consistent-btn-outline mt-2"
                          onClick={addOption}
                          disabled={currentQuestion.options.length >= 6}
                        >
                          <i className="bi bi-plus me-1"></i> Add Option
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Correct Answer for True/False, Short Answer, Coding */}
                  {currentQuestion.type !== 'MCQ' && (
                    <div className="col-12">
                      <div className="consistent-form-group">
                        <label className="consistent-form-label">Correct Answer *</label>
                        
                        {currentQuestion.type === 'True/False' ? (
                          <div className="border rounded p-3" style={{ borderColor: '#e2e8f0' }}>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div 
                                  className={`card text-center p-4 cursor-pointer`}
                                  onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))}
                                  style={{ 
                                    cursor: 'pointer',
                                    border: currentQuestion.correctAnswer === 'true' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                    borderRadius: '12px'
                                  }}
                                >
                                  <div className={`rounded-circle p-3 d-inline-flex mx-auto mb-3 ${currentQuestion.correctAnswer === 'true' ? 'bg-primary bg-opacity-10' : 'bg-light'}`}>
                                    <i className={`bi bi-check-lg fs-3 ${currentQuestion.correctAnswer === 'true' ? 'text-primary' : 'text-muted'}`}></i>
                                  </div>
                                  <div className="fw-bold mb-2">True</div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div 
                                  className={`card text-center p-4 cursor-pointer`}
                                  onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))}
                                  style={{ 
                                    cursor: 'pointer',
                                    border: currentQuestion.correctAnswer === 'false' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                    borderRadius: '12px'
                                  }}
                                >
                                  <div className={`rounded-circle p-3 d-inline-flex mx-auto mb-3 ${currentQuestion.correctAnswer === 'false' ? 'bg-primary bg-opacity-10' : 'bg-light'}`}>
                                    <i className={`bi bi-x-lg fs-3 ${currentQuestion.correctAnswer === 'false' ? 'text-primary' : 'text-muted'}`}></i>
                                  </div>
                                  <div className="fw-bold mb-2">False</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <textarea
                            className="consistent-form-control"
                            rows={currentQuestion.type === 'Coding' ? 6 : 4}
                            value={currentQuestion.correctAnswer}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                            placeholder={currentQuestion.type === 'Coding' ? 'Enter solution code...' : 'Enter correct answer...'}
                            required
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Points and Time Limit */}
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Points *</label>
                      <input
                        type="number"
                        className="consistent-form-control"
                        min="1"
                        max="20"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion(prev => ({ 
                          ...prev, 
                          points: Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                        }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Time Limit (minutes) *</label>
                      <input
                        type="number"
                        className="consistent-form-control"
                        min="1"
                        max="60"
                        value={currentQuestion.timeLimit}
                        onChange={(e) => setCurrentQuestion(prev => ({ 
                          ...prev, 
                          timeLimit: Math.max(1, Math.min(60, parseInt(e.target.value) || 5))
                        }))}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="isActive"
                          checked={currentQuestion.isActive}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, isActive: e.target.checked }))}
                          style={{ width: '50px', height: '25px', cursor: 'pointer' }}
                        />
                      </div>
                      <div>
                        <label className="fw-semibold d-block" htmlFor="isActive">
                          Active Question
                        </label>
                        <small style={{ color: '#64748b' }}>
                          Active questions are visible to users
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="consistent-modal-footer">
                <button
                  type="button"
                  className="consistent-btn consistent-btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="consistent-btn consistent-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${modalMode === 'create' ? 'bi-plus-circle' : 'bi-check-circle'} me-2`}></i>
                      {modalMode === 'create' ? 'Create Question' : 'Update Question'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
        <div className="consistent-card p-4">
      <div className="consistent-header px-0 d-flex justify-content-between align-items-center">
        <div>
          <h1>
            <i className="bi bi-question-circle me-2 " style={{ color: '#4f46e5' }}></i>
            Question Management
          </h1>
          <p>Manage assessment questions</p>
        </div>
        <button 
          className="consistent-btn consistent-btn-primary"
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Question
        </button>
      </div>
      </div>

      {/* Stats Cards - Added proper spacing with mt-4 */}
      <div className="row g-4 mb-4 mt-2">
        <div className="col-xl-2 col-md-4 col-6">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon primary">
              <i className="bi bi-question-lg"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.total}</h3>
              <p>Total</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-6">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon success">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.active}</h3>
              <p>Active</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-6">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon info">
              <i className="bi bi-list-check"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.mcq}</h3>
              <p>MCQ</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-6">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon warning">
              <i className="bi bi-check2-circle"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.trueFalse}</h3>
              <p>True/False</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-6">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon secondary">
              <i className="bi bi-chat-text"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.shortAnswer}</h3>
              <p>Short Answer</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-6">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon danger">
              <i className="bi bi-code-slash"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.coding}</h3>
              <p>Coding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="consistent-filter-bar">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search" style={{ color: '#64748b' }}></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>
          </div>
          
          <div className="col-md-3">
            <select 
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{ borderColor: '#e2e8f0' }}
            >
              <option value="">All Types</option>
              {questionTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-3">
            <select 
              className="form-select"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              style={{ borderColor: '#e2e8f0' }}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-2">
            <button 
              className="consistent-btn consistent-btn-outline w-100"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="consistent-table-container">
        <div className="consistent-header">
          <h5 className="mb-0">
            <i className="bi bi-list-task me-2" style={{ color: '#4f46e5' }}></i>
            All Questions
          </h5>
        </div>
        
        <div className="table-responsive">
          <table className="consistent-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Type</th>
                <th>Correct Answer</th>
                <th>Time</th>
                <th>Points</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5" style={{ color: '#94a3b8' }}>
                    <i className="bi bi-search display-6 d-block mb-3"></i>
                    No questions found
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question) => (
                  <tr key={question._id || question.id}>
                    <td>
                      <div className="d-flex flex-column">
                        <div className="fw-semibold mb-1">{question.title}</div>
                        <div className="text-muted small">{question.description}</div>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {question.roles?.slice(0, 2).map((role, index) => (
                            <span key={index} className="consistent-badge info small" style={{ fontSize: '11px', padding: '4px 8px' }}>
                              {typeof role === 'object' ? role.name : role}
                            </span>
                          ))}
                          {question.roles?.length > 2 && (
                            <span className="consistent-badge secondary small" style={{ fontSize: '11px', padding: '4px 8px' }}>
                              +{question.roles.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getQuestionTypeBadge(question.type)}
                    </td>
                    <td>
                      {getCorrectAnswerDisplay(question)}
                    </td>
                    <td>
                      <span>{question.timeLimit} min</span>
                    </td>
                    <td>
                      <span className="fw-bold">{question.points}</span>
                      <span className="text-muted small"> pts</span>
                    </td>
                    <td>
                      {question.isActive ? (
                        <span className="consistent-badge success">
                          Active
                        </span>
                      ) : (
                        <span className="consistent-badge secondary">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="consistent-btn consistent-btn-outline p-2"
                          onClick={() => handleEdit(question)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="consistent-btn consistent-btn-outline p-2"
                          onClick={() => handleDelete(question._id || question.id)}
                          title="Delete"
                          style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                        <button
                          className="consistent-btn consistent-btn-outline p-2"
                          onClick={() => handleToggleStatus(question._id || question.id)}
                          title={question.isActive ? 'Deactivate' : 'Activate'}
                          style={{ borderColor: question.isActive ? '#fff3e0' : '#e8f5e9', color: question.isActive ? '#f57c00' : '#2e7d32' }}
                        >
                          <i className={`bi bi-${question.isActive ? 'pause' : 'play'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="consistent-pagination">
          <button 
            className="consistent-page-item"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          {[...Array(pagination.pages).keys()].map(num => (
            <button 
              key={num + 1} 
              className={`consistent-page-item ${pagination.page === num + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(num + 1)}
            >
              {num + 1}
            </button>
          ))}
          <button 
            className="consistent-page-item"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}