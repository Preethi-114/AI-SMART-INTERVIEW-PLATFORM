// pages/HRList.jsx
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { hrAccountApi } from '../services/api'
import '../../styles/shared-styles.css'
import 'react-toastify/dist/ReactToastify.css';

export default function HRList() {
  const [hrAccounts, setHrAccounts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedHR, setSelectedHR] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest'
  })
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    loadHRData()
  }, [filters])

  const loadHRData = async () => {
    try {
      setLoading(true)
      
      const apiFilters = {
        search: searchTerm,
        status: filters.status,
        sortBy: filters.sortBy
      }
      
      const response = await hrAccountApi.getAll(apiFilters)
      if (response.success) {
        setHrAccounts(response.data || [])
      }
      
      const statsResponse = await hrAccountApi.getStats()
      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Error loading HR data:', error)
      toast.error('Failed to load HR accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await hrAccountApi.delete(id)
      if (response.success) {
        toast.success('HR account deleted successfully')
        loadHRData()
      }
    } catch (error) {
      console.error('Error deleting HR:', error)
      toast.error(error.response?.data?.message || 'Failed to delete HR account')
    } finally {
      setShowDeleteModal(false)
      setSelectedHR(null)
    }
  }

  const handleStatusChange = async (id, value) => {
    try {
      const status = parseInt(value)
      const response = await hrAccountApi.toggleStatus(id, status)
      if (response.success) {
        toast.success(`HR account ${status === 1 ? 'activated' : 'deactivated'} successfully`)
        loadHRData()
      }
    } catch (error) {
      console.error('Error changing status:', error)
      toast.error(error.response?.data?.message || 'Failed to change status')
    }
  }

  const handleCreate = async (data) => {
    try {
      const apiData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        isActive: data.isActive ? 1 : 0
      }
      
      const response = await hrAccountApi.create(apiData)
      if (response.success) {
        toast.success('HR account created successfully')
        loadHRData()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating HR:', error)
      throw error
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      const apiData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        isActive: data.isActive ? 1 : 0
      }
      
      const response = await hrAccountApi.update(id, apiData)
      if (response.success) {
        toast.success('HR account updated successfully')
        loadHRData()
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error updating HR:', error)
      throw error
    }
  }

  const handleResetPassword = async (id) => {
    if (!resetPasswordData.newPassword) {
      setPasswordError('Password is required')
      return
    }
    if (resetPasswordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      const response = await hrAccountApi.resetPassword(id, {
        password: resetPasswordData.newPassword
      })
      if (response.success) {
        toast.success('Password reset successfully')
        setShowResetPasswordModal(false)
        setResetPasswordData({ newPassword: '', confirmPassword: '' })
        setPasswordError('')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadHRData()
  }

  const filteredAccounts = hrAccounts.filter(hr => {
    const fullName = `${hr.firstName || ''} ${hr.lastName || ''}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) ||
      hr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hr.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading && hrAccounts.length === 0) {
    return (
      <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: '#64748b' }}>Loading HR accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="consistent-header px-0 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="rounded-circle p-3 me-3" style={{ backgroundColor: '#eef2ff' }}>
            <i className="bi bi-people fs-2" style={{ color: '#4f46e5' }}></i>
          </div>
          <div>
            <h1 className="mb-1">
              <span style={{ color: '#4f46e5' }}>HR</span> Accounts
            </h1>
            <p className="text-muted mb-0">Manage HR team members</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="consistent-btn consistent-btn-outline"
            onClick={loadHRData}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
          <button 
            className="consistent-btn consistent-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add HR
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4 mt-2">
        <div className="col-md-4">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon primary">
              <i className="bi bi-people"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.total}</h3>
              <p>Total HR</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon success">
              <i className="bi bi-person-check"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.active}</h3>
              <p>Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="consistent-stats-card">
            <div className="consistent-stats-icon warning">
              <i className="bi bi-person-x"></i>
            </div>
            <div className="consistent-stats-content">
              <h3>{stats.inactive}</h3>
              <p>Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="consistent-filter-bar">
        <form onSubmit={handleSearch}>
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" style={{ color: '#4f46e5' }}></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderColor: '#e2e8f0' }}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="consistent-form-control"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="consistent-btn consistent-btn-primary w-100">
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="consistent-table-container">
        <div className="table-responsive">
          <table className="consistent-table">
            <thead>
              <tr>
                <th className="ps-4">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((hr) => (
                  <tr key={hr.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '40px',
                            height: '40px',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            fontWeight: '600'
                          }}
                        >
                          {hr.firstName?.charAt(0) || 'H'}
                        </div>
                        <div className="fw-semibold" style={{ color: '#1e293b' }}>
                          {hr.firstName} {hr.lastName}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#334155' }}>{hr.email}</td>
                    <td style={{ color: '#64748b' }}>{hr.phone || 'N/A'}</td>
                    <td>
                      <select 
                        className="consistent-form-control"
                        style={{ width: '120px' }}
                        value={hr.status ? 1 : 0}
                        onChange={(e) => handleStatusChange(hr.id, e.target.value)}
                      >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <div className="d-flex align-items-center" style={{ color: '#64748b' }}>
                        <i className="bi bi-clock me-2"></i>
                        {hr.lastLogin ? new Date(hr.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <button 
                        className="consistent-btn consistent-btn-outline p-2 me-1"
                        onClick={() => {
                          setSelectedHR(hr)
                          setShowViewModal(true)
                        }}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="consistent-btn consistent-btn-outline p-2 me-1"
                        onClick={() => {
                          setSelectedHR(hr)
                          setShowEditModal(true)
                        }}
                        title="Edit"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="consistent-btn consistent-btn-outline p-2 me-1"
                        onClick={() => {
                          setSelectedHR(hr)
                          setShowResetPasswordModal(true)
                        }}
                        title="Reset Password"
                        style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                      >
                        <i className="bi bi-key"></i>
                      </button>
                      <button 
                        className="consistent-btn consistent-btn-outline p-2"
                        onClick={() => {
                          setSelectedHR(hr)
                          setShowDeleteModal(true)
                        }}
                        title="Delete"
                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <i className="bi bi-people fs-1" style={{ color: '#cbd5e1' }}></i>
                    <h6 className="mt-3" style={{ color: '#64748b' }}>No HR accounts found</h6>
                    <button 
                      className="consistent-btn consistent-btn-primary mt-3"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New HR
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '500px' }}>
            <div className="consistent-modal-header" style={{ background: '#f59e0b', color: 'white' }}>
              <h5 className="mb-0">
                <i className="bi bi-key me-2"></i>
                Reset Password
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => {
                  setShowResetPasswordModal(false)
                  setSelectedHR(null)
                  setResetPasswordData({ newPassword: '', confirmPassword: '' })
                  setPasswordError('')
                }}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              {selectedHR && (
                <>
                  <p className="text-center mb-4" style={{ color: '#475569' }}>
                    Reset password for <strong>{selectedHR.firstName} {selectedHR.lastName}</strong>
                  </p>
                  
                  <div className="consistent-form-group mb-3">
                    <label className="consistent-form-label">
                      <i className="bi bi-key me-2" style={{ color: '#f59e0b' }}></i>
                      New Password *
                    </label>
                    <input
                      type="password"
                      className="consistent-form-control"
                      value={resetPasswordData.newPassword}
                      onChange={(e) => {
                        setResetPasswordData({...resetPasswordData, newPassword: e.target.value})
                        setPasswordError('')
                      }}
                      placeholder="Enter new password (min 6 chars)"
                    />
                    {passwordError && (
                      <small className="text-danger">{passwordError}</small>
                    )}
                  </div>
                  
                  <div className="consistent-form-group mb-3">
                    <label className="consistent-form-label">
                      <i className="bi bi-lock me-2" style={{ color: '#f59e0b' }}></i>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className="consistent-form-control"
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => {
                        setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})
                        setPasswordError('')
                      }}
                      placeholder="Re-enter new password"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => {
                  setShowResetPasswordModal(false)
                  setSelectedHR(null)
                  setResetPasswordData({ newPassword: '', confirmPassword: '' })
                  setPasswordError('')
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="consistent-btn"
                style={{ background: '#f59e0b', color: 'white' }}
                onClick={() => handleResetPassword(selectedHR?.id)}
              >
                <i className="bi bi-key me-2"></i>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedHR && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '500px' }}>
            <div className="consistent-modal-header" style={{ background: '#4f46e5', color: 'white' }}>
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                HR Details
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedHR(null)
                }}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              <div className="text-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    fontSize: '32px',
                    fontWeight: '600'
                  }}
                >
                  {selectedHR.firstName?.charAt(0)}
                </div>
                <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                  {selectedHR.firstName} {selectedHR.lastName}
                </h5>
                
                <div className="text-start">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-envelope me-3" style={{ color: '#4f46e5', width: '20px' }}></i>
                    <span style={{ color: '#334155' }}>{selectedHR.email}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-telephone me-3" style={{ color: '#4f46e5', width: '20px' }}></i>
                    <span style={{ color: '#334155' }}>{selectedHR.phone || 'N/A'}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-power me-3" style={{ color: '#4f46e5', width: '20px' }}></i>
                    <span className={`consistent-badge ${selectedHR.status ? 'success' : 'secondary'}`}>
                      {selectedHR.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-clock me-3" style={{ color: '#4f46e5', width: '20px' }}></i>
                    <span style={{ color: '#334155' }}>
                      Last Login: {selectedHR.lastLogin ? new Date(selectedHR.lastLogin).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar me-3" style={{ color: '#4f46e5', width: '20px' }}></i>
                    <span style={{ color: '#334155' }}>
                      Created: {selectedHR.createdAt ? new Date(selectedHR.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="consistent-btn consistent-btn-primary"
                onClick={() => {
                  setShowViewModal(false)
                  setShowEditModal(true)
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedHR && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal" style={{ maxWidth: '500px' }}>
            <div className="consistent-modal-header" style={{ background: '#ef4444', color: 'white' }}>
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Confirm Delete
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedHR(null)
                }}
              ></button>
            </div>
            
            <div className="consistent-modal-body">
              <p style={{ color: '#475569' }}>
                Are you sure you want to delete <strong>{selectedHR.firstName} {selectedHR.lastName}</strong>?
              </p>
              <p className="text-danger small mb-0">
                <i className="bi bi-exclamation-circle me-1"></i>
                This action cannot be undone
              </p>
            </div>
            
            <div className="consistent-modal-footer">
              <button
                type="button"
                className="consistent-btn consistent-btn-outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedHR(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="consistent-btn"
                style={{ background: '#ef4444', color: 'white' }}
                onClick={() => handleDelete(selectedHR?.id)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <HRFormModal 
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false)
          setSelectedHR(null)
        }}
        hrData={null}
        onSave={handleCreate}
        isEdit={false}
      />

      <HRFormModal 
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          setSelectedHR(null)
        }}
        hrData={selectedHR}
        onSave={(data) => handleUpdate(selectedHR.id, data)}
        isEdit={true}
      />
    </div>
  )
}

// HR Form Modal
function HRFormModal({ show, onHide, hrData, onSave, isEdit }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
    password: '',
    confirmPassword: ''
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordError, setPasswordError] = useState('')
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    if (hrData && isEdit) {
      setFormData({
        firstName: hrData.firstName || '',
        lastName: hrData.lastName || '',
        email: hrData.email || '',
        phone: hrData.phone || '',
        isActive: hrData.status === true,
        password: '',
        confirmPassword: ''
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isActive: true,
        password: '',
        confirmPassword: ''
      })
    }
    setFieldErrors({})
    setPasswordError('')
  }, [hrData, show, isEdit])

  const validateForm = () => {
    const errors = {}
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!isEdit) {
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
      onHide()
    } catch (error) {
      console.error('Form submission error:', error)
      
      if (error.response?.data?.errors) {
        const apiErrors = {}
        error.response.data.errors.forEach(err => {
          const fieldMap = {
            'firstName': 'firstName',
            'lastName': 'lastName',
            'email': 'email',
            'password': 'password',
            'phone': 'phone'
          }
          const formField = fieldMap[err.field]
          if (formField) {
            apiErrors[formField] = err.message
          }
        })
        setFieldErrors(apiErrors)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  return (
    <div className="consistent-modal-overlay">
      <div className="consistent-modal" style={{ maxWidth: '700px' }}>
        <div className="consistent-modal-header" style={{ background: '#4f46e5', color: 'white' }}>
          <h5 className="mb-0">
            <i className={`bi ${isEdit ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
            {isEdit ? 'Edit HR Account' : 'Add New HR Account'}
          </h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={onHide}
            disabled={saving}
          ></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="consistent-modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="consistent-form-group">
                  <label className="consistent-form-label">
                    <i className="bi bi-person me-2" style={{ color: '#4f46e5' }}></i>
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="consistent-form-control"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({...formData, firstName: e.target.value})
                      if (fieldErrors.firstName) setFieldErrors({...fieldErrors, firstName: ''})
                    }}
                    placeholder="Enter first name"
                    disabled={saving}
                  />
                  {fieldErrors.firstName && (
                    <small className="text-danger">{fieldErrors.firstName}</small>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="consistent-form-group">
                  <label className="consistent-form-label">
                    <i className="bi bi-person me-2" style={{ color: '#4f46e5' }}></i>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="consistent-form-control"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value})
                      if (fieldErrors.lastName) setFieldErrors({...fieldErrors, lastName: ''})
                    }}
                    placeholder="Enter last name"
                    disabled={saving}
                  />
                  {fieldErrors.lastName && (
                    <small className="text-danger">{fieldErrors.lastName}</small>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="consistent-form-group">
                  <label className="consistent-form-label">
                    <i className="bi bi-envelope me-2" style={{ color: '#4f46e5' }}></i>
                    Email *
                  </label>
                  <input
                    type="email"
                    className="consistent-form-control"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value})
                      if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''})
                    }}
                    placeholder="hr@company.com"
                    disabled={saving}
                  />
                  {fieldErrors.email && (
                    <small className="text-danger">{fieldErrors.email}</small>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="consistent-form-group">
                  <label className="consistent-form-label">
                    <i className="bi bi-telephone me-2" style={{ color: '#4f46e5' }}></i>
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="consistent-form-control"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value})
                      if (fieldErrors.phone) setFieldErrors({...fieldErrors, phone: ''})
                    }}
                    placeholder="9876543210"
                    disabled={saving}
                  />
                  {fieldErrors.phone && (
                    <small className="text-danger">{fieldErrors.phone}</small>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="consistent-form-group">
                  <label className="consistent-form-label">
                    <i className="bi bi-power me-2" style={{ color: '#4f46e5' }}></i>
                    Status
                  </label>
                  <select
                    className="consistent-form-control"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    disabled={saving}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {!isEdit && (
                <>
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">
                        <i className="bi bi-key me-2" style={{ color: '#4f46e5' }}></i>
                        Password * (min 6 chars)
                      </label>
                      <input
                        type="password"
                        className="consistent-form-control"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({...formData, password: e.target.value})
                          if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''})
                          setPasswordError('')
                        }}
                        placeholder="Enter password"
                        disabled={saving}
                      />
                      {fieldErrors.password && (
                        <small className="text-danger">{fieldErrors.password}</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="consistent-form-group">
                      <label className="consistent-form-label">
                        <i className="bi bi-lock me-2" style={{ color: '#4f46e5' }}></i>
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        className="consistent-form-control"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({...formData, confirmPassword: e.target.value})
                          if (fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ''})
                          setPasswordError('')
                        }}
                        placeholder="Re-enter password"
                        disabled={saving}
                      />
                      {fieldErrors.confirmPassword && (
                        <small className="text-danger">{fieldErrors.confirmPassword}</small>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="consistent-modal-footer">
            <button
              type="button"
              className="consistent-btn consistent-btn-outline"
              onClick={onHide}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="consistent-btn consistent-btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`bi ${isEdit ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                  {isEdit ? 'Update Account' : 'Create Account'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}