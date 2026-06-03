import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { candidateApi, scheduleInterviewApi, roleApi } from '../services/api';
import '../../styles/shared-styles.css';

const ScheduleInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get preselected candidates from navigation state
  const preselectedCandidates = location.state?.selectedCandidates || [];
  const fromPage = location.state?.fromPage || 'direct';
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Basic details
    interviewTitle: '',
    interviewType: 'individual',
    jobTitle: '',
    department: '',
    
    // Date & Time
    interviewDate: '',
    startTime: '',
    timezone: 'IST',
    
    // Interview Rounds
    rounds: ['intro'],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 20, enabled: false, questionCount: 10 },
      coding: { duration: 45, enabled: false, language: 'javascript', difficulty: 'medium' }
    },
    
    // Communication
    sendEmail: true,
    sendSMS: false,
    customMessage: '',
  });
  
  // Candidates state
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [filterType, setFilterType] = useState('all');
  
  // UI state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedInterview, setSubmittedInterview] = useState(null);
  
  // Master data
  const [jobRoles, setJobRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [timezones, setTimezones] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMasterData(),
        fetchCandidates()
      ]);
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Handle preselected candidates from navigation
  useEffect(() => {
    if (preselectedCandidates.length > 0 && candidates.length > 0) {
      // Match preselected candidates with loaded candidates
      const matchedCandidates = candidates.filter(candidate => 
        preselectedCandidates.some(pre => 
          pre.id === candidate.id || 
          pre.email === candidate.email ||
          pre.name === candidate.name
        )
      );
      
      setSelectedCandidates(matchedCandidates);
      
      // Auto-populate interview title based on selection
      if (matchedCandidates.length === 1) {
        const candidate = matchedCandidates[0];
        setFormData(prev => ({
          ...prev,
          interviewTitle: `Interview with ${candidate.name} - ${new Date().toLocaleDateString()}`
        }));
      } else if (matchedCandidates.length > 1) {
        const types = [...new Set(matchedCandidates.map(c => c.type))];
        const titlePrefix = types.includes('student') ? 'Student Placement' : 'Candidate Interview';
        setFormData(prev => ({
          ...prev,
          interviewTitle: `${titlePrefix} - ${new Date().toLocaleDateString()} (${matchedCandidates.length} candidates)`
        }));
      }
    }
  }, [candidates, preselectedCandidates]);

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      const [jobRoles] = await Promise.all([
        roleApi.getAll()
      ]);
      
      if (jobRoles?.success) {
        setJobRoles(jobRoles.data || []);
      } else {
        // Fallback data
        setJobRoles([
          'Frontend Developer',
          'Backend Developer', 
          'Full Stack Developer',
          'DevOps Engineer',
          'UI/UX Designer',
          'Data Scientist',
          'QA Engineer',
          'Software Engineer Intern',
          'Student Intern',
          'Campus Placement - Software Engineer'
        ]);
      }

      setDepartments([
        'Engineering',
        'Product Development', 
        'Quality Assurance',
        'UI/UX Design',
        'Data Science',
        'Student Placement',
        'Campus Recruitment',
        'Internship Program'
      ]);

      setTimezones([
        'IST (Indian Standard Time)',
        'EST (Eastern Standard Time)',
        'PST (Pacific Standard Time)',
        'GMT (Greenwich Mean Time)'
      ]);
      
    } catch (error) {
      console.error('Error fetching master data:', error);
      // Set fallback data
      setJobRoles([
        'Frontend Developer',
        'Backend Developer', 
        'Full Stack Developer',
        'DevOps Engineer',
        'UI/UX Designer',
        'Data Scientist',
        'QA Engineer',
        'Software Engineer Intern',
        'Student Intern',
        'Campus Placement - Software Engineer'
      ]);
      setDepartments([
        'Engineering',
        'Product Development', 
        'Quality Assurance',
        'UI/UX Design',
        'Data Science',
        'Student Placement',
        'Campus Recruitment',
        'Internship Program'
      ]);
      setTimezones([
        'IST (Indian Standard Time)',
        'EST (Eastern Standard Time)',
        'PST (Pacific Standard Time)',
        'GMT (Greenwich Mean Time)'
      ]);
    }
  };

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setLoadingCandidates(true);
      setFetchError('');
      
      const response = await candidateApi.getAll({ limit: 100 });
      
      if (response?.success) {
        // Transform API data to match component structure
        const transformedCandidates = (response.data || []).map(candidate => ({
          id: candidate.id || candidate._id,
          name: candidate.personal?.fullName || 
                `${candidate.personal?.firstName || ''} ${candidate.personal?.lastName || ''}`.trim() || 
                'Unknown',
          email: candidate.personal?.email || '',
          phone: candidate.personal?.phone || '',
          type: candidate.type || 'candidate',
          status: candidate.professional?.status || 'active',
          skills: candidate.skills?.map(s => s.name || s) || [],
          education: candidate.education?.[0]?.degree || 'Not specified',
          experience: candidate.professional?.experience || 'Fresher',
          score: candidate.professional?.matchScore || Math.floor(Math.random() * 30) + 70
        }));
        
        setCandidates(transformedCandidates);
      } else {
        // Fallback sample data if API fails
        setCandidates([
          { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', type: 'student', status: 'active', 
            skills: ['React', 'JavaScript'], education: 'B.Tech CSE', experience: 'Fresher', score: 85 },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211', type: 'student', status: 'active',
            skills: ['Python', 'Django'], education: 'M.Tech CSE', experience: '1 year', score: 92 },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+91 9876543212', type: 'candidate', status: 'active',
            skills: ['Java', 'Spring Boot'], education: 'B.Sc CS', experience: '2 years', score: 78 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setFetchError('Failed to load candidates. Using sample data.');
      // Fallback sample data
      setCandidates([
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', type: 'student', status: 'active', 
          skills: ['React', 'JavaScript'], education: 'B.Tech CSE', experience: 'Fresher', score: 85 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211', type: 'student', status: 'active',
          skills: ['Python', 'Django'], education: 'M.Tech CSE', experience: '1 year', score: 92 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+91 9876543212', type: 'candidate', status: 'active',
          skills: ['Java', 'Spring Boot'], education: 'B.Sc CS', experience: '2 years', score: 78 }
      ]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Filter candidates based on search query and filter type
  const filteredCandidates = candidates.filter(candidate => {
    // Filter by type
    if (filterType !== 'all' && candidate.type !== filterType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(query) ||
      candidate.email?.toLowerCase().includes(query) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      candidate.education?.toLowerCase().includes(query)
    );
  });

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle round selection
  const handleRoundChange = (round, isChecked) => {
    setFormData(prev => {
      const rounds = isChecked 
        ? [...prev.rounds, round]
        : prev.rounds.filter(r => r !== round);
      
      return {
        ...prev,
        rounds,
        roundSettings: {
          ...prev.roundSettings,
          [round]: {
            ...prev.roundSettings[round],
            enabled: isChecked
          }
        }
      };
    });
  };

  // Handle round setting changes
  const handleRoundSettingChange = (round, setting, value) => {
    setFormData(prev => ({
      ...prev,
      roundSettings: {
        ...prev.roundSettings,
        [round]: {
          ...prev.roundSettings[round],
          [setting]: value
        }
      }
    }));
  };

  // Handle candidate selection
  const toggleCandidateSelection = (candidate) => {
    setSelectedCandidates(prev => {
      const isSelected = prev.some(c => c.id === candidate.id);
      if (isSelected) {
        return prev.filter(c => c.id !== candidate.id);
      } else {
        return [...prev, candidate];
      }
    });
  };

  // Remove candidate from selection
  const removeCandidate = (candidateId) => {
    setSelectedCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  // Select all filtered candidates
  const selectAllFiltered = () => {
    const newCandidates = filteredCandidates.filter(candidate => 
      !selectedCandidates.some(c => c.id === candidate.id)
    );
    setSelectedCandidates(prev => [...prev, ...newCandidates]);
  };

  // Deselect all filtered candidates
  const deselectAllFiltered = () => {
    const filteredIds = filteredCandidates.map(c => c.id);
    setSelectedCandidates(prev => prev.filter(c => !filteredIds.includes(c.id)));
  };

  // Calculate total duration
  const calculateTotalDuration = () => {
    let total = 0;
    formData.rounds.forEach(round => {
      if (formData.roundSettings[round]?.enabled) {
        total += formData.roundSettings[round].duration || 0;
      }
    });
    return total;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }
    
    if (formData.rounds.length === 0) {
      alert('Please select at least one interview round');
      return;
    }
    
    if (!formData.interviewDate || !formData.startTime) {
      alert('Please select interview date and time');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare data for API
      const interviewData = {
        interviewTitle: formData.interviewTitle,
        interviewType: formData.interviewType,
        jobTitle: formData.jobTitle,
        department: formData.department,
        interviewDate: formData.interviewDate,
        startTime: formData.startTime,
        timezone: formData.timezone,
        rounds: formData.rounds,
        roundSettings: formData.roundSettings,
        selectedCandidates: selectedCandidates.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          type: c.type
        })),
        sendEmail: formData.sendEmail,
        sendSMS: formData.sendSMS,
        customMessage: formData.customMessage
      };
      
      const response = await scheduleInterviewApi.schedule(interviewData);
      
      if (response?.success) {
        setIsSubmitted(true);
        setSubmittedInterview(response.data);
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(response?.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(error.response?.data?.message || 'An error occurred while scheduling the interview');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle navigation back
  const handleBack = () => {
    if (fromPage === 'candidate-list') {
      navigate('/hr/candidates');
    } else {
      navigate(-1);
    }
  };

  // Handle view scheduled interview
  const handleViewInterview = () => {
    if (submittedInterview?._id) {
      navigate(`/interviews/${submittedInterview._id}`);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Back Button */}
      {fromPage !== 'direct' && (
        <div className="mb-4">
          <button 
            className="consistent-btn consistent-btn-outline"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to {fromPage === 'candidate-list' ? 'Candidate List' : 'Previous Page'}
          </button>
        </div>
      )}

      {/* Header - Consistent with other pages */}
      <div className="consistent-card p-4 mb-4">
  <div className="consistent-header px-0">
    <h1>
      <i className="bi bi-calendar-plus me-2" style={{ color: '#4f46e5' }}></i>
      Schedule AI Interview
    </h1>
    <p>Schedule automated interviews for candidates or students with flexible round selection</p>
    {preselectedCandidates.length > 0 && (
      <div className="alert alert-info mt-3">
        <i className="bi bi-info-circle me-2"></i>
        <strong>{preselectedCandidates.length} candidate(s)</strong> pre-selected from candidate list.
        You can add or remove candidates below.
      </div>
    )}
  </div>
</div>

      {/* Error Message */}
      {fetchError && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {fetchError}
        </div>
      )}

      {/* Success Message */}
      {isSubmitted && (
        <div className="alert alert-success shadow-lg mb-4">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <i className="bi bi-check-circle-fill fs-1"></i>
            </div>
            <div className="flex-grow-1 ms-3">
              <h4 className="alert-heading">Interview Scheduled Successfully!</h4>
              <p className="mb-0">
                <strong>{selectedCandidates.length}</strong> candidate(s) have been invited for interview.
                Interview details have been sent via {formData.sendEmail ? 'email' : ''} {formData.sendSMS ? 'and SMS' : ''}.
              </p>
              <div className="mt-2">
                <strong>Scheduled for:</strong> {formatDateForDisplay(formData.interviewDate)} at {formatTimeForDisplay(formData.startTime)}
                <br />
                <strong>Duration:</strong> {calculateTotalDuration()} minutes
                <br />
                <strong>Rounds:</strong> {formData.rounds.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
              </div>
              <div className="mt-3">
                <button 
                  className="consistent-btn consistent-btn-primary me-2"
                  onClick={handleViewInterview}
                >
                  <i className="bi bi-eye me-2"></i>
                  View Interview Details
                </button>
                <button 
                  className="consistent-btn consistent-btn-outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedInterview(null);
                    setFormData({
                      interviewTitle: '',
                      interviewType: 'individual',
                      jobTitle: '',
                      department: '',
                      interviewDate: '',
                      startTime: '',
                      timezone: 'IST',
                      rounds: ['intro'],
                      roundSettings: {
                        intro: { duration: 5, enabled: true },
                        mcq: { duration: 20, enabled: false, questionCount: 10 },
                        coding: { duration: 45, enabled: false, language: 'javascript', difficulty: 'medium' }
                      },
                      sendEmail: true,
                      sendSMS: false,
                      customMessage: '',
                    });
                    setSelectedCandidates([]);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Schedule Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      {!isSubmitted && (
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Basic Details */}
            <div className="col-lg-6">
              <div className="consistent-table-container h-100">
                <div className="consistent-header" style={{ background: '#4f46e5', color: 'white' }}>
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Basic Information
                  </h5>
                </div>
                <div className="p-4">
                  <div className="consistent-form-group mb-3">
                    <label className="consistent-form-label">
                      Interview Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="consistent-form-control"
                      name="interviewTitle"
                      value={formData.interviewTitle}
                      onChange={handleChange}
                      placeholder="e.g., Campus Placement - Round 1"
                      required
                      disabled={submitting}
                    />
                    <small className="text-muted">
                      Give a descriptive name for this interview session
                    </small>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="consistent-form-group">
                        <label className="consistent-form-label">
                          Interview Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className="consistent-form-control"
                          name="interviewType"
                          value={formData.interviewType}
                          onChange={handleChange}
                          required
                          disabled={submitting}
                        >
                          <option value="individual">Individual Interview</option>
                          <option value="batch">Batch Interview</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="consistent-form-group">
                        <label className="consistent-form-label">
                          Role <span className="text-danger">*</span>
                        </label>
                        <select
                          className="consistent-form-control"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          required
                          disabled={submitting}
                        >
                          <option value="">Select Position</option>
                          {jobRoles.map((role, index) => (
                            <option key={role._id || index} value={role.name || role}>
                              {role.name || role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="consistent-form-group mb-3">
                    <label className="consistent-form-label">
                      Department / Program
                    </label>
                    <select
                      className="consistent-form-control"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="consistent-form-group mb-3">
                    <label className="consistent-form-label">
                      Timezone <span className="text-danger">*</span>
                    </label>
                    <select
                      className="consistent-form-control"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      {timezones.map((tz, index) => (
                        <option key={index} value={tz.split(' ')[0]}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="col-lg-6">
              <div className="consistent-table-container h-100">
                <div className="consistent-header" style={{ background: '#4f46e5', color: 'white' }}>
                  <h5 className="mb-0">
                    <i className="bi bi-calendar-event me-2"></i>
                    Date & Time
                  </h5>
                </div>
                <div className="p-4">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="consistent-form-group">
                        <label className="consistent-form-label">
                          Interview Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="consistent-form-control"
                          name="interviewDate"
                          value={formData.interviewDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="consistent-form-group">
                        <label className="consistent-form-label">
                          Start Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="consistent-form-control"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Total Duration:</strong> <span className="text-primary fw-bold">{calculateTotalDuration()} minutes</span>
                    <br />
                    <small className="text-muted">
                      Based on selected rounds: {formData.rounds.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Selection */}
            <div className="col-lg-12">
              <div className="consistent-table-container mb-4">
                <div className="consistent-header d-flex justify-content-between align-items-center" style={{ background: '#4f46e5', color: 'white' }}>
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Select Candidates
                  </h5>
                  <span className="consistent-badge light">
                    {selectedCandidates.length} selected
                  </span>
                </div>
                <div className="p-4">
                  <div className="row">
                    {/* Selected Candidates Preview */}
                    <div className="col-md-4">
                      <div className="selected-candidates-preview">
                        <h6 className="mb-3">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          Selected Candidates
                          <span className="consistent-badge success ms-2">{selectedCandidates.length}</span>
                        </h6>
                        
                        {selectedCandidates.length === 0 ? (
                          <div className="text-center py-4 border rounded bg-light">
                            <i className="bi bi-person-plus fs-1 text-muted mb-3"></i>
                            <p className="text-muted">No candidates selected yet</p>
                            <button 
                              className="consistent-btn consistent-btn-outline"
                              onClick={() => setShowCandidatesModal(true)}
                              disabled={loadingCandidates || submitting}
                            >
                              <i className="bi bi-search me-2"></i>
                              Browse Candidates
                            </button>
                          </div>
                        ) : (
                          <div className="selected-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {selectedCandidates.map(candidate => (
                              <div key={candidate.id} className="border rounded p-2 mb-2 bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong className="d-block">{candidate.name}</strong>
                                    <small className="text-muted">{candidate.email}</small>
                                    <div>
                                      <span className={`consistent-badge ${candidate.type === 'student' ? 'info' : 'primary'} me-1`}>
                                        {candidate.type}
                                      </span>
                                      <span className="consistent-badge secondary">
                                        Score: {candidate.score}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    className="consistent-btn consistent-btn-outline p-2"
                                    onClick={() => removeCandidate(candidate.id)}
                                    disabled={submitting}
                                    title="Remove"
                                    style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <button 
                            className="consistent-btn consistent-btn-primary w-100"
                            onClick={() => setShowCandidatesModal(true)}
                            disabled={loadingCandidates || submitting}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            {selectedCandidates.length > 0 ? 'Add More Candidates' : 'Select Candidates'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Statistics */}
                    <div className="col-md-8">
                      <div className="candidate-stats">
                        <h6 className="mb-3">Selection Summary</h6>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="consistent-stats-card" style={{ padding: '15px' }}>
                              <div className="d-flex align-items-center">
                                <div className="consistent-stats-icon primary me-3">
                                  <i className="bi bi-person"></i>
                                </div>
                                <div>
                                  <h3 className="mb-0">{selectedCandidates.length}</h3>
                                  <small className="text-muted">Total Selected</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="consistent-stats-card" style={{ padding: '15px' }}>
                              <div className="d-flex align-items-center">
                                <div className="consistent-stats-icon info me-3">
                                  <i className="bi bi-mortarboard"></i>
                                </div>
                                <div>
                                  <h3 className="mb-0">
                                    {selectedCandidates.filter(c => c.type === 'student').length}
                                  </h3>
                                  <small className="text-muted">Candidates</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {loadingCandidates ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm" style={{ color: '#4f46e5' }} role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2">Loading candidates...</span>
                          </div>
                        ) : (
                          <div className="alert alert-warning">
                            <i className="bi bi-lightbulb me-2"></i>
                            <strong>Tip:</strong> You can search, filter, and select multiple candidates in the selection modal.
                            Use batch selection for efficiency.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview Rounds */}
            <div className="col-lg-12">
              <div className="consistent-table-container">
                <div className="consistent-header" style={{ background: '#4f46e5', color: 'white' }}>
                  <h5 className="mb-0">
                    <i className="bi bi-list-task me-2"></i>
                    Interview Rounds Configuration
                  </h5>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <h5 className="mb-3">Select Rounds to Include:</h5>
                    <div className="d-flex flex-wrap gap-4 mb-4">
                      <div className="round-option">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="round-intro"
                            checked={formData.rounds.includes('intro')}
                            onChange={(e) => handleRoundChange('intro', e.target.checked)}
                            disabled={submitting}
                          />
                          <label className="form-check-label" htmlFor="round-intro">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle p-2 me-3" style={{ background: '#eef2ff' }}>
                                <i className="bi bi-mic fs-4" style={{ color: '#4f46e5' }}></i>
                              </div>
                              <div>
                                <h6 className="mb-1">Self Introduction</h6>
                                <small className="text-muted">AI evaluates communication skills</small>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="round-option">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="round-mcq"
                            checked={formData.rounds.includes('mcq')}
                            onChange={(e) => handleRoundChange('mcq', e.target.checked)}
                            disabled={submitting}
                          />
                          <label className="form-check-label" htmlFor="round-mcq">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle p-2 me-3" style={{ background: '#e8f5e9' }}>
                                <i className="bi bi-question-circle fs-4" style={{ color: '#10b981' }}></i>
                              </div>
                              <div>
                                <h6 className="mb-1">MCQ Test</h6>
                                <small className="text-muted">Technical knowledge assessment</small>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="round-option">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="round-coding"
                            checked={formData.rounds.includes('coding')}
                            onChange={(e) => handleRoundChange('coding', e.target.checked)}
                            disabled={submitting}
                          />
                          <label className="form-check-label" htmlFor="round-coding">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle p-2 me-3" style={{ background: '#fff3e0' }}>
                                <i className="bi bi-code-slash fs-4" style={{ color: '#f59e0b' }}></i>
                              </div>
                              <div>
                                <h6 className="mb-1">Coding Test</h6>
                                <small className="text-muted">Practical coding challenges</small>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Round Settings */}
                  {formData.rounds.length > 0 && (
                    <div className="round-settings-section">
                      <h5 className="mb-3">Round Settings:</h5>
                      <div className="row g-3">
                        {/* Self Introduction Settings */}
                        {formData.roundSettings.intro.enabled && (
                          <div className="col-md-6">
                            <div className="consistent-table-container h-100">
                              <div className="consistent-header py-2" style={{ background: '#eef2ff' }}>
                                <h6 className="mb-0">
                                  <i className="bi bi-mic me-2" style={{ color: '#4f46e5' }}></i>
                                  Self Introduction
                                </h6>
                              </div>
                              <div className="p-3">
                                <div className="consistent-form-group">
                                  <label className="consistent-form-label">Duration</label>
                                  <div className="d-flex gap-2 align-items-center">
                                    <select
                                      className="consistent-form-control"
                                      style={{ width: '120px' }}
                                      value={formData.roundSettings.intro.durationUnit || 'minutes'}
                                      onChange={(e) => handleRoundSettingChange('intro', 'durationUnit', e.target.value)}
                                      disabled={submitting}
                                    >
                                      <option value="minutes">Minutes</option>
                                      <option value="hours">Hours</option>
                                    </select>
                                    <input
                                      type="number"
                                      className="consistent-form-control"
                                      style={{ width: '100px' }}
                                      min="1"
                                      max="999"
                                      value={formData.roundSettings.intro.duration || 5}
                                      onChange={(e) => handleRoundSettingChange('intro', 'duration', parseInt(e.target.value) || 1)}
                                      disabled={submitting}
                                    />
                                  </div>
                                  <small className="text-muted">
                                    Set duration for self-introduction round
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MCQ Settings */}
                        {formData.roundSettings.mcq.enabled && (
                          <div className="col-md-6">
                            <div className="consistent-table-container h-100">
                              <div className="consistent-header py-2" style={{ background: '#e8f5e9' }}>
                                <h6 className="mb-0">
                                  <i className="bi bi-question-circle me-2" style={{ color: '#10b981' }}></i>
                                  MCQ Test
                                </h6>
                              </div>
                              <div className="p-3">
                                <div className="row">
                                  <div className="col-md-7">
                                    <div className="consistent-form-group">
                                      <label className="consistent-form-label">Duration</label>
                                      <div className="d-flex gap-2 align-items-center">
                                        <select
                                          className="consistent-form-control"
                                          style={{ width: '100px' }}
                                          value={formData.roundSettings.mcq.durationUnit || 'minutes'}
                                          onChange={(e) => handleRoundSettingChange('mcq', 'durationUnit', e.target.value)}
                                          disabled={submitting}
                                        >
                                          <option value="minutes">Mins</option>
                                          <option value="hours">Hours</option>
                                        </select>
                                        <input
                                          type="number"
                                          className="consistent-form-control"
                                          style={{ width: '80px' }}
                                          min="1"
                                          max="999"
                                          value={formData.roundSettings.mcq.duration || 20}
                                          onChange={(e) => handleRoundSettingChange('mcq', 'duration', parseInt(e.target.value) || 1)}
                                          disabled={submitting}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-5">
                                    <div className="consistent-form-group">
                                      <label className="consistent-form-label">Questions</label>
                                      <input
                                        type="number"
                                        className="consistent-form-control"
                                        min="1"
                                        max="500"
                                        value={formData.roundSettings.mcq.questionCount || 10}
                                        onChange={(e) => handleRoundSettingChange('mcq', 'questionCount', parseInt(e.target.value) || 1)}
                                        disabled={submitting}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Coding Test Settings */}
                        {formData.roundSettings.coding.enabled && (
                          <div className="col-md-6">
                            <div className="consistent-table-container h-100">
                              <div className="consistent-header py-2" style={{ background: '#fff3e0' }}>
                                <h6 className="mb-0">
                                  <i className="bi bi-code-slash me-2" style={{ color: '#f59e0b' }}></i>
                                  Coding Test
                                </h6>
                              </div>
                              <div className="p-3">
                                <div className="row mb-3">
                                  <div className="col-md-7">
                                    <div className="consistent-form-group">
                                      <label className="consistent-form-label">Duration</label>
                                      <div className="d-flex gap-2 align-items-center">
                                        <select
                                          className="consistent-form-control"
                                          style={{ width: '100px' }}
                                          value={formData.roundSettings.coding.durationUnit || 'minutes'}
                                          onChange={(e) => handleRoundSettingChange('coding', 'durationUnit', e.target.value)}
                                          disabled={submitting}
                                        >
                                          <option value="minutes">Mins</option>
                                          <option value="hours">Hours</option>
                                        </select>
                                        <input
                                          type="number"
                                          className="consistent-form-control"
                                          style={{ width: '80px' }}
                                          min="1"
                                          max="999"
                                          value={formData.roundSettings.coding.duration || 45}
                                          onChange={(e) => handleRoundSettingChange('coding', 'duration', parseInt(e.target.value) || 1)}
                                          disabled={submitting}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-5">
                                    <div className="consistent-form-group">
                                      <label className="consistent-form-label">Difficulty</label>
                                      <select
                                        className="consistent-form-control"
                                        value={formData.roundSettings.coding.difficulty}
                                        onChange={(e) => handleRoundSettingChange('coding', 'difficulty', e.target.value)}
                                        disabled={submitting}
                                      >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="consistent-form-group">
                                  <label className="consistent-form-label">Programming Language</label>
                                  <select
                                    className="consistent-form-control"
                                    value={formData.roundSettings.coding.language}
                                    onChange={(e) => handleRoundSettingChange('coding', 'language', e.target.value)}
                                    disabled={submitting}
                                  >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="csharp">C#</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary of selected rounds */}
                      {formData.rounds.length > 0 && (
                        <div className="mt-4 p-3 bg-light rounded">
                          <h6 className="mb-2">Selected Rounds Summary:</h6>
                          <div className="row">
                            {formData.rounds.map(round => {
                              const settings = formData.roundSettings[round];
                              if (!settings?.enabled) return null;
                              
                              let durationText = '';
                              if (settings.durationUnit === 'hours') {
                                durationText = `${settings.duration} hour${settings.duration > 1 ? 's' : ''}`;
                              } else {
                                durationText = `${settings.duration} minutes`;
                              }
                              
                              return (
                                <div className="col-md-4" key={round}>
                                  <span className="consistent-badge light p-2 me-2 mb-2">
                                    <i className={`bi bi-${
                                      round === 'intro' ? 'mic' : 
                                      round === 'mcq' ? 'question-circle' : 'code-slash'
                                    } me-1`}></i>
                                    {round.charAt(0).toUpperCase() + round.slice(1)}: {durationText}
                                    {round === 'mcq' && ` • ${settings.questionCount} questions`}
                                    {round === 'coding' && ` • ${settings.difficulty}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Communication Settings */}
            <div className="col-lg-12">
              <div className="consistent-table-container mt-4">
                <div className="consistent-header" style={{ background: '#4f46e5', color: 'white' }}>
                  <h5 className="mb-0">
                    <i className="bi bi-envelope me-2"></i>
                    Communication Settings
                  </h5>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-5">
            <button
              className="consistent-btn consistent-btn-primary px-5 py-3 me-3"
              type="submit"
              disabled={selectedCandidates.length === 0 || submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Scheduling...
                </>
              ) : (
                <>
                  <i className="bi bi-calendar-check me-2"></i>
                  Schedule Interview ({selectedCandidates.length} candidates)
                </>
              )}
            </button>
            <button
              className="consistent-btn consistent-btn-outline px-5 py-3"
              type="button"
              onClick={() => {
                setFormData({
                  interviewTitle: '',
                  interviewType: 'individual',
                  jobTitle: '',
                  department: '',
                  interviewDate: '',
                  startTime: '',
                  timezone: 'IST',
                  rounds: ['intro'],
                  roundSettings: {
                    intro: { duration: 5, enabled: true },
                    mcq: { duration: 20, enabled: false, questionCount: 10 },
                    coding: { duration: 45, enabled: false, language: 'javascript', difficulty: 'medium' }
                  },
                  sendEmail: true,
                  sendSMS: false,
                  customMessage: '',
                });
                setSelectedCandidates([]);
              }}
              disabled={submitting}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset Form
            </button>
          </div>
        </form>
      )}

      {/* Candidates Selection Modal */}
      {showCandidatesModal && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '1000px' }}>
            <div className="consistent-modal-header" style={{ background: '#4f46e5', color: 'white' }}>
              <h5>
                <i className="bi bi-people me-2"></i>
                Select Candidates
                <span className="consistent-badge light ms-2">
                  {selectedCandidates.length} selected
                </span>
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowCandidatesModal(false)}
              ></button>
            </div>
            
            <div className="consistent-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Search and Filter Bar */}
              <div className="sticky-top bg-white pb-3 pt-2" style={{ zIndex: 1 }}>
                <div className="row g-2">
                  <div className="col-md-8">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search" style={{ color: '#64748b' }}></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by name, email, skills, or education..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loadingCandidates}
                        style={{ borderColor: '#e2e8f0' }}
                      />
                      {searchQuery && (
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => setSearchQuery('')}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="consistent-form-control"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      disabled={loadingCandidates}
                    >
                      <option value="all">All Types</option>
                      <option value="student">Students Only</option>
                      <option value="candidate">Candidates Only</option>
                    </select>
                  </div>
                </div>
                
                {/* Batch Actions */}
                <div className="d-flex justify-content-between mt-2">
                  <div>
                    <button 
                      className="consistent-btn consistent-btn-outline"
                      onClick={selectAllFiltered}
                      disabled={filteredCandidates.length === 0 || loadingCandidates}
                    >
                      <i className="bi bi-check-all me-1"></i>
                      Select All ({filteredCandidates.length})
                    </button>
                    <button 
                      className="consistent-btn consistent-btn-outline ms-2"
                      onClick={deselectAllFiltered}
                      disabled={selectedCandidates.length === 0 || loadingCandidates}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Deselect All
                    </button>
                  </div>
                  <div>
                    <span className="consistent-badge info me-2">
                      Showing: {filteredCandidates.length}
                    </span>
                    <span className="consistent-badge success">
                      Selected: {selectedCandidates.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs for Search vs Selected View */}
              {loadingCandidates ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading candidates...</p>
                </div>
              ) : (
                <div className="mt-3">
                  {/* Tab Navigation */}
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className={`consistent-btn ${activeTab === 'search' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                      onClick={() => setActiveTab('search')}
                    >
                      Search Results ({filteredCandidates.length})
                    </button>
                    <button
                      className={`consistent-btn ${activeTab === 'selected' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                      onClick={() => setActiveTab('selected')}
                    >
                      Selected ({selectedCandidates.length})
                    </button>
                  </div>

                  {/* Search Results Tab */}
                  {activeTab === 'search' && (
                    <div>
                      {filteredCandidates.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-search fs-1 text-muted mb-3"></i>
                          <h5 className="text-muted">No candidates found</h5>
                          <p className="text-muted">Try a different search term or filter</p>
                        </div>
                      ) : (
                        <div className="row">
                          {filteredCandidates.map(candidate => {
                            const isSelected = selectedCandidates.some(c => c.id === candidate.id);
                            return (
                              <div className="col-md-6 col-lg-4 mb-3" key={candidate.id}>
                                <div className={`consistent-table-container h-100 ${isSelected ? 'border-success border-2' : ''}`}>
                                  <div className="p-3">
                                    <div className="d-flex align-items-start">
                                      <div className="form-check me-3 mt-1">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          checked={isSelected}
                                          onChange={() => toggleCandidateSelection(candidate)}
                                        />
                                      </div>
                                      <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <div>
                                            <h6 className="mb-1">{candidate.name}</h6>
                                            <p className="mb-1 small text-muted">
                                              <i className="bi bi-envelope me-1"></i>
                                              {candidate.email}
                                            </p>
                                          </div>
                                          {isSelected && (
                                            <span className="consistent-badge success">
                                              <i className="bi bi-check"></i>
                                            </span>
                                          )}
                                        </div>
                                        
                                        <div className="mb-2">
                                          <span className={`consistent-badge ${candidate.type === 'student' ? 'info' : 'primary'} me-1`}>
                                            {candidate.type}
                                          </span>
                                          <span className={`consistent-badge ${candidate.status === 'active' ? 'success' : 'warning'} me-1`}>
                                            {candidate.status}
                                          </span>
                                          <span className="consistent-badge secondary">
                                            Score: {candidate.score}
                                          </span>
                                        </div>
                                        
                                        <div className="small mb-2">
                                          <strong>Education:</strong> {candidate.education}
                                        </div>
                                        
                                        <div className="small mb-2">
                                          <strong>Experience:</strong> {candidate.experience}
                                        </div>
                                        
                                        <div className="small">
                                          <strong>Skills:</strong> 
                                          <div className="mt-1">
                                            {candidate.skills?.map((skill, idx) => (
                                              <span key={idx} className="consistent-badge secondary me-1 mb-1">
                                                {skill}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Tab */}
                  {activeTab === 'selected' && (
                    <div>
                      {selectedCandidates.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-person-plus fs-1 text-muted mb-3"></i>
                          <h5 className="text-muted">No candidates selected yet</h5>
                          <p className="text-muted">Switch to Search tab to select candidates</p>
                        </div>
                      ) : (
                        <div className="row">
                          {selectedCandidates.map(candidate => (
                            <div className="col-md-6 col-lg-4 mb-3" key={candidate.id}>
                              <div className="consistent-table-container h-100 border-success border-2">
                                <div className="p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="mb-1">{candidate.name}</h6>
                                    <button
                                      className="consistent-btn consistent-btn-outline p-1"
                                      onClick={() => removeCandidate(candidate.id)}
                                      style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                                    >
                                      <i className="bi bi-x"></i>
                                    </button>
                                  </div>
                                  <p className="small text-muted mb-2">
                                    <i className="bi bi-envelope me-1"></i>
                                    {candidate.email}
                                  </p>
                                  <div className="mb-2">
                                    <span className={`consistent-badge ${candidate.type === 'student' ? 'info' : 'primary'} me-1`}>
                                      {candidate.type}
                                    </span>
                                    <span className="consistent-badge secondary">
                                      Score: {candidate.score}
                                    </span>
                                  </div>
                                  <div className="small">
                                    <strong>Skills:</strong> 
                                    <div className="mt-1">
                                      {candidate.skills?.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="consistent-badge secondary me-1 mb-1">
                                          {skill}
                                        </span>
                                      ))}
                                      {candidate.skills?.length > 3 && (
                                        <span className="consistent-badge secondary">
                                          +{candidate.skills.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => setShowCandidatesModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="consistent-btn consistent-btn-primary"
                onClick={() => setShowCandidatesModal(false)}
              >
                <i className="bi bi-check-circle me-2"></i>
                Confirm Selection ({selectedCandidates.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleInterview;