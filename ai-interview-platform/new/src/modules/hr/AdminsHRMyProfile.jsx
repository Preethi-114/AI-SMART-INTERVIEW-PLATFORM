import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../services/api';
import { toast } from 'react-toastify';

export default function ProfileUpdate() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getMyProfile();
      if (response.success) {
        const { firstName, lastName, email, phone } = response.data.user;
        setProfileData({ firstName, lastName, email, phone });
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      const response = await updateMyProfile(profileData);
      if (response.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validatePasswordForm()) {
      return;
    }

    // Combine profile data with password data for update
    const updateData = {
      ...profileData,
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    };

    try {
      setUpdating(true);
      const response = await updateMyProfile(updateData);
      
      if (response.success) {
        toast.success('Password changed successfully');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      
      // Handle specific error messages
      if (errorMessage.includes('Current password is incorrect')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="consistent-header px-0">
        <h1>
          <i className="bi bi-person-circle me-2" style={{ color: '#4f46e5' }}></i>
          My Profile
        </h1>
        <p>Manage your personal information and security settings</p>
      </div>

      {/* Tabs */}
      <div className="consistent-table-container mb-4">
        <div className="border-bottom">
          <ul className="nav nav-tabs" style={{ borderBottom: 'none' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                style={{
                  border: 'none',
                  color: activeTab === 'profile' ? '#4f46e5' : '#64748b',
                  fontWeight: activeTab === 'profile' ? '600' : '400',
                  padding: '1rem 1.5rem'
                }}
              >
                <i className="bi bi-person me-2"></i>
                Profile Information
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
                style={{
                  border: 'none',
                  color: activeTab === 'password' ? '#4f46e5' : '#64748b',
                  fontWeight: activeTab === 'password' ? '600' : '400',
                  padding: '1rem 1.5rem'
                }}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Change Password
              </button>
            </li>
          </ul>
        </div>

        <div className="p-4">
          {activeTab === 'profile' ? (
            /* Profile Information Form */
            <form onSubmit={handleProfileSubmit}>
              <div className="row">
                {/* Profile Avatar Preview */}
                <div className="col-12 mb-4">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-4"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: '600'
                      }}
                    >
                      {profileData.firstName?.charAt(0) || ''}{profileData.lastName?.charAt(0) || ''}
                    </div>
                    <div>
                      <h5 className="mb-1">{profileData.firstName} {profileData.lastName}</h5>
                      <p className="text-muted mb-0">{profileData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    placeholder="Enter first name"
                    required
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.lastName ? 'is-invalid' : ''}`}
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    placeholder="Enter last name"
                    required
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter email"
                    required
                    disabled
                  />
                  <small className="text-muted">Email cannot be changed</small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="consistent-btn consistent-btn-primary"
                    disabled={updating}
                    style={{ minWidth: '150px' }}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Change Password Form */
            <form onSubmit={handlePasswordSubmit}>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${errors.currentPassword ? 'is-invalid' : ''}`}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                  {errors.currentPassword && (
                    <div className="invalid-feedback">{errors.currentPassword}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${errors.newPassword ? 'is-invalid' : ''}`}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                  {errors.newPassword && (
                    <div className="invalid-feedback">{errors.newPassword}</div>
                  )}
                  <small className="text-muted">Minimum 6 characters</small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>

                {/* Password Strength Indicator */}
                {passwordData.newPassword && !errors.newPassword && (
                  <div className="col-12 mb-3">
                    <div className="progress" style={{ height: '5px' }}>
                      <div 
                        className="progress-bar"
                        style={{
                          width: `${Math.min((passwordData.newPassword.length / 20) * 100, 100)}%`,
                          backgroundColor: passwordData.newPassword.length < 6 ? '#dc3545' : 
                                         passwordData.newPassword.length < 10 ? '#ffc107' : '#28a745'
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Password strength: {
                        passwordData.newPassword.length < 6 ? 'Weak' :
                        passwordData.newPassword.length < 10 ? 'Medium' : 'Strong'
                      }
                    </small>
                  </div>
                )}

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="consistent-btn consistent-btn-primary"
                    disabled={updating}
                    style={{ minWidth: '150px' }}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Rest of your component remains the same */}
    </div>
  );
}