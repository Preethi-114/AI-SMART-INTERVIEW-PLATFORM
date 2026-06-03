// steps/Video.jsx
export default function Video({ onNext }) {
  return (
    <div className="card shadow p-4">
      <h4>Video Interview</h4>

      <div className="alert alert-warning">
        Camera will be monitored
      </div>

      <button className="btn btn-danger mt-3" onClick={onNext}>
        Finish Interview
      </button>
    </div>
  );
}
