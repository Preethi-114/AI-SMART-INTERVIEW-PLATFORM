import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AIInterviewReport = () => {
  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          
          {/* Header */}
          <h1 className="h3 fw-bold text-dark mb-4 pb-2 border-bottom">Candidate Assessment Details</h1>

          {/* Candidate Info */}
          <div className="mb-4">
            <h2 className="h4 fw-semibold text-dark mb-1">John Smith</h2>
            <p className="text-secondary-emphasis mb-0">
              <i className="bi bi-briefcase me-2"></i>Frontend Developer • Engineering
            </p>
          </div>

          {/* Assessment Scores Section */}
          <div className="mb-4">
            <h3 className="h6 fw-bold text-uppercase text-secondary mb-3" style={{ letterSpacing: '0.5px' }}>
              <i className="bi bi-clipboard-data me-2"></i>Assessment Scores
            </h3>

            {/* MCQ Assessment */}
            <div className="bg-light p-3 rounded-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">📋 MCQ Assessment</span>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                  Completed
                </span>
              </div>
              <div className="row g-3">
                <div className="col-auto">
                  <small className="text-secondary d-block">Score</small>
                  <span className="h5 fw-bold text-dark">8/10</span>
                </div>
                <div className="col-auto">
                  <small className="text-secondary d-block">Date</small>
                  <span className="fw-medium">2024-03-15</span>
                </div>
              </div>
            </div>

            {/* Coding Assessment */}
            <div className="bg-light p-3 rounded-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">💻 Coding Assessment</span>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  75%
                </span>
              </div>
              <div className="row g-3">
                <div className="col-auto">
                  <small className="text-secondary d-block">Interviewer</small>
                  <span className="fw-medium">Sarah Johnson</span>
                </div>
              </div>
            </div>

            {/* Behavioral */}
            <div className="bg-light p-3 rounded-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">🤝 Behavioral</span>
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
                  8/10
                </span>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-primary bg-opacity-10 p-3 rounded-3 mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold text-primary">📊 Overall Score</span>
                <span className="h4 fw-bold text-primary mb-0">82%</span>
              </div>
            </div>
          </div>

          {/* Interview Details Section */}
          <div className="mb-4">
            <h3 className="h6 fw-bold text-uppercase text-secondary mb-3" style={{ letterSpacing: '0.5px' }}>
              <i className="bi bi-calendar-check me-2"></i>Interview Details
            </h3>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-2 p-2 me-3">
                    <i className="bi bi-check-circle text-success"></i>
                  </div>
                  <div>
                    <small className="text-secondary d-block">Status</small>
                    <span className="fw-medium text-success">Completed</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-2 p-2 me-3">
                    <i className="bi bi-calendar text-primary"></i>
                  </div>
                  <div>
                    <small className="text-secondary d-block">Interview Date</small>
                    <span className="fw-medium">2024-03-15</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-2 p-2 me-3">
                    <i className="bi bi-person text-info"></i>
                  </div>
                  <div>
                    <small className="text-secondary d-block">Interviewer</small>
                    <span className="fw-medium">Sarah Johnson</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-2 p-2 me-3">
                    <i className="bi bi-arrow-right text-warning"></i>
                  </div>
                  <div>
                    <small className="text-secondary d-block">Next Steps</small>
                    <span className="fw-medium text-success">Offer Stage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
            <button className="btn btn-outline-secondary px-4 py-2 rounded-3">
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button className="btn btn-primary px-4 py-2 rounded-3">
              <i className="bi bi-download me-2"></i>Download Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIInterviewReport;