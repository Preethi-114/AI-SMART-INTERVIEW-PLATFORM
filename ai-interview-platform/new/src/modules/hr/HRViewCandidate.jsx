import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/HRCandidateView.css';

const HRCandidateView = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetails();
      fetchCandidateEvaluations();
    }
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      const token = localStorage.getItem('hrToken');
      const response = await axios.get(`/api/hr/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidate(response.data.candidate);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      setLoading(false);
    }
  };

  const fetchCandidateEvaluations = async () => {
    try {
      const token = localStorage.getItem('hrToken');
      const [evalRes, historyRes, testRes] = await Promise.all([
        axios.get(`/api/hr/evaluations/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/hr/interviews/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/hr/test-results/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAiEvaluation(evalRes.data.evaluation);
      setInterviewHistory(historyRes.data.interviews);
      setTestResults(testRes.data.results);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const handleShortlist = async () => {
    try {
      const token = localStorage.getItem('hrToken');
      await axios.post('/api/hr/shortlist', 
        { candidateIds: [candidateId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Candidate shortlisted successfully!');
      fetchCandidateDetails();
    } catch (error) {
      console.error('Error shortlisting:', error);
    }
  };

  const handleScheduleInterview = () => {
    navigate(`/hr/schedule-interview/${candidateId}`);
  };

  const handleDownloadResume = async () => {
    try {
      const token = localStorage.getItem('hrToken');
      const response = await axios.get(`/api/hr/resume/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${candidate.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const handleAddNote = async () => {
    const note = prompt('Add your note about this candidate:');
    if (note && note.trim()) {
      try {
        const token = localStorage.getItem('hrToken');
        await axios.post(`/api/hr/notes/${candidateId}`, 
          { note },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Note added successfully!');
        fetchCandidateDetails();
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { label: 'New', class: 'badge-new' },
      'shortlisted': { label: 'Shortlisted', class: 'badge-shortlisted' },
      'interview': { label: 'Interview', class: 'badge-interview' },
      'rejected': { label: 'Rejected', class: 'badge-rejected' },
      'hired': { label: 'Hired', class: 'badge-hired' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'badge-default' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="not-found">
        <h2>Candidate not found</h2>
        <button onClick={() => navigate('/hr/candidates')}>Back to Candidates</button>
      </div>
    );
  }

  return (
    <div className="hr-candidate-view">
      {/* Header with Actions */}
      <div className="candidate-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/hr/candidates')}>
            ← Back to Candidates
          </button>
          <h1>Candidate Profile</h1>
        </div>
        <div className="header-actions">
          {candidate.status !== 'shortlisted' && candidate.status !== 'rejected' && (
            <button className="action-btn shortlist-btn" onClick={handleShortlist}>
              📋 Shortlist
            </button>
          )}
          <button className="action-btn schedule-btn" onClick={handleScheduleInterview}>
            📅 Schedule Interview
          </button>
          <button className="action-btn download-btn" onClick={handleDownloadResume}>
            📄 Download Resume
          </button>
          <button className="action-btn note-btn" onClick={handleAddNote}>
            📝 Add Note
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="candidate-container">
        {/* Left Sidebar - Basic Info */}
        <div className="candidate-sidebar">
          <div className="profile-card">
            <div className="profile-photo">
              <div className="avatar-large">
                {candidate.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-info">
              <h2>{candidate.name}</h2>
              <p className="position">{candidate.position}</p>
              <p className="experience">{candidate.experience} years experience</p>
              
              <div className="status-section">
                {getStatusBadge(candidate.status)}
                {candidate.shortlistedDate && (
                  <p className="date-info">
                    Shortlisted: {formatDate(candidate.shortlistedDate)}
                  </p>
                )}
              </div>
            </div>

            <div className="contact-info">
              <div className="contact-item">
                <span className="label">📧 Email:</span>
                <span>{candidate.email}</span>
              </div>
              <div className="contact-item">
                <span className="label">📱 Phone:</span>
                <span>{candidate.phone}</span>
              </div>
              <div className="contact-item">
                <span className="label">📍 Location:</span>
                <span>{candidate.location}</span>
              </div>
              <div className="contact-item">
                <span className="label">🏢 Current Company:</span>
                <span>{candidate.currentCompany || 'Not specified'}</span>
              </div>
              <div className="contact-item">
                <span className="label">💰 Expected Salary:</span>
                <span>{candidate.expectedSalary || 'Not specified'}</span>
              </div>
              <div className="contact-item">
                <span className="label">⏰ Notice Period:</span>
                <span>{candidate.noticePeriod || 'Not specified'}</span>
              </div>
            </div>

            <div className="applied-info">
              <p><strong>Applied:</strong> {formatDate(candidate.appliedDate)}</p>
              <p><strong>Candidate ID:</strong> {candidate._id.substring(0, 8)}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              {aiEvaluation && (
                <>
                  <div className="stat-item">
                    <div className="stat-value">
                      <span className={getScoreColor(aiEvaluation.overallScore)}>
                        {aiEvaluation.overallScore}%
                      </span>
                    </div>
                    <div className="stat-label">AI Score</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      <span className={getScoreColor(aiEvaluation.technicalScore)}>
                        {aiEvaluation.technicalScore}%
                      </span>
                    </div>
                    <div className="stat-label">Technical</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      <span className={getScoreColor(aiEvaluation.communicationScore)}>
                        {aiEvaluation.communicationScore}%
                      </span>
                    </div>
                    <div className="stat-label">Communication</div>
                  </div>
                </>
              )}
              {testResults && (
                <>
                  <div className="stat-item">
                    <div className="stat-value">
                      <span className={getScoreColor(testResults.mcqScore)}>
                        {testResults.mcqScore}%
                      </span>
                    </div>
                    <div className="stat-label">MCQ Score</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      <span className={getScoreColor(testResults.codingScore)}>
                        {testResults.codingScore}%
                      </span>
                    </div>
                    <div className="stat-label">Coding</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Details */}
        <div className="candidate-content">
          {/* Navigation Tabs */}
          <div className="candidate-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              Skills
            </button>
            <button 
              className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              Education
            </button>
            <button 
              className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              Experience
            </button>
            <button 
              className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`}
              onClick={() => setActiveTab('evaluations')}
            >
              Evaluations
            </button>
            <button 
              className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              HR Notes
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                <div className="section">
                  <h3>Professional Summary</h3>
                  <div className="summary-box">
                    <p>{candidate.professionalSummary || 'No summary provided'}</p>
                  </div>
                </div>

                <div className="section">
                  <h3>Key Skills</h3>
                  <div className="skills-preview">
                    {candidate.skills?.slice(0, 10).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {candidate.skills?.length > 10 && (
                      <span className="more-skills">+{candidate.skills.length - 10} more</span>
                    )}
                  </div>
                </div>

                <div className="section">
                  <h3>AI Evaluation Summary</h3>
                  {aiEvaluation ? (
                    <div className="ai-summary">
                      <div className="score-cards">
                        <div className="score-card">
                          <div className="score-title">Overall Score</div>
                          <div className={`score-value ${getScoreColor(aiEvaluation.overallScore)}`}>
                            {aiEvaluation.overallScore}%
                          </div>
                        </div>
                        <div className="score-card">
                          <div className="score-title">Technical</div>
                          <div className={`score-value ${getScoreColor(aiEvaluation.technicalScore)}`}>
                            {aiEvaluation.technicalScore}%
                          </div>
                        </div>
                        <div className="score-card">
                          <div className="score-title">Communication</div>
                          <div className={`score-value ${getScoreColor(aiEvaluation.communicationScore)}`}>
                            {aiEvaluation.communicationScore}%
                          </div>
                        </div>
                      </div>
                      <div className="feedback-box">
                        <h4>AI Feedback</h4>
                        <p>{aiEvaluation.feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data">No AI evaluation available</p>
                  )}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="tab-pane">
                <h3>Technical Skills</h3>
                <div className="skills-details">
                  {candidate.skills?.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <span className="skill-name">{skill}</span>
                      <div className="skill-bar">
                        <div className="skill-fill" style={{ width: '80%' }}></div>
                      </div>
                      <span className="skill-level">Expert</span>
                    </div>
                  ))}
                </div>

                <div className="section">
                  <h3>Certifications</h3>
                  {candidate.certifications?.length > 0 ? (
                    <div className="certifications-list">
                      {candidate.certifications.map((cert, index) => (
                        <div key={index} className="certification-item">
                          <span className="cert-name">{cert.name}</span>
                          <span className="cert-issuer">{cert.issuer}</span>
                          <span className="cert-date">{cert.year}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No certifications added</p>
                  )}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="tab-pane">
                <h3>Education History</h3>
                {candidate.education?.length > 0 ? (
                  <div className="education-list">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <div className="edu-header">
                          <h4>{edu.degree}</h4>
                          <span className="edu-dates">{edu.year}</span>
                        </div>
                        <p className="edu-institution">{edu.institution}</p>
                        <div className="edu-details">
                          <span className="edu-field">Field: {edu.field}</span>
                          <span className="edu-grade">Grade: {edu.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No education details provided</p>
                )}
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="tab-pane">
                <h3>Work Experience</h3>
                {candidate.workExperience?.length > 0 ? (
                  <div className="experience-list">
                    {candidate.workExperience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="exp-header">
                          <h4>{exp.role}</h4>
                          <span className="exp-company">{exp.company}</span>
                          <span className="exp-duration">{exp.duration}</span>
                        </div>
                        <p className="exp-description">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No work experience provided</p>
                )}
              </div>
            )}

            {/* Evaluations Tab */}
            {activeTab === 'evaluations' && (
              <div className="tab-pane">
                <div className="evaluations-section">
                  <h3>Test Results</h3>
                  {testResults ? (
                    <div className="test-results">
                      <div className="test-card">
                        <div className="test-header">
                          <h4>MCQ Test</h4>
                          <span className={`test-score ${getScoreColor(testResults.mcqScore)}`}>
                            {testResults.mcqScore}%
                          </span>
                        </div>
                        <p>Time taken: 45 minutes</p>
                        <p>Correct answers: 38/50</p>
                      </div>
                      <div className="test-card">
                        <div className="test-header">
                          <h4>Coding Test</h4>
                          <span className={`test-score ${getScoreColor(testResults.codingScore)}`}>
                            {testResults.codingScore}%
                          </span>
                        </div>
                        <p>Problems solved: 3/4</p>
                        <p>Code quality: Good</p>
                      </div>
                      <div className="test-card">
                        <div className="test-header">
                          <h4>Video Interview</h4>
                          <span className={`test-score ${getScoreColor(testResults.videoInterviewScore)}`}>
                            {testResults.videoInterviewScore}%
                          </span>
                        </div>
                        <p>Communication: Good</p>
                        <p>Confidence: High</p>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data">No test results available</p>
                  )}
                </div>

                <div className="section">
                  <h3>Interview History</h3>
                  {interviewHistory.length > 0 ? (
                    <div className="interview-history">
                      {interviewHistory.map((interview, index) => (
                        <div key={index} className="interview-item">
                          <div className="interview-header">
                            <span className="interview-round">Round {interview.round}</span>
                            <span className="interview-date">{formatDate(interview.date)}</span>
                            <span className={`interview-status ${interview.status}`}>
                              {interview.status}
                            </span>
                          </div>
                          <p className="interview-interviewer">
                            Interviewer: {interview.interviewer}
                          </p>
                          <p className="interview-feedback">{interview.feedback}</p>
                          <div className="interview-scores">
                            {interview.scores?.map((score, idx) => (
                              <span key={idx} className="score-item">
                                {score.category}: {score.value}/10
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No interview history</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="tab-pane">
                <h3>HR Notes & Comments</h3>
                <div className="notes-section">
                  {candidate.hrNotes?.length > 0 ? (
                    <div className="notes-list">
                      {candidate.hrNotes.map((note, index) => (
                        <div key={index} className="note-item">
                          <div className="note-header">
                            <span className="note-author">{note.addedBy?.name || 'HR'}</span>
                            <span className="note-date">{formatDate(note.addedAt)}</span>
                          </div>
                          <p className="note-content">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No notes added yet</p>
                  )}
                  
                  <div className="add-note-box">
                    <h4>Add New Note</h4>
                    <textarea 
                      id="newNote" 
                      placeholder="Add your notes about this candidate..."
                      rows="4"
                    ></textarea>
                    <button onClick={handleAddNote} className="btn-add-note">
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRCandidateView;