import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Alert,
  Tabs,
  Tab,
  ListGroup,
  Modal,
  Form,
  InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MonitorCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningType, setWarningType] = useState("");
  const [interviewTime, setInterviewTime] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(true);

  useEffect(() => {
    // Simulate fetching candidate data
    const mockCandidate = {
      id: id,
      name: "John Smith",
      position: "Frontend Developer",
      email: "john.smith@example.com",
      interviewer: "Sarah Johnson",
      status: "active",
      stage: "Coding Assessment",
      startTime: "10:00 AM",
      duration: "60 minutes",
      currentTime: "10:25 AM",
      score: 78,
      aiAnalysis: {
        engagement: 85,
        confidence: 72,
        focus: 90,
        stress: 25,
        positivity: 80
      },
      warnings: [
        { time: "10:05 AM", type: "multiple_tabs", message: "Candidate switched tabs" },
        { time: "10:15 AM", type: "low_engagement", message: "Low engagement detected" }
      ],
      notes: "Strong problem-solving approach, needs to work on time management",
      liveFeed: "active"
    };
    setCandidate(mockCandidate);

    // Simulate timer
    const timer = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [id]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <Badge bg="success" className="px-3 py-2">Active</Badge>;
      case 'inactive': return <Badge bg="warning" text="dark" className="px-3 py-2">Inactive</Badge>;
      case 'completed': return <Badge bg="secondary" className="px-3 py-2">Completed</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2">{status}</Badge>;
    }
  };

  const getStageBadge = (stage) => {
    const stageColors = {
      'Coding Assessment': 'bg-warning',
      'Technical Interview': 'bg-info',
      'Behavioral Round': 'bg-primary',
      'System Design': 'bg-danger',
      'HR Screening': 'bg-success'
    };
    return <Badge className={`px-3 py-2 ${stageColors[stage] || 'bg-secondary'}`}>{stage}</Badge>;
  };

  const sendWarning = (type) => {
    setWarningType(type);
    setShowWarningModal(true);
  };

  const endInterview = () => {
    if (window.confirm("Are you sure you want to end this interview?")) {
      setIsInterviewActive(false);
      // Navigate to reports page or update status
      navigate(`/hr/reports/${id}`);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  if (!candidate) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading candidate data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 className="fw-bold" style={{ color: '#2c3e50' }}>
              <i className="bi bi-eye me-3" style={{ color: '#3498db' }}></i>
              Interview Monitoring
            </h1>
            <p className="text-muted mb-0">
              Real-time monitoring for {candidate.name} - {candidate.position}
            </p>
          </div>
          <div className="d-flex gap-3">
            <Button 
              variant="outline-primary"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </Button>
            <Button 
              variant="danger"
              onClick={endInterview}
              disabled={!isInterviewActive}
            >
              <i className="bi bi-stop-circle me-2"></i>
              End Interview
            </Button>
          </div>
        </div>

        {/* Candidate Info Bar */}
        <Alert variant="info" className="d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-bold">Candidate ID:</span> {candidate.id} | 
            <span className="fw-bold ms-3">Name:</span> {candidate.name} | 
            <span className="fw-bold ms-3">Position:</span> {candidate.position} |
            <span className="fw-bold ms-3">Interviewer:</span> {candidate.interviewer}
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <i className="bi bi-clock me-1"></i>
              <span className="fw-bold">{formatTime(interviewTime)}</span>
            </div>
            {getStatusBadge(candidate.status)}
          </div>
        </Alert>
      </div>

      <Row>
        {/* Left Column - Metrics */}
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                <i className="bi bi-graph-up me-2"></i>
                AI Analysis Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Engagement Level</span>
                  <span className="fw-bold" style={{ color: getScoreColor(candidate.aiAnalysis.engagement) }}>
                    {candidate.aiAnalysis.engagement}%
                  </span>
                </div>
                <ProgressBar 
                  now={candidate.aiAnalysis.engagement} 
                  variant={candidate.aiAnalysis.engagement >= 80 ? "success" : candidate.aiAnalysis.engagement >= 60 ? "warning" : "danger"}
                  style={{ height: '10px' }}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Confidence Score</span>
                  <span className="fw-bold" style={{ color: getScoreColor(candidate.aiAnalysis.confidence) }}>
                    {candidate.aiAnalysis.confidence}%
                  </span>
                </div>
                <ProgressBar 
                  now={candidate.aiAnalysis.confidence} 
                  variant="info"
                  style={{ height: '10px' }}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Focus Level</span>
                  <span className="fw-bold" style={{ color: getScoreColor(candidate.aiAnalysis.focus) }}>
                    {candidate.aiAnalysis.focus}%
                  </span>
                </div>
                <ProgressBar 
                  now={candidate.aiAnalysis.focus} 
                  variant="primary"
                  style={{ height: '10px' }}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Stress Level</span>
                  <span className="fw-bold" style={{ color: candidate.aiAnalysis.stress > 50 ? '#dc3545' : '#28a745' }}>
                    {candidate.aiAnalysis.stress}%
                  </span>
                </div>
                <ProgressBar 
                  now={candidate.aiAnalysis.stress} 
                  variant={candidate.aiAnalysis.stress > 50 ? "danger" : "success"}
                  style={{ height: '10px' }}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Positivity Index</span>
                  <span className="fw-bold" style={{ color: getScoreColor(candidate.aiAnalysis.positivity) }}>
                    {candidate.aiAnalysis.positivity}%
                  </span>
                </div>
                <ProgressBar 
                  now={candidate.aiAnalysis.positivity} 
                  variant="success"
                  style={{ height: '10px' }}
                />
              </div>

              <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#e8f4fd' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold" style={{ color: '#2c3e50' }}>Overall Score</div>
                    <small className="text-muted">Current Assessment</small>
                  </div>
                  <div className="display-6 fw-bold" style={{ color: getScoreColor(candidate.score) }}>
                    {candidate.score}%
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Interview Details */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                <i className="bi bi-info-circle me-2"></i>
                Interview Details
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Stage</span>
                  <span>{getStageBadge(candidate.stage)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Start Time</span>
                  <span className="fw-medium">{candidate.startTime}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Duration</span>
                  <span className="fw-medium">{candidate.duration}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Current Time</span>
                  <span className="fw-medium">{candidate.currentTime}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Live Feed</span>
                  <Badge bg={candidate.liveFeed === 'active' ? 'success' : 'danger'}>
                    {candidate.liveFeed === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Candidate Email</span>
                  <span className="fw-medium">{candidate.email}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Main Monitoring */}
        <Col md={8}>
          <Tabs defaultActiveKey="video" className="mb-4">
            <Tab eventKey="video" title={
              <>
                <i className="bi bi-camera-video me-2"></i>
                Live Video
              </>
            }>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {/* Video Feed Placeholder */}
                  <div className="bg-dark" style={{ height: '400px', position: 'relative' }}>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <i className="bi bi-camera-video text-white display-1 opacity-50"></i>
                      <p className="text-white mt-3">Live Video Feed</p>
                      <Badge bg="success" className="px-3 py-2">
                        <i className="bi bi-circle-fill me-2"></i>
                        LIVE
                      </Badge>
                    </div>
                    {/* Screen indicators */}
                    <div className="position-absolute bottom-0 start-0 p-3">
                      <div className="d-flex gap-3">
                        <div className="text-white">
                          <i className="bi bi-mic-fill me-2"></i>
                          <small>Audio: Active</small>
                        </div>
                        <div className="text-white">
                          <i className="bi bi-camera-fill me-2"></i>
                          <small>Video: Active</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="screen" title={
              <>
                <i className="bi bi-display me-2"></i>
                Screen Share
              </>
            }>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {/* Screen Share Placeholder */}
                  <div className="bg-dark" style={{ height: '400px', position: 'relative' }}>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <i className="bi bi-display text-white display-1 opacity-50"></i>
                      <p className="text-white mt-3">Screen Sharing Feed</p>
                      <Badge bg={candidate.warnings.length > 0 ? 'warning' : 'success'} className="px-3 py-2">
                        {candidate.warnings.length > 0 ? 'Warnings Detected' : 'Screen Secure'}
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="code" title={
              <>
                <i className="bi bi-code-slash me-2"></i>
                Code Editor
              </>
            }>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {/* Code Editor Placeholder */}
                  <div className="bg-dark text-white p-3" style={{ height: '400px', overflow: 'auto' }}>
                    <pre className="m-0">
{`// Candidate's current code
function findLongestSubstring(str) {
    let longest = 0;
    let seen = {};
    let start = 0;

    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (seen[char]) {
            start = Math.max(start, seen[char]);
        }
        longest = Math.max(longest, i - start + 1);
        seen[char] = i + 1;
    }
    return longest;
}

// Test cases
console.log(findLongestSubstring('')); // 0
console.log(findLongestSubstring('bbbbbb')); // 1
console.log(findLongestSubstring('thisisawesome')); // 6`}
                    </pre>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          {/* Warnings & Actions */}
          <Row>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Activity Warnings
                  </h5>
                  <Badge bg="danger" pill>
                    {candidate.warnings.length}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  {candidate.warnings.length > 0 ? (
                    <ListGroup variant="flush">
                      {candidate.warnings.map((warning, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-medium">{warning.message}</div>
                            <small className="text-muted">{warning.time}</small>
                          </div>
                          <Badge bg="warning" text="dark">
                            {warning.type.replace('_', ' ')}
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                      <p className="text-muted">No warnings detected</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                    <i className="bi bi-lightning-charge me-2"></i>
                    Quick Actions
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="row g-2">
                    <Col md={6}>
                      <Button 
                        variant="outline-warning" 
                        className="w-100 mb-2"
                        onClick={() => sendWarning('tab_switch')}
                      >
                        <i className="bi bi-tab me-2"></i>
                        Tab Switch Warning
                      </Button>
                    </Col>
                    <Col md={6}>
                      <Button 
                        variant="outline-danger" 
                        className="w-100 mb-2"
                        onClick={() => sendWarning('no_face')}
                      >
                        <i className="bi bi-person-x me-2"></i>
                        Face Not Detected
                      </Button>
                    </Col>
                    <Col md={6}>
                      <Button 
                        variant="outline-info" 
                        className="w-100 mb-2"
                        onClick={() => sendWarning('low_engagement')}
                      >
                        <i className="bi bi-emoji-dizzy me-2"></i>
                        Low Engagement
                      </Button>
                    </Col>
                    <Col md={6}>
                      <Button 
                        variant="outline-secondary" 
                        className="w-100 mb-2"
                        onClick={() => setShowNotesModal(true)}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Add Notes
                      </Button>
                    </Col>
                    <Col md={12}>
                      <Button 
                        variant="outline-primary" 
                        className="w-100 mb-2"
                        onClick={() => {/* Send message logic */}}
                      >
                        <i className="bi bi-chat-left-text me-2"></i>
                        Send Message
                      </Button>
                    </Col>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notes Section */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                <i className="bi bi-sticky me-2"></i>
                Interview Notes
              </h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowNotesModal(true)}
              >
                <i className="bi bi-plus me-1"></i>
                Add Note
              </Button>
            </Card.Header>
            <Card.Body>
              {candidate.notes ? (
                <div className="p-3 bg-light rounded">
                  {candidate.notes}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-journal-text display-4 text-muted mb-3"></i>
                  <p className="text-muted">No notes added yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Interview Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Notes for {candidate.name}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your observations, feedback, or important points..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            // Save notes logic
            setShowNotesModal(false);
          }}>
            Save Notes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Send Warning
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            You are about to send a warning for: <strong>{warningType.replace('_', ' ')}</strong>
          </Alert>
          <Form.Group>
            <Form.Label>Additional Message (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Add a custom message for the candidate..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWarningModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={() => {
            // Send warning logic
            setShowWarningModal(false);
          }}>
            Send Warning
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}