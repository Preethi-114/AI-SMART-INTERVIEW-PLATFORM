import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddQuestion() {
  const navigate = useNavigate();
  const [type, setType] = useState("MCQ");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Question Added Successfully");
    navigate("/admin/questions");
  };

  return (
    <div className="container">
      <h3>Add New Question</h3>

      <form onSubmit={handleSubmit} className="card p-4">
        <div className="mb-3">
          <label>Question Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>MCQ</option>
            <option>Coding</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Question</label>
          <textarea className="form-control" required />
        </div>

        {type === "MCQ" && (
          <>
            <input className="form-control mb-2" placeholder="Option A" />
            <input className="form-control mb-2" placeholder="Option B" />
            <input className="form-control mb-2" placeholder="Option C" />
            <input className="form-control mb-2" placeholder="Option D" />

            <div className="mb-3">
              <label>Correct Answer</label>
              <select className="form-select">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
          </>
        )}

        {type === "Coding" && (
          <textarea
            className="form-control"
            placeholder="Expected solution / description"
          />
        )}

        <div className="mb-3">
          <label>Difficulty</label>
          <select className="form-select">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <button className="btn btn-success">Save Question</button>
      </form>
    </div>
  );
}
