import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/shared-styles.css';

export default function HRDashboard() {
  const stats = [
    { title: "Total Interviews", value: 15, icon: "bi-calendar-check", color: "primary" },
    { title: "Scheduled", value: 6, icon: "bi-clock", color: "info" },
    { title: "Ongoing", value: 3, icon: "bi-record-circle", color: "warning" },
    { title: "Completed", value: 6, icon: "bi-check-circle", color: "success" }
  ];

  const interviews = [
    { 
      id: 1, 
      name: "John Smith", 
      role: "Frontend Developer", 
      status: "Ongoing", 
      time: "10:00 AM - 11:00 AM",
      date: "Today"
    },
    { 
      id: 2, 
      name: "Sara Johnson", 
      role: "Backend Developer", 
      status: "Completed", 
      time: "09:00 AM - 10:00 AM",
      date: "Today"
    },
    { 
      id: 3, 
      name: "Robert Chen", 
      role: "Full Stack Developer", 
      status: "Scheduled", 
      time: "02:00 PM - 03:00 PM",
      date: "Today"
    },
    { 
      id: 4, 
      name: "Emma Wilson", 
      role: "UI/UX Designer", 
      status: "Scheduled", 
      time: "Tomorrow, 11:00 AM",
      date: "Tomorrow"
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "Ongoing": 
        return <span className="consistent-badge warning"><i className="bi bi-record-circle me-1"></i>Ongoing</span>;
      case "Completed": 
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Completed</span>;
      case "Scheduled": 
        return <span className="consistent-badge info"><i className="bi bi-clock me-1"></i>Scheduled</span>;
      default: 
        return <span className="consistent-badge secondary">{status}</span>;
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
            <div className="consistent-card p-4">
        <div className="consistent-header px-0">
          <h1>
            <i className="bi bi-speedometer2 me-2" style={{ color: '#4f46e5' }}></i>
            HR Dashboard
          </h1>
          <p>Monitor and manage all interview activities</p>
        </div>
      </div>

      {/* Stats Cards - Consistent spacing */}
      <div className="row g-4 mb-4 mt-2">
        {stats.map((stat, i) => (
          <div className="col-md-3" key={i}>
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

      {/* Interview Table */}
      <div className="consistent-table-container">
        <div className="consistent-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-task me-2" style={{ color: '#4f46e5' }}></i>
            Interview List
          </h5>
          <div className="d-flex gap-2">
            <button className="consistent-btn consistent-btn-outline">
              <i className="bi bi-filter me-1"></i>
              Filter
            </button>
            <button className="consistent-btn consistent-btn-outline">
              <i className="bi bi-download me-1"></i>
              Export
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="consistent-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Schedule</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => (
                <tr key={interview.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-light p-2 me-3" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-person" style={{ color: '#4f46e5' }}></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{interview.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium">{interview.role}</div>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{interview.time}</div>
                      <small style={{ color: '#64748b' }}>{interview.date}</small>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(interview.status)}
                  </td>
                  <td className="text-center">
                    {interview.status === "Ongoing" ? (
                      <Link 
                        to={`/hr/monitor/${interview.id}`}
                        className="consistent-btn consistent-btn-outline"
                        style={{ background: '#fff3e0', borderColor: '#ffb74d', color: '#f57c00' }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Monitor
                      </Link>
                    ) : interview.status === "Completed" ? (
                      <Link 
                        to="/hr/reports"
                        className="consistent-btn consistent-btn-outline"
                        style={{ background: '#e8f5e9', borderColor: '#81c784', color: '#2e7d32' }}
                      >
                        <i className="bi bi-file-text me-1"></i>
                        View Report
                      </Link>
                    ) : (
                      <button className="consistent-btn consistent-btn-outline">
                        <i className="bi bi-info-circle me-1"></i>
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ backgroundColor: '#f8fafc' }}>
          <small style={{ color: '#64748b' }}>
            Showing {interviews.length} interviews
          </small>
          <div className="d-flex gap-2">
            <button className="consistent-page-item">
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="consistent-page-item active">1</button>
            <button className="consistent-page-item">2</button>
            <button className="consistent-page-item">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mt-4 g-4">
        <div className="col-md-6">
          <div className="consistent-table-container">
            <div className="consistent-header">
              <h6 className="mb-0">
                <i className="bi bi-graph-up me-2" style={{ color: '#4f46e5' }}></i>
                Today's Summary
              </h6>
            </div>
            <div className="p-4">
              <div className="row text-center">
                <div className="col-4">
                  <h3 className="fw-bold" style={{ color: '#4f46e5' }}>2</h3>
                  <small style={{ color: '#64748b' }}>Today's Interviews</small>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold" style={{ color: '#f57c00' }}>1</h3>
                  <small style={{ color: '#64748b' }}>Active Now</small>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold" style={{ color: '#2e7d32' }}>1</h3>
                  <small style={{ color: '#64748b' }}>Completed Today</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="consistent-table-container">
            <div className="consistent-header">
              <h6 className="mb-0">
                <i className="bi bi-lightning me-2" style={{ color: '#4f46e5' }}></i>
                Quick Actions
              </h6>
            </div>
            <div className="p-4">
              <div className="d-flex gap-3">
                <button className="consistent-btn consistent-btn-primary flex-grow-1">
                  <i className="bi bi-plus-circle me-2"></i>
                  Schedule Interview
                </button>
                <button className="consistent-btn consistent-btn-outline flex-grow-1">
                  <i className="bi bi-calendar-week me-2"></i>
                  View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}