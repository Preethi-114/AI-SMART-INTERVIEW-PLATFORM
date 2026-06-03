// steps/MCQ.jsx
export default function MCQ({ onNext }) {
  return (
    <div className="card shadow p-4">
      <h4>MCQ Round</h4>

      <p>1. What is React?</p>
      <div className="form-check">
        <input type="radio" className="form-check-input" />
        <label className="form-check-label">Library</label>
      </div>

      <button className="btn btn-success mt-4" onClick={onNext}>
        Next → Coding
      </button>
    </div>
  );
}
