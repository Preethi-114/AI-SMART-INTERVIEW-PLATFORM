import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scheduleInterviewApi } from '../services/api';
import '../../styles/shared-styles.css';

export default function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    scheduled: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Load interviews on mount and when filters change
  useEffect(() => {
    fetchInterviews();
    fetchStats();
  }, [filters.status, filters.search, filters.page]);

  // Fetch interviews from API
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await scheduleInterviewApi.getAll({
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit
      });
      
      if (response?.success) {
        // Transform API data to match component structure
        const transformedInterviews = (response.data || []).map(interview => ({
          id: interview._id || interview.id,
          name: interview.interviewTitle || 'Interview',
          candidateName: interview.selectedCandidates?.[0]?.name || 'Multiple Candidates',
          role: interview.jobTitle || 'Position',
          status: getInterviewStatus(interview),
          time: formatInterviewTime(interview),
          date: formatInterviewDate(interview),
          candidatesCount: interview.selectedCandidates?.length || 0,
          rawStatus: interview.status,
          candidateStatuses: interview.selectedCandidates?.map(c => c.status) || []
        }));
        
        setInterviews(transformedInterviews);
        
        // Set pagination
        setPagination({
          total: response.pagination?.total || response.data?.length || 0,
          page: response.pagination?.page || filters.page,
          limit: response.pagination?.limit || filters.limit,
          pages: response.pagination?.pages || 1
        });
      } else {
        setError(response?.message || 'Failed to load interviews');
        // Fallback to empty array
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError('Failed to load interviews. Please try again.');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await scheduleInterviewApi.getStats();
      if (response?.success) {
        setStats({
          total: response.data?.interviews?.total || 0,
          ongoing: response.data?.interviews?.inProgress || 0,
          completed: response.data?.interviews?.completed || 0,
          scheduled: response.data?.interviews?.scheduled || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Helper function to determine interview status
  const getInterviewStatus = (interview) => {
    const now = new Date();
    const interviewDate = new Date(interview.interviewDate);
    const [hours, minutes] = (interview.startTime || '00:00').split(':');
    interviewDate.setHours(parseInt(hours), parseInt(minutes));
    
    if (interview.status === 'completed') return 'Completed';
    if (interview.status === 'cancelled') return 'Cancelled';
    
    if (interview.status === 'in-progress') return 'Ongoing';
    
    // Check if interview is ongoing based on time
    if (interview.status === 'scheduled') {
      const endTime = new Date(interviewDate.getTime() + (interview.totalDuration || 60) * 60000);
      
      if (now >= interviewDate && now <= endTime) {
        return 'Ongoing';
      } else if (now < interviewDate) {
        return 'Scheduled';
      } else if (now > endTime) {
        return 'Completed';
      }
    }
    
    return interview.status || 'Scheduled';
  };

  // Format interview time
  const formatInterviewTime = (interview) => {
    const startTime = interview.startTime || '00:00';
    const duration = interview.totalDuration || 60;
    
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    const startStr = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const endStr = endDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${startStr} - ${endStr}`;
  };

  // Format interview date
  const formatInterviewDate = (interview) => {
    const date = new Date(interview.interviewDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case "Ongoing": 
        return <span className="consistent-badge warning"><i className="bi bi-play-circle me-1"></i>Ongoing</span>;
      case "Completed": 
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Completed</span>;
      case "Scheduled": 
        return <span className="consistent-badge info"><i className="bi bi-calendar-check me-1"></i>Scheduled</span>;
      case "Cancelled": 
        return <span className="consistent-badge danger"><i className="bi bi-x-circle me-1"></i>Cancelled</span>;
      default: 
        return <span className="consistent-badge secondary"><i className="bi bi-question-circle me-1"></i>{status}</span>;
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await scheduleInterviewApi.export({
        status: filters.status !== 'all' ? filters.status : undefined
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interviews_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting interviews:', error);
      alert('Failed to export interviews');
    }
  };

  // Handle view details
  const handleViewDetails = (interviewId, status) => {
    if (status === 'Ongoing') {
      window.location.href = `/hr/monitor/${interviewId}`;
    } else if (status === 'Completed') {
      window.location.href = `/hr/reports/${interviewId}`;
    } else {
      window.location.href = `/hr/interviews/${interviewId}`;
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="consistent-header px-0">
        <h1>
          <i className="bi bi-calendar-check me-2" style={{ color: '#4f46e5' }}></i>
          Interview List
        </h1>
        <p>Monitor and manage all interview activities</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4 mt-2">
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon primary">
              <i className="bi bi-calendar-check"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.total}</h3>
              <p>Total Interviews</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon warning">
              <i className="bi bi-play-circle"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.ongoing}</h3>
              <p>Ongoing</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon success">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon info">
              <i className="bi bi-clock"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.scheduled}</h3>
              <p>Scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="consistent-filter-bar">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search" style={{ color: '#64748b' }}></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search interviews..."
                value={filters.search}
                onChange={handleSearch}
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>
          </div>
          <div className="col-md-5">
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className={`consistent-btn ${filters.status === 'all' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => handleStatusFilter('all')}
              >
                <i className="bi bi-list-ul me-2"></i>
                All
              </button>
              <button 
                className={`consistent-btn ${filters.status === 'scheduled' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => handleStatusFilter('scheduled')}
                style={filters.status === 'scheduled' ? {} : { borderColor: '#e2e8f0' }}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Scheduled
              </button>
              <button 
                className={`consistent-btn ${filters.status === 'in-progress' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => handleStatusFilter('in-progress')}
                style={filters.status === 'in-progress' ? {} : { borderColor: '#e2e8f0' }}
              >
                <i className="bi bi-play-circle me-2"></i>
                Ongoing
              </button>
              <button 
                className={`consistent-btn ${filters.status === 'completed' ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => handleStatusFilter('completed')}
                style={filters.status === 'completed' ? {} : { borderColor: '#e2e8f0' }}
              >
                <i className="bi bi-check-circle me-2"></i>
                Completed
              </button>
            </div>
          </div>
          <div className="col-md-2 text-end">
            <button className="consistent-btn consistent-btn-outline" onClick={handleExport}>
              <i className="bi bi-download me-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Interview Table */}
      <div className="consistent-table-container">
        <div className="consistent-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-task me-2" style={{ color: '#4f46e5' }}></i>
            Interview List
          </h5>
          <div>
            <span className="text-muted me-3">
              Total: <strong style={{ color: '#1e293b' }}>{pagination.total}</strong>
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: '#64748b' }}>Loading interviews...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="consistent-table">
              <thead>
                <tr>
                  <th>Interview</th>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <tr key={interview.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#eef2ff' }}>
                            <i className="bi bi-calendar-event" style={{ color: '#4f46e5' }}></i>
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ color: '#1e293b' }}>{interview.name}</div>
                            <small style={{ color: '#64748b' }}>
                              {interview.candidatesCount} candidate{interview.candidatesCount > 1 ? 's' : ''}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle p-2 me-2" style={{ backgroundColor: '#f1f5f9' }}>
                            <i className="bi bi-person" style={{ color: '#64748b' }}></i>
                          </div>
                          <div className="fw-medium" style={{ color: '#334155' }}>{interview.candidateName}</div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium" style={{ color: '#334155' }}>{interview.role}</div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium" style={{ color: '#334155' }}>{interview.time}</div>
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
                            style={{ background: '#fff3e0', borderColor: '#f59e0b', color: '#f59e0b' }}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Monitor
                          </Link>
                        ) : interview.status === "Completed" ? (
                          <Link 
                            to={`/hr/reports/${interview.id}`}
                            className="consistent-btn consistent-btn-outline"
                            style={{ background: '#e8f5e9', borderColor: '#10b981', color: '#10b981' }}
                          >
                            <i className="bi bi-file-text me-1"></i>
                            Report
                          </Link>
                        ) : (
                          <button 
                            className="consistent-btn consistent-btn-outline"
                            onClick={() => handleViewDetails(interview.id, interview.status)}
                          >
                            <i className="bi bi-info-circle me-1"></i>
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <i className="bi bi-calendar-x fs-1" style={{ color: '#cbd5e1' }}></i>
                      <h5 className="mt-3" style={{ color: '#64748b' }}>No interviews found</h5>
                      <p style={{ color: '#94a3b8' }}>Try adjusting your filters or create a new interview</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
            <small style={{ color: '#64748b' }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} interviews
            </small>
            <div className="d-flex gap-2">
              <button 
                className="consistent-page-item"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              
              {[...Array(pagination.pages).keys()].slice(0, 5).map((num) => (
                <button
                  key={num + 1}
                  className={`consistent-page-item ${pagination.page === num + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(num + 1)}
                >
                  {num + 1}
                </button>
              ))}
              
              {pagination.pages > 5 && (
                <>
                  <span className="consistent-page-item" style={{ opacity: 0.5, cursor: 'default' }}>...</span>
                  <button 
                    className="consistent-page-item"
                    onClick={() => handlePageChange(pagination.pages)}
                  >
                    {pagination.pages}
                  </button>
                </>
              )}
              
              <button 
                className="consistent-page-item"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}