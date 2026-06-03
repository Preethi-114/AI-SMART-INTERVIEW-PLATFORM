// src/modules/hr/ManageCandidates.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import '../../styles/shared-styles.css'; // Import shared styles

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "Pending", position: "Frontend Developer", interviewDate: "2024-03-15" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", status: "Selected", position: "Backend Developer", interviewDate: "2024-03-14" },
    { id: 3, name: "Charlie Davis", email: "charlie@example.com", status: "Rejected", position: "Full Stack Developer", interviewDate: "2024-03-13" },
    { id: 4, name: "David Wilson", email: "david@example.com", status: "Pending", position: "DevOps Engineer", interviewDate: "2024-03-16" },
    { id: 5, name: "Emma Brown", email: "emma@example.com", status: "Selected", position: "UI/UX Designer", interviewDate: "2024-03-12" },
    { id: 6, name: "Frank Miller", email: "frank@example.com", status: "Rejected", position: "Data Scientist", interviewDate: "2024-03-11" },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleStatus = (id) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                c.status === "Selected"
                  ? "Pending"
                  : "Selected",
            }
          : c
      )
    );
  };

  const setStatus = (id, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus }
          : c
      )
    );
  };

  const deleteCandidate = (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      setCandidates(prev => prev.filter(c => c.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Selected":
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Selected</span>;
      case "Rejected":
        return <span className="consistent-badge danger"><i className="bi bi-x-circle me-1"></i>Rejected</span>;
      case "Pending":
        return <span className="consistent-badge warning"><i className="bi bi-clock me-1"></i>Pending</span>;
      default:
        return <span className="consistent-badge secondary"><i className="bi bi-question-circle me-1"></i>{status}</span>;
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStatus = filterStatus === "all" || candidate.status === filterStatus;
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: candidates.length,
    selected: candidates.filter(c => c.status === "Selected").length,
    rejected: candidates.filter(c => c.status === "Rejected").length,
    pending: candidates.filter(c => c.status === "Pending").length
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="consistent-card p-4">
  <div className="consistent-header px-0 d-flex justify-content-between align-items-center">
    <div>
      <h1>
        <i className="bi bi-people me-2" style={{ color: '#4f46e5' }}></i>
        Completed Candidates
      </h1>
      <p>Manage and track candidate status after interviews</p>
    </div>
  </div>
</div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4 mt-2">
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon primary">
              <i className="bi bi-people"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.total}</h3>
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
              <h3>{stats.selected}</h3>
              <p>Selected</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon danger">
              <i className="bi bi-x-circle"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon warning">
              <i className="bi bi-clock"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
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
                placeholder="Search candidates by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              <button 
                className={`consistent-btn ${filterStatus === "all" ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => setFilterStatus("all")}
              >
                <i className="bi bi-list-ul me-2"></i>
                All
              </button>
              <button 
                className={`consistent-btn ${filterStatus === "Selected" ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => setFilterStatus("Selected")}
                style={filterStatus === "Selected" ? {} : { borderColor: '#e2e8f0' }}
              >
                <i className="bi bi-check-circle me-2"></i>
                Selected
              </button>
              <button 
                className={`consistent-btn ${filterStatus === "Rejected" ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => setFilterStatus("Rejected")}
                style={filterStatus === "Rejected" ? {} : { borderColor: '#e2e8f0' }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Rejected
              </button>
              <button 
                className={`consistent-btn ${filterStatus === "Pending" ? 'consistent-btn-primary' : 'consistent-btn-outline'}`}
                onClick={() => setFilterStatus("Pending")}
                style={filterStatus === "Pending" ? {} : { borderColor: '#e2e8f0' }}
              >
                <i className="bi bi-clock me-2"></i>
                Pending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="consistent-table-container">
        <div className="consistent-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2" style={{ color: '#4f46e5' }}></i>
            Candidate List ({filteredCandidates.length} candidates)
          </h5>
        </div>
        
        <div className="table-responsive">
          <table className="consistent-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Candidate</th>
                <th>Position</th>
                <th>Status</th>
                <th>Interview Date</th>
                <th>Reports</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate, index) => (
                <tr key={candidate.id}>
                  <td>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#eef2ff',
                          color: '#4f46e5'
                        }}
                      >
                        <i className="bi bi-person"></i>
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ color: '#1e293b' }}>{candidate.name}</div>
                        <small style={{ color: '#64748b' }}>{candidate.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#334155' }}>{candidate.position}</div>
                  </td>
                  <td>
                    {getStatusBadge(candidate.status)}
                  </td>
                  <td>
                    <div style={{ color: '#64748b' }}>{candidate.interviewDate}</div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/candidate/report/${candidate.id}`}
                        className="consistent-btn consistent-btn-outline"
                        style={{ background: '#eef2ff', borderColor: '#4f46e5', color: '#4f46e5' }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Report
                      </Link>
                      <div className="dropdown">
                        <button 
                          className="consistent-btn consistent-btn-outline p-2"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          title="Export Options"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>
                              <i className="bi bi-file-pdf me-2" style={{ color: '#ef4444' }}></i>
                              Export PDF
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>
                              <i className="bi bi-file-excel me-2" style={{ color: '#10b981' }}></i>
                              Export CSV
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="consistent-btn consistent-btn-outline"
                        onClick={() => toggleStatus(candidate.id)}
                        style={candidate.status === "Selected" ? 
                          { background: '#fff3e0', borderColor: '#f59e0b', color: '#f59e0b' } : 
                          { background: '#e8f5e9', borderColor: '#10b981', color: '#10b981' }}
                      >
                        {candidate.status === "Selected"
                          ? <><i className="bi bi-x-circle me-1"></i> Unselect</>
                          : <><i className="bi bi-check-circle me-1"></i> Select</>}
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
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setStatus(candidate.id, "Selected"); }}>
                              <i className="bi bi-check-circle me-2" style={{ color: '#10b981' }}></i>
                              Mark as Selected
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setStatus(candidate.id, "Rejected"); }}>
                              <i className="bi bi-x-circle me-2" style={{ color: '#ef4444' }}></i>
                              Mark as Rejected
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setStatus(candidate.id, "Pending"); }}>
                              <i className="bi bi-clock me-2" style={{ color: '#f59e0b' }}></i>
                              Mark as Pending
                            </a>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); deleteCandidate(candidate.id); }}>
                              <i className="bi bi-trash me-2" style={{ color: '#ef4444' }}></i>
                              Delete
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
          <small style={{ color: '#64748b' }}>
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </small>
          <div className="d-flex gap-2">
            <button className="consistent-btn consistent-btn-outline">
              <i className="bi bi-printer me-1"></i>
              Print
            </button>
            <button className="consistent-btn consistent-btn-primary">
              <i className="bi bi-download me-1"></i>
              Export All
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <div className="consistent-table-container mt-4">
          <div className="text-center py-5">
            <i className="bi bi-people fs-1" style={{ color: '#cbd5e1' }}></i>
            <h5 className="mt-3" style={{ color: '#64748b' }}>No candidates found</h5>
            <p style={{ color: '#94a3b8' }}>Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="consistent-table-container mt-4">
        <div className="consistent-header">
          <h6 className="mb-0">
            <i className="bi bi-pie-chart me-2" style={{ color: '#4f46e5' }}></i>
            Summary
          </h6>
        </div>
        <div className="p-4">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-2 me-3" style={{ background: '#e8f5e9' }}>
                  <i className="bi bi-check-lg" style={{ color: '#10b981' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{stats.selected} Selected</div>
                  <small style={{ color: '#64748b' }}>Ready for next steps</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-2 me-3" style={{ background: '#fff3e0' }}>
                  <i className="bi bi-clock" style={{ color: '#f59e0b' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{stats.pending} Pending</div>
                  <small style={{ color: '#64748b' }}>Awaiting decision</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-2 me-3" style={{ background: '#fee2e2' }}>
                  <i className="bi bi-x-lg" style={{ color: '#ef4444' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>{stats.rejected} Rejected</div>
                  <small style={{ color: '#64748b' }}>Not selected</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}