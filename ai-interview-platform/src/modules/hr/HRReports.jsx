// src/modules/hr/HRReports.jsx
// Using the hrReportsApi from api.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrReportsApi } from '../../modules/services/api';
import '../../styles/hr-dashboard.css';

const HRReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0,
    highPerformers: 0,
    integrityFlags: 0
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(100);
  
  // Selection state
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, search, filterStatus, filterPosition, sortBy, scoreMin, scoreMax]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrReportsApi.getAllResponses({
        search,
        status: filterStatus,
        position: filterPosition,
        sortBy,
        scoreMin,
        scoreMax
      });
      
      if (response.success) {
        setReports(response.data || []);
        // Extract unique positions for filter
        const uniquePositions = [...new Set(response.data.map(r => r.position).filter(Boolean))];
        setPositions(uniquePositions);
      } else {
        throw new Error(response.message || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await hrReportsApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    if (filterPosition !== 'all') {
      filtered = filtered.filter(r => r.position === filterPosition);
    }
    
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.candidateName || '').toLowerCase().includes(term) ||
        (r.email || '').toLowerCase().includes(term) ||
        (r.position || '').toLowerCase().includes(term)
      );
    }
    
    filtered = filtered.filter(r => {
      const score = r.scores?.overall ?? 0;
      return score >= scoreMin && score <= scoreMax;
    });
    
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));
    } else if (sortBy === 'score_desc') {
      filtered.sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0));
    } else if (sortBy === 'score_asc') {
      filtered.sort((a, b) => (a.scores?.overall || 0) - (b.scores?.overall || 0));
    }
    
    setFilteredReports(filtered);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectReport = (id) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter(sid => sid !== id));
    } else {
      setSelectedReports([...selectedReports, id]);
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedReports.length) return;
    
    if (!window.confirm(`Are you sure you want to ${action} ${selectedReports.length} candidate(s)?`)) return;
    
    try {
      const response = await hrReportsApi.bulkAction(selectedReports, action);
      if (response.success) {
        alert(`${selectedReports.length} candidate(s) ${action}ed successfully`);
        loadReports();
        loadStats();
        setSelectedReports([]);
        setSelectAll(false);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      alert(`Failed to ${action}: ${err.message}`);
    }
  };

  const handleShortlist = async (id) => {
    try {
      const response = await hrReportsApi.updateSelection(id, 'shortlisted');
      if (response.success) {
        alert('Candidate shortlisted successfully');
        loadReports();
        loadStats();
      }
    } catch (err) {
      alert(`Failed to shortlist: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await hrReportsApi.updateSelection(id, 'rejected');
      if (response.success) {
        alert('Candidate rejected');
        loadReports();
        loadStats();
      }
    } catch (err) {
      alert(`Failed to reject: ${err.message}`);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await hrReportsApi.exportReports({ status: filterStatus });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-reports-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Failed to export: ${err.message}`);
    }
  };

  return (
    <div className="hr-reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Interview Reports</h1>
          <p>Review candidate assessments, view detailed reports, and manage selections</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            <i className="bi bi-download"></i> Export
          </button>
          <button className="btn-refresh" onClick={loadReports}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><i className="bi bi-people"></i></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Candidates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><i className="bi bi-check-circle"></i></div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><i className="bi bi-graph-up"></i></div>
          <div className="stat-info">
            <h3>{stats.avgScore}%</h3>
            <p>Avg Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><i className="bi bi-star-fill"></i></div>
          <div className="stat-info">
            <h3>{stats.highPerformers}</h3>
            <p>High Performers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${stats.integrityFlags > 0 ? 'danger' : 'success'}`}>
            <i className="bi bi-shield-exclamation"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.integrityFlags}</h3>
            <p>Integrity Flags</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedReports.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedReports.length} candidate(s) selected</span>
          <div className="bulk-actions">
            <button className="btn-success" onClick={() => handleBulkAction('shortlist')}>
              <i className="bi bi-star-fill"></i> Shortlist
            </button>
            <button className="btn-danger" onClick={() => handleBulkAction('reject')}>
              <i className="bi bi-x-circle"></i> Reject
            </button>
            <button className="btn-secondary" onClick={() => setSelectedReports([])}>
              <i className="bi bi-x-lg"></i> Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search by name, email, or position..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
        <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}>
          <option value="all">All Positions</option>
          {positions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="score_desc">Highest Score</option>
          <option value="score_asc">Lowest Score</option>
        </select>
        <div className="score-range">
          <input type="number" placeholder="Min" value={scoreMin} onChange={(e) => setScoreMin(+e.target.value || 0)} />
          <span>-</span>
          <input type="number" placeholder="Max" value={scoreMax} onChange={(e) => setScoreMax(+e.target.value || 100)} />
        </div>
        <button className="btn-clear" onClick={() => {
          setSearch('');
          setFilterStatus('all');
          setFilterPosition('all');
          setSortBy('newest');
          setScoreMin(0);
          setScoreMax(100);
          loadReports();
        }}>
          <i className="bi bi-x-lg"></i> Clear
        </button>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div><p>Loading reports...</p></div>
      ) : error ? (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={loadReports}>Retry</button>
        </div>
      ) : (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                <th>Candidate</th>
                <th>Position</th>
                <th>Completed</th>
                <th>Intro</th>
                <th>MCQ</th>
                <th>Coding</th>
                <th>Overall</th>
                <th>Integrity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.id} className={selectedReports.includes(report.id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                    />
                  </td>
                  <td>
                    <div className="candidate-info">
                      <div className="avatar">{report.candidateName?.charAt(0) || '?'}</div>
                      <div>
                        <div className="name">{report.candidateName}</div>
                        <div className="email">{report.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{report.position}</td>
                  <td>{report.completedAt ? new Date(report.completedAt).toLocaleDateString() : '—'}</td>
                  <td><span className={`score-badge ${getScoreClass(report.scores?.intro)}`}>{report.scores?.intro || 0}%</span></td>
                  <td><span className={`score-badge ${getScoreClass(report.scores?.mcq)}`}>{report.scores?.mcq || 0}%</span></td>
                  <td><span className={`score-badge ${getScoreClass(report.scores?.coding)}`}>{report.scores?.coding || 0}%</span></td>
                  <td><span className={`score-badge overall ${getScoreClass(report.scores?.overall)}`}>{report.scores?.overall || 0}%</span></td>
                  <td>
                    <span className={`integrity-badge ${report.proctoring?.integrityScore >= 90 ? 'high' : report.proctoring?.integrityScore >= 70 ? 'medium' : 'low'}`}>
                      {report.proctoring?.integrityScore || 100}%
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/hr/reports/${report.interviewId}/${report.candidateId}`)}
                        title="View Full Report"
                      >
                        <i className="bi bi-file-text"></i>
                      </button>
                      <button 
                        className="btn-shortlist"
                        onClick={() => handleShortlist(report.id)}
                        title="Shortlist"
                      >
                        <i className="bi bi-star"></i>
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(report.id)}
                        title="Reject"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <h3>No reports found</h3>
              <p>Try adjusting your filters or wait for candidates to complete interviews</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

export default HRReports;