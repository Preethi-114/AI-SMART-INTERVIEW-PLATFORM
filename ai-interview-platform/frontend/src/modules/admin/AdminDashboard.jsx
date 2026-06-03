import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 🔴 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.clear(); // token / role ellam clear
    navigate("/"); // home page ku pogum
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Scheduled",
        data: [10, 15, 12, 20, 18],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "Completed",
        data: [8, 12, 10, 18, 16],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Interview Statistics" },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 5 } },
    },
  };

  const pieData = {
    labels: ["Candidates", "HRs", "Admins"],
    datasets: [
      {
        label: "Users",
        data: [150, 30, 5],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(255, 99, 132, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container-fluid">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Admin Dashboard</h3>

        <div className="d-flex align-items-center gap-3">
          <span>Welcome, Admin!</span>

          <img
            src="https://i.pravatar.cc/40"
            alt="Admin Avatar"
            className="rounded-circle"
          />

          {/* 🔴 LOGOUT BUTTON */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {[
          { title: "Total Users", value: 185, color: "primary" },
          { title: "Scheduled Interviews", value: 42, color: "warning" },
          { title: "Completed Interviews", value: 28, color: "success" },
          { title: "Pending Reviews", value: 12, color: "danger" },
        ].map((card, i) => (
          <div className="col-lg-3 col-md-6" key={i}>
            <div className={`card text-white bg-${card.color} shadow`}>
              <div className="card-body text-center py-4">
                <h6 className="mb-2">{card.title}</h6>
                <h2 className="mb-0">{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Pending Reviews */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow p-3">
            <div style={{ height: "300px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex flex-column gap-3">
          <div className="card shadow p-3" style={{ height: "350px" }}>
            <Pie data={pieData} />
          </div>

          <div className="card shadow p-3 flex-grow-1">
            <h6 className="mb-3">Pending Reviews</h6>
            <table className="table table-hover mb-0">
              <tbody>
                <tr>
                  <td>John Miller</td>
                  <td>Frontend Developer</td>
                  <td>
                    <button className="btn btn-sm btn-primary">Manage</button>
                  </td>
                </tr>
                <tr>
                  <td>Emily Stone</td>
                  <td>Data Analyst</td>
                  <td>
                    <button className="btn btn-sm btn-primary">Manage</button>
                  </td>
                </tr>
                <tr>
                  <td>Raj Patel</td>
                  <td>Backend Developer</td>
                  <td>
                    <button className="btn btn-sm btn-primary">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
