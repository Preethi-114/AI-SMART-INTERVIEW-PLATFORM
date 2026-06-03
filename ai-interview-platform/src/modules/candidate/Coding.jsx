// steps/Coding.jsx
export default function Coding({ onNext }) {
  return (
    <div className="card shadow p-4">
      <h4>Coding Round</h4>

      <textarea
        className="form-control mb-3"
        rows="6"
        placeholder="Write your code here..."
      />

      <button className="btn btn-success" onClick={onNext}>
        Next → Video Interview
      </button>
    </div>
  );
}
