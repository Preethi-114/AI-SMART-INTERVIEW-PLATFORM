import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMyProfile, logout, hrAccountApi } from '../services/api'; // Import specific functions

export default function HRLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jobRoles: 0, // Default static values
    candidates: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    totalQuestions: 0
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchSidebarStats();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getMyProfile(); // Using the imported function
      if (response.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If unauthorized, logout will be handled by interceptor
    } finally {
      setLoading(false);
    }
  };

    const fetchSidebarStats = async () => {
    try {
      setLoading(true);
      const response = await hrAccountApi.getHRSidebarStats();// Using the imported function
      if (response.success) {
        setStats({
          jobRoles: response.data.jobRoles || 0,
          candidates: response.data.candidates || 0,
          scheduledInterviews: response.data.scheduledInterviews || 0,
          completedInterviews: response.data.completedInterviews || 0,
          totalQuestions: response.data.totalQuestions || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If unauthorized, logout will be handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Common logout function using imported logout
  const handleLogout = () => {
    logout(); // Using the imported logout function
    navigate("/login", { replace: true });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData) return "HR";
    const first = userData.firstName?.charAt(0) || '';
    const last = userData.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || "HR";
  };

  // Get full name
  const getFullName = () => {
    if (!userData) return "HR User";
    return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "HR User";
  };

  // Get user email
  const getUserEmail = () => {
    return userData?.email || 'hr@company.com';
  };

  // Update menu groups with badge counts
  const menuGroups = [
    {
      title: "RECRUITMENT",
      items: [
        { path: "/hr/dashboard", icon: "bi-speedometer2", label: "Dashboard", badge: null, badgeColor: null },
        { path: "/hr/job-roles", icon: "bi-briefcase", label: "Job Roles", badge: stats.jobRoles.toString(), badgeColor: "primary" },
        { path: "/hr/manage-questions", icon: "bi bi-question-diamond", label: "Questions", badge: stats.totalQuestions.toString(), badgeColor: "success" },
        { path: "/hr/candidates", icon: "bi-people", label: "Candidates", badge: stats.candidates.toString(), badgeColor: "success" }
      ]
    },
    {
      title: "INTERVIEWS",
      items: [
        { path: "/hr/schedule-interview", icon: "bi-calendar-check", label: "Schedule", badge: null, badgeColor: "warning" },
        { path: "/hr/interviews", icon: "bi-list-task", label: "Interviews", badge: stats.scheduledInterviews.toString(), badgeColor: "info" },
        // { path: "/hr/completed-candidates", icon: "bi-check2-circle", label: "Completed", badge: stats.completedInterviews.toString(), badgeColor: "success" },
        { path: "/hr/reports", icon: "bi-chat-square-text", label: "Reports", badge: "0", badgeColor: "danger" }
      ]
    }
  ];

  const getBadgeClass = (color) => {
    const colors = {
      primary: "bg-primary-soft text-primary",
      success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning",
      info: "bg-info-soft text-info",
      danger: "bg-danger-soft text-danger",
      purple: "bg-purple-soft text-purple"
    };
    return colors[color] || "bg-secondary-soft text-secondary";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50"
          style={{ zIndex: 1045, backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-white d-flex flex-column position-fixed h-100 shadow-lg ${
          collapsed ? "sidebar-collapsed" : "sidebar-expanded"
        } ${mobileOpen ? "d-block" : "d-none d-lg-block"}`}
        style={{ 
          width: collapsed ? "85px" : "300px",
          zIndex: 1050,
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Logo Area */}
        <div className={`d-flex align-items-center p-4 border-bottom ${collapsed ? "justify-content-center" : "justify-content-between"}`}>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-gradient-primary rounded-3 p-2 shadow-sm">
              <i className="bi bi-building text-white fs-5"></i>
            </div>
            {!collapsed && (
              <div className="d-flex flex-column">
                <h5 className="fw-bold mb-0">AI Interview <span className="text-primary">Pro</span></h5>
                <small className="text-muted">HR Panel</small>
              </div>
            )}
          </div>
          <button 
            className="btn btn-light btn-sm rounded-circle d-none d-lg-flex align-items-center justify-content-center border-0 shadow-sm"
            style={{ width: "32px", height: "32px" }}
            onClick={() => setCollapsed(!collapsed)}
          >
            <i className={`bi bi-chevron-${collapsed ? "right" : "left"} fs-6`}></i>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-grow-1 overflow-auto px-3 py-3">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-4">
              {!collapsed && (
                <div className="d-flex align-items-center px-3 mb-2">
                  <small className="text-uppercase text-muted fw-semibold tracking-wider" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                    {group.title}
                  </small>
                  <hr className="flex-grow-1 ms-3 border-0 bg-secondary" style={{ height: "1px", opacity: 0.1 }} />
                </div>
              )}
              
              {group.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  className={({ isActive }) => `
                    nav-link d-flex align-items-center px-3 py-2 mb-1 rounded-3
                    ${collapsed ? "justify-content-center" : "gap-3"}
                    ${isActive 
                      ? "bg-soft-primary text-primary" 
                      : "text-secondary hover-bg-soft"
                    }
                    transition-all
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`d-flex align-items-center justify-content-center ${isActive ? "text-primary" : "text-muted"}`}>
                        <i className={`bi ${item.icon} fs-5`}></i>
                      </div>
                      
                      {!collapsed && (
                        <>
                          <span className="flex-grow-1 text-start fw-medium" style={{ fontSize: "14px" }}>
                            {item.label}
                          </span>
                          
                          {item.badge && (
                            <span className={`badge ${getBadgeClass(item.badgeColor)} px-3 py-2 rounded-pill fw-normal`} 
                                  style={{ fontSize: "11px" }}>
                              {item.badge}
                            </span>
                          )}

                          {isActive && (
                            <div className="bg-primary" 
                                 style={{ width: "3px", height: "24px", borderRadius: "3px 0 0 3px" }} />
                          )}
                        </>
                      )}

                      {collapsed && item.badge && (
                        <span className={`position-absolute top-0 end-0 badge ${getBadgeClass(item.badgeColor)} rounded-pill`}
                              style={{ fontSize: "9px", transform: "translate(25%, -25%)" }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* User Profile Section at Bottom */}
        {!collapsed && userData && (
          <div className="p-3 border-top mt-auto">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-soft-primary rounded-3 d-flex align-items-center justify-content-center" 
                   style={{ width: "45px", height: "45px" }}>
                <span className="fw-bold text-primary fs-6">{getUserInitials()}</span>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0 fw-semibold">{getFullName()}</h6>
                <small className="text-muted d-block" style={{ fontSize: "12px" }}>{getUserEmail()}</small>
                <span className="badge bg-primary-soft text-primary px-2 py-1 mt-1" style={{ fontSize: "10px" }}>
                  {userData.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main 
        className="flex-grow-1"
        style={{ 
          marginLeft: collapsed ? "85px" : "300px",
          transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Top Navigation */}
        <nav className="navbar navbar-expand-lg bg-white px-4 py-3 shadow-sm">
          <div className="container-fluid px-0">
            <div className="d-flex align-items-center gap-4">
              <button 
                className="btn btn-light btn-sm d-lg-none rounded-3 p-2 border-0"
                onClick={() => setMobileOpen(true)}
              >
                <i className="bi bi-list fs-5"></i>
              </button>
              
              <div className="d-none d-md-flex align-items-center gap-2">
                <span className="text-muted">Pages</span>
                <i className="bi bi-chevron-right text-muted" style={{ fontSize: "12px" }}></i>
                <span className="fw-semibold">Dashboard</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* User Menu */}
              <div className="dropdown">
                <button className="d-flex align-items-center gap-2 btn btn-light border-0 p-1 ps-2 rounded-3" data-bs-toggle="dropdown">
                  <span className="d-none d-md-block small fw-semibold">{getFullName()}</span>
                  <div className="bg-soft-primary rounded-2 d-flex align-items-center justify-content-center" 
                       style={{ width: "36px", height: "36px" }}>
                    <span className="fw-bold text-primary">{getUserInitials()}</span>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 py-2 mt-2">
                  <li><span className="dropdown-item-text fw-semibold px-3 py-2">{getFullName()}</span></li>
                  <li><span className="dropdown-item-text text-muted px-3 pb-2" style={{ fontSize: "12px" }}>{getUserEmail()}</span></li>
                  <li><hr className="dropdown-divider my-2" /></li>
                  <li>
                    <NavLink className="dropdown-item py-2 px-3" to="/hr/my-profile">
                      <i className="bi bi-person me-2 text-muted"></i>
                      My Profile
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-2" />
                  </li>
                  <li>
                    <button className="dropdown-item py-2 px-3 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      <style>{`
        /* Custom Colors */
        .bg-soft-primary {
          background-color: rgba(67, 97, 238, 0.1);
        }
        .bg-soft-success {
          background-color: rgba(25, 135, 84, 0.1);
        }
        .bg-soft-warning {
          background-color: rgba(255, 193, 7, 0.1);
        }
        .bg-soft-info {
          background-color: rgba(13, 202, 240, 0.1);
        }
        .bg-soft-danger {
          background-color: rgba(220, 53, 69, 0.1);
        }
        .bg-soft-purple {
          background-color: rgba(111, 66, 193, 0.1);
        }
        .bg-soft-secondary {
          background-color: rgba(108, 117, 125, 0.1);
        }

        /* Text Colors */
        .text-purple {
          color: #6f42c1;
        }

        /* Badge Variants */
        .bg-primary-soft {
          background-color: rgba(13, 110, 253, 0.1);
        }
        .bg-success-soft {
          background-color: rgba(25, 135, 84, 0.1);
        }
        .bg-warning-soft {
          background-color: rgba(255, 193, 7, 0.1);
        }
        .bg-info-soft {
          background-color: rgba(13, 202, 240, 0.1);
        }
        .bg-danger-soft {
          background-color: rgba(220, 53, 69, 0.1);
        }
        .bg-purple-soft {
          background-color: rgba(111, 66, 193, 0.1);
        }

        /* Gradient */
        .bg-gradient-primary {
          background: linear-gradient(135deg, #4361ee 0%, #3a56d4 100%);
        }
        .bg-gradient-light {
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }

        /* Transitions */
        .transition-all {
          transition: all 0.2s ease;
        }

        /* Hover Effects */
        .hover-bg-soft:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        .nav-link:hover i {
          color: #4361ee;
        }

        /* Custom Scrollbar */
        .overflow-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        /* Typography */
        .tracking-wider {
          letter-spacing: 0.05em;
        }

        /* Sidebar States */
        .sidebar-expanded {
          width: 300px;
        }
        .sidebar-collapsed {
          width: 85px;
        }
        .sidebar-collapsed .nav-link span {
          display: none;
        }

        @media (max-width: 991.98px) {
          main {
            margin-left: 0 !important;
          }
        }

        /* Card Styles */
        .btn-light {
          background-color: #f8f9fa;
          border: 1px solid transparent;
        }
        .btn-light:hover {
          background-color: #e9ecef;
        }

        /* Dropdown Styles */
        .dropdown-item {
          font-size: 14px;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        /* Badge Pulse */
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        .badge.bg-danger {
          animation: pulse 2s infinite;
        }

        /* Glass Morphism */
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
}