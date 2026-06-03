import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { questionApi, roleApi } from '../services/api';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchRoles();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionApi.getAll();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await roleApi.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionApi.delete(id);
        fetchQuestions(); // Refresh list
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const getTypeBadge = (type) => {
    const types = {
      'MCQ': { bg: 'primary', icon: 'bi-list-ul' },
      'Coding': { bg: 'success', icon: 'bi-code-slash' },
      'Descriptive': { bg: 'info', icon: 'bi-text-paragraph' },
      'Behavioral': { bg: 'warning', icon: 'bi-people' },
      'System Design': { bg: 'danger', icon: 'bi-diagram-3' }
    };
    const typeConfig = types[type] || { bg: 'secondary', icon: 'bi-question' };
    return (
      <span className={`badge bg-${typeConfig.bg} px-3 py-2`}>
        <i className={`bi ${typeConfig.icon} me-1`}></i>
        {type}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const levels = {
      'Easy': 'success',
      'Medium': 'warning',
      'Hard': 'danger'
    };
    return (
      <span className={`badge bg-${levels[level] || 'secondary'} px-3 py-2`}>
        {level}
      </span>
    );
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || question.roleId === selectedRole;
    const matchesType = selectedType === 'all' || question.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || question.level === selectedLevel;
    
    return matchesSearch && matchesRole && matchesType && matchesLevel;
  });

  const stats = [
    { title: "Total Questions", value: questions.length, icon: "bi-question-circle", color: "primary" },
    { title: "MCQ Questions", value: questions.filter(q => q.type === 'MCQ').length, icon: "bi-list-ul", color: "info" },
    { title: "Coding Questions", value: questions.filter(q => q.type === 'Coding').length, icon: "bi-code-slash", color: "success" },
    { title: "Hard Questions", value: questions.filter(q => q.level === 'Hard').length, icon: "bi-bar-chart", color: "danger" }
  ];

  const questionTypes = ['MCQ', 'Coding', 'Descriptive', 'Behavioral', 'System Design'];
  const difficultyLevels = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold mb-2">
              <i className="bi bi-question-circle me-2 text-primary"></i>
              Question Bank
            </h1>
            <p className="text-muted">Manage and organize interview questions</p>
          </div>
          <Link to="/admin/questions/add" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add New Question
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center py-4">
                <div className={`rounded-circle bg-${stat.color} bg-opacity-10 d-inline-flex p-3 mb-3`}>
                  <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                </div>
                <h6 className="text-muted mb-2">{stat.title}</h6>
                <h2 className="fw-bold" style={{ color: '#2c3e50' }}>{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id || role._id} value={role.id || role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {questionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100">
                <i className="bi bi-funnel me-1"></i>
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-list-task me-2"></i>
              Question List ({filteredQuestions.length} questions)
            </h5>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2">
                <i className="bi bi-download me-1"></i>
                Export
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-printer me-1"></i>
                Print
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading questions...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">#</th>
                    <th>Question</th>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Level</th>
                    <th>Created Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((question, index) => {
                    const role = roles.find(r => r.id === question.roleId || r._id === question.roleId);
                    return (
                      <tr key={question.id || question._id}>
                        <td className="ps-4 fw-bold">{index + 1}</td>
                        <td>
                          <div className="fw-medium">{question.title}</div>
                          {question.description && (
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '300px' }}>
                              {question.description}
                            </small>
                          )}
                        </td>
                        <td>
                          {role ? (
                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                              <i className="bi bi-briefcase me-1"></i>
                              {role.name}
                            </span>
                          ) : (
                            <span className="text-muted">No role</span>
                          )}
                        </td>
                        <td>{getTypeBadge(question.type)}</td>
                        <td>{getLevelBadge(question.level)}</td>
                        <td>
                          {question.createdAt ? (
                            <>
                              <div className="fw-medium">
                                {new Date(question.createdAt).toLocaleDateString()}
                              </div>
                              <small className="text-muted">
                                {new Date(question.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/admin/questions/edit/${question.id || question._id}`)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => navigate(`/admin/questions/${question.id || question._id}/preview`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(question.id || question._id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredQuestions.length === 0 && !loading && (
              <div className="text-center py-5">
                <i className="bi bi-question-circle fs-1 text-muted mb-3"></i>
                <h5 className="text-muted">No questions found</h5>
                <p className="text-muted">Try changing your filters or add a new question</p>
                <Link to="/admin/questions/add" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Question
                </Link>
              </div>
            )}
            
            <div className="card-footer bg-white border-top py-3">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing {filteredQuestions.length} of {questions.length} questions
                </small>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-secondary active">1</button>
                  <button className="btn btn-sm btn-outline-secondary">2</button>
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-info-circle me-2"></i>
                Question Types
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                {questionTypes.map(type => {
                  const count = questions.filter(q => q.type === type).length;
                  return (
                    <div className="col-md-2 col-6 mb-3" key={type}>
                      <div className="text-center">
                        <div className="bg-light rounded-circle p-3 mb-2 d-inline-block">
                          <i className={`bi ${
                            type === 'MCQ' ? 'bi-list-ul' :
                            type === 'Coding' ? 'bi-code-slash' :
                            type === 'Descriptive' ? 'bi-text-paragraph' :
                            type === 'Behavioral' ? 'bi-people' : 'bi-diagram-3'
                          } fs-4 text-primary`}></i>
                        </div>
                        <div className="fw-bold">{type}</div>
                        <small className="text-muted">{count} questions</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-2">
                <Link to="/admin/questions/add" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Question
                </Link>
                <Link to="/roles" className="btn btn-outline-success">
                  <i className="bi bi-briefcase me-2"></i>
                  Manage Roles
                </Link>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-download me-2"></i>
                  Import Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Question Page Component
export function AddQuestion() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MCQ',
    level: 'Medium',
    roleId: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    solution: '',
    tags: []
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleApi.getAll();
      setRoles(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, roleId: data[0].id || data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const questionTypes = [
    { value: 'MCQ', label: 'Multiple Choice', icon: 'bi-list-ul' },
    { value: 'Coding', label: 'Coding Problem', icon: 'bi-code-slash' },
    { value: 'Descriptive', label: 'Descriptive', icon: 'bi-text-paragraph' },
    { value: 'Behavioral', label: 'Behavioral', icon: 'bi-people' },
    { value: 'System Design', label: 'System Design', icon: 'bi-diagram-3' }
  ];

  const difficultyLevels = [
    { value: 'Easy', label: 'Easy', color: 'success' },
    { value: 'Medium', label: 'Medium', color: 'warning' },
    { value: 'Hard', label: 'Hard', color: 'danger' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Question title is required';
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role';
    }
    
    if (formData.type === 'MCQ') {
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required for MCQ';
      }
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = 'Please specify the correct answer';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      await questionApi.create(formData);
      alert('Question created successfully!');
      navigate('/admin/questions');
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/admin/questions" className="text-decoration-none">
                    <i className="bi bi-question-circle me-1"></i>
                    Questions
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Add New Question
                </li>
              </ol>
            </nav>
            <h1 className="fw-bold mb-2">
              <i className="bi bi-plus-circle me-2 text-primary"></i>
              Add New Question
            </h1>
            <p className="text-muted">
              Create a new interview question and assign it to a role
            </p>
          </div>
          <div>
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate('/admin/questions')}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Form Section */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-card-text me-2"></i>
                Question Details
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Question Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="form-label fw-bold">
                    Question Title <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-question-circle"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter the question..."
                      maxLength={200}
                    />
                  </div>
                  {errors.title && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.title}
                    </div>
                  )}
                  <small className="text-muted">
                    Be clear and concise. Max 200 characters.
                  </small>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="form-label fw-bold">
                    Description
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light align-items-start pt-3">
                      <i className="bi bi-text-paragraph"></i>
                    </span>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add additional context or details (optional)..."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <small className="text-muted">
                    Optional. Add context, constraints, or expectations.
                  </small>
                </div>

                {/* Role Selection */}
                <div className="mb-4">
                  <label htmlFor="roleId" className="form-label fw-bold">
                    Select Role <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-briefcase"></i>
                    </span>
                    <select
                      className={`form-select ${errors.roleId ? 'is-invalid' : ''}`}
                      id="roleId"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                    >
                      <option value="">Select a role...</option>
                      {roles.map(role => (
                        <option key={role.id || role._id} value={role.id || role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.roleId && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.roleId}
                    </div>
                  )}
                </div>

                {/* Question Type */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Question Type <span className="text-danger">*</span>
                  </label>
                  <div className="row g-3">
                    {questionTypes.map(type => (
                      <div className="col-md-4 col-6" key={type.value}>
                        <div 
                          className={`card border ${formData.type === type.value ? 'border-primary border-2' : 'border-1'} cursor-pointer h-100`}
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center py-3">
                            <div className="mb-2 text-primary">
                              <i className={`bi ${type.icon} fs-4`}></i>
                            </div>
                            <h6 className="mb-1 fw-bold">{type.label}</h6>
                            {formData.type === type.value && (
                              <div className="mt-2">
                                <i className="bi bi-check-circle-fill text-primary"></i>
                                <small className="ms-1 text-muted">Selected</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Difficulty Level <span className="text-danger">*</span>
                  </label>
                  <div className="row g-3">
                    {difficultyLevels.map(level => (
                      <div className="col-md-4" key={level.value}>
                        <div 
                          className={`card border ${formData.level === level.value ? `border-${level.color} border-2` : 'border-1'} cursor-pointer h-100`}
                          onClick={() => setFormData(prev => ({ ...prev, level: level.value }))}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center py-3">
                            <div className={`mb-2 text-${level.color}`}>
                              <i className="bi bi-bar-chart fs-4"></i>
                            </div>
                            <h6 className="mb-1 fw-bold">{level.label}</h6>
                            {formData.level === level.value && (
                              <div className="mt-2">
                                <i className={`bi bi-check-circle-fill text-${level.color}`}></i>
                                <small className="ms-1 text-muted">Selected</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MCQ Options (Conditional) */}
                {formData.type === 'MCQ' && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      Multiple Choice Options <span className="text-danger">*</span>
                    </label>
                    {errors.options && (
                      <div className="alert alert-warning py-2 mb-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {errors.options}
                      </div>
                    )}
                    {formData.options.map((option, index) => (
                      <div className="input-group mb-2" key={index}>
                        <span className="input-group-text bg-light">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}...`}
                        />
                      </div>
                    ))}
                    
                    {/* Correct Answer */}
                    <div className="mt-3">
                      <label htmlFor="correctAnswer" className="form-label fw-bold">
                        Correct Answer <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-check-circle"></i>
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.correctAnswer ? 'is-invalid' : ''}`}
                          id="correctAnswer"
                          name="correctAnswer"
                          value={formData.correctAnswer}
                          onChange={handleChange}
                          placeholder="Enter the correct answer..."
                        />
                      </div>
                      {errors.correctAnswer && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Solution/Explanation */}
                <div className="mb-4">
                  <label htmlFor="solution" className="form-label fw-bold">
                    Solution / Explanation
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light align-items-start pt-3">
                      <i className="bi bi-lightbulb"></i>
                    </span>
                    <textarea
                      className="form-control"
                      id="solution"
                      name="solution"
                      value={formData.solution}
                      onChange={handleChange}
                      placeholder="Provide the solution or explanation (optional)..."
                      rows={4}
                      maxLength={2000}
                    />
                  </div>
                  <small className="text-muted">
                    Helps interviewers evaluate answers.
                  </small>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Tags</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tags (e.g., react, javascript, algorithms)..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddTag}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                          {tag}
                          <button
                            type="button"
                            className="btn-close ms-2"
                            style={{ fontSize: '0.5rem' }}
                            onClick={() => handleRemoveTag(tag)}
                          ></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <small className="text-muted">
                    Add relevant tags to help with search and organization.
                  </small>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin/questions')}
                    disabled={submitting}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Questions
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setFormData({
                          title: '',
                          description: '',
                          type: 'MCQ',
                          level: 'Medium',
                          roleId: roles[0]?.id || roles[0]?._id || '',
                          options: ['', '', '', ''],
                          correctAnswer: '',
                          solution: '',
                          tags: []
                        });
                      }}
                      disabled={submitting}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Create Question
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Guide Section */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-journal-check me-2"></i>
                Quick Guide
              </h6>
            </div>
            <div className="card-body">
              {/* Step-by-Step Guide */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="bi bi-list-ol me-2"></i>
                  Creating Effective Questions
                </h6>
                <div className="d-flex mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                    1
                  </div>
                  <div className="ms-3">
                    <strong>Be Specific</strong>
                    <p className="text-muted small mb-0">
                      Clear, focused questions get better answers
                    </p>
                  </div>
                </div>
                
                <div className="d-flex mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                    2
                  </div>
                  <div className="ms-3">
                    <strong>Match Role</strong>
                    <p className="text-muted small mb-0">
                      Select appropriate role for the question
                    </p>
                  </div>
                </div>
                
                <div className="d-flex mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                    3
                  </div>
                  <div className="ms-3">
                    <strong>Set Difficulty</strong>
                    <p className="text-muted small mb-0">
                      Match question difficulty to role level
                    </p>
                  </div>
                </div>
                
                <div className="d-flex">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                    4
                  </div>
                  <div className="ms-3">
                    <strong>Add Context</strong>
                    <p className="text-muted small mb-0">
                      Provide solution to help interviewers
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Types */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-tags me-2 text-primary"></i>
                  Question Types Guide
                </h6>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-list-ul text-primary me-2"></i>
                    <strong>MCQ:</strong> Quick assessment of knowledge
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-code-slash text-success me-2"></i>
                    <strong>Coding:</strong> Test programming skills
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-text-paragraph text-info me-2"></i>
                    <strong>Descriptive:</strong> Assess communication
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-people text-warning me-2"></i>
                    <strong>Behavioral:</strong> Evaluate soft skills
                  </li>
                  <li>
                    <i className="bi bi-diagram-3 text-danger me-2"></i>
                    <strong>System Design:</strong> Test architecture skills
                  </li>
                </ul>
              </div>

              {/* Best Practices */}
              <div className="border-top pt-3">
                <h6 className="fw-bold mb-2">
                  <i className="bi bi-lightbulb me-2 text-warning"></i>
                  Best Practices
                </h6>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-1"></i>
                    Keep questions role-relevant
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-1"></i>
                    Include difficulty levels
                  </li>
                  <li>
                    <i className="bi bi-check-circle text-success me-1"></i>
                    Tag questions for easy search
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}