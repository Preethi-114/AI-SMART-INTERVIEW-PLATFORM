export default function AdminDashboard() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Admin Dashboard</h3>
        <div>Welcome, Admin! <img src="https://i.pravatar.cc/40" className="rounded-circle ms-2" /></div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {[
          { title: "Total Users", value: 256, color: "primary" },
          { title: "Scheduled Interviews", value: 42, color: "warning" },
          { title: "Completed Interviews", value: 28, color: "success" },
          { title: "Pending Reviews", value: 12, color: "danger" },
        ].map((card, i) => (
          <div className="col-md-3" key={i}>
            <div className={`card text-white bg-${card.color} shadow`}>
              <div className="card-body text-center">
                <h6>{card.title}</h6>
                <h2>{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Tables */}
      <div className="row g-4">
        {/* Left: Charts */}
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h6>Interview Statistics</h6>
            {/* Placeholder for chart */}
            <div className="bg-light border" style={{ height: 200 }}></div>
          </div>
        </div>

        {/* Right: Pie + Pending Reviews */}
        <div className="col-md-6">
          <div className="card p-3 shadow mb-4">
            <h6>User Distribution</h6>
            {/* Placeholder for pie chart */}
            <div className="bg-light border" style={{ height: 200 }}></div>
          </div>

          <div className="card p-3 shadow">
            <h6>Pending Reviews</h6>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Miller</td>
                  <td>Frontend Developer</td>
                  <td><button className="btn btn-sm btn-primary">Manage</button></td>
                </tr>
                <tr>
                  <td>Emily Stone</td>
                  <td>Data Analyst</td>
                  <td><button className="btn btn-sm btn-primary">Manage</button></td>
                </tr>
                <tr>
                  <td>Raj Patel</td>
                  <td>Backend Developer</td>
                  <td><button className="btn btn-sm btn-primary">Manage</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card shadow mt-4 p-3">
        <h6>Recent Registrations</h6>
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Date Registered</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Priya Sharma</td><td>Candidate</td><td>2023-10-12</td></tr>
            <tr><td>Robert Brown</td><td>HR Manager</td><td>2023-10-10</td></tr>
            <tr><td>Anita Das</td><td>Candidate</td><td>2023-10-08</td></tr>
            <tr><td>David Lee</td><td>Admin</td><td>2023-10-07</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
