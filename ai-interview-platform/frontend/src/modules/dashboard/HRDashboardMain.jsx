export default function HRDashboard() {
  return (
    
    <div>
      <h3 className="mb-4">HR Dashboard</h3>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {["Total Interviews", "Scheduled", "Ongoing", "Completed"].map((title, i) => (
          <div className="col-md-3" key={i}>
            <div className="card shadow p-3 text-center">
              <h6>{title}</h6>
              <h2>{[15, 6, 3, 6][i]}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Interview Table */}
      <div className="card shadow">
        <div className="card-header fw-bold">Interview List</div>
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>Frontend Dev</td>
              <td><span className="badge bg-warning">Ongoing</span></td>
              <td><a href="/hr/monitor/1" className="btn btn-sm btn-warning">Monitor</a></td>
            </tr>
            <tr>
              <td>Sara</td>
              <td>Backend Dev</td>
              <td><span className="badge bg-success">Completed</span></td>
              <td><a href="/hr/reports" className="btn btn-sm btn-success">View Report</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
