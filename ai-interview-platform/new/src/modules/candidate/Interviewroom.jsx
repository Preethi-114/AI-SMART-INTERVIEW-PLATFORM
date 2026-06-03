import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Interview data (in real app, this would come from API)
  const [interview, setInterview] = useState({
    id: 1,
    company: "TechCorp Inc.",
    role: "Senior Frontend Developer",
    interviewer: "Sarah Johnson",
    status: "Ongoing",
    duration: 60,
    startTime: new Date().toISOString(),
    questions: [
      {
        id: 1,
        type: "coding",
        title: "Array Manipulation",
        description: "Given an array of integers, return the maximum product of any three numbers.",
        difficulty: "Medium",
        timeLimit: 15,
        template: `function maxProductOfThree(nums) {
    // Write your solution here
}`,
        testCases: [
          { input: "[1,2,3,4]", output: "24" },
          { input: "[-10,-10,1,3,2]", output: "300" }
        ]
      },
      {
        id: 2,
        type: "theoretical",
        title: "React Hooks",
        description: "Explain the difference between useState and useReducer hooks with examples.",
        difficulty: "Easy",
        timeLimit: 10
      },
      {
        id: 3,
        type: "system-design",
        title: "URL Shortener",
        description: "Design a URL shortening service like bit.ly",
        difficulty: "Hard",
        timeLimit: 25
      }
    ]
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(interview.duration * 60);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, sender: "interviewer", text: "Hello! Welcome to the interview.", time: "10:00 AM" },
    { id: 2, sender: "interviewer", text: "Let's start with the first coding question.", time: "10:01 AM" },
    { id: 3, sender: "candidate", text: "Sure, I'm ready.", time: "10:02 AM" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(
    interview.questions[0]?.timeLimit * 60 || 0
  );

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const codeEditorRef = useRef(null);
  const intervalRef = useRef(null);
  const questionIntervalRef = useRef(null);

  // Initialize video (simulated)
  useEffect(() => {
    if (videoRef.current && videoEnabled) {
      // In real app, this would initialize camera stream
      videoRef.current.srcObject = null;
    }
  }, [videoEnabled]);

  // Timer for total interview
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining <= 0) {
      handleEndInterview();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeRemaining]);

  // Timer for current question
  useEffect(() => {
    if (isRunning && questionTimeRemaining > 0) {
      questionIntervalRef.current = setInterval(() => {
        setQuestionTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (questionTimeRemaining <= 0) {
      handleNextQuestion();
    }

    return () => clearInterval(questionIntervalRef.current);
  }, [isRunning, questionTimeRemaining]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentQuestion = interview.questions[currentQuestionIndex];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: "candidate",
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleRunCode = () => {
    // Simulate code execution
    setOutput("Running tests...\n");
    setTimeout(() => {
      setOutput(prev => prev + "✓ Test 1 passed: [1,2,3,4] -> 24\n");
      setTimeout(() => {
        setOutput(prev => prev + "✓ Test 2 passed: [-10,-10,1,3,2] -> 300\n");
        setTimeout(() => {
          setOutput(prev => prev + "\n✅ All tests passed!");
        }, 500);
      }, 500);
    }, 1000);
  };

  const handleSubmitQuestion = () => {
    alert("Question submitted successfully!");
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = interview.questions[currentQuestionIndex + 1];
      setQuestionTimeRemaining(nextQuestion.timeLimit * 60);
      setCode(nextQuestion.template || "");
      setOutput("");
    } else {
      handleEndInterview();
    }
  };

  const handleEndInterview = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(questionIntervalRef.current);
    alert("Interview completed! Thank you for participating.");
    navigate("/candidate/dashboard");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert("Recording started. The interview will be recorded for review.");
    } else {
      alert("Recording stopped.");
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const toggleScreenShare = () => {
    setScreenShare(!screenShare);
    if (!screenShare) {
      alert("Screen sharing started.");
    } else {
      alert("Screen sharing stopped.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleRunCode();
    }
  };

  return (
    <div className="container-fluid vh-100 bg-dark">
      <div className="row h-100">
        {/* Left Panel - Video & Controls */}
        <div className="col-lg-8 d-flex flex-column p-0">
          {/* Header */}
          <div className="bg-dark text-white p-3 border-bottom border-secondary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{interview.company} - {interview.role}</h4>
                <small className="text-muted">Interviewer: {interview.interviewer}</small>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-center">
                  <div className="fs-5 fw-bold text-warning">{formatTime(timeRemaining)}</div>
                  <small className="text-muted">Total Time</small>
                </div>
                <div className="text-center">
                  <div className="fs-5 fw-bold text-info">{formatTime(questionTimeRemaining)}</div>
                  <small className="text-muted">Question Time</small>
                </div>
                <button
                  onClick={handleEndInterview}
                  className="btn btn-outline-danger btn-sm"
                >
                  <i className="bi bi-telephone-x me-1"></i>
                  End Interview
                </button>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-grow-1 position-relative bg-black">
            {/* Interviewer Video (Simulated) */}
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="text-center">
                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-3 mx-auto" 
                     style={{ width: '120px', height: '120px' }}>
                  <i className="bi bi-camera-video-off fs-1"></i>
                </div>
                <h4 className="text-white">{interview.interviewer}</h4>
                <p className="text-muted">Interviewer is waiting for you to start...</p>
              </div>
            </div>

            {/* Candidate Video (Simulated) */}
            <div className="position-absolute bottom-0 end-0 m-3" style={{ width: '200px' }}>
              <div className="card bg-dark border-secondary">
                <div className="card-body p-2 text-center">
                  {videoEnabled ? (
                    <div className="bg-black rounded mb-2" style={{ height: '120px' }}>
                      <div className="h-100 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-circle fs-1 text-white"></i>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary rounded mb-2 d-flex align-items-center justify-content-center" 
                         style={{ height: '120px' }}>
                      <i className="bi bi-camera-video-off fs-1"></i>
                    </div>
                  )}
                  <small className="text-white">You</small>
                </div>
              </div>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="position-absolute top-0 start-0 m-3">
                <span className="badge bg-danger d-flex align-items-center gap-1">
                  <i className="bi bi-record-circle"></i>
                  Recording
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-dark p-3 border-top border-secondary">
            <div className="d-flex justify-content-center align-items-center gap-3">
              <button
                onClick={toggleAudio}
                className={`btn ${audioEnabled ? 'btn-primary' : 'btn-secondary'} rounded-circle`}
                style={{ width: '50px', height: '50px' }}
              >
                <i className={`bi ${audioEnabled ? 'bi-mic' : 'bi-mic-mute'} fs-5`}></i>
              </button>

              <button
                onClick={toggleVideo}
                className={`btn ${videoEnabled ? 'btn-primary' : 'btn-secondary'} rounded-circle`}
                style={{ width: '50px', height: '50px' }}
              >
                <i className={`bi ${videoEnabled ? 'bi-camera-video' : 'bi-camera-video-off'} fs-5`}></i>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`btn ${screenShare ? 'btn-warning' : 'btn-primary'} rounded-circle`}
                style={{ width: '50px', height: '50px' }}
              >
                <i className="bi bi-laptop fs-5"></i>
              </button>

              <button
                onClick={toggleRecording}
                className={`btn ${isRecording ? 'btn-danger' : 'btn-outline-danger'} rounded-circle`}
                style={{ width: '50px', height: '50px' }}
              >
                <i className="bi bi-record-circle fs-5"></i>
              </button>

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`btn ${chatOpen ? 'btn-success' : 'btn-outline-success'} rounded-circle`}
                style={{ width: '50px', height: '50px' }}
              >
                <i className="bi bi-chat-dots fs-5"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Questions & Chat */}
        <div className="col-lg-4 d-flex flex-column p-0 bg-dark">
          {/* Question Tabs */}
          <div className="bg-dark text-white p-3 border-bottom border-secondary">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Question {currentQuestionIndex + 1}/{interview.questions.length}</h5>
              <span className={`badge ${
                currentQuestion.difficulty === 'Easy' ? 'bg-success' :
                currentQuestion.difficulty === 'Medium' ? 'bg-warning' :
                'bg-danger'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            <h6>{currentQuestion.title}</h6>
            <p className="text-muted small">{currentQuestion.description}</p>
            
            {/* Question Navigation */}
            <div className="d-flex gap-2 mt-3">
              {interview.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`btn btn-sm ${
                    index === currentQuestionIndex 
                      ? 'btn-primary' 
                      : 'btn-outline-primary'
                  }`}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor or Question Area */}
          <div className="flex-grow-1 bg-dark text-white p-3 overflow-auto">
            {currentQuestion.type === "coding" ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">Code Editor (Ctrl+Enter to run)</small>
                  <button
                    onClick={handleRunCode}
                    className="btn btn-success btn-sm"
                  >
                    <i className="bi bi-play-circle me-1"></i>
                    Run Code
                  </button>
                </div>
                
                <div className="mb-3">
                  <textarea
                    ref={codeEditorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="form-control bg-dark text-white border-secondary"
                    rows={15}
                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                    placeholder="Write your code here..."
                  />
                </div>

                <div className="mb-3">
                  <h6 className="text-info">Test Cases:</h6>
                  <div className="bg-black p-3 rounded">
                    {currentQuestion.testCases.map((test, index) => (
                      <div key={index} className="mb-2">
                        <small className="text-muted">Input:</small>
                        <code className="d-block bg-dark p-1 rounded">{test.input}</code>
                        <small className="text-muted">Expected Output:</small>
                        <code className="d-block bg-dark p-1 rounded">{test.output}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h6 className="text-success">Output:</h6>
                  <pre className="bg-black text-white p-3 rounded" style={{ minHeight: '100px' }}>
                    {output || "Run your code to see output here..."}
                  </pre>
                </div>
              </>
            ) : (
              <div className="h-100 d-flex flex-column">
                <div className="mb-3">
                  <h6 className="text-warning">Answer Area:</h6>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-control bg-dark text-white border-secondary"
                    rows={10}
                    placeholder="Type your answer here..."
                  />
                </div>
                
                <div className="mt-auto">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    For theoretical questions, focus on clarity and examples. 
                    For system design, think about scalability and trade-offs.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="border-top border-secondary bg-dark" style={{ height: '300px' }}>
              <div className="d-flex flex-column h-100">
                {/* Chat Header */}
                <div className="bg-dark text-white p-2 border-bottom border-secondary d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="bi bi-chat-dots me-2"></i>
                    Chat with Interviewer
                  </h6>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 p-3 overflow-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-3 ${msg.sender === 'candidate' ? 'text-end' : ''}`}
                    >
                      <div className="d-flex align-items-start gap-2">
                        {msg.sender === 'interviewer' && (
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                               style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                            <i className="bi bi-person text-white"></i>
                          </div>
                        )}
                        <div>
                          <div className={`p-2 rounded ${msg.sender === 'candidate' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}
                               style={{ maxWidth: '80%', display: 'inline-block' }}>
                            {msg.text}
                          </div>
                          <div className="text-muted small mt-1">{msg.time}</div>
                        </div>
                        {msg.sender === 'candidate' && (
                          <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" 
                               style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                            <i className="bi bi-person text-white"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-2 border-top border-secondary">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="btn btn-primary"
                    >
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-dark p-3 border-top border-secondary">
            <div className="d-flex gap-2">
              <button
                onClick={handleSubmitQuestion}
                className="btn btn-success flex-grow-1"
              >
                <i className="bi bi-check-circle me-2"></i>
                Submit Answer
              </button>
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                disabled={currentQuestionIndex === interview.questions.length - 1}
              >
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video element (hidden) */}
      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />

      <style>{`
        .bg-dark {
          background-color: #1a1a1a !important;
        }
        .border-secondary {
          border-color: #444 !important;
        }
        .form-control:focus {
          background-color: #2d2d2d;
          border-color: #666;
          color: white;
          box-shadow: none;
        }
        .btn-outline-primary {
          border-color: #0d6efd;
          color: #0d6efd;
        }
        .btn-outline-primary:hover {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .code-editor {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #2d2d2d;
        }
        ::-webkit-scrollbar-thumb {
          background: #666;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
}