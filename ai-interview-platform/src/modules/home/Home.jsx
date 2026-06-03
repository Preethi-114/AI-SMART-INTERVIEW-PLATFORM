import Layout from "../layout/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");
  const [activeRole, setActiveRole] = useState("candidate");
  const [scrolled, setScrolled] = useState(false);


  // Stats data
  const stats = [
    { value: "10,000+", label: "Interviews Completed", icon: "bi-camera-video", color: "primary" },
    { value: "95%", label: "Candidate Satisfaction", icon: "bi-emoji-smile", color: "success" },
    { value: "60%", label: "Faster Hiring", icon: "bi-lightning", color: "warning" },
    { value: "500+", label: "Companies", icon: "bi-building", color: "info" }
  ];

  // Role features
  const roleFeatures = {
    candidate: [
      { icon: "bi-robot", title: "AI Mock Interviews", desc: "Practice with intelligent AI feedback", color: "primary" },
      { icon: "bi-graph-up", title: "Performance Analytics", desc: "Track improvement with insights", color: "success" },
      { icon: "bi-calendar-check", title: "Smart Scheduling", desc: "Flexible interview slots", color: "warning" }
    ],
    hr: [
      { icon: "bi-search", title: "Smart Screening", desc: "AI-powered candidate matching", color: "primary" },
      { icon: "bi-bar-chart", title: "Analytics Dashboard", desc: "Comprehensive hiring metrics", color: "success" },
      { icon: "bi-people", title: "Team Collaboration", desc: "Share feedback with team", color: "warning" }
    ],
    admin: [
      { icon: "bi-shield-check", title: "Security Controls", desc: "GDPR compliant platform", color: "primary" },
      { icon: "bi-gear", title: "Platform Management", desc: "Configure system settings", color: "success" },
      { icon: "bi-graph-up-arrow", title: "Business Insights", desc: "Advanced analytics", color: "warning" }
    ]
  };

  // Platform features
  const platformFeatures = [
    {
      icon: "bi-cpu",
      title: "AI-Powered Analysis",
      description: "Real-time analysis with detailed insights",
      color: "primary"
    },
    {
      icon: "bi-eye-slash",
      title: "Bias Reduction",
      description: "Objective evaluation algorithms",
      color: "success"
    },
    {
      icon: "bi-chat-left-text",
      title: "Real-time Collaboration",
      description: "Seamless communication tools",
      color: "warning"
    },
    {
      icon: "bi-shield-check",
      title: "Enterprise Security",
      description: "Bank-level encryption & compliance",
      color: "info"
    }
  ];

  // How it works steps
  const workflowSteps = [
    { number: 1, title: "Sign Up", desc: "Register based on role", icon: "bi-person-plus" },
    { number: 2, title: "Setup", desc: "Complete profile setup", icon: "bi-person-badge" },
    { number: 3, title: "Apply/Post", desc: "Candidates apply, HR posts jobs", icon: "bi-rocket-takeoff" },
    { number: 4, title: "Interview", desc: "AI-powered test sessions", icon: "bi-camera-video" },
    { number: 5, title: "Evaluate", desc: "HR reviews & evaluates", icon: "bi-clipboard-check" },
    { number: 6, title: "Results", desc: "Get feedback & decisions", icon: "bi-award" }
  ];

  // Tech stack
  const techStack = [
    { name: "React.js", icon: "bi-code-slash", color: "primary" },
    { name: "Node.js", icon: "bi-server", color: "success" },
    { name: "MongoDB", icon: "bi-database", color: "warning" },
    { name: "Bootstrap 5", icon: "bi-layout-wtf", color: "info" },
    { name: "Express.js", icon: "bi-gear", color: "danger" },
    { name: "JWT Auth", icon: "bi-shield-lock", color: "purple" }
  ];

  return (
    <Layout>
      

      {/* Hero Section */}
      <section id="hero" className="pt-5 mt-5 bg-light position-relative overflow-hidden">
        {/* Background Elements */}
        <div className="position-absolute top-0 end-0 w-50 h-100 opacity-10">
          <div className="position-absolute top-0 end-0 w-100 h-100" style={{
            background: 'radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)'
          }}></div>
        </div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row min-vh-100 align-items-center py-5">
            
            {/* Left Content */}
            <div className="col-lg-6">
              {/* Badge */}
              <div className="mb-4">
                
              </div>

              {/* Main Heading */}
              <h1 className="display-3 fw-bold text-dark mb-4">
                Transform Hiring with <br />
                <span className="text-gradient">AI-Powered Interviews</span>
              </h1>

              {/* Description */}
              <p className="lead text-secondary mb-5">
                Complete SaaS platform connecting candidates, HR teams, and administrators. 
                Streamline hiring with intelligent automation, objective evaluations, 
                and data-driven decisions.
              </p>

              {/* Feature Highlights */}
              <div className="row g-3 mb-5">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-check-circle text-primary"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">AI-Powered Screening</h6>
                      <p className="text-muted small mb-0">Automated candidate evaluation</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-check-circle text-success"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Multi-role Platform</h6>
                      <p className="text-muted small mb-0">Separate portals for all users</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-check-circle text-warning"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Real-time Analytics</h6>
                      <p className="text-muted small mb-0">Data-driven hiring decisions</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-check-circle text-info"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Enterprise Security</h6>
                      <p className="text-muted small mb-0">GDPR compliant, encrypted</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-5">
                <button
                  onClick={() => navigate('/register')}
                  className="btn btn-primary btn-lg px-5 py-3 fw-bold"
                >
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Try Live Demo
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="btn btn-outline-primary btn-lg px-5 py-3 fw-bold"
                >
                  <i className="bi bi-info-circle me-2"></i>
                  Platform Overview
                </button>
              </div>

              {/* Quick Stats */}
              <div className="d-flex flex-wrap gap-4">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-shield-check text-primary fs-4"></i>
                  </div>
                  <div>
                    <div className="fw-bold fs-5">Enterprise Ready</div>
                    <div className="text-muted small">Production-grade platform</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-lightning text-success fs-4"></i>
                  </div>
                  <div>
                    <div className="fw-bold fs-5">Fast Setup</div>
                    <div className="text-muted small">Quick deployment</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Platform Architecture */}
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                {/* Card Header */}
                <div className="card-header bg-gradient-primary text-white py-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-diagram-3 fs-3 me-3"></i>
                    <div>
                      <h5 className="fw-bold mb-0">Platform Architecture</h5>
                      <small className="opacity-75">Three-tier user system</small>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body p-4">
                  {/* Architecture Flow */}
                  <div className="text-center mb-4">
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-4">
                      <div className="text-center mb-3 mb-md-0 mx-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-flex mb-2">
                          <i className="bi bi-person fs-2 text-primary"></i>
                        </div>
                        <div className="fw-bold">Candidate</div>
                        <small className="text-muted">Job Seeker</small>
                      </div>
                      
                      <div className="mx-3 my-3 my-md-0">
                        <i className="bi bi-arrow-right text-muted fs-4 d-none d-md-block"></i>
                        <i className="bi bi-arrow-down text-muted fs-4 d-md-none"></i>
                      </div>
                      
                      <div className="text-center mb-3 mb-md-0 mx-3">
                        <div className="bg-success bg-opacity-10 rounded-circle p-4 d-inline-flex mb-2">
                          <i className="bi bi-briefcase fs-2 text-success"></i>
                        </div>
                        <div className="fw-bold">HR Recruiter</div>
                        <small className="text-muted">Hiring Manager</small>
                      </div>
                      
                      <div className="mx-3 my-3 my-md-0">
                        <i className="bi bi-arrow-right text-muted fs-4 d-none d-md-block"></i>
                        <i className="bi bi-arrow-down text-muted fs-4 d-md-none"></i>
                      </div>
                      
                      <div className="text-center mx-3">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-4 d-inline-flex mb-2">
                          <i className="bi bi-shield-check fs-2 text-warning"></i>
                        </div>
                        <div className="fw-bold">Administrator</div>
                        <small className="text-muted">Platform Admin</small>
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="border-top pt-4">
                    <h6 className="fw-bold mb-3">Core Features</h6>
                    <div className="row g-2">
                      {[
                        "AI Interview Analysis", "Automated Screening", 
                        "Real-time Dashboard", "Role-based Access", 
                        "Analytics & Reports", "Secure & Scalable"
                      ].map((feature, idx) => (
                        <div key={idx} className="col-6">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            <small>{feature}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="border-top pt-4 mt-3">
                    <h6 className="fw-bold mb-3">Built With</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {techStack.slice(0, 4).map((tech, idx) => (
                        <span key={idx} className="badge bg-light text-dark border px-3 py-2">
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer bg-light border-top py-3">
                  <div className="text-center">
                    <small className="text-muted">
                      <i className="bi bi-clock-history me-1"></i>
                      Live Demo Available • Ready for Deployment
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-5 bg-white">
        <div className="container py-5">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="text-center">
                  <div className={`text-${stat.color} mb-3`}>
                    <i className={`bi ${stat.icon} fs-1`}></i>
                  </div>
                  <h2 className="display-4 fw-bold text-dark mb-2">{stat.value}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">
              <span className="text-primary">Complete</span> Platform Solution
            </h2>
            <p className="lead text-muted">
              Three roles, one powerful ecosystem
            </p>
          </div>

          {/* Role Selection */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="bg-white rounded-4 p-2 shadow-sm">
                <div className="row g-2">
                  {["candidate", "hr", "admin"].map((role) => (
                    <div key={role} className="col-md-4">
                      <button
                        className={`btn w-100 h-100 p-4 text-start rounded-3 ${activeRole === role ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                        onClick={() => setActiveRole(role)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <i className={`bi bi-${role === 'candidate' ? 'person' : role === 'hr' ? 'briefcase' : 'shield-check'} fs-2`}></i>
                          <div>
                            <h5 className="fw-bold mb-1">
                              {role === 'candidate' ? 'Candidate' : role === 'hr' ? 'HR Recruiter' : 'Administrator'}
                            </h5>
                            <small className="opacity-75">View features</small>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="row g-4">
            {roleFeatures[activeRole].map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card border-0 h-100 shadow-sm hover-lift">
                  <div className="card-body p-4">
                    <div className={`bg-${feature.color} bg-opacity-10 rounded-3 p-3 d-inline-flex mb-4`}>
                      <i className={`bi ${feature.icon} fs-2 text-${feature.color}`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">
              <span className="text-primary">Why Choose</span> IntelliHire?
            </h2>
            <p className="lead text-muted">
              Powerful features for modern hiring needs
            </p>
          </div>

          <div className="row g-4">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card border-0 h-100 text-center p-4 shadow-sm">
                  <div className={`bg-${feature.color} bg-opacity-10 rounded-circle p-4 d-inline-flex mb-4 justify-content-center mx-auto`}>
                    <i className={`bi ${feature.icon} fs-2 text-${feature.color}`}></i>
                  </div>
                  <h5 className="fw-bold mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="lead text-muted">
              Simple 6-step process for everyone
            </p>
          </div>

          <div className="row g-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card border-0 bg-white h-100 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <div className="position-relative mb-4">
                      <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <i className={`bi ${step.icon} fs-3`}></i>
                      </div>
                      <div className="position-absolute top-0 start-100 translate-middle bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '30px', height: '30px' }}>
                        {step.number}
                      </div>
                    </div>
                    <h5 className="fw-bold mb-3">{step.title}</h5>
                    <p className="text-muted mb-0">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">
              <span className="text-primary">Built With</span> Modern Tech
            </h2>
          </div>

          <div className="row g-4">
            {techStack.map((tech, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-2">
                <div className="text-center">
                  <div className={`bg-${tech.color} bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3 justify-content-center mx-auto`}>
                    <i className={`bi ${tech.icon} fs-2 text-${tech.color}`}></i>
                  </div>
                  <h6 className="fw-bold">{tech.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-5 bg-gradient-primary text-white">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-4 fw-bold mb-4">
                Ready to Transform Your Hiring?
              </h2>
              <p className="lead mb-5 opacity-75">
                Experience the future of interviews with our AI-powered platform
              </p>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button
                  onClick={() => navigate('/register')}
                  className="btn btn-light btn-lg px-5 py-3 fw-bold"
                >
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-outline-light btn-lg px-5 py-3 fw-bold"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login to Demo
                </button>
              </div>
              
              <p className="mt-4 opacity-75">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-primary rounded-3 p-2">
                  <i className="bi bi-robot text-white"></i>
                </div>
                <span className="h4 fw-bold mb-0">IntelliHire Pro</span>
              </div>
              <p className="text-light opacity-75">
                Revolutionizing hiring with AI-powered interviews for modern organizations.
              </p>
            </div>
            
            <div className="col-lg-8">
              <div className="row">
                <div className="col-6 col-md-3 mb-4">
                  <h6 className="fw-bold mb-3">Platform</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Features</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Pricing</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Demo</a></li>
                  </ul>
                </div>
                
                <div className="col-6 col-md-3 mb-4">
                  <h6 className="fw-bold mb-3">Resources</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Documentation</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Blog</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Support</a></li>
                  </ul>
                </div>
                
                <div className="col-6 col-md-3 mb-4">
                  <h6 className="fw-bold mb-3">Company</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">About</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Contact</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Careers</a></li>
                  </ul>
                </div>
                
                <div className="col-6 col-md-3 mb-4">
                  <h6 className="fw-bold mb-3">Legal</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Privacy</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Terms</a></li>
                    <li className="mb-2"><a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100">Security</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="border-secondary my-4" />
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="text-light opacity-75 mb-0">
              © 2024 IntelliHire Pro. All rights reserved.
            </p>
            <div className="d-flex gap-3 mt-3 mt-md-0">
              <a href="#" className="text-light opacity-75 hover-opacity-100">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-light opacity-75 hover-opacity-100">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
              <a href="#" className="text-light opacity-75 hover-opacity-100">
                <i className="bi bi-github fs-5"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
        .text-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .min-vh-100 {
          min-height: 100vh;
        }
      `}</style>
    </Layout>
  );
}