import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="container py-5">
      <div className="row align-items-center">
        {/* Left Side */}
        <div className="col-md-6">
          <h1 className="display-4 fw-bold">
            Hire Smarter with <span className="text-primary">AI-Powered Interviews</span>
          </h1>
          <p className="text-secondary my-4 fs-5">
            Conduct real-time interviews with AI-based emotion analysis, 
            coding evaluation, and instant performance reports.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <button
              className="btn btn-primary btn-lg px-4 py-3"
              onClick={() => navigate("/login")}
            >
              <i className="fas fa-rocket me-2"></i>
              Get Started
            </button>
            <button className="btn btn-outline-light btn-lg px-4 py-3">
              <i className="fas fa-play-circle me-2"></i>
              Watch Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="row mt-5 pt-4">
            <div className="col-4">
              <h3 className="fw-bold text-primary">1000+</h3>
              <p className="text-secondary mb-0">Interviews</p>
            </div>
            <div className="col-4">
              <h3 className="fw-bold text-primary">99%</h3>
              <p className="text-secondary mb-0">Accuracy</p>
            </div>
            <div className="col-4">
              <h3 className="fw-bold text-primary">50+</h3>
              <p className="text-secondary mb-0">Companies</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-md-6 mt-5 mt-md-0">
          <div className="card bg-secondary border-0 shadow-lg overflow-hidden">
            <div className="card-body p-0">
              <div className="position-relative" style={{ height: "280px" }}>
                <div className="position-absolute w-100 h-100 bg-primary bg-opacity-10"></div>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <div className="display-1 text-primary opacity-25">
                    <i className="fas fa-robot"></i>
                  </div>
                  <h4 className="fw-bold mt-3">Live Interview Preview</h4>
                </div>
              </div>
              <div className="row text-center bg-dark bg-opacity-50 py-4">
                <div className="col border-end border-secondary py-3">
                  <div className="text-primary fs-4 mb-2">
                    <i className="fas fa-smile"></i>
                  </div>
                  <p className="mb-1 text-secondary">Emotion AI</p>
                  <h6 className="fw-bold mb-0">Real-time</h6>
                </div>
                <div className="col border-end border-secondary py-3">
                  <div className="text-warning fs-4 mb-2">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <p className="mb-1 text-secondary">MCQ Tests</p>
                  <h6 className="fw-bold mb-0">Auto Scoring</h6>
                </div>
                <div className="col py-3">
                  <div className="text-success fs-4 mb-2">
                    <i className="fas fa-code"></i>
                  </div>
                  <p className="mb-1 text-secondary">Coding</p>
                  <h6 className="fw-bold mb-0">Live Evaluation</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}