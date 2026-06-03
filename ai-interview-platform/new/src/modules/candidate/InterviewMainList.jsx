import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../modules/candidate/CandidateLayout';
import '../../styles/main.css';
import { candidateInterviewApi } from '../../modules/services/api';

const InterviewList = () => {
  const navigate = useNavigate();
  const [allInterviews, setAllInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const profileDropdownRef = useRef(null);

  // Human-readable round icons and names
  const getRoundDetails = (round) => {
    switch(round) {
      case 'MCQ':
      case 'mcq':
        return {
          icon: <i className="bi bi-question-circle text-primary me-1"></i>,
          name: 'MCQ Test',
          color: 'primary'
        };
      case 'Coding Challenge':
      case 'Coding':
      case 'coding':
        return {
          icon: <i className="bi bi-code-slash text-success me-1"></i>,
          name: 'Coding Challenge',
          color: 'success'
        };
      case 'Video Interview':
      case 'Video':
      case 'intro':
        return {
          icon: <i className="bi bi-camera-video text-info me-1"></i>,
          name: 'Video Interview',
          color: 'info'
        };
      default:
        return {
          icon: <i className="bi bi-circle me-1"></i>,
          name: round,
          color: 'secondary'
        };
    }
  };

  // Check if interview can start
  const checkIfCanStart = useCallback((interview) => {
    if (interview.status === 'completed' || interview.status === 'cancelled' || interview.status === 'expired') return false;
    
    const now = new Date();
    const interviewTime = new Date(interview.scheduledTime);
    const interviewEndTime = new Date(interviewTime.getTime() + (interview.duration * 60000));
    
    return now >= interviewTime && now <= interviewEndTime;
  }, []);

  // Check if interview is expired
  const isExpired = useCallback((interview) => {
    if (interview.status === 'completed' || interview.status === 'cancelled') return false;
    
    const now = new Date();
    const interviewTime = new Date(interview.scheduledTime);
    const interviewEndTime = new Date(interviewTime.getTime() + (interview.duration * 60000));
    
    return now > interviewEndTime;
  }, []);

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // const response = await api.getProfile();
        const response = await candidateInterviewApi.getMyInterviews();
        
        if (response.success && response.data) {
          const interviews = response.data.all || [];
          
          const initializedInterviews = interviews.map(interview => ({
            ...interview,
            canStart: checkIfCanStart(interview)
          }));
          
          setAllInterviews(initializedInterviews);
          setUpcomingInterviews(response.data.upcoming || []);
          setCompletedInterviews(response.data.completed || []);
        } else {
          console.log("Failed to load interviews");
          // setError('Failed to load interviews');
        }
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setError(err.message || 'Error loading interviews. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, [checkIfCanStart]);

  // Update interviews when currentTime changes
  useEffect(() => {
    if (allInterviews.length > 0) {
      setAllInterviews(prev => 
        prev.map(interview => ({
          ...interview,
          canStart: checkIfCanStart(interview)
        }))
      );
      
      setUpcomingInterviews(prev => 
        prev.map(interview => ({
          ...interview,
          canStart: checkIfCanStart(interview)
        }))
      );
    }
  }, [currentTime, checkIfCanStart]);

  // Handle start interview
  const handleStartInterview = (interviewId) => {
    const interview = allInterviews.find(i => i.id === interviewId);
    if (interview && interview.canStart && !isExpired(interview)) {
      navigate(`/interview/${interviewId}/live`, { 
        state: { 
          interviewId: interview.id,
          interviewTitle: interview.title,
          interviewTime: interview.scheduledTime,
          interviewDuration: interview.duration,
          interviewRounds: interview.rounds,
          interviewLink: interview.interviewLink
        }
      });
    }
  };

  const handleViewReport = (interviewId) => {
    navigate(`/interview/${interviewId}/report`);
  };

  // Human-readable date formatting
  const formatReadableDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatReadableTime = (timeString) => {
    if (!timeString) return 'Time not set';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDateTime = (scheduledTime) => {
    if (!scheduledTime) return 'Date and time not set';
    try {
      const date = new Date(scheduledTime);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return scheduledTime;
    }
  };

  const getTimeUntilInterview = (scheduledTime) => {
    if (!scheduledTime) return null;
    
    const now = new Date();
    const interviewTime = new Date(scheduledTime);
    const diffMs = interviewTime - now;
    
    if (diffMs <= 0) return null;
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getTimeRemaining = (scheduledTime, duration) => {
    if (!scheduledTime) return null;
    
    const now = new Date();
    const interviewTime = new Date(scheduledTime);
    const interviewEndTime = new Date(interviewTime.getTime() + (duration * 60000));
    const diffMs = interviewEndTime - now;
    
    if (diffMs <= 0) return null;
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getDurationText = (minutes) => {
    if (!minutes) return 'Duration not set';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="badge bg-success px-3 py-2">Ready to Start</span>;
      case 'scheduled':
        return <span className="badge bg-primary px-3 py-2">Scheduled</span>;
      case 'completed':
        return <span className="badge bg-success px-3 py-2">Completed</span>;
      case 'cancelled':
        return <span className="badge bg-danger px-3 py-2">Cancelled</span>;
      case 'expired':
        return <span className="badge bg-secondary px-3 py-2">Expired</span>;
      default:
        return <span className="badge bg-light text-dark px-3 py-2">{status || 'Unknown'}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="interview-dashboard">
        <Header title="AI Interview Pro" subtitle="Interviews" showBackButton={false} />
        <div className="container-fluid main-content">
          <div className="container mt-4">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 fs-5 text-muted">Loading your interviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-dashboard">
        <Header title="AI Interview Pro" subtitle="Interviews" showBackButton={false} />
        <div className="container-fluid main-content">
          <div className="container mt-4">
            <div className="alert alert-danger text-center py-5 rounded-4">
              <i className="fas fa-exclamation-triangle fa-4x mb-3 text-danger"></i>
              <h4 className="mb-3">Unable to Load Interviews</h4>
              <p className="text-muted mb-4">{error}</p>
              <button 
                className="btn btn-primary px-4 py-2"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo me-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-dashboard">
      <Header title="AI Interview Pro" subtitle="Interviews" showBackButton={false} />

      <div className="container-fluid main-content">
        <div className="container mt-4">
          {/* Welcome Message */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="bg-light p-4 rounded-4">
                <h2 className="h4 mb-2">Welcome back!</h2>
                <p className="text-muted mb-0">
                  You have {upcomingInterviews.length} upcoming interview{upcomingInterviews.length !== 1 ? 's' : ''} 
                  {allInterviews.filter(i => i.canStart).length > 0 && 
                    `, with ${allInterviews.filter(i => i.canStart).length} ready to start now`}.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="row mb-5">
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card total p-4 rounded-4">
                <div className="d-flex align-items-center">
                    <div className="stat-icon">
                      <i className="bi bi-calendar"></i>
                    </div>
                  <div className="stat-content">
                    <h3 className="mb-1 fs-2 fw-bold">{allInterviews.filter(i => i.status === 'scheduled' || i.status === 'available').length}</h3>
                    <p className="text-muted mb-0">Total Scheduled</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card upcoming p-4 rounded-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                      <i className="bi bi-play-circle-fill"></i>
                    </div>
                  <div className="stat-content">
                    <h3 className="mb-1 fs-2 fw-bold">{allInterviews.filter(i => i.canStart && (i.status === 'scheduled' || i.status === 'available')).length}</h3>
                    <p className="text-muted mb-0">Ready to Start</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card completed p-4 rounded-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                  <div className="stat-content">
                    <h3 className="mb-1 fs-2 fw-bold">{completedInterviews.length}</h3>
                    <p className="text-muted mb-0">Completed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-lg-6 mb-4">
              <div className="stat-card average p-4 rounded-4">
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                      <i className="bi bi-bar-chart-fill"></i>
                    </div>
                  <div className="stat-content">
                    <h3 className="mb-1 fs-2 fw-bold">
                      {completedInterviews.length > 0 
                        ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedInterviews.length)
                        : 0}%
                    </h3>
                    <p className="text-muted mb-0">Average Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Tabs */}
          <div className="interview-tabs">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-transparent border-bottom p-4">
                <ul className="nav nav-tabs border-0">
                  <li className="nav-item me-2">
                    <button 
                      className={`nav-link px-4 py-2 rounded-3 ${activeTab === 'upcoming' ? 'active bg-primary text-white' : 'bg-light'}`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      <i className="fas fa-clock me-2"></i>
                      Upcoming
                      <span className={`badge ${activeTab === 'upcoming' ? 'bg-white text-primary' : 'bg-primary text-white'} ms-2`}>
                        {upcomingInterviews.length}
                      </span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link px-4 py-2 rounded-3 ${activeTab === 'completed' ? 'active bg-primary text-white' : 'bg-light'}`}
                      onClick={() => setActiveTab('completed')}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Completed
                      <span className={`badge ${activeTab === 'completed' ? 'bg-white text-primary' : 'bg-success text-white'} ms-2`}>
                        {completedInterviews.length}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="card-body p-4">
                {/* Upcoming Interviews */}
                {activeTab === 'upcoming' && (
                  <div className="tab-content">
                    {upcomingInterviews.length === 0 ? (
                      <div className="empty-state text-center py-5">
                        <div className="mb-4">
                          <i className="fas fa-calendar-times fa-5x text-muted opacity-50"></i>
                        </div>
                        <h4 className="text-muted mb-3">No Upcoming Interviews</h4>
                        <p className="text-muted mb-4">You don't have any scheduled interviews at the moment.</p>
                        <p className="small text-muted">Check back later for new interview invitations.</p>
                      </div>
                    ) : (
                      <div className="row g-4">
                        {upcomingInterviews.map(interview => {
                          const timeUntil = getTimeUntilInterview(interview.scheduledTime);
                          const timeRemaining = getTimeRemaining(interview.scheduledTime, interview.duration);
                          const isAvailable = interview.canStart;
                          const expired = isExpired(interview);
                          
                          return (
                            <div key={interview.id} className="col-lg-6 col-xl-4">
                              <div className="interview-card card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                                <div className={`card-header p-3 ${expired ? 'bg-secondary' : (isAvailable ? 'bg-success' : 'bg-primary')} text-white`}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="mb-0 fw-bold text-truncate" style={{maxWidth: '160px'}}>{interview.title || 'Untitled Interview'}</h5>
                                    {getStatusBadge(expired ? 'expired' : (isAvailable ? 'available' : interview.status))}
                                  </div>
                                  <p className="mb-0 small opacity-75">
                                    <i className="fas fa-building me-2"></i>
                                    {interview.company || 'Company'}
                                  </p>
                                </div>
                                
                                <div className="card-body p-3">
                                  {/* Date and Time */}
                                  <div className="mb-3 pb-2 border-bottom">
                                    <div className="d-flex align-items-center mb-2">
                                      <i className="fas fa-calendar-day text-primary me-2" style={{width: '20px'}}></i>
                                      <span className="fw-medium">{formatReadableDate(interview.scheduledTime)}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <i className="fas fa-clock text-primary me-2" style={{width: '20px'}}></i>
                                      <span className="fw-medium">{formatReadableTime(interview.time)}</span>
                                      <span className="mx-2 text-muted">•</span>
                                      <span className="text-muted">{getDurationText(interview.duration)}</span>
                                    </div>
                                  </div>

                                  {/* Rounds */}
                                  {interview.rounds && interview.rounds.length > 0 && (
                                    <div className="mb-3">
                                      <p className="small text-muted mb-2">Interview Rounds:</p>
                                      <div className="d-flex flex-wrap gap-2">
                                        {interview.rounds.map((round, index) => {
                                          const details = getRoundDetails(round);
                                          return (
                                            <span key={index} className={`badge bg-light-${details.color} text-${details.color} d-flex align-items-center py-2 px-3 rounded-pill`}>
                                              {details.icon}
                                              {details.name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Status Messages */}
                                  {!expired && !isAvailable && timeUntil && interview.status !== 'cancelled' && (
                                    <div className="alert alert-warning py-2 px-3 mb-3 rounded-3">
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-hourglass-half me-2"></i>
                                        <div>
                                          <strong className="d-block small">Starts in {timeUntil}</strong>
                                          <small>Please be ready at the scheduled time</small>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {!expired && isAvailable && timeRemaining && (
                                    <div className="alert alert-success py-2 px-3 mb-3 rounded-3">
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-check-circle me-2"></i>
                                        <div>
                                          <strong className="d-block small">Ready to Start!</strong>
                                          <small>{timeRemaining} remaining to begin</small>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {interview.status === 'cancelled' && (
                                    <div className="alert alert-danger py-2 px-3 mb-3 rounded-3">
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-times-circle me-2"></i>
                                        <span>This interview has been cancelled</span>
                                      </div>
                                    </div>
                                  )}

                                  {expired && interview.status !== 'cancelled' && (
                                    <div className="alert alert-secondary py-2 px-3 mb-3 rounded-3">
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-clock me-2"></i>
                                        <span>Interview window has expired</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Button */}
                                  <button 
                                    className={`btn w-100 py-3 rounded-3 fw-medium ${
                                      expired || interview.status === 'cancelled' 
                                        ? 'btn-secondary' 
                                        : isAvailable 
                                          ? 'btn-success' 
                                          : 'btn-outline-primary'
                                    }`}
                                    onClick={() => handleStartInterview(interview.id)}
                                    disabled={!isAvailable || expired || interview.status === 'cancelled'}
                                  >
                                    {interview.status === 'cancelled' ? (
                                      <>
                                        <i className="fas fa-times-circle me-2"></i>
                                        Cancelled
                                      </>
                                    ) : expired ? (
                                      <>
                                        <i className="fas fa-clock me-2"></i>
                                        Expired
                                      </>
                                    ) : isAvailable ? (
                                      <>
                                        <i className="fas fa-play-circle me-2"></i>
                                        Start Interview Now
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-clock me-2"></i>
                                        Starts at {formatReadableTime(interview.time)}
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Completed Interviews */}
                {activeTab === 'completed' && (
                  <div className="tab-content">
                    {completedInterviews.length === 0 ? (
                      <div className="empty-state text-center py-5">
                        <div className="mb-4">
                          <i className="fas fa-clipboard-check fa-5x text-muted opacity-50"></i>
                        </div>
                        <h4 className="text-muted mb-3">No Completed Interviews</h4>
                        <p className="text-muted mb-4">You haven't completed any interviews yet.</p>
                        <p className="small text-muted">Complete your scheduled interviews to see them here.</p>
                      </div>
                    ) : (
                      <div className="row g-4">
                        {completedInterviews.map(interview => (
                          <div key={interview.id} className="col-lg-6 col-xl-4">
                            <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                              <div className="card-header bg-success text-white p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h5 className="mb-0 fw-bold text-truncate" style={{maxWidth: '160px'}}>{interview.title || 'Untitled Interview'}</h5>
                                  <span className="badge bg-light text-success px-3 py-2">Completed</span>
                                </div>
                                <p className="mb-0 small opacity-75">
                                  <i className="fas fa-building me-2"></i>
                                  {interview.company || 'Company'}
                                </p>
                              </div>
                              
                              <div className="card-body p-3">
                                {/* Date */}
                                <div className="d-flex align-items-center mb-3">
                                  <i className="fas fa-calendar-check text-success me-2" style={{width: '20px'}}></i>
                                  <span>{formatShortDate(interview.date)} at {formatReadableTime(interview.time)}</span>
                                </div>
                                
                                {/* Rounds */}
                                {interview.rounds && interview.rounds.length > 0 && (
                                  <div className="mb-3">
                                    <p className="small text-muted mb-2">Completed Rounds:</p>
                                    <div className="d-flex flex-wrap gap-2">
                                      {interview.rounds.map((round, index) => {
                                        const details = getRoundDetails(round);
                                        return (
                                          <span key={index} className={`badge bg-light-${details.color} text-${details.color} d-flex align-items-center py-2 px-3 rounded-pill`}>
                                            {details.icon}
                                            {details.name}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Score and Feedback */}
                                {interview.score && (
                                  <div className="mb-3 p-3 bg-light rounded-3">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                      <span className="text-muted">Your Score</span>
                                      <span className="fw-bold fs-4 text-success">{interview.score}%</span>
                                    </div>
                                    {interview.feedback && (
                                      <div className="small text-muted">
                                        <i className="fas fa-quote-left me-1 opacity-50"></i>
                                        {interview.feedback}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* View Report Button */}
                                <button 
                                  className="btn btn-outline-primary w-100 py-3 rounded-3 fw-medium"
                                  onClick={() => handleViewReport(interview.id)}
                                >
                                  <i className="fas fa-file-alt me-2"></i>
                                  View Detailed Report
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
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

export default InterviewList;