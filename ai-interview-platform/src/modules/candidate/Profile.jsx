import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../modules/candidate/CandidateLayout';
import '../../styles/Profile.css';
import * as api from '../../modules/services/api';

// Predefined data for suggestions
const skillSuggestions = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
  'TypeScript', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Project Management',
  'Communication', 'Leadership', 'Problem Solving', 'Teamwork'
];

const jobTitles = [
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer',
  'Cloud Architect', 'System Administrator', 'Database Administrator',
  'Project Manager', 'Product Manager', 'UI/UX Designer', 'QA Engineer',
  'Mobile Developer', 'Security Engineer', 'Network Engineer'
];

const experienceLevels = [
  'Fresher (0-1 years)',
  'Junior (1-3 years)',
  'Mid-Level (3-6 years)',
  'Senior (6-10 years)',
  'Lead (10+ years)',
  'Director/VP (15+ years)'
];

const noticePeriods = [
  'Immediate Joiner',
  '15 Days',
  '30 Days',
  '60 Days',
  '90 Days',
  'Negotiable'
];

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState('personal');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);

  // Load profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Check for changes
  useEffect(() => {
    if (userProfile && formData) {
      const changed = JSON.stringify(userProfile) !== JSON.stringify(formData);
      setHasChanges(changed);
    }
  }, [formData, userProfile]);

  // Filter skills based on search
  useEffect(() => {
    if (skillSearch.trim()) {
      const filtered = skillSuggestions.filter(skill =>
        skill.toLowerCase().includes(skillSearch.toLowerCase())
      );
      setFilteredSkills(filtered.slice(0, 8));
      setShowSkillSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSkillSuggestions(false);
    }
  }, [skillSearch]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getProfile();
      
      if (response.success) {
        const transformedData = {
          personal: {
            firstName: response.data.personal?.firstName || '',
            lastName: response.data.personal?.lastName || '',
            fullName: response.data.fullName || `${response.data.personal?.firstName || ''} ${response.data.personal?.lastName || ''}`.trim(),
            email: response.data.personal?.email || '',
            dateOfBirth: response.data.personal?.dateOfBirth || '',
            phone: response.data.personal?.phone || '',
            address: response.data.personal?.address || '',
            gender: response.data.personal?.gender || '',
            nationality: response.data.personal?.nationality || '',
            profilePhoto: response.data.personal?.profilePhoto || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                response.data.personal?.firstName || 'User'
              )}&background=667eea&color=fff&size=256`,
          },
          professional: {
            title: response.data.professional?.title || '',
            experience: response.data.professional?.experience || '',
            experienceLevel: response.data.professional?.experienceLevel || '',
            currentCompany: response.data.professional?.currentCompany || '',
            industry: response.data.professional?.industry || '',
            department: response.data.professional?.department || '',
            employmentType: response.data.professional?.employmentType || '',
            currentSalary: response.data.professional?.currentSalary || '',
            expectedSalary: response.data.professional?.expectedSalary || '',
            noticePeriod: response.data.professional?.noticePeriod || '',
            availability: response.data.professional?.availability || '',
            candidateId: response.data.professional?.candidateId || '',
            status: response.data.professional?.status || 'Active',
            skills: response.data.professional?.skills || []
          },
          education: response.data.education || [],
          skills: response.data.skills || [],
          projects: response.data.projects || [],
          socialLinks: response.data.socialLinks || {},
          resume: response.data.resume || {},
          profileCompletion: response.data.profileCompletion || 0,
          lastUpdated: response.data.updatedAt || response.data.lastUpdated || ''
        };
        
        setUserProfile(transformedData);
        setFormData(transformedData);
        setOriginalData(transformedData);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Unable to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setError('');
    } else {
      setError(message);
      setSuccessMessage('');
    }
    
    setTimeout(() => {
      if (type === 'success') setSuccessMessage('');
      if (type === 'error') setError('');
    }, 3000);
  };

  const prepareApiData = () => {
    return {
      personal: {
        firstName: formData.personal.firstName,
        lastName: formData.personal.lastName,
        email: formData.personal.email,
        dateOfBirth: formData.personal.dateOfBirth,
        phone: formData.personal.phone,
        address: formData.personal.address,
        gender: formData.personal.gender,
        nationality: formData.personal.nationality,
      },
      professional: {
        title: formData.professional.title,
        experience: formData.professional.experience,
        experienceLevel: formData.professional.experienceLevel,
        currentCompany: formData.professional.currentCompany,
        industry: formData.professional.industry,
        department: formData.professional.department,
        employmentType: formData.professional.employmentType,
        currentSalary: formData.professional.currentSalary,
        expectedSalary: formData.professional.expectedSalary,
        noticePeriod: formData.professional.noticePeriod,
        availability: formData.professional.availability
      },
      education: formData.education,
      skills: formData.skills
    };
  };

  const handleSaveProfile = async () => {
    if (!formData) return;
    
    try {
      setIsUploading(true);
      const apiData = prepareApiData();
      const response = await api.updateProfile(apiData);
      
      if (response.success) {
        showMessage('Profile updated successfully!');
        setEditMode(false);
        setUserProfile(formData);
        setOriginalData(formData);
        setHasChanges(false);
        
        // Update local user data
        const updatedUser = {
          ...api.getCurrentUser(),
          firstName: formData.personal.firstName,
          lastName: formData.personal.lastName,
          email: formData.personal.email
        };
        api.updateLocalUser(updatedUser);
      } else {
        showMessage(response.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showMessage(error.message || 'Failed to save profile. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditMode(false);
    setHasChanges(false);
    showMessage('Changes discarded', 'info');
  };

  const handleFieldChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayFieldChange = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Enhanced Education Functions
  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      field: '',
      institution: '',
      year: '',
      grade: '',
      description: '',
      isCurrent: false
    };
    
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const handleRemoveEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    showMessage('Education removed successfully');
  };

  // Enhanced Skill Functions
  const handleAddSkill = (skillName = '', level = 'Beginner', years = 1) => {
    if (!skillName.trim()) return;
    
    const newSkill = {
      id: Date.now(),
      name: skillName.trim(),
      level: level,
      years: years,
      proficiency: 'Beginner'
    };
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    
    setSkillSearch('');
    setShowSkillSuggestions(false);
    showMessage(`Skill "${skillName}" added successfully`);
  };

  const handleQuickAddSkill = (skillName) => {
    handleAddSkill(skillName);
  };

  const handleSkillInputKeyPress = (e) => {
    if (e.key === 'Enter' && skillSearch.trim()) {
      handleAddSkill(skillSearch);
    }
  };

  const handleRemoveSkill = (id) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
    showMessage('Skill removed successfully');
  };

  const getSkillLevelColor = (level) => {
    switch((level || '').toLowerCase()) {
      case 'expert': return 'success';
      case 'advanced': return 'primary';
      case 'intermediate': return 'warning';
      case 'beginner': return 'info';
      default: return 'secondary';
    }
  };

  const getProficiencyIcon = (level) => {
    switch((level || '').toLowerCase()) {
      case 'expert': return '⭐️⭐️⭐️⭐️⭐️';
      case 'advanced': return '⭐️⭐️⭐️⭐️';
      case 'intermediate': return '⭐️⭐️⭐️';
      case 'beginner': return '⭐️⭐️';
      default: return '⭐️';
    }
  };

  // File Upload Functions
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please upload an image file', 'error');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const response = await api.uploadProfilePhoto(file);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            profilePhoto: response.data.fullUrl || response.data.url
          }
        }));
        showMessage('Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showMessage(error.message || 'Failed to upload photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await api.uploadResume(file);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          resume: response.data
        }));
        showMessage('Resume uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      showMessage(error.message || 'Failed to upload resume', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Professional Details Functions

  const getJobTitleSuggestions = () => {
    if (!formData.professional.title) return jobTitles.slice(0, 5);
    const searchTerm = formData.professional.title.toLowerCase();
    return jobTitles.filter(title => 
      title.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header title="AI Interview Pro" subtitle="Profile" showBackButton={false} />

      <div className="container-fluid main-content">
        <div className="container mt-4">
          {/* Messages */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Profile Header with Stats */}
          {/* Profile Header with Enhanced Design */}
<div className="row mb-4">
  <div className="col-12">
    <div className="profile-header-card-enhanced card shadow-lg border-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="profile-header-bg">
        <div className="gradient-overlay"></div>
        <div className="pattern-overlay"></div>
      </div>
      
      <div className="card-body position-relative">
        <div className="row align-items-center">
          {/* Profile Photo Section */}
          <div className="col-lg-3 text-center text-lg-start mb-4 mb-lg-0">
            <div className="profile-photo-section position-relative d-inline-block">
              <div className="profile-photo-wrapper-enhanced position-relative">
                <img 
                  src={formData.personal.profilePhoto} 
                  alt="Profile" 
                  className="profile-photo-enhanced"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.personal.fullName || 'User')}&background=667eea&color=fff&size=256`;
                  }}
                />
                {editMode && (
                  <label 
                    htmlFor="photoUpload" 
                    className="btn btn-light btn-sm change-photo-btn-enhanced"
                    title="Change photo"
                  >
                    <i className="bi bi-camera-fill"></i>
                    <span className="d-none d-md-inline ms-1">Change</span>
                  </label>
                )}
                <input 
                  type="file" 
                  id="photoUpload"
                  className="d-none"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </div>
              
              {/* Online Status Indicator */}
              <div className="online-status-indicator bg-success">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
          
          {/* Profile Info Section */}
          <div className="col-lg-5 mb-4 mb-lg-0">
            <div className="profile-info-section">
              <div className="d-flex align-items-center mb-2">
                <h1 className="profile-name-enhanced mb-0 me-3">{formData.personal.fullName}</h1>
                {formData.professional.status === 'Active' && (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    <i className="bi bi-check-circle me-1"></i>
                    Active
                  </span>
                )}
              </div>
              
              <h5 className="text-white text-opacity-90 mb-3">
                {formData.professional.title || 'No title set'}
                {formData.professional.currentCompany && (
                  <span className="text-white text-opacity-75"> • {formData.professional.currentCompany}</span>
                )}
              </h5>
              
              {/* Quick Stats */}
              <div className="profile-quick-stats d-flex flex-wrap gap-3 mb-4">
                <div className="stat-badge">
                  <i className="bi bi-briefcase me-1"></i>
                  <span>{formData.professional.experienceLevel || 'Fresher'}</span>
                </div>
                <div className="stat-badge">
                  <i className="bi bi-geo-alt me-1"></i>
                  <span>{formData.personal.address?.split(',')[0] || 'Location'}</span>
                </div>
                {formData.professional.candidateId && (
                  <div className="stat-badge">
                    <i className="bi bi-person-badge me-1"></i>
                    <span>ID: {formData.professional.candidateId}</span>
                  </div>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="contact-mini-enhanced">
                <div className="d-flex align-items-center mb-2">
                  <div className="contact-icon-circle">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div className="ms-3">
                    <div className="contact-label">Email</div>
                    <div className="contact-value text-white text-opacity-90">{formData.personal.email}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="contact-icon-circle">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <div className="ms-3">
                    <div className="contact-label">Phone</div>
                    <div className="contact-value text-white text-opacity-90">
                      {formData.personal.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Completion & Actions */}
          <div className="col-lg-4">
            <div className="profile-actions-section">
              {/* Completion Widget */}
              <div className="completion-widget-enhanced mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 text-white text-opacity-90">Profile Strength</h6>
                  <span className="completion-percent-enhanced">{formData.profileCompletion || 0}%</span>
                </div>
                <div className="progress progress-enhanced">
                  <div 
                    className="progress-bar progress-bar-gradient" 
                    role="progressbar" 
                    style={{ width: `${formData.profileCompletion || 0}%` }}
                    aria-valuenow={formData.profileCompletion || 0} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <small className="text-white text-opacity-75 d-block mt-2">
                  Complete your profile to increase job opportunities
                </small>
              </div>
              
              {/* Action Buttons */}
              <div className="action-buttons-enhanced">
                {!editMode ? (
                  <button 
                    className="btn btn-light w-100 d-flex align-items-center justify-content-center mb-2"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn btn-success w-100 d-flex align-items-center justify-content-center mb-2"
                      onClick={handleSaveProfile}
                      disabled={!hasChanges || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
                      onClick={handleCancel}
                      disabled={isUploading}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </>
                )}
              </div>
              
              {/* Quick Links */}
              <div className="quick-links mt-3">
                <div className="row g-2">
                  <div className="col-6">
                    <button 
                      className="btn btn-outline-light btn-sm w-100"
                      onClick={() => setActiveTab('resume')}
                    >
                      <i className="bi bi-upload me-1"></i>
                      Resume
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className="btn btn-outline-light btn-sm w-100"
                      onClick={() => setActiveTab('skills')}
                    >
                      <i className="bi bi-tools me-1"></i>
                      Skills
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Main Content */}
          <div className="row">
            {/* Left Column - Quick Stats & Info */}
            <div className="col-lg-4 mb-4">
              {/* Quick Stats Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h6 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Quick Stats
                  </h6>
                </div>
                <div className="card-body">
                  <div className="quick-stats">
                    <div className="stat-item">
                      <div className="stat-icon bg-primary-light">
                        <i className="bi bi-mortarboard text-primary"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">{formData.education.length}</div>
                        <div className="stat-label">Education</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon bg-success-light">
                        <i className="bi bi-code-slash text-success"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">{formData.skills.length}</div>
                        <div className="stat-label">Skills</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon bg-info-light">
                        <i className="bi bi-file-earmark-text text-info"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">
                          {formData.resume.fileName ? '✓' : '✗'}
                        </div>
                        <div className="stat-label">Resume</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h6 className="mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Contact Information
                  </h6>
                </div>
                <div className="card-body">
                  <div className="contact-info-list">
                    <div className="contact-info-item">
                      <div className="contact-icon">
                        <i className="bi bi-envelope"></i>
                      </div>
                      <div className="contact-details">
                        <div className="contact-label">Email</div>
                        <div className="contact-value">{formData.personal.email}</div>
                      </div>
                    </div>
                    
                    <div className="contact-info-item">
                      <div className="contact-icon">
                        <i className="bi bi-telephone"></i>
                      </div>
                      <div className="contact-details">
                        <div className="contact-label">Phone</div>
                        <div className="contact-value">
                          {formData.personal.phone || (
                            <span className="text-muted">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="contact-info-item">
                      <div className="contact-icon">
                        <i className="bi bi-geo-alt"></i>
                      </div>
                      <div className="contact-details">
                        <div className="contact-label">Address</div>
                        <div className="contact-value">
                          {formData.personal.address ? (
                            <small>{formData.personal.address.split('\n')[0]}</small>
                          ) : (
                            <span className="text-muted">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="contact-info-item">
                      <div className="contact-icon">
                        <i className="bi bi-calendar3"></i>
                      </div>
                      <div className="contact-details">
                        <div className="contact-label">Date of Birth</div>
                        <div className="contact-value">
                          {formData.personal.dateOfBirth ? formatDate(formData.personal.dateOfBirth) : 'Not provided'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="contact-info-item">
                      <div className="contact-icon">
                        <i className="bi bi-gender-ambiguous"></i>
                      </div>
                      <div className="contact-details">
                        <div className="contact-label">Gender</div>
                        <div className="contact-value">
                          {formData.personal.gender || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="col-lg-8">
              {/* Enhanced Navigation Tabs */}
              <div className="card shadow-sm mb-4">
                <div className="card-body p-2">
                  <div className="profile-nav-tabs">
                    <div className="nav-scrollable">
                      <ul className="nav nav-pills">
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                          >
                            <i className="bi bi-person-fill me-2"></i>
                            Personal
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'professional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('professional')}
                          >
                            <i className="bi bi-briefcase-fill me-2"></i>
                            Professional
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                            onClick={() => setActiveTab('education')}
                          >
                            <i className="bi bi-mortarboard-fill me-2"></i>
                            Education
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                            onClick={() => setActiveTab('skills')}
                          >
                            <i className="bi bi-tools me-2"></i>
                            Skills
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${activeTab === 'resume' ? 'active' : ''}`}
                            onClick={() => setActiveTab('resume')}
                          >
                            <i className="bi bi-file-earmark-text me-2"></i>
                            Resume
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="profile-tab-content">
                
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-person-fill text-primary me-2"></i>
                          Personal Details
                        </h5>
                        {editMode && (
                          <span className="badge bg-warning bg-opacity-10 text-warning">
                            <i className="bi bi-pencil me-1"></i>
                            Editing Mode
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-person me-1"></i>
                            First Name *
                          </label>
                          {editMode ? (
                            <input 
                              type="text"
                              className="form-control"
                              value={formData.personal.firstName}
                              onChange={(e) => handleFieldChange('personal', 'firstName', e.target.value)}
                              placeholder="Enter your first name"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.firstName || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-person me-1"></i>
                            Last Name *
                          </label>
                          {editMode ? (
                            <input 
                              type="text"
                              className="form-control"
                              value={formData.personal.lastName}
                              onChange={(e) => handleFieldChange('personal', 'lastName', e.target.value)}
                              placeholder="Enter your last name"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.lastName || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-envelope me-1"></i>
                            Email Address *
                          </label>
                          {editMode ? (
                            <input 
                              type="email"
                              className="form-control"
                              value={formData.personal.email}
                              onChange={(e) => handleFieldChange('personal', 'email', e.target.value)}
                              placeholder="your.email@example.com"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.email}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-telephone me-1"></i>
                            Phone Number
                          </label>
                          {editMode ? (
                            <div className="input-group">
                              <span className="input-group-text">+91</span>
                              <input 
                                type="tel"
                                className="form-control"
                                value={formData.personal.phone}
                                onChange={(e) => handleFieldChange('personal', 'phone', e.target.value)}
                                placeholder="Enter your phone number"
                              />
                            </div>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.phone || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-calendar3 me-1"></i>
                            Date of Birth
                          </label>
                          {editMode ? (
                            <input 
                              type="date"
                              className="form-control"
                              value={formData.personal.dateOfBirth}
                              onChange={(e) => handleFieldChange('personal', 'dateOfBirth', e.target.value)}
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.dateOfBirth 
                                ? formatDate(formData.personal.dateOfBirth)
                                : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-gender-ambiguous me-1"></i>
                            Gender
                          </label>
                          {editMode ? (
                            <select 
                              className="form-select"
                              value={formData.personal.gender}
                              onChange={(e) => handleFieldChange('personal', 'gender', e.target.value)}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.gender || 'Not specified'}
                            </div>
                          )}
                        </div>

                        <div className="col-12">
                          <label className="form-label">
                            <i className="bi bi-geo-alt me-1"></i>
                            Address
                          </label>
                          {editMode ? (
                            <textarea 
                              className="form-control"
                              rows="3"
                              value={formData.personal.address}
                              onChange={(e) => handleFieldChange('personal', 'address', e.target.value)}
                              placeholder="Enter your complete address"
                            />
                          ) : (
                            <div className="form-control-plaintext whitespace-pre">
                              {formData.personal.address || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-globe me-1"></i>
                            Nationality
                          </label>
                          {editMode ? (
                            <input 
                              type="text"
                              className="form-control"
                              value={formData.personal.nationality}
                              onChange={(e) => handleFieldChange('personal', 'nationality', e.target.value)}
                              placeholder="Your nationality"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.personal.nationality || 'Not provided'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Details Tab */}
                {activeTab === 'professional' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-briefcase-fill text-primary me-2"></i>
                          Professional Details
                        </h5>
                        {editMode && (
                          <span className="badge bg-warning bg-opacity-10 text-warning">
                            <i className="bi bi-pencil me-1"></i>
                            Editing Mode
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-briefcase me-1"></i>
                            Job Title *
                          </label>
                          {editMode ? (
                            <div className="position-relative">
                              <input 
                                type="text"
                                className="form-control"
                                value={formData.professional.title}
                                onChange={(e) => handleFieldChange('professional', 'title', e.target.value)}
                                onFocus={() => setShowJobTitleSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowJobTitleSuggestions(false), 200)}
                                placeholder="e.g., Senior Software Engineer"
                              />
                              {showJobTitleSuggestions && formData.professional.title && (
                                <div className="suggestions-dropdown">
                                  {getJobTitleSuggestions().map((title, index) => (
                                    <div 
                                      key={index}
                                      className="suggestion-item"
                                      onClick={() => {
                                        handleFieldChange('professional', 'title', title);
                                        setShowJobTitleSuggestions(false);
                                      }}
                                    >
                                      {title}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.title || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-building me-1"></i>
                            Current Company
                          </label>
                          {editMode ? (
                            <input 
                              type="text"
                              className="form-control"
                              value={formData.professional.currentCompany}
                              onChange={(e) => handleFieldChange('professional', 'currentCompany', e.target.value)}
                              placeholder="Your current employer"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.currentCompany || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-bar-chart me-1"></i>
                            Experience Level
                          </label>
                          {editMode ? (
                            <select 
                              className="form-select"
                              value={formData.professional.experienceLevel}
                              onChange={(e) => handleFieldChange('professional', 'experienceLevel', e.target.value)}
                            >
                              <option value="">Select Experience Level</option>
                              {experienceLevels.map((level, index) => (
                                <option key={index} value={level}>{level}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.experienceLevel || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-clock-history me-1"></i>
                            Total Experience
                          </label>
                          {editMode ? (
                            <div className="input-group">
                              <input 
                                type="text"
                                className="form-control"
                                value={formData.professional.experience}
                                onChange={(e) => handleFieldChange('professional', 'experience', e.target.value)}
                                placeholder="e.g., 5 years"
                              />
                              <span className="input-group-text">years</span>
                            </div>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.experience || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-industry me-1"></i>
                            Industry
                          </label>
                          {editMode ? (
                            <input 
                              type="text"
                              className="form-control"
                              value={formData.professional.industry}
                              onChange={(e) => handleFieldChange('professional', 'industry', e.target.value)}
                              placeholder="e.g., Information Technology"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.industry || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-diagram-3 me-1"></i>
                            Department
                          </label>
                          {editMode ? (
                            <input 
                              type="text"
                              className="form-control"
                              value={formData.professional.department}
                              onChange={(e) => handleFieldChange('professional', 'department', e.target.value)}
                              placeholder="e.g., Engineering"
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.department || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-person-badge me-1"></i>
                            Employment Type
                          </label>
                          {editMode ? (
                            <select 
                              className="form-select"
                              value={formData.professional.employmentType}
                              onChange={(e) => handleFieldChange('professional', 'employmentType', e.target.value)}
                            >
                              <option value="">Select Type</option>
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Contract">Contract</option>
                              <option value="Freelance">Freelance</option>
                              <option value="Internship">Internship</option>
                            </select>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.employmentType || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-calendar-check me-1"></i>
                            Availability
                          </label>
                          {editMode ? (
                            <select 
                              className="form-select"
                              value={formData.professional.availability}
                              onChange={(e) => handleFieldChange('professional', 'availability', e.target.value)}
                            >
                              <option value="">Select Availability</option>
                              <option value="Immediate">Immediate</option>
                              <option value="1-2 weeks">1-2 weeks</option>
                              <option value="1 month">1 month</option>
                              <option value="2 months">2 months</option>
                              <option value="3 months">3 months</option>
                              <option value="Not available">Not available</option>
                            </select>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.availability || 'Not specified'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-clock me-1"></i>
                            Notice Period
                          </label>
                          {editMode ? (
                            <select 
                              className="form-select"
                              value={formData.professional.noticePeriod}
                              onChange={(e) => handleFieldChange('professional', 'noticePeriod', e.target.value)}
                            >
                              <option value="">Select Notice Period</option>
                              {noticePeriods.map((period, index) => (
                                <option key={index} value={period}>{period}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.noticePeriod || 'Not specified'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-currency-dollar me-1"></i>
                            Current Salary (Annual)
                          </label>
                          {editMode ? (
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input 
                                type="number"
                                className="form-control"
                                value={formData.professional.currentSalary}
                                onChange={(e) => handleFieldChange('professional', 'currentSalary', e.target.value)}
                                placeholder="Current salary"
                              />
                              <span className="input-group-text">.00</span>
                            </div>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.currentSalary 
                                ? `$${formData.professional.currentSalary}`
                                : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            <i className="bi bi-cash-coin me-1"></i>
                            Expected Salary (Annual)
                          </label>
                          {editMode ? (
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input 
                                type="number"
                                className="form-control"
                                value={formData.professional.expectedSalary}
                                onChange={(e) => handleFieldChange('professional', 'expectedSalary', e.target.value)}
                                placeholder="Expected salary"
                              />
                              <span className="input-group-text">.00</span>
                            </div>
                          ) : (
                            <div className="form-control-plaintext">
                              {formData.professional.expectedSalary 
                                ? `$${formData.professional.expectedSalary}`
                                : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div className="col-12">
                          <label className="form-label">
                            <i className="bi bi-card-checklist me-1"></i>
                            Key Professional Skills (from skills section)
                          </label>
                          <div className="professional-skills-preview">
                            {formData.skills.slice(0, 10).map((skill, index) => (
                              <span key={index} className="badge bg-light text-dark me-2 mb-2">
                                <i className="bi bi-check-circle text-success me-1"></i>
                                {skill.name} ({skill.level})
                              </span>
                            ))}
                            {formData.skills.length === 0 && (
                              <div className="text-muted">No skills added yet</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Education Tab - Enhanced */}
                {activeTab === 'education' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-mortarboard-fill text-primary me-2"></i>
                          Education Details
                        </h5>
                        {editMode && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={handleAddEducation}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Add Education
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      {formData.education.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="empty-state">
                            <i className="bi bi-mortarboard display-1 text-muted"></i>
                            <h5 className="mt-3 text-muted">No Education Added</h5>
                            <p className="text-muted mb-4">
                              Add your education details to showcase your qualifications.
                            </p>
                            {editMode ? (
                              <button 
                                className="btn btn-primary"
                                onClick={handleAddEducation}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                Add First Education
                              </button>
                            ) : (
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => setEditMode(true)}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Edit to Add Education
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="education-list">
                          {formData.education.map((edu, index) => (
                            <div key={edu.id || index} className="education-card">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  {editMode ? (
                                    <div className="row g-3">
                                      <div className="col-md-6">
                                        <label className="form-label small">Degree</label>
                                        <input 
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={edu.degree}
                                          onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                                          placeholder="e.g., Bachelor of Science"
                                        />
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label small">Field of Study</label>
                                        <input 
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={edu.field}
                                          onChange={(e) => handleArrayFieldChange('education', index, 'field', e.target.value)}
                                          placeholder="e.g., Computer Science"
                                        />
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label small">Institution</label>
                                        <input 
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={edu.institution}
                                          onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                                          placeholder="University name"
                                        />
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label small">Year</label>
                                        <input 
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={edu.year}
                                          onChange={(e) => handleArrayFieldChange('education', index, 'year', e.target.value)}
                                          placeholder="e.g., 2018-2022"
                                        />
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label small">Grade</label>
                                        <input 
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={edu.grade}
                                          onChange={(e) => handleArrayFieldChange('education', index, 'grade', e.target.value)}
                                          placeholder="e.g., 3.8/4.0"
                                        />
                                      </div>
                                      <div className="col-md-6">
                                        <div className="form-check mt-4 pt-2">
                                          <input 
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={edu.isCurrent}
                                            onChange={(e) => handleArrayFieldChange('education', index, 'isCurrent', e.target.checked)}
                                          />
                                          <label className="form-check-label small">Currently studying here</label>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <label className="form-label small">Description</label>
                                        <textarea 
                                          className="form-control form-control-sm"
                                          rows="2"
                                          value={edu.description}
                                          onChange={(e) => handleArrayFieldChange('education', index, 'description', e.target.value)}
                                          placeholder="Additional details about your education"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="d-flex align-items-start mb-2">
                                        <div className="education-icon">
                                          <i className="bi bi-mortarboard text-primary"></i>
                                        </div>
                                        <div>
                                          <h6 className="mb-1">{edu.degree}</h6>
                                          <p className="text-muted mb-1">
                                            <i className="bi bi-book me-1"></i>
                                            {edu.field}
                                          </p>
                                          <div className="education-meta">
                                            <span className="badge bg-light text-dark me-2">
                                              <i className="bi bi-building me-1"></i>
                                              {edu.institution}
                                            </span>
                                            <span className="badge bg-light text-dark me-2">
                                              <i className="bi bi-calendar me-1"></i>
                                              {edu.year}
                                            </span>
                                            <span className="badge bg-light text-dark me-2">
                                              <i className="bi bi-star me-1"></i>
                                              {edu.grade}
                                            </span>
                                            {edu.isCurrent && (
                                              <span className="badge bg-success me-2">
                                                <i className="bi bi-circle-fill me-1"></i>
                                                Current
                                              </span>
                                            )}
                                          </div>
                                          {edu.description && (
                                            <p className="mt-2 mb-0 small text-muted">
                                              {edu.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {editMode && (
                                  <button 
                                    className="btn btn-sm btn-outline-danger ms-3"
                                    onClick={() => handleRemoveEducation(edu.id)}
                                    title="Remove education"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                )}
                              </div>
                              {index < formData.education.length - 1 && <hr className="my-3" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Tab - Enhanced with Search */}
                {activeTab === 'skills' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-tools text-primary me-2"></i>
                          Skills & Expertise
                        </h5>
                        {editMode && (
                          <div className="d-flex gap-2">
                            <div className="skill-search-wrapper">
                              <input 
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search skills..."
                                value={skillSearch}
                                onChange={(e) => setSkillSearch(e.target.value)}
                                onKeyPress={handleSkillInputKeyPress}
                                onFocus={() => setShowSkillSuggestions(true)}
                              />
                              {showSkillSuggestions && filteredSkills.length > 0 && (
                                <div className="skill-suggestions-dropdown">
                                  {filteredSkills.map((skill, index) => (
                                    <div 
                                      key={index}
                                      className="skill-suggestion-item"
                                      onClick={() => handleQuickAddSkill(skill)}
                                    >
                                      {skill}
                                      <small className="text-muted ms-2">Click to add</small>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => setShowSkillSuggestions(!showSkillSuggestions)}
                              title="Show suggestions"
                            >
                              <i className="bi bi-lightbulb"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      {formData.skills.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="empty-state">
                            <i className="bi bi-code-slash display-1 text-muted"></i>
                            <h5 className="mt-3 text-muted">No Skills Added</h5>
                            <p className="text-muted mb-4">
                              Add your skills to showcase your expertise to employers.
                            </p>
                            {editMode ? (
                              <div className="skill-quick-add">
                                <div className="input-group mb-3">
                                  <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter a skill (e.g., React, Python, Leadership)"
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    onKeyPress={handleSkillInputKeyPress}
                                  />
                                  <button 
                                    className="btn btn-primary"
                                    onClick={() => handleAddSkill(skillSearch)}
                                    disabled={!skillSearch.trim()}
                                  >
                                    <i className="bi bi-plus-lg"></i>
                                  </button>
                                </div>
                                <div className="popular-skills mt-3">
                                  <small className="text-muted d-block mb-2">Popular skills:</small>
                                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {['JavaScript', 'React', 'Python', 'Communication', 'Problem Solving'].map(skill => (
                                      <button 
                                        key={skill}
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleQuickAddSkill(skill)}
                                      >
                                        {skill}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => setEditMode(true)}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Edit to Add Skills
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="skills-container">
                          <div className="skills-grid-enhanced">
                            {formData.skills.map((skill, index) => (
                              <div key={skill.id || index} className="skill-card-enhanced">
                                {editMode && (
                                  <button 
                                    className="skill-remove-btn"
                                    onClick={() => handleRemoveSkill(skill.id)}
                                    title="Remove skill"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                )}
                                
                                {editMode ? (
                                  <div className="skill-edit-form">
                                    <input 
                                      type="text"
                                      className="form-control form-control-sm mb-2"
                                      value={skill.name}
                                      onChange={(e) => handleArrayFieldChange('skills', index, 'name', e.target.value)}
                                      placeholder="Skill name"
                                    />
                                    <div className="row g-2">
                                      <div className="col-7">
                                        <select 
                                          className="form-select form-select-sm"
                                          value={skill.level}
                                          onChange={(e) => handleArrayFieldChange('skills', index, 'level', e.target.value)}
                                        >
                                          <option value="Beginner">Beginner</option>
                                          <option value="Intermediate">Intermediate</option>
                                          <option value="Advanced">Advanced</option>
                                          <option value="Expert">Expert</option>
                                        </select>
                                      </div>
                                      <div className="col-5">
                                        <select 
                                          className="form-select form-select-sm"
                                          value={skill.years}
                                          onChange={(e) => handleArrayFieldChange('skills', index, 'years', parseInt(e.target.value))}
                                        >
                                          {[1,2,3,4,5,6,7,8,9,10].map(year => (
                                            <option key={year} value={year}>{year} yr{year > 1 ? 's' : ''}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="skill-header">
                                      <div className="skill-name">
                                        <i className="bi bi-tag me-1"></i>
                                        {skill.name}
                                      </div>
                                      <div className="skill-level">
                                        <span className={`badge bg-${getSkillLevelColor(skill.level)}`}>
                                          {getProficiencyIcon(skill.level)} {skill.level}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="skill-details">
                                      <div className="skill-experience">
                                        <i className="bi bi-clock me-1"></i>
                                        {skill.years} year{skill.years > 1 ? 's' : ''} experience
                                      </div>
                                      <div className="skill-progress">
                                        <div className="progress" style={{ height: '4px' }}>
                                          <div 
                                            className="progress-bar"
                                            style={{ 
                                              width: `${(skill.years > 10 ? 10 : skill.years) * 10}%`,
                                              backgroundColor: getSkillLevelColor(skill.level) === 'success' ? '#28a745' :
                                                              getSkillLevelColor(skill.level) === 'primary' ? '#007bff' :
                                                              getSkillLevelColor(skill.level) === 'warning' ? '#ffc107' :
                                                              '#17a2b8'
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {editMode && (
                            <div className="mt-4">
                              <div className="skill-quick-add">
                                <h6 className="mb-3">Add More Skills</h6>
                                <div className="input-group">
                                  <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Type a skill and press Enter..."
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    onKeyPress={handleSkillInputKeyPress}
                                  />
                                  <button 
                                    className="btn btn-primary"
                                    onClick={() => handleAddSkill(skillSearch)}
                                    disabled={!skillSearch.trim()}
                                  >
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Add
                                  </button>
                                </div>
                                {skillSuggestions.length > 0 && (
                                  <div className="suggested-skills mt-3">
                                    <small className="text-muted d-block mb-2">Suggestions:</small>
                                    <div className="d-flex flex-wrap gap-2">
                                      {skillSuggestions.slice(0, 8).map((skill, index) => (
                                        <button 
                                          key={index}
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => handleQuickAddSkill(skill)}
                                        >
                                          {skill}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resume Tab - Enhanced */}
                {activeTab === 'resume' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-file-earmark-text text-primary me-2"></i>
                        Resume & Documents
                      </h5>
                    </div>
                    <div className="card-body">
                      {/* Upload Section */}
                      <div className="resume-upload-section mb-5">
                        <div className="upload-area text-center py-5 px-3">
                          <i className="bi bi-cloud-arrow-up fa-3x text-muted mb-3"></i>
                          <h4>Upload Your Resume</h4>
                          <p className="text-muted mb-3">
                            Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                          </p>
                          <input 
                            type="file" 
                            id="resumeUpload"
                            className="d-none"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleResumeUpload}
                            disabled={isUploading}
                          />
                          <label 
                            htmlFor="resumeUpload" 
                            className={`btn btn-lg ${isUploading ? 'btn-secondary' : 'btn-primary'}`}
                          >
                            {isUploading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-upload me-2"></i>
                                Choose File
                              </>
                            )}
                          </label>
                          <p className="text-muted small mt-3">
                            Your resume is crucial for job applications. Keep it updated!
                          </p>
                        </div>
                      </div>

                      {/* Current Resume */}
                      <div className="current-resume">
                        <h5 className="mb-4">
                          <i className="bi bi-file-earmark me-2"></i>
                          Current Resume
                        </h5>
                        {formData.resume.fileName ? (
                          <div className="document-card-enhanced">
                            <div className="d-flex align-items-center">
                              <div className="document-icon-enhanced">
                                <i className="bi bi-file-earmark-pdf fa-3x text-danger"></i>
                              </div>
                              <div className="ms-3 flex-grow-1">
                                <h6 className="mb-1">{formData.resume.fileName}</h6>
                                <div className="d-flex flex-wrap gap-4 mb-2">
                                  <small className="text-muted">
                                    <i className="bi bi-file-earmark me-1"></i>
                                    Size: {formData.resume.fileSize}
                                  </small>
                                  <small className="text-muted">
                                    <i className="bi bi-calendar me-1"></i>
                                    Uploaded: {formData.resume.uploadedDate || 'Recently'}
                                  </small>
                                  <small className="text-muted">
                                    <i className="bi bi-filetype-pdf me-1"></i>
                                    {formData.resume.fileType || 'PDF Document'}
                                  </small>
                                </div>
                                <div className="document-actions">
                                  <a 
                                    href={formData.resume.fullUrl || formData.resume.publicUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary me-2"
                                  >
                                    <i className="bi bi-eye me-1"></i> Preview
                                  </a>
                                  <a 
                                    href={formData.resume.fullUrl || formData.resume.publicUrl} 
                                    download
                                    className="btn btn-sm btn-outline-success me-2"
                                  >
                                    <i className="bi bi-download me-1"></i> Download
                                  </a>
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => {
                                      fileInputRef.current.click();
                                    }}
                                  >
                                    <i className="bi bi-arrow-repeat me-1"></i> Replace
                                  </button>
                                  <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="d-none"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleResumeUpload}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-info alert-dismissible fade show">
                            <div className="d-flex">
                              <div className="flex-shrink-0">
                                <i className="bi bi-info-circle-fill fs-4"></i>
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h6>No Resume Uploaded</h6>
                                <p className="mb-0">
                                  Upload your resume to increase your profile completeness and make it easier for employers to find you.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Resume Tips */}
                      <div className="resume-tips mt-5">
                        <h6 className="mb-3">
                          <i className="bi bi-lightbulb me-2"></i>
                          Resume Tips
                        </h6>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <div className="tip-card">
                              <div className="tip-icon bg-primary-light">
                                <i className="bi bi-check-circle text-primary"></i>
                              </div>
                              <div className="tip-content">
                                <h6>Keep it Updated</h6>
                                <p className="small text-muted mb-0">
                                  Regularly update your resume with new skills and experiences.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="tip-card">
                              <div className="tip-icon bg-success-light">
                                <i className="bi bi-file-text text-success"></i>
                              </div>
                              <div className="tip-content">
                                <h6>Clear Formatting</h6>
                                <p className="small text-muted mb-0">
                                  Use clear headings and bullet points for easy readability.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="tip-card">
                              <div className="tip-icon bg-warning-light">
                                <i className="bi bi-search text-warning"></i>
                              </div>
                              <div className="tip-content">
                                <h6>Keyword Optimized</h6>
                                <p className="small text-muted mb-0">
                                  Include relevant keywords from job descriptions you're targeting.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Action Button for Mobile */}
          <div className="floating-action-btn d-lg-none">
            <button 
              className="btn btn-primary rounded-circle"
              onClick={() => setEditMode(!editMode)}
            >
              <i className={`bi ${editMode ? 'bi-check-lg' : 'bi-pencil'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;