import { useNavigate, useParams } from "react-router-dom";

export default function ReportPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const results = {
    mcq: 85,
    coding: 92,
    emotion: "Confident",
    confidence: "85%"
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center mb-4">Interview Report - {id}</h2>

      <div className="row g-4 justify-content-center">
        <div className="col-md-3">
          <div className="card shadow p-3 text-center">
            <h5 className="fw-bold">MCQ Score</h5>
            <p className="fs-3">{results.mcq}%</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow p-3 text-center">
            <h5 className="fw-bold">Coding Score</h5>
            <p className="fs-3">{results.coding}%</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow p-3 text-center">
            <h5 className="fw-bold">AI Metrics</h5>
            <p>Emotion: {results.emotion}</p>
            <p>Confidence: {results.confidence}</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <button className="btn btn-success me-3" onClick={() => alert("Download Report")}>Download Report</button>
        <button className="btn btn-primary" onClick={() => navigate("/candidate-dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}
