import React, { useState, useEffect, useRef } from 'react';
import { roleApi } from '../services/api';
import '../../styles/shared-styles.css';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentRole, setCurrentRole] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (showModal && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current.focus();
      }, 100);
    }
  }, [showModal]);


  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleApi.getAll();
      if (response.success) {
        setRoles(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert(error.message || 'Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Total Roles", value: roles.length, icon: "bi-briefcase", color: "primary" },
    { title: "Active Roles", value: roles.filter(r => r.isActive).length, icon: "bi-check-circle", color: "success" },
    { title: "Inactive Roles", value: roles.filter(r => !r.isActive).length, icon: "bi-x-circle", color: "warning" },
    { title: "Recent Roles", value: roles.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdAt) > weekAgo;
    }).length, icon: "bi-clock-history", color: "info" }
  ];

  const getStatusBadge = (isActive) => {
    return isActive 
      ? <span className="consistent-badge success"><i className="bi bi-check-circle me-1"></i>Active</span>
      : <span className="consistent-badge warning"><i className="bi bi-x-circle me-1"></i>Inactive</span>;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role? This will set it to inactive.')) {
      try {
        const response = await roleApi.delete(id);
        if (response.success) {
          fetchRoles();
          alert('Role set to inactive successfully!');
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        alert(error.message || 'Failed to delete role. Please try again.');
      }
    }
  };

  const handleCreate = () => {
    setCurrentRole({
      name: '',
      description: '',
      isActive: true
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setCurrentRole({
      id: role._id,
      name: role.name,
      description: role.description || '',
      isActive: role.isActive !== undefined ? role.isActive : true
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentRole.name.trim()) {
      alert('Role name is required');
      nameInputRef.current.focus();
      return;
    }

    try {
      setModalLoading(true);
      
      const roleData = {
        name: currentRole.name.trim(),
        description: currentRole.description.trim(),
        isActive: currentRole.isActive
      };

      let response;
      if (modalMode === 'create') {
        response = await roleApi.create(roleData);
      } else {
        response = await roleApi.update(currentRole.id, roleData);
      }

      if (response.success) {
        setShowModal(false);
        fetchRoles();
        alert(`Role ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
        setCurrentRole({
          name: '',
          description: '',
          isActive: true
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} role:`, error);
      alert(error.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} role. Please try again.`);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' ? role.isActive : !role.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const sortedRoles = [...filteredRoles].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Modal */}
      {showModal && (
        <div className="consistent-modal-overlay">
          <div className="consistent-modal">
            <div className="consistent-modal-header">
              <h5>
                <i className={`bi ${modalMode === 'create' ? 'bi-plus-circle' : 'bi-pencil'} me-2`} style={{ color: '#4f46e5' }}></i>
                {modalMode === 'create' ? 'Create New Role' : 'Edit Role'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              ></button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              <div className="consistent-modal-body">
                <div className="consistent-form-group">
                  <label className="consistent-form-label">
                    Role Name <span className="text-danger">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    className="consistent-form-control"
                    name="name"
                    value={currentRole.name}
                    onChange={(e) => setCurrentRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                    disabled={modalLoading}
                  />
                  <small style={{ color: '#64748b' }}>Role name must be unique</small>
                </div>
                
                <div className="consistent-form-group">
                  <label className="consistent-form-label">Description</label>
                  <textarea
                    className="consistent-form-control"
                    name="description"
                    rows="3"
                    value={currentRole.description}
                    onChange={(e) => setCurrentRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description..."
                    disabled={modalLoading}
                  />
                </div>
                
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="isActive"
                      checked={currentRole.isActive}
                      onChange={(e) => setCurrentRole(prev => ({ ...prev, isActive: e.target.checked }))}
                      disabled={modalLoading}
                      style={{ width: '50px', height: '25px', cursor: 'pointer' }}
                    />
                  </div>
                  <div>
                    <label className="fw-semibold d-block" htmlFor="isActive">
                      Active Role
                    </label>
                    <small style={{ color: '#64748b' }}>
                      {currentRole.isActive 
                        ? 'Role is active and can be used' 
                        : 'Role is inactive and hidden'}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="consistent-modal-footer">
                <button
                  type="button"
                  className="consistent-btn consistent-btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="consistent-btn consistent-btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${modalMode === 'create' ? 'bi-plus-circle' : 'bi-check-circle'} me-2`}></i>
                      {modalMode === 'create' ? 'Create Role' : 'Update Role'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Header */}

      <div className="consistent-card p-4">
      <div className="consistent-header px-0 d-flex justify-content-between align-items-center">
    <div>
      <h1>
        <i className="bi bi-briefcase me-2" style={{ color: '#4f46e5' }}></i>
        Job Roles
      </h1>
      <p>Manage all job roles</p>
    </div>
    <button 
      className="consistent-btn consistent-btn-primary"
      onClick={handleCreate}
    >
      <i className="bi bi-plus-circle me-2"></i>
      Add New Role
    </button>
  </div>
</div>


      {/* Stats Cards - Added proper spacing with mt-2 */}
      <div className="row g-4 mb-4 mt-2">
        {stats.map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="consistent-stats-card">
              <div className={`consistent-stats-icon ${stat.color}`}>
                <i className={`bi ${stat.icon}`}></i>
              </div>
              <div className="consistent-stats-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="consistent-filter-bar">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search" style={{ color: '#64748b' }}></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderColor: '#e2e8f0' }}
            >
              <option value="">All Roles</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="consistent-table-container">
        <div className="consistent-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-task me-2" style={{ color: '#4f46e5' }}></i>
            All Roles
          </h5>
          <span className="text-muted small">
            Showing {sortedRoles.length} of {roles.length} roles
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2" style={{ color: '#64748b' }}>Loading roles...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="consistent-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRoles.map((role) => (
                    <tr key={role._id} className={!role.isActive ? 'opacity-75' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`rounded-circle p-2 me-3 ${role.isActive ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'}`}>
                            <i className={`bi bi-briefcase ${role.isActive ? 'text-primary' : 'text-secondary'}`}></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{role.name}</div>
                            <small style={{ color: '#64748b' }}>ID: {role._id?.substring(0, 8)}...</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '250px' }}>
                          {role.description || 'No description'}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(role.isActive)}
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">
                            {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <small style={{ color: '#64748b' }}>
                            {role.createdAt ? new Date(role.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="consistent-btn consistent-btn-outline p-2"
                            onClick={() => handleEdit(role)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="consistent-btn consistent-btn-outline p-2"
                            onClick={() => handleDelete(role._id)}
                            title="Delete"
                            style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedRoles.length === 0 && !loading && (
              <div className="text-center py-5">
                <i className="bi bi-briefcase fs-1" style={{ color: '#cbd5e1' }}></i>
                <h5 className="mt-3" style={{ color: '#64748b' }}>No roles found</h5>
                <p style={{ color: '#94a3b8' }}>
                  {searchTerm || statusFilter 
                    ? 'Try changing your search or filter criteria' 
                    : 'Get started by creating your first role'}
                </p>
                {!searchTerm && !statusFilter && (
                  <button 
                    className="consistent-btn consistent-btn-primary mt-2"
                    onClick={handleCreate}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create First Role
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}