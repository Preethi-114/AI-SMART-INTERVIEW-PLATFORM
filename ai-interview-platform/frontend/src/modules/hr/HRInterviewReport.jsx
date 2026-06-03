// src/modules/hr/HRInterviewReport.jsx
// Complete detailed report page with all sections

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrReportsApi } from '../../modules/services/api';
import '../../styles/hr-dashboard.css';

const HRInterviewReport = () => {
  const { interviewId, candidateId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionNote, setSelectionNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openMCQ, setOpenMCQ] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    loadReport();
  }, [interviewId, candidateId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await hrReportsApi.getReport(interviewId, candidateId);
      if (response.success) {
        setReport(response.data);
        setSelectedStatus(response.data.selectionStatus || 'pending');
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSelection = async () => {
    try {
      const response = await hrReportsApi.updateSelection(candidateId, selectedStatus, selectionNote);
      if (response.success) {
        alert(`Candidate ${selectedStatus === 'shortlisted' ? 'shortlisted' : selectedStatus === 'rejected' ? 'rejected' : 'marked as pending'} successfully`);
        setShowSelectionModal(false);
        loadReport();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading report...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-screen">
      <i className="bi bi-exclamation-triangle"></i>
      <p>{error}</p>
      <button onClick={loadReport}>Retry</button>
    </div>
  );
  
  if (!report) return (
    <div className="error-screen">
      <p>Report not found</p>
      <button onClick={() => navigate('/hr/reports')}>Back to Reports</button>
    </div>
  );

  const { candidate, scores, intro, mcq, coding, proctoring, timeline, selectionStatus, roundsCompleted, durationMinutes, completedAt, startedAt } = report;

  return (
    <div className="hr-report-container">
      {/* Header */}
      <div className="report-header">
        <button className="btn-back" onClick={() => navigate('/hr/reports')}>
          <i className="bi bi-arrow-left"></i> Back to Reports
        </button>
        <div className="header-info">
          <h1>{candidate?.name || 'Candidate'}</h1>
          <p>{candidate?.email} • {candidate?.position || 'Position not specified'}</p>
          <div className="meta-info">
            <span><i className="bi bi-calendar"></i> {completedAt ? new Date(completedAt).toLocaleString() : 'Not completed'}</span>
            <span><i className="bi bi-clock"></i> {durationMinutes || 0} minutes</span>
            <span><i className="bi bi-play-circle"></i> Started: {startedAt ? new Date(startedAt).toLocaleString() : '—'}</span>
          </div>
        </div>
        <div className="selection-status">
          <span className={`selection-badge ${selectionStatus}`}>
            {selectionStatus === 'shortlisted' ? '✓ Shortlisted' : 
             selectionStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
          </span>
          <button className="btn-select" onClick={() => setShowSelectionModal(true)}>
            <i className="bi bi-check2-circle"></i> Update Selection
          </button>
        </div>
      </div>

      {/* Score Summary Cards */}
      <div className="score-summary">
        <div className="overall-score-card">
          <div className="score-circle" style={{ '--score': scores?.overall || 0 }}>
            <span>{scores?.overall || 0}%</span>
          </div>
          <div className="score-label">Overall Score</div>
        </div>
        <div className="score-details-grid">
          <div className="score-detail-item">
            <div className="score-label-sm">Intro Video</div>
            <div className="score-value-sm">{scores?.intro || 0}%</div>
            <div className="progress-bar-sm"><div className="fill" style={{ width: `${scores?.intro || 0}%`, background: '#3b82f6' }}></div></div>
          </div>
          <div className="score-detail-item">
            <div className="score-label-sm">Communication</div>
            <div className="score-value-sm">{scores?.communication || 0}%</div>
            <div className="progress-bar-sm"><div className="fill" style={{ width: `${scores?.communication || 0}%`, background: '#8b5cf6' }}></div></div>
          </div>
          <div className="score-detail-item">
            <div className="score-label-sm">MCQ Assessment</div>
            <div className="score-value-sm">{scores?.mcq || 0}%</div>
            <div className="progress-bar-sm"><div className="fill" style={{ width: `${scores?.mcq || 0}%`, background: '#10b981' }}></div></div>
          </div>
          <div className="score-detail-item">
            <div className="score-label-sm">Coding Challenge</div>
            <div className="score-value-sm">{scores?.coding || 0}%</div>
            <div className="progress-bar-sm"><div className="fill" style={{ width: `${scores?.coding || 0}%`, background: '#f59e0b' }}></div></div>
          </div>
          <div className="score-detail-item">
            <div className="score-label-sm">Integrity</div>
            <div className="score-value-sm">{scores?.integrity || 0}%</div>
            <div className="progress-bar-sm"><div className="fill" style={{ width: `${scores?.integrity || 0}%`, background: '#ef4444' }}></div></div>
          </div>
        </div>
      </div>

      {/* Round Completion Status */}
      <div className="rounds-status">
        <h4>Interview Rounds</h4>
        <div className="rounds-grid">
          <div className={`round-card ${roundsCompleted?.intro ? 'completed' : 'pending'}`}>
            <i className="bi bi-camera-video"></i>
            <span>Video Introduction</span>
            <span className="status">{roundsCompleted?.intro ? '✓ Completed' : '○ Not started'}</span>
          </div>
          <div className={`round-card ${roundsCompleted?.mcq ? 'completed' : 'pending'}`}>
            <i className="bi bi-list-check"></i>
            <span>MCQ Test</span>
            <span className="status">{roundsCompleted?.mcq ? '✓ Completed' : '○ Not started'}</span>
          </div>
          <div className={`round-card ${roundsCompleted?.coding ? 'completed' : 'pending'}`}>
            <i className="bi bi-code-square"></i>
            <span>Coding Challenge</span>
            <span className="status">{roundsCompleted?.coding ? '✓ Completed' : '○ Not started'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          <i className="bi bi-grid"></i> Overview
        </button>
        <button className={activeTab === 'intro' ? 'active' : ''} onClick={() => setActiveTab('intro')}>
          <i className="bi bi-camera-video"></i> Intro Video
        </button>
        <button className={activeTab === 'mcq' ? 'active' : ''} onClick={() => setActiveTab('mcq')}>
          <i className="bi bi-list-check"></i> MCQ Q&A
        </button>
        <button className={activeTab === 'coding' ? 'active' : ''} onClick={() => setActiveTab('coding')}>
          <i className="bi bi-code-square"></i> Coding Solution
        </button>
        <button className={activeTab === 'proctoring' ? 'active' : ''} onClick={() => setActiveTab('proctoring')}>
          <i className="bi bi-shield-check"></i> Proctoring
        </button>
        <button className={activeTab === 'timeline' ? 'active' : ''} onClick={() => setActiveTab('timeline')}>
          <i className="bi bi-clock-history"></i> Timeline
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="ai-insight-card">
              <div className="ai-icon">
                <i className="bi bi-stars"></i>
              </div>
              <div className="ai-content">
                <h4>AI HR Insight</h4>
                <p>{intro?.aiAnalysis?.hrInsight || 'No AI analysis available for this candidate.'}</p>
                {intro?.aiAnalysis?.recommendation && (
                  <div className={`recommendation-tag ${intro.aiAnalysis.recommendation}`}>
                    {intro.aiAnalysis.recommendation === 'strong_hire' ? '🌟 Strong Hire' :
                     intro.aiAnalysis.recommendation === 'hire' ? '✅ Hire' :
                     intro.aiAnalysis.recommendation === 'maybe' ? '🤔 Consider' :
                     intro.aiAnalysis.recommendation === 'no_hire' ? '❌ No Hire' : '⚠️ Strong No Hire'}
                  </div>
                )}
              </div>
            </div>

            <div className="overview-grid">
              <div className="info-card">
                <h4><i className="bi bi-person-badge"></i> Candidate Information</h4>
                <div className="info-row"><span>Full Name:</span><strong>{candidate?.name}</strong></div>
                <div className="info-row"><span>Email:</span><strong>{candidate?.email}</strong></div>
                <div className="info-row"><span>Position Applied:</span><strong>{candidate?.position}</strong></div>
                <div className="info-row"><span>Interview Date:</span><strong>{completedAt ? new Date(completedAt).toLocaleDateString() : '—'}</strong></div>
                <div className="info-row"><span>Total Duration:</span><strong>{durationMinutes || 0} minutes</strong></div>
              </div>
              
              <div className="info-card">
                <h4><i className="bi bi-star-fill"></i> Key Strengths</h4>
                {intro?.aiAnalysis?.keyStrengths?.length > 0 ? (
                  <ul className="strengths-list">
                    {intro.aiAnalysis.keyStrengths.map((s, i) => (
                      <li key={i}><i className="bi bi-check-circle-fill text-success"></i> {s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No strengths identified</p>
                )}
              </div>
              
              <div className="info-card">
                <h4><i className="bi bi-exclamation-triangle"></i> Areas for Improvement</h4>
                {intro?.aiAnalysis?.areasToImprove?.length > 0 ? (
                  <ul className="improvements-list">
                    {intro.aiAnalysis.areasToImprove.map((a, i) => (
                      <li key={i}><i className="bi bi-arrow-up-short text-warning"></i> {a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No improvement areas identified</p>
                )}
              </div>
              
              <div className="info-card">
                <h4><i className="bi bi-flag"></i> Red Flags</h4>
                {intro?.aiAnalysis?.redFlags?.length > 0 ? (
                  <ul className="redflags-list">
                    {intro.aiAnalysis.redFlags.map((f, i) => (
                      <li key={i}><i className="bi bi-exclamation-diamond-fill text-danger"></i> {f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No red flags detected</p>
                )}
              </div>
            </div>

            <div className="technical-keywords">
              <h4><i className="bi bi-tags"></i> Technical Keywords Detected</h4>
              <div className="keywords-list">
                {intro?.aiAnalysis?.technicalKeywords?.length > 0 ? (
                  intro.aiAnalysis.technicalKeywords.map((kw, i) => (
                    <span key={i} className="keyword-badge">{kw}</span>
                  ))
                ) : (
                  <span className="text-muted">No technical keywords detected</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INTRO VIDEO TAB */}
        {activeTab === 'intro' && (
          <div className="intro-tab">
            <div className="video-section">
              <h4><i className="bi bi-camera-video"></i> Video Recording</h4>
              {intro?.videoUrl ? (
                <video ref={videoRef} src={intro.videoUrl} controls className="intro-video" />
              ) : (
                <div className="no-video">
                  <i className="bi bi-camera-video-off"></i>
                  <p>No video recording available</p>
                </div>
              )}
            </div>

            <div className="transcript-section">
              <h4><i className="bi bi-chat-quote"></i> Transcript</h4>
              <div className="transcript-box">
                {intro?.transcript ? `"${intro.transcript}"` : 'No transcript available'}
              </div>
            </div>

            <div className="ai-metrics-section">
              <h4><i className="bi bi-bar-chart"></i> AI Analysis Metrics</h4>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Communication</div>
                  <div className="metric-value">{intro?.aiAnalysis?.communicationScore || 0}%</div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${intro?.aiAnalysis?.communicationScore || 0}%`, background: '#3b82f6' }}></div></div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Clarity</div>
                  <div className="metric-value">{intro?.aiAnalysis?.clarityScore || 0}%</div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${intro?.aiAnalysis?.clarityScore || 0}%`, background: '#8b5cf6' }}></div></div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Confidence</div>
                  <div className="metric-value">{intro?.aiAnalysis?.confidenceScore || 0}%</div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${intro?.aiAnalysis?.confidenceScore || 0}%`, background: '#10b981' }}></div></div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Professionalism</div>
                  <div className="metric-value">{intro?.aiAnalysis?.professionalismScore || 0}%</div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${intro?.aiAnalysis?.professionalismScore || 0}%`, background: '#f59e0b' }}></div></div>
                </div>
              </div>
              
              <div className="speech-metrics">
                <div className="metric-item">
                  <span><i className="bi bi-file-text"></i> Word Count:</span>
                  <strong>{intro?.aiAnalysis?.wordCount || 0}</strong>
                </div>
                <div className="metric-item">
                  <span><i className="bi bi-speedometer2"></i> Speaking Rate:</span>
                  <strong>{intro?.aiAnalysis?.speakingRate || 0} wpm</strong>
                </div>
                <div className="metric-item">
                  <span><i className="bi bi-mic"></i> Filler Words:</span>
                  <strong>{intro?.aiAnalysis?.fillerWordCount || 0}</strong>
                </div>
                <div className="metric-item">
                  <span><i className="bi bi-hourglass-split"></i> Duration:</span>
                  <strong>{intro?.duration || 0} seconds</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MCQ TAB - Full Q&A */}
        {activeTab === 'mcq' && (
          <div className="mcq-tab">
            <div className="mcq-summary-cards">
              <div className="summary-card">
                <div className="summary-value">{mcq?.score || 0}%</div>
                <div className="summary-label">Overall Score</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">{mcq?.correct || 0}/{mcq?.total || 0}</div>
                <div className="summary-label">Correct Answers</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">{Math.floor((mcq?.timeSpent || 0) / 60)}m {(mcq?.timeSpent || 0) % 60}s</div>
                <div className="summary-label">Time Spent</div>
              </div>
            </div>

            <h4><i className="bi bi-question-circle"></i> Question & Answer Review</h4>
            <div className="questions-list">
              {(mcq?.answers || []).map((q, idx) => (
                <div key={idx} className={`question-card ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-header">
                    <div className="question-number">Q{idx + 1}</div>
                    <div className={`status-badge ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                      {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </div>
                    <div className="time-spent"><i className="bi bi-clock"></i> {q.timeSpent}s</div>
                  </div>
                  <div className="question-text">{q.questionText}</div>
                  <div className="answer-section">
                    <div className="candidate-answer">
                      <span className="label">Candidate's Answer:</span>
                      <span className={`answer ${!q.isCorrect ? 'wrong' : ''}`}>
                        {q.selectedOptionText || 'No answer selected'}
                      </span>
                    </div>
                    <div className="correct-answer">
                      <span className="label">Correct Answer:</span>
                      <span className="answer correct">{q.correctAnswer}</span>
                    </div>
                    {!q.isCorrect && q.correctAnswer && (
                      <div className="explanation">
                        <i className="bi bi-info-circle"></i>
                        The correct answer is "{q.correctAnswer}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CODING TAB */}
        {activeTab === 'coding' && (
          <div className="coding-tab">
            {(coding?.solutions || []).length === 0 ? (
              <div className="empty-coding">
                <i className="bi bi-code-slash"></i>
                <p>No coding solution submitted</p>
              </div>
            ) : (
              (coding.solutions || []).map((sol, idx) => (
                <div key={idx} className="coding-solution-card">
                  <div className="solution-header">
                    <h4><i className="bi bi-file-code"></i> {sol.challengeTitle || `Challenge ${idx + 1}`}</h4>
                    <div className="solution-metrics">
                      <span className={`score-badge ${sol.score >= 80 ? 'high' : sol.score >= 60 ? 'medium' : 'low'}`}>
                        Score: {sol.score}%
                      </span>
                      <span className="language-badge">{sol.language}</span>
                    </div>
                  </div>
                  
                  <div className="code-section">
                    <div className="section-header">Submitted Code</div>
                    <pre className="code-block"><code>{sol.code || '// No code submitted'}</code></pre>
                  </div>
                  
                  <div className="execution-section">
                    <div className="section-header">Execution Result</div>
                    <div className={`execution-status ${sol.executionResult?.success ? 'success' : 'error'}`}>
                      <i className={`bi ${sol.executionResult?.success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                      <span>{sol.executionResult?.success ? 'Execution Successful' : 'Execution Failed'}</span>
                    </div>
                    {sol.executionResult?.output && (
                      <div className="output-block">
                        <strong>Output:</strong>
                        <pre>{sol.executionResult.output}</pre>
                      </div>
                    )}
                    {sol.executionResult?.error && (
                      <div className="error-block">
                        <strong>Error:</strong>
                        <pre>{sol.executionResult.error}</pre>
                      </div>
                    )}
                  </div>
                  
                  {sol.aiAnalysis && (
                    <div className="ai-review-section">
                      <div className="section-header">
                        <i className="bi bi-stars"></i> AI Code Review
                      </div>
                      <div className="review-feedback">{sol.aiAnalysis.feedback}</div>
                      <div className="review-metrics-grid">
                        <div className="review-metric">
                          <span>Code Quality</span>
                          <div className="metric-bar"><div className="fill" style={{ width: `${sol.aiAnalysis.codeQuality || 0}%` }}></div></div>
                          <span className="value">{sol.aiAnalysis.codeQuality || 0}%</span>
                        </div>
                        <div className="review-metric">
                          <span>Readability</span>
                          <div className="metric-bar"><div className="fill" style={{ width: `${sol.aiAnalysis.readability || 0}%` }}></div></div>
                          <span className="value">{sol.aiAnalysis.readability || 0}%</span>
                        </div>
                        <div className="review-metric">
                          <span>Efficiency</span>
                          <div className="metric-bar"><div className="fill" style={{ width: `${sol.aiAnalysis.efficiency || 0}%` }}></div></div>
                          <span className="value">{sol.aiAnalysis.efficiency || 0}%</span>
                        </div>
                        <div className="review-metric">
                          <span>Correctness</span>
                          <div className="metric-bar"><div className="fill" style={{ width: `${sol.aiAnalysis.correctness || 0}%` }}></div></div>
                          <span className="value">{sol.aiAnalysis.correctness || 0}%</span>
                        </div>
                      </div>
                      <div className="complexity-info">
                        <span><i className="bi bi-speedometer2"></i> Time Complexity: <code>{sol.aiAnalysis.timeComplexity || 'O(n)'}</code></span>
                        <span><i className="bi bi-memory"></i> Space Complexity: <code>{sol.aiAnalysis.spaceComplexity || 'O(n)'}</code></span>
                      </div>
                      {sol.aiAnalysis.strengths?.length > 0 && (
                        <div className="strengths">
                          <strong>✓ Strengths:</strong>
                          <ul>{sol.aiAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                      )}
                      {sol.aiAnalysis.improvements?.length > 0 && (
                        <div className="improvements">
                          <strong>⚠️ Improvements:</strong>
                          <ul>{sol.aiAnalysis.improvements.map((imp, i) => <li key={i}>{imp}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PROCTORING TAB */}
        {activeTab === 'proctoring' && (
          <div className="proctoring-tab">
            <div className="integrity-score-card">
              <div className="integrity-circle" style={{ '--score': proctoring?.integrityScore || 100 }}>
                <span>{proctoring?.integrityScore || 100}%</span>
              </div>
              <div className="integrity-label">Integrity Score</div>
              <div className={`integrity-message ${proctoring?.integrityScore >= 80 ? 'good' : proctoring?.integrityScore >= 60 ? 'warning' : 'bad'}`}>
                {proctoring?.integrityScore >= 90 ? '✓ High integrity maintained' :
                 proctoring?.integrityScore >= 70 ? '⚠️ Minor integrity concerns' :
                 '❌ Serious integrity violations detected'}
              </div>
            </div>

            <div className="violations-summary">
              <div className="violation-stat">
                <i className="bi bi-window-stack"></i>
                <div className="stat-info">
                  <span className="stat-label">Tab Switches</span>
                  <strong className={`stat-value ${proctoring?.tabSwitches > 0 ? 'warning' : ''}`}>{proctoring?.tabSwitches || 0}</strong>
                </div>
              </div>
              <div className="violation-stat">
                <i className="bi bi-clipboard"></i>
                <div className="stat-info">
                  <span className="stat-label">Copy/Paste Events</span>
                  <strong className={`stat-value ${proctoring?.copyPasteEvents > 0 ? 'danger' : ''}`}>{proctoring?.copyPasteEvents || 0}</strong>
                </div>
              </div>
              <div className="violation-stat">
                <i className="bi bi-arrows-fullscreen"></i>
                <div className="stat-info">
                  <span className="stat-label">Screen Resizes</span>
                  <strong>{proctoring?.screenResizes || 0}</strong>
                </div>
              </div>
            </div>

            <h4><i className="bi bi-exclamation-triangle"></i> Violation Log</h4>
            {(proctoring?.violations || []).length === 0 ? (
              <div className="no-violations">
                <i className="bi bi-shield-check"></i>
                <p>No violations detected during the interview</p>
              </div>
            ) : (
              <table className="violations-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {proctoring.violations.map((v, i) => (
                    <tr key={i}>
                      <td>{new Date(v.timestamp).toLocaleTimeString()}</td>
                      <td><span className="violation-type">{v.type?.replace(/_/g, ' ')}</span></td>
                      <td>{v.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="timeline-tab">
            <div className="timeline-container">
              {(timeline || []).map((event, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{new Date(event.timestamp).toLocaleString()}</div>
                    <div className="timeline-title">{event.event?.replace(/_/g, ' ')}</div>
                    <div className="timeline-detail">{event.detail}</div>
                  </div>
                </div>
              ))}
              {(!timeline || timeline.length === 0) && (
                <div className="empty-timeline">
                  <i className="bi bi-clock-history"></i>
                  <p>No timeline events recorded</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selection Modal */}
      {showSelectionModal && (
        <div className="modal-overlay">
          <div className="selection-modal">
            <h3>Update Candidate Status</h3>
            <div className="selection-options">
              <button className={`option ${selectedStatus === 'shortlisted' ? 'active' : ''}`} onClick={() => setSelectedStatus('shortlisted')}>
                <i className="bi bi-star-fill"></i> Shortlist
              </button>
              <button className={`option ${selectedStatus === 'rejected' ? 'active' : ''}`} onClick={() => setSelectedStatus('rejected')}>
                <i className="bi bi-x-circle-fill"></i> Reject
              </button>
              <button className={`option ${selectedStatus === 'pending' ? 'active' : ''}`} onClick={() => setSelectedStatus('pending')}>
                <i className="bi bi-hourglass-split"></i> Pending
              </button>
            </div>
            <textarea 
              placeholder="Add notes (optional)" 
              value={selectionNote}
              onChange={(e) => setSelectionNote(e.target.value)}
              rows="3"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSelectionModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleUpdateSelection}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRInterviewReport;