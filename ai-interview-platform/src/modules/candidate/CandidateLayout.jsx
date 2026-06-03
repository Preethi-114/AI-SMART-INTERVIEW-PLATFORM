import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Adjust the import path as needed
import '../../styles/candidate_layout.css';

const Header = ({ title = "AI Interview Pro", subtitle = "Dashboard", showBackButton = false }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "",
    candidateId: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const profileDropdownRef = useRef(null);

  // Fetch user data from localStorage and API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get basic user data from localStorage first
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // Set initial data from localStorage
          setUserProfile({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            email: user.email || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${user.firstName || 'User'} ${user.lastName || ''}`
            )}&background=667eea&color=fff&size=128`,
            role: storedRole || user.role || 'Candidate',
            candidateId: user.candidateId || `CAND${user.id?.slice(-6) || '000000'}`
          });

          // Try to fetch full profile data from API
          try {
            const response = await api.getProfile();
            
            if (response.success && response.data) {
              const profileData = response.data;
              
              // Update with more detailed profile data
              setUserProfile(prev => ({
                ...prev,
                name: profileData.fullName || 
                      `${profileData.personal?.firstName || ''} ${profileData.personal?.lastName || ''}`.trim() || 
                      prev.name,
                email: profileData.personal?.email || prev.email,
                avatar: profileData.personal?.profilePhoto || prev.avatar,
                role: storedRole || user.role || 'Candidate',
                candidateId: profileData.professional?.candidateId || prev.candidateId
              }));
            }
          } catch (profileError) {
            console.log('Could not fetch full profile, using localStorage data');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies if any
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Redirect to HOME PAGE (not login)
    navigate('/', { replace: true });
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
  };

  // Menu items with routes
  const menuItems = [
    { id: 1, icon: "bi-person", label: "Profile", path: "/profile", color: "text-primary" },
    { id: 2, icon: "bi-speedometer", label: "Dashboard", path: "/candidate-dashboard", color: "text-info" }
  ];

  // Show loading state if needed
  if (isLoading) {
    return (
      <header className="interview-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-2">
            <div className="brand">
              <h2 className="mb-0">
                <i className="bi bi-brain text-primary me-2"></i>
                {title}
              </h2>
            </div>
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="interview-header">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center py-2">
          {/* Left Section */}
          <div className="d-flex align-items-center gap-3">
            {showBackButton && (
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
            )}
            
            <div className="brand">
              <h2 className="mb-0">
                <i className="bi bi-brain text-primary me-2"></i>
                {title}
              </h2>
              {subtitle && (
                <small className="text-light ms-2">{subtitle}</small>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="d-flex align-items-center gap-4">
            {/* User Info */}
            <div className="d-flex align-items-center gap-2">
              <div className="user-info">
                <div className="badge bg-dark">
                  <i className="bi bi-person-circle me-1"></i>
                  {userProfile.candidateId || 'CAND000000'}
                </div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="position-relative" ref={profileDropdownRef}>
              <button 
                className="btn p-0 border-0 bg-transparent d-flex align-items-center gap-2"
                onClick={toggleProfileDropdown}
              >
                <div className="profile-avatar">
                  <img 
                    src={userProfile.avatar} 
                    alt={userProfile.name} 
                    className="rounded-circle"
                    width="36"
                    height="36"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=667eea&color=fff&size=128`;
                    }}
                  />
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="fw-medium text-white">{userProfile.name}</div>
                </div>
                <i className={`bi bi-chevron-${showProfileDropdown ? 'up' : 'down'} text-light`}></i>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="profile-dropdown show">
                  {/* Header */}
                  <div className="dropdown-header p-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="profile-avatar">
                        <img 
                          src={userProfile.avatar} 
                          alt={userProfile.name} 
                          className="rounded-circle"
                          width="40"
                          height="40"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=667eea&color=fff&size=128`;
                          }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">{userProfile.name}</h6>
                        <small className="text-muted d-block">{userProfile.email}</small>
                        <small className="text-muted d-block">{userProfile.candidateId}</small>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Menu Items */}
                  <div className="dropdown-body py-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        className="dropdown-item d-flex align-items-center py-2 px-3"
                        onClick={() => handleMenuItemClick(item.path)}
                      >
                        <i className={`bi ${item.icon} ${item.color} me-2`}></i>
                        <span className="fw-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Logout */}
                  <div className="p-3">
                    <button 
                      className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;