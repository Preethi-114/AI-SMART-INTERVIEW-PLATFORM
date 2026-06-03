import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../modules/candidate/CandidateLayout';
import '../../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState({
    degree: '',
    field: '',
    institution: '',
    year: '',
    grade: ''
  });
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initial profile data - Ready for API integration
  const initialProfile = {
    personal: {
      fullName: "John Alexander Doe",
      email: "john.doe@example.com",
      dateOfBirth: "1995-08-15",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Apt 4B\nNew York, NY 10001",
      gender: "Male",
      nationality: "American",
      profilePhoto: "https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff&size=256"
    },
    professional: {
      title: "Senior React Developer",
      experience: "5 years",
      currentCompany: "TechCorp Inc.",
      expectedSalary: "$120,000",
      noticePeriod: "30 days",
      candidateId: "CAND789012",
      status: "Active",
      memberSince: "2024-01-01"
    },
    education: [
      {
        id: 1,
        degree: "Master of Science",
        field: "Computer Science",
        institution: "Stanford University",
        year: "2018-2020",
        grade: "3.8/4.0"
      },
      {
        id: 2,
        degree: "Bachelor of Engineering",
        field: "Software Engineering",
        institution: "MIT",
        year: "2014-2018",
        grade: "3.9/4.0"
      }
    ],
    skills: [
      { id: 1, name: "React.js", level: "Expert", years: 4 },
      { id: 2, name: "JavaScript", level: "Expert", years: 5 },
      { id: 3, name: "Node.js", level: "Advanced", years: 3 },
      { id: 4, name: "TypeScript", level: "Intermediate", years: 2 },
      { id: 5, name: "MongoDB", level: "Advanced", years: 3 },
      { id: 6, name: "AWS", level: "Intermediate", years: 2 }
    ],
    socialLinks: {
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      portfolio: "johndoe.dev"
    },
    resume: {
      fileName: "John_Doe_Resume.pdf",
      fileSize: "2.4 MB",
      uploadedDate: "2024-01-10",
      lastUpdated: "2024-01-15",
      url: "#"
    }
  };

  useEffect(() => {
    // Load profile data - Replace with API call
    const fetchProfileData = async () => {
      try {
        // Example API call
        // const response = await fetch('/api/profile');
        // const data = await response.json();
        // setUserProfile(data);
        
        setUserProfile(initialProfile);
        setSkills(initialProfile.skills);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfileData();
  }, []);

  // API Integration Functions
  const saveProfileToAPI = async (profileData) => {
    try {
      setIsUploading(true);
      setUploadProgress(30);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(60);
      
      // Actual API call would look like:
      // const response = await fetch('/api/profile/update', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(profileData)
      // });
      
      // const result = await response.json();
      
      setUploadProgress(100);
      setIsUploading(false);
      
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      setIsUploading(false);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    
    const updatedProfile = {
      ...userProfile,
      skills
    };
    
    const result = await saveProfileToAPI(updatedProfile);
    
    if (result.success) {
      setEditMode(false);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const newSkillObj = {
        id: Date.now(),
        name: newSkill,
        level: "Beginner",
        years: 1
      };
      setSkills([...skills, newSkillObj]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillId) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const handleAddEducation = () => {
    if (Object.values(newEducation).every(val => val.trim())) {
      const newEducationObj = {
        id: Date.now(),
        ...newEducation
      };
      
      setUserProfile(prev => ({
        ...prev,
        education: [...prev.education, newEducationObj]
      }));
      
      setNewEducation({
        degree: '',
        field: '',
        institution: '',
        year: '',
        grade: ''
      });
    }
  };

  const handleRemoveEducation = (educationId) => {
    setUserProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== educationId)
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // In real app, upload to server
      // const formData = new FormData();
      // formData.append('profilePhoto', file);
      // const response = await fetch('/api/upload-photo', {
      //   method: 'POST',
      //   body: formData
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      clearInterval(interval);
      setUploadProgress(100);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            profilePhoto: reader.result
          }
        }));
        setIsUploading(false);
        alert('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload PDF, DOC, or DOCX files only');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 1000));
      clearInterval(interval);
      setUploadProgress(100);

      const updatedProfile = {
        ...userProfile,
        resume: {
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedDate: new Date().toLocaleDateString(),
          lastUpdated: new Date().toLocaleDateString(),
          url: URL.createObjectURL(file) // Temporary URL
        }
      };
      
      setUserProfile(updatedProfile);
      setIsUploading(false);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume');
      setIsUploading(false);
    }
  };

  const handleFieldChange = (section, field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getSkillLevelColor = (level) => {
    switch(level.toLowerCase()) {
      case 'expert': return 'success';
      case 'advanced': return 'primary';
      case 'intermediate': return 'warning';
      case 'beginner': return 'info';
      default: return 'secondary';
    }
  };

  if (!userProfile) {
    return (
      <div className="profile-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header Component */}
      <Header title="AI Interview Pro" subtitle="Profile" showBackButton={false} />

      <div className="container-fluid main-content">
        <div className="container mt-4">
          <div className="row">
            {/* Left Column - Profile Summary */}
            <div className="col-lg-4 mb-4">
              <div className="profile-card card shadow-lg">
                <div className="card-body text-center">
                  {/* Profile Photo Section */}
                  <div className="profile-photo-section">
                    <div className="profile-photo-wrapper">
                      <img 
                        src={userProfile.personal.profilePhoto} 
                        alt="Profile" 
                        className="profile-photo"
                      />
                      {editMode && (
                        <>
                          <input 
                            type="file" 
                            id="photoUpload"
                            className="d-none"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={isUploading}
                          />
                          <label 
                            htmlFor="photoUpload" 
                            className="btn btn-sm btn-primary change-photo-btn"
                          >
                            <i className="bi bi-camera"></i>
                          </label>
                        </>
                      )}
                    </div>
                    
                    {isUploading && uploadProgress > 0 && (
                      <div className="upload-progress mt-3">
                        <div className="progress">
                          <div 
                            className="progress-bar progress-bar-striped progress-bar-animated" 
                            style={{ width: `${uploadProgress}%` }}
                          >
                            {uploadProgress}%
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <h3 className="mt-3 mb-1">{userProfile.personal.fullName}</h3>
                    <p className="text-muted mb-3">{userProfile.professional.title}</p>
                    
                    <div className="profile-badges mb-3">
                      <span className="badge bg-success">{userProfile.professional.status}</span>
                      <span className="badge bg-info">ID: {userProfile.professional.candidateId}</span>
                    </div>
                  </div>

                  {/* Profile Stats */}
                  <div className="profile-stats">
                    <div className="row text-center">
                      <div className="col-6">
                        <div className="stat-number">8</div>
                        <small className="text-muted">Interviews</small>
                      </div>
                      <div className="col-6">
                        <div className="stat-number">87%</div>
                        <small className="text-muted">Avg. Score</small>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4">
                    <button 
                      className="btn btn-primary w-100 mb-2"
                      onClick={() => setEditMode(!editMode)}
                      disabled={isUploading}
                    >
                      <i className={`bi bi-${editMode ? 'x' : 'pencil'} me-2`}></i>
                      {editMode ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                    
                    {editMode && (
                      <button 
                        className="btn btn-success w-100"
                        onClick={handleSaveProfile}
                        disabled={isUploading}
                      >
                        <i className="bi bi-save me-2"></i>
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Contact Info */}
              <div className="card shadow-sm mt-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    Contact Info
                  </h6>
                </div>
                <div className="card-body">
                  <div className="contact-item">
                    <i className="bi bi-envelope text-primary"></i>
                    <span>{userProfile.personal.email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-telephone text-success"></i>
                    <span>{userProfile.personal.phone}</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-geo-alt text-danger"></i>
                    <span className="text-muted">{userProfile.personal.address.split('\n')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="col-lg-8">
              {/* Navigation Tabs */}
              <div className="card shadow-sm mb-4">
                <div className="card-body p-0">
                  <ul className="nav nav-tabs profile-tabs">
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                      >
                        <i className="bi bi-person me-2"></i>
                        Personal
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                        onClick={() => setActiveTab('education')}
                      >
                        <i className="bi bi-mortarboard me-2"></i>
                        Education
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                        onClick={() => setActiveTab('skills')}
                      >
                        <i className="bi bi-code-slash me-2"></i>
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

              {/* Tab Content */}
              <div className="profile-tab-content">
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Personal Details</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {[
                          { label: 'Full Name', field: 'fullName', type: 'text', value: userProfile.personal.fullName },
                          { label: 'Email Address', field: 'email', type: 'email', value: userProfile.personal.email },
                          { label: 'Date of Birth', field: 'dateOfBirth', type: 'date', value: userProfile.personal.dateOfBirth },
                          { label: 'Phone Number', field: 'phone', type: 'tel', value: userProfile.personal.phone },
                          { label: 'Gender', field: 'gender', type: 'select', value: userProfile.personal.gender, options: ['Male', 'Female', 'Other'] },
                          { label: 'Nationality', field: 'nationality', type: 'text', value: userProfile.personal.nationality }
                        ].map((item, index) => (
                          <div key={index} className="col-md-6 mb-3">
                            <label className="form-label">{item.label}</label>
                            {editMode ? (
                              item.type === 'select' ? (
                                <select 
                                  className="form-select"
                                  value={item.value}
                                  onChange={(e) => handleFieldChange('personal', item.field, e.target.value)}
                                >
                                  {item.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : (
                                <input 
                                  type={item.type}
                                  className="form-control"
                                  value={item.value}
                                  onChange={(e) => handleFieldChange('personal', item.field, e.target.value)}
                                />
                              )
                            ) : (
                              <div className="form-control-plaintext">
                                {item.type === 'date' ? new Date(item.value).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : item.value}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="col-12 mb-3">
                          <label className="form-label">Address</label>
                          {editMode ? (
                            <textarea 
                              className="form-control"
                              rows="3"
                              value={userProfile.personal.address}
                              onChange={(e) => handleFieldChange('personal', 'address', e.target.value)}
                            />
                          ) : (
                            <div className="form-control-plaintext whitespace-pre">
                              {userProfile.personal.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Education Details</h5>
                      {editMode && (
                        <button 
                          className="btn btn-sm btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#educationModal"
                        >
                          <i className="bi bi-plus me-1"></i> Add Education
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      {userProfile.education.map((edu, index) => (
                        <div key={edu.id} className="education-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{edu.degree} in {edu.field}</h6>
                              <p className="text-muted mb-1">
                                <i className="bi bi-building me-2"></i>
                                {edu.institution}
                              </p>
                              <div className="d-flex gap-4">
                                <small>
                                  <i className="bi bi-calendar me-1"></i>
                                  {edu.year}
                                </small>
                                <small>
                                  <i className="bi bi-star me-1"></i>
                                  Grade: {edu.grade}
                                </small>
                              </div>
                            </div>
                            {editMode && (
                              <div className="btn-group">
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveEducation(edu.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                          {index < userProfile.education.length - 1 && <hr className="my-3" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Technical Skills</h5>
                    </div>
                    <div className="card-body">
                      {editMode && (
                        <div className="mb-4">
                          <div className="input-group">
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="Add a new skill (e.g., Python, Docker, etc.)"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <button 
                              className="btn btn-primary"
                              onClick={handleAddSkill}
                              disabled={!newSkill.trim()}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="skills-grid">
                        {skills.map(skill => (
                          <div key={skill.id} className="skill-card">
                            <div className="skill-header">
                              <span className="skill-name">{skill.name}</span>
                              <div className="skill-level">
                                <span className={`badge bg-${getSkillLevelColor(skill.level)}`}>
                                  {skill.level}
                                </span>
                              </div>
                            </div>
                            <div className="skill-details">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {skill.years} year{skill.years > 1 ? 's' : ''} experience
                              </small>
                            </div>
                            {editMode && (
                              <button 
                                className="skill-remove-btn"
                                onClick={() => handleRemoveSkill(skill.id)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Resume Tab */}
                {activeTab === 'resume' && (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Resume & Documents</h5>
                    </div>
                    <div className="card-body">
                      <div className="resume-upload-section mb-5">
                        <div className="upload-area text-center py-5">
                          <i className="bi bi-cloud-arrow-up fa-3x text-muted mb-3"></i>
                          <h5>Upload Your Resume</h5>
                          <p className="text-muted mb-3">
                            Supported formats: PDF, DOC, DOCX (Max 5MB)
                          </p>
                          <input 
                            type="file" 
                            id="resumeUpload"
                            className="d-none"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            disabled={isUploading}
                          />
                          <label 
                            htmlFor="resumeUpload" 
                            className={`btn ${isUploading ? 'btn-secondary' : 'btn-primary'}`}
                          >
                            <i className="bi bi-upload me-2"></i>
                            {isUploading ? 'Uploading...' : 'Choose File'}
                          </label>
                          
                          {isUploading && uploadProgress > 0 && (
                            <div className="upload-progress mt-3 w-75 mx-auto">
                              <div className="progress">
                                <div 
                                  className="progress-bar progress-bar-striped progress-bar-animated" 
                                  style={{ width: `${uploadProgress}%` }}
                                >
                                  {uploadProgress}%
                                </div>
                              </div>
                              <small className="text-muted">Uploading resume...</small>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="current-resume">
                        <h6 className="mb-3">Current Resume</h6>
                        <div className="document-card">
                          <div className="d-flex align-items-center">
                            <div className="document-icon">
                              <i className="bi bi-file-earmark-pdf fa-2x text-danger"></i>
                            </div>
                            <div className="ms-3 flex-grow-1">
                              <h6 className="mb-1">{userProfile.resume.fileName}</h6>
                              <div className="d-flex gap-4 flex-wrap">
                                <small className="text-muted">
                                  <i className="bi bi-file-earmark me-1"></i>
                                  {userProfile.resume.fileSize}
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-calendar me-1"></i>
                                  Uploaded: {userProfile.resume.uploadedDate}
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-arrow-clockwise me-1"></i>
                                  Updated: {userProfile.resume.lastUpdated}
                                </small>
                              </div>
                            </div>
                            <div className="btn-group">
                              <a 
                                href={userProfile.resume.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary"
                              >
                                <i className="bi bi-eye me-1"></i> View
                              </a>
                              <a 
                                href={userProfile.resume.url} 
                                download
                                className="btn btn-outline-success"
                              >
                                <i className="bi bi-download me-1"></i> Download
                              </a>
                              {editMode && (
                                <button className="btn btn-outline-danger">
                                  <i className="bi bi-trash me-1"></i>
                                </button>
                              )}
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
        </div>
      </div>

      {/* Add Education Modal */}
      {editMode && (
        <div className="modal fade" id="educationModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Education</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {Object.keys(newEducation).map((field) => (
                    <div key={field} className="col-12 mb-3">
                      <label className="form-label text-capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newEducation[field]}
                        onChange={(e) => setNewEducation(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddEducation}
                  data-bs-dismiss="modal"
                  disabled={Object.values(newEducation).some(val => !val.trim())}
                >
                  Add Education
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;