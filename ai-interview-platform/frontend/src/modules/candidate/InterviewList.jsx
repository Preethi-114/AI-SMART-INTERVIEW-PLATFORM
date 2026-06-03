// InterviewList.jsx
import { useNavigate } from "react-router-dom";

export default function InterviewList() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h3 className="mb-4">My Interviews</h3>

      <div className="card shadow">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5>Frontend Developer</h5>
            <p className="text-muted mb-0">Company: ABC Tech</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/candidate/interview/1")}
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}
