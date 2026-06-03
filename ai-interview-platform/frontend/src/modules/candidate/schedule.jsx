import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../modules/candidate/CandidateLayout';
import '../../styles/main.css';

const Schedule = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const profileDropdownRef = useRef(null);

  // User profile data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff&size=128",
    role: "Candidate",
    candidateId: "CAND789012",
    status: "Active",
    memberSince: "2024-01-01",
    totalInterviews: 8,
    averageScore: 87
  };

  // Sample interview data
  const sampleInterviews = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp Inc.",
      date: "2024-01-15",
      time: "14:30",
      duration: 60,
      status: "scheduled",
      difficulty: "Hard",
      questions: 15,
      codingChallenges: 3,
      canStart: true,
      scheduledTime: "2024-01-15T14:30:00"
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupXYZ",
      date: "2024-01-16",
      time: "10:00",
      duration: 45,
      status: "scheduled",
      difficulty: "Medium",
      questions: 10,
      codingChallenges: 2,
      canStart: false,
      scheduledTime: "2024-01-16T10:00:00"
    },
    {
      id: 3,
      title: "Frontend Developer",
      company: "DesignCo",
      date: "2024-01-14",
      time: "11:00",
      duration: 60,
      status: "completed",
      difficulty: "Medium",
      questions: 12,
      codingChallenges: 2,
      score: 85,
      feedback: "Good performance",
      canStart: false,
      scheduledTime: "2024-01-14T11:00:00"
    },
    {
      id: 4,
      title: "Backend Engineer",
      company: "API Masters",
      date: "2026-02-13",
      time: "15:30",
      duration: 90,
      status: "completed",
      difficulty: "Hard",
      questions: 20,
      codingChallenges: 4,
      score: 92,
      feedback: "Excellent problem solving",
      canStart: false,
      scheduledTime: "2026-02-13T15:30:00"
    },
    {
      id: 5,
      title: "DevOps Engineer",
      company: "CloudSystems",
      date: "2026-06-17",
      time: "09:00",
      duration: 75,
      status: "scheduled",
      difficulty: "Hard",
      questions: 18,
      codingChallenges: 3,
      canStart: true,
      scheduledTime: "2026-06-17T09:00:00"
    }
  ];

  useEffect(() => {
    // Set user profile
    setUserProfile(userData);
    
    // Set interviews data
    setInterviews(sampleInterviews);
    
    const now = new Date();
    const upcoming = sampleInterviews.filter(interview => {
      const interviewTime = new Date(interview.scheduledTime);
      return interviewTime > now && interview.status !== 'completed';
    });
    
    const completed = sampleInterviews.filter(interview => 
      interview.status === 'completed'
    );

    setUpcomingInterviews(upcoming);
    setCompletedInterviews(completed);

    // Check interview availability
    const interval = setInterval(checkInterviewAvailability, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkInterviewAvailability = () => {
    const now = new Date();
    const updatedInterviews = interviews.map(interview => {
      const interviewTime = new Date(interview.scheduledTime);
      const timeDiff = interviewTime - now;
      const canStartNow = timeDiff <= 1800000 && timeDiff > -300000; // 30 min before to 5 min after
      
      return {
        ...interview,
        canStart: canStartNow && interview.status === 'scheduled'
      };
    });

    setInterviews(updatedInterviews);
    setUpcomingInterviews(updatedInterviews.filter(i => 
      new Date(i.scheduledTime) > now && i.status !== 'completed'
    ));
  };

  const handleStartInterview = (interviewId) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (interview && interview.canStart) {
      checkCameraAccess()
        .then(() => {
          navigate(`/interview/101/live`);
        })
        .catch(error => {
          alert('Please allow camera access to start the interview');
        });
    }
  };

  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      throw new Error('Camera access denied');
    }
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('interviewData');
    sessionStorage.clear();
    localStorage.clear();
    // Navigate to login page
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'primary',
      'in-progress': 'warning',
      completed: 'success',
      expired: 'secondary'
    };
    return badges[status] || 'secondary';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'success',
      Medium: 'warning',
      Hard: 'danger'
    };
    return colors[difficulty] || 'secondary';
  };

  return (
    <div className="interview-dashboard">
      {/* Header */}
      <Header title="AI Interview Pro" subtitle="Profile" showBackButton={false} />

      <div className="container-fluid main-content">
        <div className="container mt-4">
          {/* Stats Overview with Enhanced Design */}
          <div className="row mb-5">
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="bi bi-calendar"></i>
                </div>
                <div className="stat-content">
                  <h3>{interviews.length}</h3>
                  <p>Total Interviews</p>
                  <div className="stat-progress">
                    <div className="progress">
                      <div className="progress-bar" style={{width: '100%'}}></div>
                    </div>
                    <small>All scheduled interviews</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card upcoming">
                <div className="stat-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="stat-content">
                  <h3>{upcomingInterviews.length}</h3>
                  <p>Upcoming</p>
                  <div className="stat-progress">
                    <div className="progress">
                      <div className="progress-bar" style={{width: `${(upcomingInterviews.length / interviews.length) * 100 || 0}%`}}></div>
                    </div>
                    <small>Ready to start</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card completed">
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>{completedInterviews.length}</h3>
                  <p>Completed</p>
                  <div className="stat-progress">
                    <div className="progress">
                      <div className="progress-bar" style={{width: `${(completedInterviews.length / interviews.length) * 100 || 0}%`}}></div>
                    </div>
                    <small>Finished interviews</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card average">
                <div className="stat-icon">
                  <i className="bi bi-bar-chart"></i>
                </div>
                <div className="stat-content">
                  <h3>
                    {completedInterviews.length > 0 
                      ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedInterviews.length)
                      : 0}%
                  </h3>
                  <p>Avg. Score</p>
                  <div className="stat-progress">
                    <div className="progress">
                      <div className="progress-bar" style={{width: `${completedInterviews.length > 0 
                        ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedInterviews.length)
                        : 0}%`}}></div>
                    </div>
                    <small>Performance score</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Tabs */}
          <div className="interview-tabs">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-transparent border-bottom">
                <ul className="nav nav-tabs border-0">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      <i className="fas fa-clock me-2"></i>
                      Upcoming Interviews
                      <span className="badge bg-primary ms-2">{upcomingInterviews.length}</span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                      onClick={() => setActiveTab('completed')}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Completed Interviews
                      <span className="badge bg-success ms-2">{completedInterviews.length}</span>
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="card-body">
                {/* Upcoming Interviews */}
                {activeTab === 'upcoming' && (
                  <div className="tab-content">
                    {upcomingInterviews.length === 0 ? (
                      <div className="empty-state text-center py-5">
                        <i className="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                        <h4 className="text-muted">No Upcoming Interviews</h4>
                        <p className="text-muted">You don't have any scheduled interviews at the moment.</p>
                      </div>
                    ) : (
                      <div className="row">
                        {upcomingInterviews.map(interview => (
                          <div key={interview.id} className="col-lg-6 mb-4">
                            <div className="interview-card card border-0 shadow-sm h-100">
                              <div className="card-header bg-info text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h5 className="mb-1">{interview.title}</h5>
                                    <p className="mb-0 opacity-75">{interview.company}</p>
                                  </div>
                                  <span className={`badge bg-${getStatusBadge(interview.status)}`}>
                                    {interview.status.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="card-body">
                                <div className="interview-details">
                                  <div className="detail-item mb-3">
                                    <i className="fas fa-calendar text-primary me-2"></i>
                                    <div>
                                      <small className="text-muted">Date & Time</small>
                                      <p className="mb-0 fw-medium">
                                        {formatDate(interview.date)} at {formatTime(interview.time)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="row mb-3">
                                    <div className="col-6">
                                      <div className="detail-item">
                                        <i className="fas fa-clock text-warning me-2"></i>
                                        <div>
                                          <small className="text-muted">Duration</small>
                                          <p className="mb-0">{interview.duration} minutes</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-6">
                                      <div className="detail-item">
                                        <i className="fas fa-chart-bar text-info me-2"></i>
                                        <div>
                                          <small className="text-muted">Difficulty</small>
                                          <p className="mb-0">
                                            <span className={`badge bg-${getDifficultyColor(interview.difficulty)}`}>
                                              {interview.difficulty}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="detail-item">
                                    <i className="fas fa-tasks text-success me-2"></i>
                                    <div>
                                      <small className="text-muted">Format</small>
                                      <p className="mb-0">
                                        {interview.questions} MCQ, {interview.codingChallenges} Coding
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="interview-actions mt-4 pt-3 border-top">
                                  <button 
                                    className={`btn ${interview.canStart ? 'btn-primary' : 'btn-secondary'} w-100`}
                                    onClick={() => handleStartInterview(interview.id)}
                                    disabled={!interview.canStart}
                                  >
                                    {interview.canStart ? (
                                      <>
                                        <i className="fas fa-play-circle me-2"></i>
                                        Start Interview Now
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-clock me-2"></i>
                                        Available at {formatTime(interview.time)}
                                      </>
                                    )}
                                  </button>
                                  
                                  {!interview.canStart && (
                                    <div className="countdown mt-2 text-center">
                                      <small className="text-muted">
                                        Starts in{' '}
                                        {(() => {
                                          const now = new Date();
                                          const interviewTime = new Date(interview.scheduledTime);
                                          const diffMs = interviewTime - now;
                                          const diffMins = Math.floor(diffMs / 60000);
                                          const diffHours = Math.floor(diffMins / 60);
                                          const diffDays = Math.floor(diffHours / 24);
                                          
                                          if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
                                          if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
                                          return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
                                        })()}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Completed Interviews */}
                {activeTab === 'completed' && (
                  <div className="tab-content">
                    {completedInterviews.length === 0 ? (
                      <div className="empty-state text-center py-5">
                        <i className="fas fa-clipboard-check fa-4x text-muted mb-3"></i>
                        <h4 className="text-muted">No Completed Interviews</h4>
                        <p className="text-muted">You haven't completed any interviews yet.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Position</th>
                              <th>Company</th>
                              <th>Date</th>
                              <th>Score</th>
                              <th>Difficulty</th>
                              <th>Feedback</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedInterviews.map(interview => (
                              <tr key={interview.id}>
                                <td>
                                  <strong>{interview.title}</strong>
                                </td>
                                <td>{interview.company}</td>
                                <td>
                                  {formatDate(interview.date)}
                                  <br />
                                  <small className="text-muted">{formatTime(interview.time)}</small>
                                </td>
                                <td>
                                  <div className="score-display">
                                    <div className="score-circle-sm">
                                      {interview.score}%
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge bg-${getDifficultyColor(interview.difficulty)}`}>
                                    {interview.difficulty}
                                  </span>
                                </td>
                                <td>
                                  <small className="text-truncate d-inline-block" style={{maxWidth: '150px'}}>
                                    {interview.feedback}
                                  </small>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-eye me-1"></i>
                                    View Report
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;