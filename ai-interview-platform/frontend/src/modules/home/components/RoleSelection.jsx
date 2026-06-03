import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      icon: "fas fa-user-graduate",
      title: "Candidate",
      desc: "Attend interviews, solve challenges, get instant feedback",
      btnText: "Start Interview",
      color: "danger"
    },
    {
      icon: "fas fa-user-tie",
      title: "HR / Recruiter",
      desc: "Create interviews, monitor candidates, review analytics",
      btnText: "Go to Dashboard",
      color: "warning"
    },
    {
      icon: "fas fa-user-shield",
      title: "Admin",
      desc: "Manage platform, users, and system analytics",
      btnText: "Admin Panel",
      color: "primary"
    }
  ];

  return (
    <section id="roles" className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-25 text-primary px-4 py-2 mb-3">
          <i className="fas fa-users me-2"></i>PLATFORM ACCESS
        </span>
        <h2 className="fw-bold display-5">Choose Your Role</h2>
        <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
          One platform, multiple roles. Login once, access everything.
        </p>
      </div>
      <div className="row g-4">
        {roles.map((role, index) => (
          <div key={index} className="col-md-4">
            <div className="card border-0 bg-dark bg-opacity-50 h-100 hover-lift">
              <div className="card-body p-4 d-flex flex-column">
                <div className="text-center mb-4">
                  <div className={`rounded-circle bg-${role.color} bg-opacity-10 d-inline-flex align-items-center justify-content-center p-3`} 
                       style={{width: "80px", height: "80px"}}>
                    <i className={`${role.icon} fs-2 text-${role.color}`}></i>
                  </div>
                </div>
                <h5 className="fw-bold text-center mb-3">{role.title}</h5>
                <p className="text-secondary text-center mb-4 flex-grow-1">{role.desc}</p>
                <button
                  onClick={() => navigate("/login")}
                  className={`btn btn-${role.color} btn-lg w-100 py-3`}
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  {role.btnText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}