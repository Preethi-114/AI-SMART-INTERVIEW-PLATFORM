// API configuration
const API_URL = 'http://localhost:5000/api';

// ==================== AXIOS SETUP ====================
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    if (error.response?.status === 401) {
      // Auto logout on 401 Unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== FETCH HELPER ====================
const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include'
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION APIs ====================

// Simple login function (using fetch for compatibility)
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data; // Returns { success, token, user }
  } catch (error) {
    throw error;
  }
};

// Register new user
export const registerUser = async (userData) => {
  return apiRequest('/auth/register', 'POST', userData);
};

// Forgot password
export const forgotPassword = async (email) => {
  return apiRequest('/auth/forgot-password', 'POST', { email });
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  return apiRequest('/auth/reset-password', 'POST', { token, newPassword });
};

// Check if user is logged in
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get user role
export const getUserRole = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user).role;
  } catch {
    return null;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  // Optional: Clear axios default headers
  delete api.defaults.headers.common['Authorization'];
};

// ==================== USER APIs ====================

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// Update user profile in localStorage
export const updateLocalUser = (userData) => {
  try {
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error updating local user:', error);
    return null;
  }
};

// ==================== PROFILE APIs ====================

// Get user profile (using axios)
export const getProfile = async () => {
  return api.get('/profile').then(res => res.data);
};

// Update profile (using axios)
export const updateProfile = async (profileData) => {
  return api.put('/profile', profileData).then(res => res.data);
};

// Get profile statistics
export const getProfileStats = async () => {
  return api.get('/profile/stats').then(res => res.data);
};

// ==================== EDUCATION APIs ====================

// Add education
export const addEducation = async (educationData) => {
  return apiRequest('/profile/education', 'POST', educationData);
};

// Update education
export const updateEducation = async (id, educationData) => {
  return apiRequest(`/profile/education/${id}`, 'PUT', educationData);
};

// Delete education
export const deleteEducation = async (id) => {
  return apiRequest(`/profile/education/${id}`, 'DELETE');
};

// ==================== SKILLS APIs ====================

// Add skill
export const addSkill = async (skillData) => {
  return apiRequest('/profile/skills', 'POST', skillData);
};

// Delete skill
export const deleteSkill = async (id) => {
  return apiRequest(`/profile/skills/${id}`, 'DELETE');
};

// ==================== FILE UPLOAD APIs ====================

// Upload profile photo
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('profilePhoto', file);
  
  return apiRequest('/profile/upload-photo', 'POST', formData, true);
};

// Upload resume
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  return apiRequest('/profile/upload-resume', 'POST', formData, true);
};

// Delete resume
export const deleteResume = async () => {
  return apiRequest('/profile/resume', 'DELETE');
};

// ==================== INTERVIEW APIs ====================
// ==================== INTERVIEW APIs ====================
// ─── All methods the InterviewPlatform and InterviewList need ─────────────────
 
// ==================== INTERVIEW PLATFORM API ====================
// Complete API service for candidate interview flow

export const candidateInterviewApi = {
  
  // ─── INTERVIEW LIST ─────────────────────────────────────────────
  // Get all interviews for logged-in candidate
  getMyInterviews: () =>
    api.get('/candidate/my-interviews').then(res => res.data),

  // Get single interview details (questions, rounds, etc.)
  // Get interview by ID with questions
  getInterviewById: (id) => api.get(`/candidate/interviews/${id}`).then(res => res.data),
  
  // Start interview session
  startInterview: (id) => api.post(`/candidate/interviews/${id}/start`).then(res => res.data),
  
  // Save intro video with transcript and AI analysis
  saveIntroVideo: (id, formData) => api.post(`/candidate/interviews/${id}/intro`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  
  // Save MCQ answers
  saveMCQAnswers: (id, data) => api.post(`/candidate/interviews/${id}/mcq`, data).then(res => res.data),
  
  // Run code (no test cases - just check if it works)
  runCode: (id, data) => api.post(`/candidate/interviews/${id}/run-code`, data).then(res => res.data),
  
  // Save coding progress
  saveCodingProgress: (id, data) => api.post(`/candidate/interviews/${id}/coding`, data).then(res => res.data),
  
  // Save proctoring metrics
  saveMetrics: (id, data) => api.post(`/candidate/interviews/${id}/metrics`, data).catch(() => ({ success: true })),
  
  // Submit interview
  submitInterview: (id) => api.post(`/candidate/interviews/${id}/submit`).then(res => res.data),
  
  // Get HR report (full analysis)
  getHRReport: (interviewId, candidateUserId) => 
    api.get(`/candidate/interviews/${interviewId}/hr-report?candidateUserId=${candidateUserId}`).then(res => res.data)
};

// ==================== ROLE APIs (using axios) ====================

export const roleApi = {
  create: (data) => api.post('/roles', data).then(res => res.data),
  getAll: () => api.get('/roles').then(res => res.data),
  getById: (id) => api.get(`/roles/${id}`).then(res => res.data),
  update: (id, data) => api.put(`/roles/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/roles/${id}`).then(res => res.data)
};

// ==================== QUESTION APIs (using axios) ====================

export const questionApi = {
  // Create a new question
  create: (data) => api.post('/questions', data).then(res => res.data),
  
  // Get all questions with filters
  getAll: (params) => api.get('/questions', { params }).then(res => res.data),
  
  // Get question by ID
  getById: (id) => api.get(`/questions/${id}`).then(res => res.data),
  
  // Get questions by role
  getByRole: (roleId, params) => api.get(`/questions/by-role/${roleId}`, { params }).then(res => res.data),
  
  // Update question
  update: (id, data) => api.put(`/questions/${id}`, data).then(res => res.data),
  
  // Delete question
  delete: (id) => api.delete(`/questions/${id}`).then(res => res.data),
  
  // Toggle question status
  toggleStatus: (id) => api.patch(`/questions/${id}/toggle-status`).then(res => res.data)
};

// ==================== HR / CANDIDATE APIs ====================

export const candidateApi = {
  // Get all candidates with filters
  getAll: (filters = {}) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.experience && filters.experience !== 'all') queryParams.append('experience', filters.experience);
    if (filters.skills && filters.skills.length > 0) queryParams.append('skills', filters.skills.join(','));
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const endpoint = `/hr/candidates${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint).then(res => res.data);
  },
  
  // Get candidate by ID
  getById: (candidateId) => api.get(`/hr/candidates/${candidateId}`).then(res => res.data),
  
  // Update candidate status
  updateStatus: (candidateId, status) => 
    api.patch(`/hr/candidates/${candidateId}/status`, { status }).then(res => res.data),
  
  // Add note to candidate
  addNote: (candidateId, note) => 
    api.post(`/hr/candidates/${candidateId}/notes`, { note }).then(res => res.data),
  
  // Schedule interview
  scheduleInterview: (candidateId, interviewData) => 
    api.post(`/hr/candidates/${candidateId}/interviews`, interviewData).then(res => res.data),
  
  // Shortlist candidate
  shortlist: (candidateId) => 
    api.post(`/hr/candidates/${candidateId}/shortlist`).then(res => res.data),
  
  // Reject candidate
  reject: (candidateId, reason) => 
    api.post(`/hr/candidates/${candidateId}/reject`, { reason }).then(res => res.data),
  
  // Download resume
  downloadResume: (candidateId) => 
    api.get(`/hr/candidates/${candidateId}/resume`, { responseType: 'blob' }).then(res => res.data),
  
  // Export candidates list
  export: (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.skills) queryParams.append('skills', filters.skills.join(','));
    
    const queryString = queryParams.toString();
    const endpoint = `/hr/candidates/export${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, { responseType: 'blob' }).then(res => res.data);
  }
};

// ==================== SCHEDULE INTERVIEW APIs ====================

export const scheduleInterviewApi = {
  // Schedule new interview
  schedule: (interviewData) => 
    api.post('/hr/interviews/schedule', interviewData).then(res => res.data),
  
  // Get all scheduled interviews with filters
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    return api.get(`/hr/interviews${queryString ? `?${queryString}` : ''}`).then(res => res.data);
  },
  
  // Get single interview by ID
  getById: (id) => 
    api.get(`/hr/interviews/${id}`).then(res => res.data),
  
  // Update interview
  update: (id, interviewData) => 
    api.put(`hr/interviews/${id}`, interviewData).then(res => res.data),
  
  // Update interview status
  updateStatus: (id, status) => 
    api.patch(`/hr/interviews/${id}/status`, { status }).then(res => res.data),
  
  // Cancel interview
  cancel: (id, reason) => 
    api.post(`/hr/interviews/${id}/cancel`, { reason }).then(res => res.data),
  
  // Resend invitations
  resendInvitations: (id, candidateIds = []) => 
    api.post(`/hr/interviews/${id}/resend`, { candidateIds }).then(res => res.data),
  
  // Delete interview
  delete: (id) => 
    api.delete(`/hr/interviews/${id}`).then(res => res.data),
  
  // Get interview statistics for dashboard
  getStats: () => 
    api.get('/hr/interviews/stats/dashboard').then(res => res.data),
  
  // Get upcoming interviews
  getUpcoming: (limit = 10) => 
    api.get(`/hr/interviews/upcoming?limit=${limit}`).then(res => res.data),
  
  // Get past interviews
  getPast: (page = 1, limit = 10) => 
    api.get(`/hr/interviews/past?page=${page}&limit=${limit}`).then(res => res.data),
  
  // Clone interview
  clone: (id, modifications = {}) => 
    api.post(`/hr/interviews/${id}/clone`, modifications).then(res => res.data),
  
  // Get all job roles
  getJobTitles: () => 
    api.get('/hr/interviews/job-roles').then(res => res.data),
  
  // Check availability for candidates
  checkAvailability: (date, time, candidateIds) => 
    api.post('/hr/interviews/check-availability', { date, time, candidateIds }).then(res => res.data),
  
  // Bulk schedule interviews
  bulkSchedule: (interviewsData) => 
    api.post('/hr/interviews/bulk-schedule', interviewsData).then(res => res.data),
  
  // Export interviews to CSV/Excel
  export: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    
    const queryString = queryParams.toString();
    return api.get(`/hr/interviews/export${queryString ? `?${queryString}` : ''}`, { 
      responseType: 'blob' 
    }).then(res => res.data);
  },
  
  // Get interview templates
  getTemplates: () => 
    api.get('/hr/interviews/templates').then(res => res.data),
  
  // Save current interview as template
  saveAsTemplate: (id, templateName) => 
    api.post(`/hr/interviews/${id}/save-template`, { templateName }).then(res => res.data),
  
  // Schedule interview from template
  scheduleFromTemplate: (templateId, modifications = {}) => 
    api.post(`/hr/interviews/templates/${templateId}/schedule`, modifications).then(res => res.data)
};


// ADMIN - HR API section 

export const hrAccountApi = {
  // Get all HR accounts with filters
  getAll: (filters = {}) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.role && filters.role !== 'all') queryParams.append('role', filters.role);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const endpoint = `/hr${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint).then(res => res.data);
  },
  
  // Get HR statistics
  getStats: () => api.get('/hr/stats').then(res => res.data),

  getHRSidebarStats: () => api.get('/hr/sidebar/stats').then(res => res.data),
  
  // Get single HR account by ID
  getById: (hrId) => api.get(`/hr/${hrId}`).then(res => res.data),
  
  // Create new HR account
  create: (hrData) => api.post('/hr', hrData).then(res => res.data),
  
  // Update HR account
  update: (hrId, hrData) => api.put(`/hr/${hrId}`, hrData).then(res => res.data),
  
  // Delete HR account
  delete: (hrId) => api.delete(`/hr/${hrId}`).then(res => res.data),
  
  // Toggle HR account status
  toggleStatus: (hrId, status) => 
    api.patch(`/hr/${hrId}/toggle-status`, { status }).then(res => res.data),
  
  // Reset password
  resetPassword: (hrId, passwordData) => 
    api.put(`/hr/${hrId}/reset-password`, passwordData).then(res => res.data)
};


// src/modules/services/api.js
// Add these to your existing api.js file

// ==================== HR REPORTS API ====================

export const hrReportsApi = {
  // Get all interview responses with filters
  getAllResponses: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.position && filters.position !== 'all') queryParams.append('position', filters.position);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.scoreMin) queryParams.append('scoreMin', filters.scoreMin);
    if (filters.scoreMax) queryParams.append('scoreMax', filters.scoreMax);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const endpoint = `/hr/reports/interviews/responses${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint).then(res => res.data);
  },
  
  // Get single interview report
  getReport: (interviewId, candidateId) => 
    api.get(`/hr/reports/interviews/${interviewId}/candidate/${candidateId}/report`).then(res => res.data),
  
  // Update candidate selection status (shortlist/reject/pending)
  updateSelection: (id, status, note = '') => 
    api.post(`/hr/reports/interviews/candidate/${id}/select`, { status, note }).then(res => res.data),
  
  // Bulk update selection
  bulkAction: (ids, action) => 
    api.post('/hr/reports/interviews/bulk-action', { ids, action }).then(res => res.data),
  
  // Export reports to CSV
  exportReports: (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    
    const queryString = queryParams.toString();
    const endpoint = `/hr/reports/interviews/export${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, { responseType: 'blob' }).then(res => res.data);
  },
  
  // Get report statistics for dashboard
  getStats: () => 
    api.get('/hr/reports/interviews/stats').then(res => res.data)
};


// ==================== PROFILE APIs ====================

// Get user profile (using axios)
export const getMyProfile = async () => {
  return api.get('/auth/my-profile').then(res => res.data);
};

// Update profile (using axios)
export const updateMyProfile = async (profileData) => {
  return api.put('/auth/my-profile', profileData).then(res => res.data);
};

// ==================== UTILITY FUNCTIONS ====================

// Format date
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  
  const fields = [
    { check: profile.personal?.firstName, weight: 10 },
    { check: profile.personal?.lastName, weight: 10 },
    { check: profile.personal?.email, weight: 10 },
    { check: profile.personal?.phone, weight: 5 },
    { check: profile.professional?.title, weight: 10 },
    { check: profile.professional?.experience, weight: 5 },
    { check: profile.education?.length > 0, weight: 15 },
    { check: profile.skills?.length > 0, weight: 15 },
    { check: profile.resume?.fileName, weight: 10 },
    { check: profile.personal?.profilePhoto, weight: 10 }
  ];

  let completion = 0;
  fields.forEach(field => {
    if (field.check) completion += field.weight;
  });

  return Math.min(100, completion);
};

// Validate email format
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number (basic)
export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Debounce function for search inputs
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Get skill level color
export const getSkillLevelColor = (level) => {
  switch((level || '').toLowerCase()) {
    case 'expert': return 'success';
    case 'advanced': return 'primary';
    case 'intermediate': return 'warning';
    case 'beginner': return 'info';
    default: return 'secondary';
  }
};

// ==================== DEFAULT EXPORT ====================

// Export axios instance for direct use if needed
export { api };

// Main default export
export default {
  // Auth
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  getUserRole,
  logout,
  
  // User
  getCurrentUser,
  updateLocalUser,
  
  // Profile
  getProfile,
  updateProfile,
  getProfileStats,
  
  // Education
  addEducation,
  updateEducation,
  deleteEducation,
  
  // Skills
  addSkill,
  deleteSkill,
  
  // File Uploads
  uploadProfilePhoto,
  uploadResume,
  deleteResume,
  
  // Interviews
  candidateInterviewApi,
  
  // HR Dashboard APIs (using axios)
  roleApi,
  questionApi,
  candidateApi,
  scheduleInterviewApi,
  
  //ADMIN1

  hrAccountApi,
  hrReportsApi,


  //MY Profile
  getMyProfile,
  updateMyProfile,

  // Utilities
  formatDate,
  formatFileSize,
  calculateProfileCompletion,
  validateEmail,
  validatePhone,
  debounce,
  getSkillLevelColor,
  
  // Axios instance
  api
};