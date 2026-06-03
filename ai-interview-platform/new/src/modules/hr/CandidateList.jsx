import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '../services/api';
import '../../styles/shared-styles.css';

const HRCandidateProfiles = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterSkills, setFilterSkills] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('personal');
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [error, setError] = useState('');

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showProfileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProfileModal]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        experience: filterExperience !== 'all' ? filterExperience : undefined,
        skills: filterSkills.length > 0 ? filterSkills : undefined,
        sortBy: sortBy !== 'relevance' ? sortBy : undefined
      };
      
      const response = await candidateApi.getAll(filters);
      
      if (response && response.success === false) {
        setError(response.message || 'Failed to fetch candidates');
        setCandidates([]);
      } else if (response && response.data) {
        setCandidates(response.data);
        setTotalCandidates(response.total || response.data.length);
      } else if (Array.isArray(response)) {
        setCandidates(response);
        setTotalCandidates(response.length);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError(error.message || 'Failed to fetch candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
  const getSkillLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'expert': return 'success';
      case 'advanced': return 'primary';
      case 'intermediate': return 'warning';
      case 'beginner': return 'info';
      default: return 'secondary';
    }
  };

  const getProficiencyIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'expert': return '⭐️⭐️⭐️⭐️⭐️';
      case 'advanced': return '⭐️⭐️⭐️⭐️';
      case 'intermediate': return '⭐️⭐️⭐️';
      case 'beginner': return '⭐️⭐️';
      default: return '⭐️';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatLongDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not disclosed';
    const num = parseInt(salary);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${(num / 1000).toFixed(0)}K`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Calculate stats from real data
  const stats = [
    { 
      title: "Total Candidates", 
      value: totalCandidates, 
      icon: "bi-people-fill", 
      color: "primary"
    },
    { 
      title: "Active Candidates", 
      value: candidates.filter(c => c.professional?.status === 'Active').length, 
      icon: "bi-person-check-fill", 
      color: "success"
    },
    { 
      title: "Available Now", 
      value: candidates.filter(c => c.professional?.noticePeriod?.toLowerCase().includes('immediate')).length, 
      icon: "bi-lightning-charge-fill", 
      color: "warning"
    },
    { 
      title: "Avg. Experience", 
      value: candidates.length ? 
        `${Math.round(candidates.reduce((acc, c) => 
          acc + parseInt(c.professional?.experience || 0), 0) / candidates.length)} yrs` : '0 yrs', 
      icon: "bi-briefcase-fill", 
      color: "info"
    }
  ];

  const allSkills = [...new Set(candidates.flatMap(c => c.skills?.map(s => s.name) || []))];

  // Filter candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      const searchMatch = !searchTerm || 
        candidate.personal?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.professional?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.professional?.candidateId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.personal?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const statusMatch = filterStatus === 'all' || 
        (filterStatus === 'active' && candidate.professional?.status === 'Active') ||
        (filterStatus === 'inactive' && candidate.professional?.status !== 'Active') ||
        (filterStatus === 'interviewing' && candidate.interviews?.length > 0) ||
        (filterStatus === 'offered' && candidate.offers > 0);

      let experienceMatch = true;
      if (filterExperience !== 'all') {
        const exp = parseInt(candidate.professional?.experience) || 0;
        if (filterExperience === 'fresher') experienceMatch = exp < 1;
        else if (filterExperience === 'junior') experienceMatch = exp >= 1 && exp < 3;
        else if (filterExperience === 'mid') experienceMatch = exp >= 3 && exp < 6;
        else if (filterExperience === 'senior') experienceMatch = exp >= 6 && exp < 10;
        else if (filterExperience === 'lead') experienceMatch = exp >= 10;
      }

      const skillsMatch = filterSkills.length === 0 || 
        filterSkills.every(skill => candidate.skills?.some(s => s.name === skill));

      return searchMatch && statusMatch && experienceMatch && skillsMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'relevance') return (b.professional?.matchScore || 0) - (a.professional?.matchScore || 0);
      if (sortBy === 'newest') return new Date(b.lastActive) - new Date(a.lastActive);
      if (sortBy === 'oldest') return new Date(a.lastActive) - new Date(b.lastActive);
      if (sortBy === 'name') return a.personal?.fullName?.localeCompare(b.personal?.fullName);
      if (sortBy === 'experience') {
        const expA = parseInt(a.professional?.experience) || 0;
        const expB = parseInt(b.professional?.experience) || 0;
        return expB - expA;
      }
      if (sortBy === 'match') return (b.professional?.matchScore || 0) - (a.professional?.matchScore || 0);
      return 0;
    });

  const handleViewProfile = async (candidate) => {
    try {
      setShowProfileModal(true);
      
      // If we already have detailed data, use it
      if (candidate.skills && candidate.skills.length > 0 && candidate.education) {
        setSelectedCandidate(candidate);
      } else {
        // Fetch detailed profile
        const response = await candidateApi.getById(candidate.id);
        if (response && response.success === false) {
          console.error('Failed to fetch profile:', response.message);
          setSelectedCandidate(candidate);
        } else {
          setSelectedCandidate(response.data || response);
        }
      }
      
      setProfileActiveTab('personal');
    } catch (error) {
      console.error('Error viewing profile:', error);
      setSelectedCandidate(candidate);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setTimeout(() => setSelectedCandidate(null), 300);
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
    setShowBulkActions(true);
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
      setShowBulkActions(false);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
      setShowBulkActions(true);
    }
  };

  const handleShortlist = async (candidateId) => {
    try {
      const response = await candidateApi.shortlist(candidateId);
      if (response && response.success === false) {
        alert(response.message || 'Failed to shortlist candidate');
      } else {
        alert('Candidate shortlisted successfully!');
        fetchCandidates();
        if (showProfileModal) handleCloseProfile();
      }
    } catch (error) {
      console.error('Error shortlisting:', error);
      alert('An error occurred while shortlisting');
    }
  };

  const handleDownloadResume = async (candidateId, fileName) => {
    try {
      const blob = await candidateApi.downloadResume(candidateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume');
    }
  };

  const handleBulkExport = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        skills: filterSkills.length > 0 ? filterSkills : undefined
      };
      
      const blob = await candidateApi.export(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting candidates:', error);
      alert('Failed to export candidates');
    }
  };

  const handleBulkEmail = () => {
    if (selectedCandidates.length === 0) return;
    const emails = candidates
      .filter(c => selectedCandidates.includes(c.id))
      .map(c => c.personal?.email)
      .join(',');
    window.location.href = `mailto:?bcc=${emails}`;
  };

  const handleScheduleInterview = () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate to schedule an interview');
      return;
    }
    
    // Navigate to schedule interview page with selected candidates data
    navigate('/hr/schedule-interview', {
      state: {
        selectedCandidates: selectedCandidates,
        fromPage: 'candidate-list'
      }
    });
  };

  const handleScheduleFromProfile = (candidate) => {
    // Close the profile modal
    setShowProfileModal(false);
    
    // Navigate to schedule interview page with single candidate
    navigate('/hr/schedule-interview', {
      state: {
        selectedCandidates: [candidate],
        fromPage: 'candidate-profile',
        preselectedCandidate: candidate
      }
    });
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="consistent-card p-4">
  <div className="consistent-header px-0 d-flex justify-content-between align-items-center">
    <div>
      <h1>
        <i className="bi bi-people me-2" style={{ color: '#4f46e5' }}></i>
        Candidate Profiles
      </h1>
      <p>View and manage candidate applications</p>
    </div>
  </div>
</div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4 mt-2">
        {stats.map((stat, i) => (
          <div key={i} className="col-xl-3 col-lg-4 col-md-6">
            <div className="consistent-stats-card">
              <div className={`consistent-stats-icon ${stat.color}`}>
                <i className={`bi ${stat.icon}`}></i>
              </div>
              <div className="consistent-stats-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error message if any */}
      {error && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Advanced Search & Filter Bar */}
      <div className="consistent-filter-bar">
        <div className="filter-header d-flex justify-content-between align-items-center mb-3">
          <div className="filter-title d-flex align-items-center">
            <i className="bi bi-sliders2 me-2" style={{ color: '#4f46e5' }}></i>
            <span className="fw-semibold" style={{ color: '#1e293b' }}>Smart Filters</span>
          </div>
          <button 
            className="consistent-btn consistent-btn-outline"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterExperience('all');
              setFilterSkills([]);
              setSortBy('relevance');
            }}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reset
          </button>
        </div>

        <div className="filter-body">
          <div className="row g-3">
            <div className="col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" style={{ color: '#64748b' }}></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, skills, role, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderColor: '#e2e8f0' }}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-lg-2">
              <select 
                className="consistent-form-control"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="col-lg-2">
              <select 
                className="consistent-form-control"
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
              >
                <option value="all">All Experience</option>
                <option value="fresher">Fresher (0-1 yrs)</option>
                <option value="junior">Junior (1-3 yrs)</option>
                <option value="mid">Mid-Level (3-6 yrs)</option>
                <option value="senior">Senior (6-10 yrs)</option>
                <option value="lead">Lead (10+ yrs)</option>
              </select>
            </div>
            
            <div className="col-lg-2">
              <select 
                className="consistent-form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="match">Sort: Match Score</option>
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="name">Sort: Name A-Z</option>
                <option value="experience">Sort: Experience</option>
              </select>
            </div>
            
            <div className="col-lg-2">
              <div className="d-flex gap-2">
                <button 
                  className={`consistent-btn ${viewMode === 'grid' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </button>
                <button 
                  className={`consistent-btn ${viewMode === 'list' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Skills Filter Chips */}
          {allSkills.length > 0 && (
            <div className="mt-3 pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <span className="me-3 fw-semibold" style={{ color: '#475569', fontSize: '13px' }}>Skills:</span>
                <div className="d-flex flex-wrap gap-2">
                  {allSkills.slice(0, 15).map(skill => (
                    <button
                      key={skill}
                      className={`consistent-badge ${filterSkills.includes(skill) ? 'primary' : 'secondary'} cursor-pointer`}
                      onClick={() => {
                        if (filterSkills.includes(skill)) {
                          setFilterSkills(filterSkills.filter(s => s !== skill));
                        } else {
                          setFilterSkills([...filterSkills, skill]);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {skill}
                    </button>
                  ))}
                  {allSkills.length > 15 && (
                    <span className="consistent-badge secondary">
                      +{allSkills.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedCandidates.length > 0 && (
        <div className="consistent-filter-bar mb-4" style={{ background: '#eef2ff', border: '1px solid #4f46e5' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <span className="consistent-badge primary me-3">{selectedCandidates.length}</span>
              <span style={{ color: '#1e293b' }}>candidates selected</span>
            </div>
            <div className="d-flex gap-2">
              <button className="consistent-btn consistent-btn-outline" onClick={handleBulkEmail}>
                <i className="bi bi-envelope me-2"></i>
                Send Email
              </button>
              <button className="consistent-btn consistent-btn-outline" onClick={handleScheduleInterview}>
                <i className="bi bi-calendar-plus me-2"></i>
                Schedule Interview
              </button>
              <button className="consistent-btn consistent-btn-outline" onClick={handleBulkExport}>
                <i className="bi bi-download me-2"></i>
                Export
              </button>
              <button 
                className="consistent-btn consistent-btn-outline"
                onClick={() => {
                  setSelectedCandidates([]);
                  setShowBulkActions(false);
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-0">
            <span className="fw-bold" style={{ color: '#1e293b', fontSize: '24px' }}>{filteredCandidates.length}</span>
            <span style={{ color: '#64748b', marginLeft: '8px' }}>Candidates Found</span>
          </h5>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            Showing {Math.min(filteredCandidates.length, 10)} of {totalCandidates} total candidates
          </p>
        </div>
        <div className="d-flex align-items-center">
          <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
            <input 
              type="checkbox"
              className="form-check-input"
              checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
              onChange={handleSelectAll}
            />
            <span style={{ color: '#1e293b', fontSize: '14px' }}>Select All</span>
          </label>
        </div>
      </div>

      {/* Candidates Grid/List View */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: '#64748b' }}>Loading candidate profiles...</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="row g-4">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(candidate => (
                  <div key={candidate.id} className="col-xl-4 col-lg-6">
                    <div className={`consistent-table-container h-100 ${selectedCandidates.includes(candidate.id) ? 'border-success border-2' : ''}`}>
                      <div className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <label className="d-flex align-items-center">
                            <input 
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={selectedCandidates.includes(candidate.id)}
                              onChange={() => handleSelectCandidate(candidate.id)}
                            />
                          </label>
                          <span className={`consistent-badge ${
                            candidate.professional?.matchScore >= 90 ? 'success' : 
                            candidate.professional?.matchScore >= 75 ? 'primary' : 'warning'
                          }`}>
                            {candidate.professional?.matchScore || 0}% Match
                          </span>
                        </div>

                        <div className="d-flex gap-3 mb-4">
                          <div className="position-relative">
                            <img 
                              src={candidate.personal?.profilePhoto} 
                              alt={candidate.personal?.fullName}
                              className="rounded-circle"
                              style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.personal?.fullName || 'User')}&background=4f46e5&color=fff&size=128`;
                              }}
                            />
                            <span className="position-absolute bottom-0 end-0" style={{ width: '12px', height: '12px', backgroundColor: '#10b981', border: '2px solid white', borderRadius: '50%' }}></span>
                          </div>
                          <div>
                            <h5 className="fw-semibold mb-1" style={{ color: '#1e293b' }}>{candidate.personal?.fullName}</h5>
                            <p className="mb-1" style={{ color: '#4f46e5', fontWeight: '500' }}>{candidate.professional?.title}</p>
                            <p className="mb-0" style={{ color: '#64748b', fontSize: '13px' }}>
                              <i className="bi bi-building me-1"></i>
                              {candidate.professional?.currentCompany}
                            </p>
                          </div>
                        </div>

                        <div className="row g-2 mb-4">
                          <div className="col-4 text-center">
                            <div className="p-2 bg-light rounded">
                              <i className="bi bi-briefcase" style={{ color: '#4f46e5' }}></i>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{candidate.professional?.experience}</div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="p-2 bg-light rounded">
                              <i className="bi bi-clock" style={{ color: '#4f46e5' }}></i>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{candidate.professional?.noticePeriod}</div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="p-2 bg-light rounded">
                              <i className="bi bi-currency-rupee" style={{ color: '#4f46e5' }}></i>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{formatSalary(candidate.professional?.expectedSalary)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-4">
                          {candidate.skills?.slice(0, 4).map((skill, i) => (
                            <span 
                              key={i} 
                              className={`consistent-badge ${getSkillLevelColor(skill.level)}`}
                            >
                              {skill.name}
                              {skill.verified && (
                                <i className="bi bi-patch-check-fill ms-1" title="Verified"></i>
                              )}
                            </span>
                          ))}
                          {candidate.skills?.length > 4 && (
                            <span className="consistent-badge secondary">
                              +{candidate.skills.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
                          <div>
                            <small className="d-block" style={{ color: '#94a3b8' }}>
                              <i className="bi bi-person-badge me-1"></i>
                              {candidate.professional?.candidateId}
                            </small>
                            <small style={{ color: '#94a3b8' }}>
                              <i className="bi bi-clock-history me-1"></i>
                              {getTimeAgo(candidate.lastActive)}
                            </small>
                          </div>
                          <button 
                            className="consistent-btn consistent-btn-primary"
                            onClick={() => handleViewProfile(candidate)}
                          >
                            View Profile
                            <i className="bi bi-arrow-right ms-2"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="consistent-table-container text-center py-5">
                    <i className="bi bi-search fs-1" style={{ color: '#cbd5e1' }}></i>
                    <h5 className="mt-3" style={{ color: '#64748b' }}>No candidates found</h5>
                    <p style={{ color: '#94a3b8' }}>Try adjusting your search filters or criteria</p>
                    <button 
                      className="consistent-btn consistent-btn-primary mt-2"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterExperience('all');
                        setFilterSkills([]);
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="consistent-table-container">
              <div className="table-responsive">
                <table className="consistent-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input 
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Candidate</th>
                      <th>Position</th>
                      <th>Top Skills</th>
                      <th>Exp</th>
                      <th>Match</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? 'bg-light' : ''}>
                        <td>
                          <input 
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => handleSelectCandidate(candidate.id)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img 
                              src={candidate.personal?.profilePhoto} 
                              alt={candidate.personal?.fullName}
                              className="rounded-circle"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.personal?.fullName || 'User')}&background=4f46e5&color=fff&size=128`;
                              }}
                            />
                            <div>
                              <div className="fw-semibold" style={{ color: '#1e293b' }}>{candidate.personal?.fullName}</div>
                              <small style={{ color: '#64748b' }}>{candidate.professional?.candidateId}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ color: '#334155' }}><strong>{candidate.professional?.title}</strong></div>
                            <small style={{ color: '#64748b' }}>{candidate.professional?.currentCompany}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {candidate.professional?.topSkills?.slice(0, 3).map((skill, i) => (
                              <span key={i} className="consistent-badge secondary small">{skill}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="consistent-badge secondary">
                            {candidate.professional?.experience}
                          </span>
                        </td>
                        <td>
                          <span className={`consistent-badge ${
                            candidate.professional?.matchScore >= 90 ? 'success' : 
                            candidate.professional?.matchScore >= 75 ? 'primary' : 'warning'
                          }`}>
                            {candidate.professional?.matchScore || 0}%
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <button 
                              className="consistent-btn consistent-btn-outline p-2"
                              onClick={() => handleViewProfile(candidate)}
                              title="View Profile"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="consistent-btn consistent-btn-outline p-2"
                              onClick={() => window.location.href = `mailto:${candidate.personal?.email}`}
                              title="Send Email"
                            >
                              <i className="bi bi-envelope"></i>
                            </button>
                            <button 
                              className="consistent-btn consistent-btn-outline p-2"
                              onClick={() => handleShortlist(candidate.id)}
                              title="Shortlist"
                            >
                              <i className="bi bi-bookmark-plus"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========== PROFILE POPUP ========== */}
      {selectedCandidate && (
        <div 
          className="consistent-modal-overlay"
          style={{ display: showProfileModal ? 'flex' : 'none' }}
          onClick={handleCloseProfile}
        >
          <div 
            className="consistent-modal"
            style={{ maxWidth: '1300px', height: '85vh', padding: 0, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            
            {/* ----- HEADER ----- */}
            <div className="consistent-modal-header d-flex justify-content-between align-items-center" style={{ background: '#4f46e5', color: 'white' }}>
              <div className="d-flex align-items-center gap-3">
                <button className="btn-back" onClick={handleCloseProfile} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', width: '36px', height: '36px' }}>
                  <i className="bi bi-arrow-left"></i>
                </button>
                <div className="d-flex align-items-center gap-3">
                  <h5 className="mb-0">Candidate Profile</h5>
                  <span className="consistent-badge light">
                    <i className="bi bi-person-badge me-1"></i>
                    {selectedCandidate.professional?.candidateId}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn-icon-header" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', width: '36px', height: '36px' }}
                  onClick={() => handleShortlist(selectedCandidate.id)}
                  title="Shortlist"
                >
                  <i className="bi bi-bookmark-plus"></i>
                </button>
                <button 
                  className="btn-icon-header" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', width: '36px', height: '36px' }}
                  onClick={() => handleDownloadResume(selectedCandidate.id, selectedCandidate.resume?.fileName)}
                  title="Download Resume"
                >
                  <i className="bi bi-download"></i>
                </button>
                <button className="btn-close-popup" onClick={handleCloseProfile} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', width: '36px', height: '36px' }}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            {/* ----- MAIN CONTENT - TWO COLUMN ----- */}
            <div className="d-flex" style={{ height: 'calc(85vh - 70px)', overflow: 'hidden' }}>
              
              {/* ----- LEFT COLUMN - QUICK INFO ----- */}
              <div className="left-column" style={{ width: '35%', padding: '24px', overflowY: 'auto', background: 'white', borderRight: '1px solid #e2e8f0' }}>
                
                {/* Profile Summary Card */}
                <div className="consistent-table-container mb-4">
                  <div className="p-4">
                    <div className="d-flex align-items-start justify-content-between mb-4">
                      <div className="position-relative">
                        <img 
                          src={selectedCandidate.personal?.profilePhoto} 
                          alt={selectedCandidate.personal?.fullName}
                          className="rounded-circle"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidate.personal?.fullName || 'User')}&background=4f46e5&color=fff&size=200`;
                          }}
                        />
                        <span className="position-absolute bottom-0 end-0" style={{ width: '14px', height: '14px', backgroundColor: '#10b981', border: '3px solid white', borderRadius: '50%' }}></span>
                      </div>
                      <div className="consistent-badge primary" style={{ padding: '12px 16px' }}>
                        <div className="text-center">
                          <div style={{ fontSize: '20px', fontWeight: '700' }}>{selectedCandidate.professional?.matchScore || 0}%</div>
                          <div style={{ fontSize: '11px' }}>Match</div>
                        </div>
                      </div>
                    </div>

                    <h2 className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '24px' }}>{selectedCandidate.personal?.fullName}</h2>
                    
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="consistent-badge primary">
                        <i className="bi bi-briefcase me-1"></i>
                        {selectedCandidate.professional?.title}
                      </span>
                      <span className="consistent-badge secondary">
                        <i className="bi bi-building me-1"></i>
                        {selectedCandidate.professional?.currentCompany}
                      </span>
                    </div>
                    
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="consistent-badge secondary">
                        <i className="bi bi-geo-alt me-1"></i>
                        {selectedCandidate.personal?.address?.split(',')[0] || 'India'}
                      </span>
                      <span className="consistent-badge secondary">
                        <i className="bi bi-clock me-1"></i>
                        {selectedCandidate.professional?.experience}
                      </span>
                      <span className="consistent-badge secondary">
                        <i className="bi bi-calendar me-1"></i>
                        Notice: {selectedCandidate.professional?.noticePeriod}
                      </span>
                    </div>

                    <div className="bg-light p-3 rounded mb-4">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <i className="bi bi-envelope" style={{ color: '#4f46e5', width: '20px' }}></i>
                        <span style={{ color: '#334155' }}>{selectedCandidate.personal?.email}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-telephone" style={{ color: '#4f46e5', width: '20px' }}></i>
                        <span style={{ color: '#334155' }}>{selectedCandidate.personal?.phone || 'Not provided'}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-4">
                      <button className="consistent-btn consistent-btn-primary w-100 mb-2" onClick={() => handleScheduleFromProfile(selectedCandidate)}>
                        <i className="bi bi-calendar-plus me-2"></i>
                        Schedule Interview
                      </button>
                      <div className="d-flex gap-2">
                        <button 
                          className="consistent-btn consistent-btn-outline flex-grow-1"
                          onClick={() => handleShortlist(selectedCandidate.id)}
                        >
                          <i className="bi bi-bookmark-plus me-2"></i>
                          Shortlist
                        </button>
                        <button 
                          className="consistent-btn consistent-btn-outline flex-grow-1"
                          onClick={() => handleDownloadResume(selectedCandidate.id, selectedCandidate.resume?.fileName)}
                        >
                          <i className="bi bi-download me-2"></i>
                          Resume
                        </button>
                        <button className="consistent-btn consistent-btn-outline flex-grow-1">
                          <i className="bi bi-share me-2"></i>
                          Share
                        </button>
                      </div>
                    </div>

                    {/* Profile Strength */}
                    <div className="bg-light p-3 rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ color: '#475569', fontSize: '13px' }}>Profile Strength</span>
                        <span className="fw-bold" style={{ color: '#4f46e5' }}>{selectedCandidate.profileCompletion || 0}%</span>
                      </div>
                      <div className="progress" style={{ height: '8px', backgroundColor: '#e2e8f0' }}>
                        <div 
                          className="progress-bar"
                          style={{ width: `${selectedCandidate.profileCompletion || 0}%`, backgroundColor: '#4f46e5' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Skills Preview */}
                <div className="consistent-table-container">
                  <div className="p-4">
                    <h6 className="fw-semibold mb-3">
                      <i className="bi bi-star me-2" style={{ color: '#4f46e5' }}></i>
                      Top Skills
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {selectedCandidate.skills?.slice(0, 5).map((skill, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                          <span style={{ color: '#1e293b' }}>{skill.name}</span>
                          <span className={`rounded-circle`} style={{ width: '8px', height: '8px', backgroundColor: 
                            skill.level === 'Expert' ? '#10b981' :
                            skill.level === 'Advanced' ? '#4f46e5' :
                            skill.level === 'Intermediate' ? '#f59e0b' : '#3b82f6'
                          }}></span>
                        </div>
                      ))}
                      {selectedCandidate.skills?.length > 5 && (
                        <div className="p-2 bg-light rounded" style={{ color: '#64748b' }}>
                          +{selectedCandidate.skills.length - 5} more
                        </div>
                      )}
                    </div>
                    <button className="btn-link" onClick={() => setProfileActiveTab('skills')} style={{ color: '#4f46e5', border: 'none', background: 'none' }}>
                      View all skills <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* ----- RIGHT COLUMN - DETAILED INFO ----- */}
              <div className="right-column" style={{ width: '65%', padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
                
                {/* Simple Tabs */}
                <div className="d-flex gap-1 bg-white p-1 rounded mb-4" style={{ border: '1px solid #e2e8f0' }}>
                  <button 
                    className={`flex-grow-1 py-2 px-3 rounded ${profileActiveTab === 'personal' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                    onClick={() => setProfileActiveTab('personal')}
                  >
                    Personal
                  </button>
                  <button 
                    className={`flex-grow-1 py-2 px-3 rounded ${profileActiveTab === 'professional' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                    onClick={() => setProfileActiveTab('professional')}
                  >
                    Professional
                  </button>
                  <button 
                    className={`flex-grow-1 py-2 px-3 rounded ${profileActiveTab === 'education' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                    onClick={() => setProfileActiveTab('education')}
                  >
                    Education
                  </button>
                  <button 
                    className={`flex-grow-1 py-2 px-3 rounded ${profileActiveTab === 'skills' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                    onClick={() => setProfileActiveTab('skills')}
                  >
                    Skills
                  </button>
                  <button 
                    className={`flex-grow-1 py-2 px-3 rounded ${profileActiveTab === 'resume' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                    onClick={() => setProfileActiveTab('resume')}
                  >
                    Resume
                  </button>
                </div>

                {/* Tab Panes */}
                <div className="consistent-table-container">
                  
                  {/* PERSONAL TAB */}
                  {profileActiveTab === 'personal' && (
                    <div className="p-4">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Full Name</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>{selectedCandidate.personal?.fullName}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Email</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>{selectedCandidate.personal?.email}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Phone</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>{selectedCandidate.personal?.phone || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Date of Birth</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>
                              {selectedCandidate.personal?.dateOfBirth ? formatLongDate(selectedCandidate.personal.dateOfBirth) : 'Not provided'}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Gender</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>{selectedCandidate.personal?.gender || 'Not specified'}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Nationality</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>{selectedCandidate.personal?.nationality || 'Indian'}</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Address</small>
                            <div style={{ color: '#1e293b', fontWeight: '500' }}>{selectedCandidate.personal?.address || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="fw-semibold mb-2">Professional Summary</h6>
                        <p style={{ color: '#475569', lineHeight: '1.6' }}>{selectedCandidate.personal?.summary || 'No summary provided'}</p>
                      </div>

                      {selectedCandidate.professional?.achievements?.length > 0 && (
                        <div className="mt-4">
                          <h6 className="fw-semibold mb-3">Key Achievements</h6>
                          {selectedCandidate.professional.achievements.map((item, idx) => (
                            <div key={idx} className="d-flex gap-3 mb-2">
                              <i className="bi bi-trophy" style={{ color: '#f59e0b' }}></i>
                              <span style={{ color: '#475569' }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROFESSIONAL TAB */}
                  {profileActiveTab === 'professional' && (
                    <div className="p-4">
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="fw-semibold mb-3" style={{ color: '#1e293b' }}>Employment Details</h6>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Job Title</small>
                            <div style={{ color: '#1e293b' }}>{selectedCandidate.professional?.title || 'Not provided'}</div>
                          </div>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Company</small>
                            <div style={{ color: '#1e293b' }}>{selectedCandidate.professional?.currentCompany || 'Not provided'}</div>
                          </div>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Experience</small>
                            <div style={{ color: '#1e293b' }}>{selectedCandidate.professional?.experience || 'Not provided'}</div>
                          </div>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Industry</small>
                            <div style={{ color: '#1e293b' }}>{selectedCandidate.professional?.industry || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6 className="fw-semibold mb-3" style={{ color: '#1e293b' }}>Compensation & Availability</h6>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Current Salary</small>
                            <div style={{ color: '#1e293b' }}>{formatSalary(selectedCandidate.professional?.currentSalary)}</div>
                          </div>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Expected Salary</small>
                            <div style={{ color: '#1e293b' }}>{formatSalary(selectedCandidate.professional?.expectedSalary)}</div>
                          </div>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Notice Period</small>
                            <div style={{ color: '#1e293b' }}>{selectedCandidate.professional?.noticePeriod || 'Not specified'}</div>
                          </div>
                          <div className="mb-3">
                            <small className="d-block mb-1" style={{ color: '#64748b' }}>Employment Type</small>
                            <div style={{ color: '#1e293b' }}>{selectedCandidate.professional?.employmentType || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h6 className="fw-semibold mb-3" style={{ color: '#1e293b' }}>Top Skills</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedCandidate.professional?.topSkills?.map((skill, idx) => (
                            <span key={idx} className="consistent-badge primary">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDUCATION TAB */}
                  {profileActiveTab === 'education' && (
                    <div className="p-4">
                      {selectedCandidate.education?.length > 0 ? (
                        selectedCandidate.education.map((edu, idx) => (
                          <div key={idx} className="mb-4 pb-4 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                            <div className="d-flex gap-3">
                              <div style={{ width: '10px', height: '10px', backgroundColor: '#4f46e5', borderRadius: '50%', marginTop: '6px' }}></div>
                              <div>
                                <h6 className="fw-semibold mb-1">{edu.degree} in {edu.field}</h6>
                                <div className="d-flex flex-wrap gap-3 mb-2">
                                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                                    <i className="bi bi-building me-1"></i>{edu.institution}
                                  </span>
                                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                                    <i className="bi bi-calendar me-1"></i>{edu.year}
                                  </span>
                                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                                    <i className="bi bi-star me-1"></i>{edu.grade}
                                  </span>
                                  {edu.isCurrent && (
                                    <span className="consistent-badge success">Current</span>
                                  )}
                                </div>
                                {edu.description && <p style={{ color: '#475569' }}>{edu.description}</p>}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-5">
                          <i className="bi bi-mortarboard fs-1" style={{ color: '#cbd5e1' }}></i>
                          <p className="mt-3" style={{ color: '#64748b' }}>No education details added</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SKILLS TAB */}
                  {profileActiveTab === 'skills' && (
                    <div className="p-4">
                      {selectedCandidate.skills?.length > 0 ? (
                        <div className="row g-3">
                          {selectedCandidate.skills.map((skill, idx) => (
                            <div key={idx} className="col-md-6">
                              <div className="p-3 bg-light rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="fw-semibold" style={{ color: '#1e293b' }}>{skill.name}</span>
                                  {skill.verified && (
                                    <i className="bi bi-patch-check-fill" style={{ color: '#4f46e5' }}></i>
                                  )}
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className={`consistent-badge ${getSkillLevelColor(skill.level)}`}>
                                    {skill.level}
                                  </span>
                                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                                    {skill.years} yr{skill.years > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="progress" style={{ height: '4px' }}>
                                  <div 
                                    className="progress-bar"
                                    style={{ 
                                      width: `${Math.min(skill.years * 10, 100)}%`,
                                      backgroundColor: 
                                        skill.level === 'Expert' ? '#10b981' :
                                        skill.level === 'Advanced' ? '#4f46e5' :
                                        skill.level === 'Intermediate' ? '#f59e0b' : '#3b82f6'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <i className="bi bi-code-slash fs-1" style={{ color: '#cbd5e1' }}></i>
                          <p className="mt-3" style={{ color: '#64748b' }}>No skills added</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RESUME TAB */}
                  {profileActiveTab === 'resume' && (
                    <div className="p-4">
                      {selectedCandidate.resume?.fileName ? (
                        <div className="d-flex gap-4 p-4 bg-light rounded">
                          <i className="bi bi-file-earmark-pdf" style={{ fontSize: '48px', color: '#ef4444' }}></i>
                          <div>
                            <h6 className="fw-semibold mb-2">{selectedCandidate.resume.fileName}</h6>
                            <div className="d-flex flex-wrap gap-3 mb-3">
                              <span style={{ color: '#64748b', fontSize: '13px' }}>
                                <i className="bi bi-file-earmark me-1"></i>{selectedCandidate.resume.fileSize}
                              </span>
                              <span style={{ color: '#64748b', fontSize: '13px' }}>
                                <i className="bi bi-calendar me-1"></i>Uploaded: {formatDate(selectedCandidate.resume.uploadedDate)}
                              </span>
                              <span style={{ color: '#64748b', fontSize: '13px' }}>
                                <i className="bi bi-file-text me-1"></i>{selectedCandidate.resume.pages} pages
                              </span>
                            </div>
                            <div className="d-flex gap-2">
                              <a 
                                href={selectedCandidate.resume.publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="consistent-btn consistent-btn-primary"
                              >
                                <i className="bi bi-eye me-2"></i> Preview
                              </a>
                              <button 
                                onClick={() => handleDownloadResume(selectedCandidate.id, selectedCandidate.resume.fileName)}
                                className="consistent-btn consistent-btn-outline"
                              >
                                <i className="bi bi-download me-2"></i> Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <i className="bi bi-file-earmark fs-1" style={{ color: '#cbd5e1' }}></i>
                          <p className="mt-3" style={{ color: '#64748b' }}>No resume uploaded</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center gap-2" style={{ color: '#64748b' }}>
                    <i className="bi bi-clock-history"></i>
                    Last active: {getTimeAgo(selectedCandidate.lastActive)}
                  </div>
                  <div className="d-flex gap-3">
                    <button 
                      className="consistent-btn consistent-btn-outline"
                      onClick={() => handleShortlist(selectedCandidate.id)}
                    >
                      <i className="bi bi-bookmark-plus me-2"></i> Shortlist
                    </button>
                    <button className="consistent-btn consistent-btn-outline">
                      <i className="bi bi-flag me-2"></i> Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRCandidateProfiles;