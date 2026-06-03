export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: "fas fa-calendar-alt",
      title: "Schedule Interview",
      desc: "Create interviews and assign assessments"
    },
    {
      number: "2",
      icon: "fas fa-video",
      title: "Candidate Attends",
      desc: "Join video calls and complete challenges"
    },
    {
      number: "3",
      icon: "fas fa-brain",
      title: "AI Analysis",
      desc: "Real-time skill and emotion evaluation"
    },
    {
      number: "4",
      icon: "fas fa-chart-bar",
      title: "Smart Report",
      desc: "Instant comprehensive performance reports"
    }
  ];

  return (
    <section id="how-it-works" className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-25 text-primary px-4 py-2 mb-3">
          <i className="fas fa-cogs me-2"></i>PROCESS
        </span>
        <h2 className="fw-bold display-5">How It Works</h2>
        <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
          Simple 4-step process to transform your hiring
        </p>
      </div>
      <div className="row g-4">
        {steps.map((step, index) => (
          <div key={index} className="col-md-3">
            <div className="card border-0 bg-dark bg-opacity-50 h-100 hover-lift">
              <div className="card-body p-4 text-center">
                <div className="position-relative d-inline-block mb-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                       style={{width: "80px", height: "80px", fontWeight: "bold"}}>
                    <span className="fs-3">{step.number}</span>
                  </div>
                  <div className="position-absolute top-0 start-100 translate-middle bg-white text-primary rounded-circle p-2">
                    <i className={step.icon}></i>
                  </div>
                </div>
                <h5 className="fw-bold mb-3">{step.title}</h5>
                <p className="text-secondary mb-0">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}