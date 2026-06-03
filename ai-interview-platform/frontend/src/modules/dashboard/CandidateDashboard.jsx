import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const navigate = useNavigate();
    // 🔴 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.clear();   // token / user data clear
    navigate("/");          // home page
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completed: 0,
    upcoming: 0,
    ongoing: 0,
    successRate: 0
  });

  const [interviews, setInterviews] = useState([
    { 
      id: 1, 
      company: "TechCorp Inc.", 
      role: "Senior Frontend Developer",
      date: "2026-01-25T14:00:00", 
      duration: 60,
      status: "Scheduled",
      difficulty: "Advanced",
      interviewer: "Sarah Johnson",
      platform: "Zoom",
      meetingLink: "https://zoom.us/j/123456789",
      preparationTips: [
        "Review React Hooks and Performance Optimization",
        "Practice System Design Questions",
        "Prepare questions about team culture"
      ],
      companyLogo: "https://api.dicebear.com/7.x/initials/svg?seed=TechCorp",
      feedback: null,
      rating: null
    },
    { 
      id: 2, 
      company: "AI Solutions LLC", 
      role: "ML Engineer",
      date: "2026-01-25T10:00:00", 
      duration: 90,
      status: "Ongoing",
      difficulty: "Intermediate",
      interviewer: "Michael Chen",
      platform: "Google Meet",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      preparationTips: [
        "Brush up on ML algorithms",
        "Review Python data structures",
        "Prepare portfolio projects discussion"
      ],
      companyLogo: "https://api.dicebear.com/7.x/initials/svg?seed=AI+Solutions",
      feedback: null,
      rating: null
    },
    { 
      id: 3, 
      company: "NextGen AI", 
      role: "Full Stack Developer",
      date: "2026-01-24T12:00:00", 
      duration: 75,
      status: "Completed",
      difficulty: "Expert",
      interviewer: "David Wilson",
      platform: "Microsoft Teams",
      meetingLink: "https://teams.microsoft.com/l/meetup-join",
      preparationTips: [
        "Practice coding challenges",
        "Review system architecture",
        "Prepare behavioral questions"
      ],
      companyLogo: "https://api.dicebear.com/7.x/initials/svg?seed=NextGen",
      feedback: "Excellent problem-solving skills",
      rating: 4.5
    }
  ]);

  useEffect(() => {
    // Calculate statistics
    const total = interviews.length;
    const completed = interviews.filter(i => i.status === "Completed").length;
    const upcoming = interviews.filter(i => i.status === "Scheduled").length;
    const ongoing = interviews.filter(i => i.status === "Ongoing").length;
    const successRate = completed > 0 ? Math.round((interviews.filter(i => i.rating >= 4).length / completed) * 100) : 0;

    setStats({
      totalInterviews: total,
      completed,
      upcoming,
      ongoing,
      successRate
    });

    // Generate notifications
    const now = new Date();
    const upcomingInterviews = interviews.filter(i => 
      i.status === "Scheduled" && 
      new Date(i.date) > now &&
      new Date(i.date) - now < 24 * 60 * 60 * 1000
    );

    const newNotifications = upcomingInterviews.map(interview => ({
      id: interview.id,
      message: `Upcoming interview with ${interview.company} in ${countdown(interview.date)}`,
      type: "reminder",
      time: new Date().toISOString()
    }));

    setNotifications(newNotifications);

    // Real-time status updates
    const interval = setInterval(() => {
      const now = new Date();
      setInterviews(prev => prev.map(i => {
        const interviewTime = new Date(i.date);
        const endTime = new Date(interviewTime.getTime() + i.duration * 60000);
        
        if (i.status === "Scheduled" && interviewTime <= now) {
          return { ...i, status: "Ongoing" };
        }
        if (i.status === "Ongoing" && endTime <= now) {
          return { ...i, status: "Completed" };
        }
        return i;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [interviews.length]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const matchesSearch = 
        interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        statusFilter === "all" || 
        interview.status === statusFilter;

      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [interviews, searchTerm, statusFilter]);

  const countdown = (date) => {
    const diff = Math.max(0, new Date(date) - new Date());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      Scheduled: { color: "bg-info text-white", icon: "bi-clock" },
      Ongoing: { color: "bg-warning text-dark", icon: "bi-camera-video" },
      Completed: { color: "bg-success text-white", icon: "bi-check-circle" }
    };
    return config[status] || { color: "bg-secondary text-white", icon: "bi-question-circle" };
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      Beginner: "bg-success text-white",
      Intermediate: "bg-primary text-white",
      Advanced: "bg-info text-white",
      Expert: "bg-danger text-white"
    };
    return colors[difficulty] || "bg-secondary text-white";
  };

  const StatCard = ({ iconClass, label, value, colorClass }) => (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-muted small mb-1">{label}</p>
            <h3 className={`mb-0 ${colorClass}`}>{value}</h3>
          </div>
          <div className={`p-3 rounded-circle bg-${colorClass.split('-')[1]}-light`}>
            <i className={`bi ${iconClass} fs-4 ${colorClass}`}></i>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5">
          <div>
            <h1 className="display-6 fw-bold text-dark mb-2">Interview Dashboard</h1>
            <p className="text-muted">Track and manage your upcoming interviews</p>
          </div>
          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
            <button className="btn btn-outline-secondary position-relative">
              <i className="bi bi-bell"></i>
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">New alerts</span>
                </span>
              )}
            </button>
            <div className="d-flex align-items-center gap-3 bg-white px-4 py-2 rounded shadow-sm border">
              <div className="bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <span className="text-white fw-bold">JD</span>
              </div>
              <div>
                <p className="fw-semibold mb-0">John Doe</p>
                <small className="text-muted">Candidate</small>
              </div>
              <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
              >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>

            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg">
            <StatCard
              iconClass="bi-people"
              label="Total Interviews"
              value={stats.totalInterviews}
              colorClass="text-dark"
            />
          </div>
          <div className="col-md-6 col-lg">
            <StatCard
              iconClass="bi-calendar-check"
              label="Upcoming"
              value={stats.upcoming}
              colorClass="text-success"
            />
          </div>
          <div className="col-md-6 col-lg">
            <StatCard
              iconClass="bi-camera-video"
              label="Ongoing"
              value={stats.ongoing}
              colorClass="text-warning"
            />
          </div>
          <div className="col-md-6 col-lg">
            <StatCard
              iconClass="bi-check-circle"
              label="Completed"
              value={stats.completed}
              colorClass="text-primary"
            />
          </div>
          <div className="col-md-6 col-lg">
            <StatCard
              iconClass="bi-graph-up"
              label="Success Rate"
              value={`${stats.successRate}%`}
              colorClass="text-info"
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by company or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button className="btn btn-primary d-flex align-items-center gap-2">
                    <i className="bi bi-funnel"></i>
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interviews Grid */}
        <div className="row g-4">
          {filteredInterviews.map((interview) => {
            const statusConfig = getStatusBadge(interview.status);
            
            return (
              <div className="col-lg-6" key={interview.id}>
                <div className="card border-0 shadow-sm h-100 hover-shadow transition-all">
                  <div className="card-body p-4">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={interview.companyLogo}
                          alt={interview.company}
                          className="rounded-circle border"
                          style={{ width: '60px', height: '60px' }}
                        />
                        <div>
                          <h5 className="card-title fw-bold mb-1">{interview.company}</h5>
                          <p className="text-muted mb-0">{interview.role}</p>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-2 align-items-end">
                        <span className={`badge ${statusConfig.color} d-flex align-items-center gap-1`}>
                          <i className={`bi ${statusConfig.icon}`}></i>
                          {interview.status}
                        </span>
                        <span className={`badge ${getDifficultyBadge(interview.difficulty)}`}>
                          {interview.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-4 text-muted mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-calendar"></i>
                          <span>{formatDate(interview.date)}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-clock"></i>
                          <span>{interview.duration} minutes</span>
                        </div>
                      </div>

                      <div className="bg-light p-3 rounded mb-3">
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted">Interviewer</small>
                            <p className="mb-0 fw-semibold">{interview.interviewer}</p>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Platform</small>
                            <p className="mb-0 fw-semibold">{interview.platform}</p>
                          </div>
                        </div>
                      </div>

                      {interview.status === "Scheduled" && (
                        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <p className="mb-1 fw-semibold">Starts in</p>
                            <h4 className="mb-0">{countdown(interview.date)}</h4>
                          </div>
                          <a 
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                          >
                            Join <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        </div>
                      )}

                      {interview.feedback && (
                        <div className="alert alert-success mb-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <p className="fw-semibold mb-1">Feedback</p>
                              <p className="mb-0">{interview.feedback}</p>
                            </div>
                            {interview.rating && (
                              <div className="text-warning">
                                {[...Array(5)].map((_, i) => (
                                  <i 
                                    key={i}
                                    className={`bi ${i < Math.floor(interview.rating) ? 'bi-star-fill' : 'bi-star'}`}
                                  ></i>
                                ))}
                                <span className="ms-2 text-dark">{interview.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title mb-3">
                            <i className="bi bi-lightbulb me-2"></i>
                            Preparation Tips
                          </h6>
                          <ul className="list-unstyled mb-0">
                            {interview.preparationTips.slice(0, 3).map((tip, index) => (
                              <li key={index} className="mb-2 d-flex align-items-start">
                                <i className="bi bi-check-circle text-success me-2 mt-1"></i>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate(`/candidate/interview/${interview.id}`)}
                        disabled={interview.status !== "Ongoing"}
                        className={`btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${
                          interview.status === "Ongoing" 
                            ? "btn-primary" 
                            : "btn-outline-secondary"
                        }`}
                      >
                        {interview.status === "Ongoing" ? (
                          <>
                            <i className="bi bi-camera-video"></i>
                            Enter Interview Room
                          </>
                        ) : interview.status === "Scheduled" ? (
                          `Join in ${countdown(interview.date)}`
                        ) : (
                          "Interview Completed"
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/candidate/interview/${interview.id}/details`)}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredInterviews.length === 0 && (
          <div className="text-center py-5 my-5">
            <div className="display-1 text-muted mb-4">
              <i className="bi bi-calendar-x"></i>
            </div>
            <h3 className="mb-3">No interviews found</h3>
            <p className="text-muted mb-4">
              {searchTerm 
                ? `No interviews match "${searchTerm}". Try adjusting your search.`
                : "You don't have any upcoming interviews scheduled."}
            </p>
            <button 
              className="btn btn-outline-primary"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset Filters
            </button>
          </div>
        )}

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className="toast show" role="alert">
              <div className="toast-header bg-primary text-white">
                <i className="bi bi-bell me-2"></i>
                <strong className="me-auto">Upcoming Reminders</strong>
                <small>{notifications.length} active</small>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setNotifications([])}
                ></button>
              </div>
              <div className="toast-body">
                {notifications.map(notification => (
                  <div key={notification.id} className="d-flex align-items-start mb-2">
                    <i className="bi bi-circle-fill text-primary me-2 mt-1" style={{ fontSize: '8px' }}></i>
                    <small>{notification.message}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
        }
      `}</style>
    </div>
  );
}