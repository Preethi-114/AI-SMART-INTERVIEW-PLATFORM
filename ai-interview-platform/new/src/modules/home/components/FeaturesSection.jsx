export default function FeaturesSection() {
  const features = [
    {
      icon: "fas fa-video",
      title: "Live Video Interviews",
      desc: "HD video calls with screen sharing",
      color: "primary"
    },
    {
      icon: "fas fa-code",
      title: "Code Execution",
      desc: "20+ programming languages",
      color: "success"
    },
    {
      icon: "fas fa-brain",
      title: "AI Emotion Analysis",
      desc: "Real-time facial recognition",
      color: "warning"
    },
    {
      icon: "fas fa-chart-line",
      title: "Analytics Dashboard",
      desc: "Comprehensive performance metrics",
      color: "info"
    },
    {
      icon: "fas fa-shield-alt",
      title: "Advanced Security",
      desc: "End-to-end encryption",
      color: "danger"
    },
    {
      icon: "fas fa-robot",
      title: "AI Interviewer",
      desc: "Intelligent follow-up questions",
      color: "purple"
    }
  ];

  return (
    <section id="features" className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-25 text-primary px-4 py-2 mb-3">
          <i className="fas fa-star me-2"></i>FEATURES
        </span>
        <h2 className="fw-bold display-5">Powerful Features</h2>
      </div>
      <div className="row g-4">
        {features.map((feature, index) => (
          <div key={index} className="col-md-4">
            <div className="card border-0 bg-dark bg-opacity-50 h-100 hover-lift">
              <div className="card-body p-4">
                <div className={`rounded-circle bg-${feature.color} bg-opacity-10 d-inline-flex align-items-center justify-content-center p-3 mb-4`}>
                  <i className={`${feature.icon} fs-4 text-${feature.color}`}></i>
                </div>
                <h5 className="fw-bold mb-3">{feature.title}</h5>
                <p className="text-secondary mb-0">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}