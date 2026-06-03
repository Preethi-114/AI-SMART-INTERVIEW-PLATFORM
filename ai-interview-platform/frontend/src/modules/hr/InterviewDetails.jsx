import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scheduleInterviewApi } from '../services/api';
import '../../styles/shared-styles.css'; // Import the shared styles

export default function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Candidate status update
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState('');
  const [candidateFeedback, setCandidateFeedback] = useState('');
  const [updatingCandidate, setUpdatingCandidate] = useState(false);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await scheduleInterviewApi.getById(id);
      
      if (response?.success) {
        setInterview(response.data);
        setEditData(response.data);
      } else {
        setError(response?.message || 'Failed to load interview details');
      }
    } catch (error) {
      console.error('Error fetching interview:', error);
      setError('An error occurred while loading interview details');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(interview);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoundSettingChange = (round, field, value) => {
    setEditData(prev => ({
      ...prev,
      roundSettings: {
        ...prev.roundSettings,
        [round]: {
          ...prev.roundSettings[round],
          [field]: value
        }
      }
    }));
  };

  const handleRoundToggle = (round) => {
    setEditData(prev => {
      const rounds = prev.rounds.includes(round)
        ? prev.rounds.filter(r => r !== round)
        : [...prev.rounds, round];
      
      return {
        ...prev,
        rounds,
        roundSettings: {
          ...prev.roundSettings,
          [round]: {
            ...prev.roundSettings[round],
            enabled: !prev.rounds.includes(round)
          }
        }
      };
    });
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const response = await scheduleInterviewApi.update(id, editData);
      
      if (response?.success) {
        setInterview(response.data);
        setIsEditing(false);
        setSuccess('Interview updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response?.message || 'Failed to update interview');
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      setError('An error occurred while updating');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel interview
  const handleCancelInterview = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    try {
      setCancelling(true);
      
      const response = await scheduleInterviewApi.cancel(id, cancelReason);
      
      if (response?.success) {
        setShowCancelModal(false);
        setCancelReason('');
        await fetchInterviewDetails();
        setSuccess('Interview cancelled successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(response?.message || 'Failed to cancel interview');
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      alert('An error occurred while cancelling');
    } finally {
      setCancelling(false);
    }
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    
    try {
      setUpdatingStatus(true);
      
      const response = await scheduleInterviewApi.updateStatus(id, newStatus);
      
      if (response?.success) {
        setShowStatusModal(false);
        setNewStatus('');
        setStatusReason('');
        await fetchInterviewDetails();
        setSuccess(`Interview status updated to ${newStatus}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(response?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update candidate status
  const handleUpdateCandidateStatus = async () => {
    if (!selectedCandidate || !candidateStatus) {
      alert('Please select a status');
      return;
    }
    
    try {
      setUpdatingCandidate(true);
      
      const response = await scheduleInterviewApi.updateCandidateStatus(
        id,
        selectedCandidate._id,
        {
          status: candidateStatus,
          feedback: candidateFeedback ? { comments: candidateFeedback } : undefined
        }
      );
      
      if (response?.success) {
        setShowCandidateModal(false);
        setSelectedCandidate(null);
        setCandidateStatus('');
        setCandidateFeedback('');
        await fetchInterviewDetails();
        setSuccess('Candidate status updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(response?.message || 'Failed to update candidate status');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('An error occurred while updating candidate');
    } finally {
      setUpdatingCandidate(false);
    }
  };

  // Resend invitations
  const handleResendInvitations = async () => {
    if (!window.confirm('Resend invitations to all candidates?')) return;
    
    try {
      const response = await scheduleInterviewApi.resendInvitations(id);
      
      if (response?.success) {
        setSuccess('Invitations resent successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(response?.message || 'Failed to resend invitations');
      }
    } catch (error) {
      console.error('Error resending invitations:', error);
      alert('An error occurred while resending');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled':
        return <span className="consistent-badge info"><i className="bi bi-calendar-check me-1"></i>Scheduled</span>;
      case 'in-progress':
        return <span className="consistent-badge warning"><i className="bi bi-play-circle me-1"></i>In Progress</span>;
      case 'completed':
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Completed</span>;
      case 'cancelled':
        return <span className="consistent-badge danger"><i className="bi bi-x-circle me-1"></i>Cancelled</span>;
      default:
        return <span className="consistent-badge secondary">{status}</span>;
    }
  };

  const getCandidateStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Confirmed</span>;
      case 'completed':
        return <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Completed</span>;
      case 'cancelled':
        return <span className="consistent-badge danger"><i className="bi bi-x-circle me-1"></i>Cancelled</span>;
      case 'no-show':
        return <span className="consistent-badge warning"><i className="bi bi-exclamation-circle me-1"></i>No Show</span>;
      case 'pending':
        return <span className="consistent-badge secondary"><i className="bi bi-hourglass me-1"></i>Pending</span>;
      default:
        return <span className="consistent-badge secondary">{status}</span>;
    }
  };

  const getRoundIcon = (round) => {
    switch(round) {
      case 'intro': return 'bi-mic';
      case 'mcq': return 'bi-question-circle';
      case 'coding': return 'bi-code-slash';
      default: return 'bi-list-task';
    }
  };

  const getRoundName = (round) => {
    switch(round) {
      case 'intro': return 'Self Introduction';
      case 'mcq': return 'MCQ Test';
      case 'coding': return 'Coding Test';
      default: return round;
    }
  };

  if (loading) {
    return (
      <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: '#64748b' }}>Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview && !loading) {
    return (
      <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <i className="bi bi-exclamation-triangle fs-1" style={{ color: '#f59e0b' }}></i>
          <h3 className="mt-3" style={{ color: '#1e293b' }}>Interview Not Found</h3>
          <p className="text-muted mb-4">The interview you're looking for doesn't exist.</p>
          <button 
            className="consistent-btn consistent-btn-primary"
            onClick={() => navigate('/hr/interviews')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Interview List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Success Message */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Cancel Interview Modal */}
      {showCancelModal && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '500px' }}>
            <div className="consistent-modal-header" style={{ background: '#dc2626', color: 'white' }}>
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Cancel Interview
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowCancelModal(false)}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              <p style={{ color: '#475569' }}>Are you sure you want to cancel this interview?</p>
              <div className="consistent-form-group">
                <label className="consistent-form-label">Reason for cancellation</label>
                <textarea
                  className="consistent-form-control"
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                />
              </div>
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep It
              </button>
              <button
                type="button"
                className="consistent-btn"
                style={{ background: '#dc2626', color: 'white' }}
                onClick={handleCancelInterview}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle me-2"></i>
                    Yes, Cancel Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '500px' }}>
            <div className="consistent-modal-header" style={{ background: '#f59e0b', color: 'white' }}>
              <h5 className="mb-0">
                <i className="bi bi-arrow-repeat me-2"></i>
                Change Interview Status
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowStatusModal(false)}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              <div className="consistent-form-group">
                <label className="consistent-form-label">New Status</label>
                <select
                  className="consistent-form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="consistent-form-group">
                <label className="consistent-form-label">Reason (optional)</label>
                <textarea
                  className="consistent-form-control"
                  rows="2"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Reason for status change..."
                />
              </div>
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="consistent-btn"
                style={{ background: '#f59e0b', color: 'white' }}
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Candidate Status Modal */}
      {showCandidateModal && selectedCandidate && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '500px' }}>
            <div className="consistent-modal-header" style={{ background: '#4f46e5', color: 'white' }}>
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                Update Candidate Status
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowCandidateModal(false)}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              <h6 className="fw-semibold mb-3" style={{ color: '#1e293b' }}>{selectedCandidate.name}</h6>
              
              <div className="consistent-form-group">
                <label className="consistent-form-label">Status</label>
                <select
                  className="consistent-form-control"
                  value={candidateStatus}
                  onChange={(e) => setCandidateStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              
              <div className="consistent-form-group">
                <label className="consistent-form-label">Feedback / Notes</label>
                <textarea
                  className="consistent-form-control"
                  rows="3"
                  value={candidateFeedback}
                  onChange={(e) => setCandidateFeedback(e.target.value)}
                  placeholder="Add feedback or notes about this candidate..."
                />
              </div>
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => setShowCandidateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="consistent-btn consistent-btn-primary"
                onClick={handleUpdateCandidateStatus}
                disabled={updatingCandidate}
              >
                {updatingCandidate ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Update Candidate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button 
            className="consistent-btn consistent-btn-outline mb-3"
            onClick={() => navigate('/hr/interviews')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to List
          </button>
          <div className="consistent-header px-0">
            <h1>
              <i className="bi bi-calendar-check me-2" style={{ color: '#4f46e5' }}></i>
              Interview Details
            </h1>
            <p>ID: {interview._id} • Created by {interview.createdByName}</p>
          </div>
        </div>
        <div>
          {getStatusBadge(interview.status)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4">
        {!isEditing && interview.status !== 'cancelled' && interview.status !== 'completed' && (
          <>
            <button className="consistent-btn consistent-btn-primary" onClick={handleEdit}>
              <i className="bi bi-pencil me-2"></i>
              Edit Interview
            </button>
            <button 
              className="consistent-btn" 
              style={{ background: '#f59e0b', color: 'white' }}
              onClick={() => setShowStatusModal(true)}
            >
              <i className="bi bi-arrow-repeat me-2"></i>
              Change Status
            </button>
            <button 
              className="consistent-btn" 
              style={{ background: '#dc2626', color: 'white' }}
              onClick={() => setShowCancelModal(true)}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel Interview
            </button>
          </>
        )}
        {interview.status === 'scheduled' && (
          <button className="consistent-btn consistent-btn-outline" onClick={handleResendInvitations}>
            <i className="bi bi-envelope me-2"></i>
            Resend Invitations
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="row g-4">
        <div className="col-lg-8">
          {/* Basic Information */}
          <div className="consistent-table-container mb-4">
            <div className="consistent-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2" style={{ color: '#4f46e5' }}></i>
                Basic Information
              </h5>
            </div>
            <div className="p-4">
              {isEditing ? (
                // Edit Mode
                <div className="row g-3">
                  <div className="col-12">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Interview Title</label>
                      <input
                        type="text"
                        className="consistent-form-control"
                        name="interviewTitle"
                        value={editData.interviewTitle || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Interview Type</label>
                      <select
                        className="consistent-form-control"
                        name="interviewType"
                        value={editData.interviewType || 'individual'}
                        onChange={handleInputChange}
                      >
                        <option value="individual">Individual</option>
                        <option value="batch">Batch</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Job Title</label>
                      <input
                        type="text"
                        className="consistent-form-control"
                        name="jobTitle"
                        value={editData.jobTitle || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Department</label>
                      <input
                        type="text"
                        className="consistent-form-control"
                        name="department"
                        value={editData.department || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Timezone</label>
                      <input
                        type="text"
                        className="consistent-form-control"
                        name="timezone"
                        value={editData.timezone || 'IST'}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="row">
                  <div className="col-md-3" style={{ color: '#64748b' }}>Title:</div>
                  <div className="col-md-9 fw-semibold mb-3">{interview.interviewTitle}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>Type:</div>
                  <div className="col-md-9 text-capitalize mb-3">{interview.interviewType}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>Job Title:</div>
                  <div className="col-md-9 mb-3">{interview.jobTitle}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>Department:</div>
                  <div className="col-md-9 mb-3">{interview.department || 'Not specified'}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>Timezone:</div>
                  <div className="col-md-9 mb-3">{interview.timezone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="consistent-table-container mb-4">
            <div className="consistent-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2" style={{ color: '#4f46e5' }}></i>
                Schedule
              </h5>
            </div>
            <div className="p-4">
              {isEditing ? (
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Interview Date</label>
                      <input
                        type="date"
                        className="consistent-form-control"
                        name="interviewDate"
                        value={editData.interviewDate?.split('T')[0] || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Start Time</label>
                      <input
                        type="time"
                        className="consistent-form-control"
                        name="startTime"
                        value={editData.startTime || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-3" style={{ color: '#64748b' }}>Date:</div>
                  <div className="col-md-9 mb-3">{formatDate(interview.interviewDate)}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>Time:</div>
                  <div className="col-md-9 mb-3">{interview.startTime} {interview.timezone}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>Duration:</div>
                  <div className="col-md-9 mb-3">{interview.totalDuration} minutes</div>
                </div>
              )}
            </div>
          </div>

          {/* Interview Rounds */}
          <div className="consistent-table-container mb-4">
            <div className="consistent-header">
              <h5 className="mb-0">
                <i className="bi bi-list-task me-2" style={{ color: '#4f46e5' }}></i>
                Interview Rounds
              </h5>
            </div>
            <div className="p-4">
              {isEditing ? (
                <div>
                  <div className="consistent-form-group mb-3">
                    <label className="consistent-form-label">Select Rounds</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="roundIntro"
                          checked={editData.rounds?.includes('intro')}
                          onChange={() => handleRoundToggle('intro')}
                        />
                        <label className="form-check-label" htmlFor="roundIntro">
                          Self Introduction
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="roundMcq"
                          checked={editData.rounds?.includes('mcq')}
                          onChange={() => handleRoundToggle('mcq')}
                        />
                        <label className="form-check-label" htmlFor="roundMcq">
                          MCQ Test
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="roundCoding"
                          checked={editData.rounds?.includes('coding')}
                          onChange={() => handleRoundToggle('coding')}
                        />
                        <label className="form-check-label" htmlFor="roundCoding">
                          Coding Test
                        </label>
                      </div>
                    </div>
                  </div>

                  {editData.rounds?.includes('intro') && (
                    <div className="border rounded p-3 mb-3" style={{ borderColor: '#e2e8f0' }}>
                      <h6 className="fw-semibold mb-3">Self Introduction Settings</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="consistent-form-group">
                            <label className="consistent-form-label">Duration (minutes)</label>
                            <input
                              type="number"
                              className="consistent-form-control"
                              value={editData.roundSettings?.intro?.duration || 5}
                              onChange={(e) => handleRoundSettingChange('intro', 'duration', parseInt(e.target.value))}
                              min="1"
                              max="30"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {editData.rounds?.includes('mcq') && (
                    <div className="border rounded p-3 mb-3" style={{ borderColor: '#e2e8f0' }}>
                      <h6 className="fw-semibold mb-3">MCQ Test Settings</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="consistent-form-group">
                            <label className="consistent-form-label">Duration (minutes)</label>
                            <input
                              type="number"
                              className="consistent-form-control"
                              value={editData.roundSettings?.mcq?.duration || 20}
                              onChange={(e) => handleRoundSettingChange('mcq', 'duration', parseInt(e.target.value))}
                              min="10"
                              max="60"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="consistent-form-group">
                            <label className="consistent-form-label">Questions</label>
                            <input
                              type="number"
                              className="consistent-form-control"
                              value={editData.roundSettings?.mcq?.questionCount || 10}
                              onChange={(e) => handleRoundSettingChange('mcq', 'questionCount', parseInt(e.target.value))}
                              min="5"
                              max="50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {editData.rounds?.includes('coding') && (
                    <div className="border rounded p-3" style={{ borderColor: '#e2e8f0' }}>
                      <h6 className="fw-semibold mb-3">Coding Test Settings</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="consistent-form-group">
                            <label className="consistent-form-label">Duration</label>
                            <input
                              type="number"
                              className="consistent-form-control"
                              value={editData.roundSettings?.coding?.duration || 45}
                              onChange={(e) => handleRoundSettingChange('coding', 'duration', parseInt(e.target.value))}
                              min="15"
                              max="120"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="consistent-form-group">
                            <label className="consistent-form-label">Language</label>
                            <select
                              className="consistent-form-control"
                              value={editData.roundSettings?.coding?.language || 'javascript'}
                              onChange={(e) => handleRoundSettingChange('coding', 'language', e.target.value)}
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="consistent-form-group">
                            <label className="consistent-form-label">Difficulty</label>
                            <select
                              className="consistent-form-control"
                              value={editData.roundSettings?.coding?.difficulty || 'medium'}
                              onChange={(e) => handleRoundSettingChange('coding', 'difficulty', e.target.value)}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-3">
                  {interview.rounds?.map(round => (
                    <div key={round} className="consistent-badge info p-3">
                      <i className={`bi ${getRoundIcon(round)} me-2`}></i>
                      {getRoundName(round)}
                      {' '}({interview.roundSettings?.[round]?.duration} min)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Candidates List */}
          <div className="consistent-table-container mb-4">
            <div className="consistent-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-people me-2" style={{ color: '#4f46e5' }}></i>
                Candidates ({interview.selectedCandidates?.length || 0})
              </h5>
            </div>
            <div className="table-responsive">
              <table className="consistent-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interview.selectedCandidates?.map(candidate => (
                    <tr key={candidate._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light p-2 me-3" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-person" style={{ color: '#4f46e5' }}></i>
                          </div>
                          <div className="fw-semibold">{candidate.name}</div>
                        </div>
                      </td>
                      <td>{candidate.email}</td>
                      <td>
                        <span className={`consistent-badge ${candidate.type === 'student' ? 'info' : 'primary'}`}>
                          {candidate.type}
                        </span>
                      </td>
                      <td>
                        {getCandidateStatusBadge(candidate.status)}
                      </td>
                      <td className="text-center">
                        {interview.status !== 'cancelled' && interview.status !== 'completed' && (
                          <button
                            className="consistent-btn consistent-btn-outline p-2"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setCandidateStatus(candidate.status);
                              setCandidateFeedback(candidate.feedback?.comments || '');
                              setShowCandidateModal(true);
                            }}
                            title="Update Status"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        {candidate.feedback?.rating && (
                          <span className="ms-2" style={{ color: '#f59e0b' }}>
                            {'★'.repeat(candidate.feedback.rating)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Communication Settings */}
          <div className="consistent-table-container mb-4">
            <div className="consistent-header">
              <h5 className="mb-0">
                <i className="bi bi-envelope me-2" style={{ color: '#4f46e5' }}></i>
                Communication
              </h5>
            </div>
            <div className="p-4">
              {isEditing ? (
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="sendEmail"
                        name="sendEmail"
                        checked={editData.sendEmail}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="sendEmail">
                        Send Email Invitations
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="sendSMS"
                        name="sendSMS"
                        checked={editData.sendSMS}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="sendSMS">
                        Send SMS Notifications
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">Custom Message</label>
                      <textarea
                        className="consistent-form-control"
                        rows="3"
                        name="customMessage"
                        value={editData.customMessage || ''}
                        onChange={handleInputChange}
                        placeholder="Add instructions for candidates..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-3" style={{ color: '#64748b' }}>Email:</div>
                  <div className="col-md-9 mb-3">{interview.sendEmail ? 'Yes' : 'No'}</div>
                  
                  <div className="col-md-3" style={{ color: '#64748b' }}>SMS:</div>
                  <div className="col-md-9 mb-3">{interview.sendSMS ? 'Yes' : 'No'}</div>
                  
                  {interview.customMessage && (
                    <>
                      <div className="col-md-3" style={{ color: '#64748b' }}>Message:</div>
                      <div className="col-md-9 mb-3">
                        <div className="bg-light p-3 rounded">
                          {interview.customMessage}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons for Edit Mode */}
          {isEditing && (
            <div className="d-flex gap-2 mb-4">
              <button
                className="consistent-btn consistent-btn-primary"
                onClick={handleSaveChanges}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Changes
                  </>
                )}
              </button>
              <button
                className="consistent-btn consistent-btn-outline"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* Summary Card */}
          <div className="consistent-table-container mb-4">
            <div className="consistent-header">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2" style={{ color: '#4f46e5' }}></i>
                Summary
              </h5>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <small className="d-block mb-1" style={{ color: '#64748b' }}>Total Candidates</small>
                <h3 style={{ color: '#1e293b' }}>{interview.results?.totalCandidates || 0}</h3>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: '#475569' }}>Confirmed</span>
                  <span className="fw-bold">{interview.results?.confirmed || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px', backgroundColor: '#e2e8f0' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${((interview.results?.confirmed || 0) / (interview.results?.totalCandidates || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: '#475569' }}>Completed</span>
                  <span className="fw-bold">{interview.results?.completed || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px', backgroundColor: '#e2e8f0' }}>
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${((interview.results?.completed || 0) / (interview.results?.totalCandidates || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: '#475569' }}>Cancelled</span>
                  <span className="fw-bold">{interview.results?.cancelled || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px', backgroundColor: '#e2e8f0' }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{ width: `${((interview.results?.cancelled || 0) / (interview.results?.totalCandidates || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {interview.results?.averageScore > 0 && (
                <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
                  <small className="d-block mb-1" style={{ color: '#64748b' }}>Average Score</small>
                  <h2 style={{ color: '#4f46e5' }}>{interview.results.averageScore}%</h2>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="consistent-table-container">
            <div className="consistent-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2" style={{ color: '#4f46e5' }}></i>
                Metadata
              </h5>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <small className="d-block mb-1" style={{ color: '#64748b' }}>Created By</small>
                <strong style={{ color: '#1e293b' }}>{interview.createdByName}</strong>
              </div>
              <div className="mb-3">
                <small className="d-block mb-1" style={{ color: '#64748b' }}>Created At</small>
                <strong style={{ color: '#1e293b' }}>{formatDate(interview.createdAt)}</strong>
              </div>
              <div className="mb-3">
                <small className="d-block mb-1" style={{ color: '#64748b' }}>Last Updated</small>
                <strong style={{ color: '#1e293b' }}>{formatDate(interview.updatedAt)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}