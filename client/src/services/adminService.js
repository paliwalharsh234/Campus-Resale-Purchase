import api from './api';

export const adminService = {
  // Dashboard
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleUserSuspension: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/suspend`);
    return res.data;
  },

  // Listings
  getListings: async (params = {}) => {
    const res = await api.get('/admin/listings', { params });
    return res.data;
  },

  deleteListing: async (listingId) => {
    const res = await api.delete(`/admin/listings/${listingId}`);
    return res.data;
  },

  // Reports
  getReports: async (status) => {
    const res = await api.get('/admin/reports', { params: status ? { status } : {} });
    return res.data;
  },

  updateReportStatus: async (reportId, status) => {
    const res = await api.patch(`/admin/reports/${reportId}/status`, { status });
    return res.data;
  },

  createReport: async (reportData) => {
    const res = await api.post('/reports', reportData);
    return res.data;
  },

  // Campuses
  getCampuses: async () => {
    const res = await api.get('/admin/campuses');
    return res.data;
  },

  addCampus: async (campusData) => {
    const res = await api.post('/admin/campuses', campusData);
    return res.data;
  },

  updateCampus: async (campusId, campusData) => {
    const res = await api.put(`/admin/campuses/${campusId}`, campusData);
    return res.data;
  },

  toggleCampusStatus: async (campusId) => {
    const res = await api.patch(`/admin/campuses/${campusId}/toggle`);
    return res.data;
  },
};

export default adminService;
