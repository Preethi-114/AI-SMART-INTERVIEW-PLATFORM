import React, { useState } from 'react';
import '../../styles/shared-styles.css'; // Import the shared styles

export default function HRReports() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const candidates = [
    { 
      id: 1, 
      name: "John Smith", 
      position: "Frontend Developer", 
      department: "Engineering",
      mcq: { score: 8, total: 10 }, 
      coding: { score: 75, total: 100 },
      behavioral: { score: 8, total: 10 },
      status: "Completed",
      date: "2024-03-15",
      email: "john.smith@example.com",
      overall: 82,
      interviewer: "Sarah Johnson",
      nextSteps: "Offer Stage"
    },
    { 
      id: 2, 
      name: "Sara Johnson", 
      position: "Backend Developer", 
      department: "Engineering",
      mcq: { score: 6, total: 10 }, 
      coding: { score: 65, total: 100 },
      behavioral: { score: 7, total: 10 },
      status: "Completed",
      date: "2024-03-14",
      email: "sara.j@example.com",
      overall: 65,
      interviewer: "Michael Chen",
      nextSteps: "Technical Review"
    },
    { 
      id: 3, 
      name: "Robert Chen", 
      position: "Full Stack Developer", 
      department: "Engineering",
      mcq: { score: 9, total: 10 }, 
      coding: { score: 88, total: 100 },
      behavioral: { score: 9, total: 10 },
      status: "In Progress",
      date: "2024-03-16",
      email: "robert.chen@example.com",
      overall: 88,
      interviewer: "David Wilson",
      nextSteps: "Final Interview"
    },
    { 
      id: 4, 
      name: "Emma Wilson", 
      position: "UI/UX Designer", 
      department: "Design",
      mcq: { score: 7, total: 10 }, 
      coding: { score: 70, total: 100 },
      behavioral: { score: 8, total: 10 },
      status: "Completed",
      date: "2024-03-12",
      email: "emma.w@example.com",
      overall: 71,
      interviewer: "Lisa Brown",
      nextSteps: "Portfolio Review"
    },
    { 
      id: 5, 
      name: "Michael Brown", 
      position: "DevOps Engineer", 
      department: "Operations",
      mcq: { score: 10, total: 10 }, 
      coding: { score: 92, total: 100 },
      behavioral: { score: 9, total: 10 },
      status: "Completed",
      date: "2024-03-11",
      email: "michael.b@example.com",
      overall: 94,
      interviewer: "Alex Taylor",
      nextSteps: "Offer Preparation"
    },
    { 
      id: 6, 
      name: "Lisa Wang", 
      position: "Data Scientist", 
      department: "Analytics",
      mcq: { score: 5, total: 10 }, 
      coding: { score: 60, total: 100 },
      behavioral: { score: 6, total: 10 },
      status: "Not Started",
      date: "2024-03-18",
      email: "lisa.w@example.com",
      overall: 55,
      interviewer: "Mark Davis",
      nextSteps: "Assessment Pending"
    }
  ];

  const positions = [...new Set(candidates.map(c => c.position))];
  const departments = [...new Set(candidates.map(c => c.department))];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesFilter = filter === 'all' || candidate.position === filter;
    const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(search.toLowerCase()) ||
                         candidate.department.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': 
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Completed</span>;
      case 'In Progress': 
        return <span className="consistent-badge warning"><i className="bi bi-play-circle me-1"></i>In Progress</span>;
      case 'Not Started': 
        return <span className="consistent-badge secondary"><i className="bi bi-hourglass me-1"></i>Not Started</span>;
      default: 
        return <span className="consistent-badge secondary">{status}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return <span className="consistent-badge success"><i className="bi bi-star me-1"></i>{score}%</span>;
    if (score >= 60) return <span className="consistent-badge warning"><i className="bi bi-star me-1"></i>{score}%</span>;
    return <span className="consistent-badge danger"><i className="bi bi-star me-1"></i>{score}%</span>;
  };

  const getMCQBadge = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>{score}/{total}</span>;
    if (percentage >= 60) return <span className="consistent-badge warning"><i className="bi bi-exclamation-circle me-1"></i>{score}/{total}</span>;
    return <span className="consistent-badge danger"><i className="bi bi-x-circle me-1"></i>{score}/{total}</span>;
  };

  const handleExportPDF = (candidate) => {
    console.log(`Exporting PDF for ${candidate.name}`);
  };

  const handleExportCSV = (candidate) => {
    console.log(`Exporting CSV for ${candidate.name}`);
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const calculateAverage = (field) => {
    const completed = candidates.filter(c => c.status === 'Completed');
    if (completed.length === 0) return 0;
    
    const total = completed.reduce((sum, c) => sum + c[field], 0);
    return Math.round(total / completed.length);
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Candidate Details Modal */}
      {showModal && selectedCandidate && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '700px' }}>
            <div className="consistent-modal-header">
              <h5>
                <i className="bi bi-person-badge me-2" style={{ color: '#4f46e5' }}></i>
                Candidate Assessment Details
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-3 me-3" style={{ backgroundColor: '#eef2ff' }}>
                    <i className="bi bi-person fs-4" style={{ color: '#4f46e5' }}></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{selectedCandidate.name}</h4>
                    <p className="mb-0" style={{ color: '#64748b' }}>{selectedCandidate.position} • {selectedCandidate.department}</p>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="consistent-table-container">
                    <div className="consistent-header py-2">
                      <h6 className="mb-0 fw-semibold">Assessment Scores</h6>
                    </div>
                    <div className="p-3">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: '#475569' }}>MCQ Assessment</span>
                          {getMCQBadge(selectedCandidate.mcq.score, selectedCandidate.mcq.total)}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: '#475569' }}>Coding Assessment</span>
                          {getScoreBadge(selectedCandidate.coding.score)}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: '#475569' }}>Behavioral</span>
                          <span className="consistent-badge primary">{selectedCandidate.behavioral.score}/{selectedCandidate.behavioral.total}</span>
                        </div>
                        <hr className="my-3" style={{ borderColor: '#e2e8f0' }} />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold" style={{ color: '#1e293b' }}>Overall Score</span>
                          <strong className="h4" style={{ color: getScoreColor(selectedCandidate.overall) }}>
                            {selectedCandidate.overall}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="consistent-table-container">
                    <div className="consistent-header py-2">
                      <h6 className="mb-0 fw-semibold">Interview Details</h6>
                    </div>
                    <div className="p-3">
                      <div className="mb-3">
                        <small className="d-block mb-1" style={{ color: '#64748b' }}>Status</small>
                        <div className="mb-2">{getStatusBadge(selectedCandidate.status)}</div>
                      </div>
                      <div className="mb-3">
                        <small className="d-block mb-1" style={{ color: '#64748b' }}>Interview Date</small>
                        <div className="fw-medium mb-2" style={{ color: '#1e293b' }}>{selectedCandidate.date}</div>
                      </div>
                      <div className="mb-3">
                        <small className="d-block mb-1" style={{ color: '#64748b' }}>Interviewer</small>
                        <div className="fw-medium mb-2" style={{ color: '#1e293b' }}>{selectedCandidate.interviewer}</div>
                      </div>
                      <div>
                        <small className="d-block mb-1" style={{ color: '#64748b' }}>Next Steps</small>
                        <div className="fw-medium" style={{ color: '#1e293b' }}>{selectedCandidate.nextSteps}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="consistent-btn consistent-btn-primary"
                onClick={() => handleExportPDF(selectedCandidate)}
              >
                <i className="bi bi-download me-2"></i>
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="consistent-header px-0 d-flex justify-content-between align-items-center">
        <div>
          <h1>
            <i className="bi bi-clipboard-data me-2" style={{ color: '#4f46e5' }}></i>
            Candidate Assessment Reports
          </h1>
          <p>Comprehensive performance tracking and analysis dashboard</p>
        </div>
        <div className="d-flex gap-3">
          <button className="consistent-btn consistent-btn-outline">
            <i className="bi bi-calendar-week me-2"></i>
            Generate Report
          </button>
          <button className="consistent-btn consistent-btn-primary">
            <i className="bi bi-download me-2"></i>
            Export All
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-4 mb-4 mt-2">
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon primary">
              <i className="bi bi-people"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{candidates.length}</h3>
              <p>Total Candidates</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon success">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{candidates.filter(c => c.status === 'Completed').length}</h3>
              <p>Completed Assessments</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon warning">
              <i className="bi bi-graph-up"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{calculateAverage('overall')}%</h3>
              <p>Average Score</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon danger">
              <i className="bi bi-building"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{departments.length}</h3>
              <p>Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="consistent-filter-bar">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search" style={{ color: '#64748b' }}></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search candidates by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ borderColor: '#e2e8f0' }}
            >
              <option value="all">All Positions</option>
              {positions.map((position, index) => (
                <option key={index} value={position}>{position}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <div className="dropdown">
              <button 
                className="consistent-btn consistent-btn-outline w-100"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-sliders me-2"></i>
                More Filters
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">By Department</a></li>
                <li><a className="dropdown-item" href="#">By Score Range</a></li>
                <li><a className="dropdown-item" href="#">By Date Range</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="consistent-table-container">
        <div className="consistent-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2" style={{ color: '#4f46e5' }}></i>
            Assessment Results
          </h5>
          <div className="d-flex gap-2">
            <button className="consistent-btn consistent-btn-outline">
              <i className="bi bi-printer me-2"></i>
              Print
            </button>
            <button className="consistent-btn consistent-btn-outline">
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="consistent-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
                <th>MCQ</th>
                <th>Coding</th>
                <th>Overall</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="align-middle">
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#eef2ff' }}>
                        <i className="bi bi-person" style={{ color: '#4f46e5' }}></i>
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ color: '#1e293b' }}>{candidate.name}</div>
                        <small style={{ color: '#64748b' }}>{candidate.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium" style={{ color: '#334155' }}>{candidate.position}</div>
                  </td>
                  <td>
                    <span className="consistent-badge secondary">
                      {candidate.department}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(candidate.status)}
                  </td>
                  <td>
                    {getMCQBadge(candidate.mcq.score, candidate.mcq.total)}
                  </td>
                  <td>
                    {getScoreBadge(candidate.coding.score)}
                  </td>
                  <td>
                    <div className="fw-bold" style={{ 
                      color: getScoreColor(candidate.overall),
                      fontSize: '1.1rem'
                    }}>
                      {candidate.overall}%
                    </div>
                  </td>
                  <td>
                    <small style={{ color: '#64748b' }}>{candidate.date}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="consistent-btn consistent-btn-outline p-2"
                        onClick={() => handleViewDetails(candidate)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <div className="dropdown">
                        <button 
                          className="consistent-btn consistent-btn-outline p-2"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          title="More Actions"
                        >
                          <i className="bi bi-gear"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportPDF(candidate); }}>
                              <i className="bi bi-file-pdf me-2" style={{ color: '#ef4444' }}></i>
                              Export PDF Report
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportCSV(candidate); }}>
                              <i className="bi bi-file-excel me-2" style={{ color: '#10b981' }}></i>
                              Export CSV Data
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              <i className="bi bi-envelope me-2" style={{ color: '#4f46e5' }}></i>
                              Email Report
                            </a>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <a className="dropdown-item" href="#">
                              <i className="bi bi-person-plus me-2" style={{ color: '#3b82f6' }}></i>
                              Schedule Follow-up
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div>
            <small style={{ color: '#64748b' }}>
              Showing {filteredCandidates.length} of {candidates.length} records
            </small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <select className="form-select" style={{ width: 'auto', borderColor: '#e2e8f0' }}>
              <option>10 per page</option>
              <option>25 per page</option>
              <option>50 per page</option>
            </select>
            <div className="d-flex gap-2">
              <button className="consistent-page-item" disabled>
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
      </div>

      {/* Summary Statistics */}
      <div className="row mt-4 g-4">
        <div className="col-md-8">
          <div className="consistent-table-container h-100">
            <div className="consistent-header">
              <h6 className="mb-0">
                <i className="bi bi-bar-chart me-2" style={{ color: '#4f46e5' }}></i>
                Performance Summary
              </h6>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center p-3">
                    <div className="display-6 fw-bold" style={{ color: '#10b981' }}>
                      {candidates.filter(c => c.overall >= 80).length}
                    </div>
                    <div style={{ color: '#64748b' }}>Excellent (80%+)</div>
                    <span className="consistent-badge success mt-2">
                      Top Performers
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3">
                    <div className="display-6 fw-bold" style={{ color: '#f59e0b' }}>
                      {candidates.filter(c => c.overall >= 60 && c.overall < 80).length}
                    </div>
                    <div style={{ color: '#64748b' }}>Good (60-79%)</div>
                    <span className="consistent-badge warning mt-2">
                      Potential Candidates
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3">
                    <div className="display-6 fw-bold" style={{ color: '#ef4444' }}>
                      {candidates.filter(c => c.overall < 60).length}
                    </div>
                    <div style={{ color: '#64748b' }}>Needs Improvement</div>
                    <span className="consistent-badge danger mt-2">
                      Review Required
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="consistent-table-container h-100">
            <div className="consistent-header">
              <h6 className="mb-0">
                <i className="bi bi-clock-history me-2" style={{ color: '#4f46e5' }}></i>
                Recent Activity
              </h6>
            </div>
            <div className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-check-circle" style={{ color: '#10b981' }}></i>
                </div>
                <div>
                  <div className="fw-medium" style={{ color: '#1e293b' }}>3 assessments completed</div>
                  <small style={{ color: '#64748b' }}>Today, 2:30 PM</small>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#eef2ff' }}>
                  <i className="bi bi-person-plus" style={{ color: '#4f46e5' }}></i>
                </div>
                <div>
                  <div className="fw-medium" style={{ color: '#1e293b' }}>2 new candidates added</div>
                  <small style={{ color: '#64748b' }}>Yesterday</small>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#fff3e0' }}>
                  <i className="bi bi-exclamation-triangle" style={{ color: '#f59e0b' }}></i>
                </div>
                <div>
                  <div className="fw-medium" style={{ color: '#1e293b' }}>1 assessment pending review</div>
                  <small style={{ color: '#64748b' }}>2 days ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}