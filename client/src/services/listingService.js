import api from './api';

export const listingService = {
  getListings: async (params = {}) => {
    const res = await api.get('/listings', { params });
    return res.data;
  },

  createListing: async (formData) => {
    const res = await api.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getListingById: async (id) => {
    const res = await api.get(`/listings/${id}`);
    return res.data;
  },

  updateListing: async (id, formData) => {
    const res = await api.put(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateListingStatus: async (id, status) => {
    const res = await api.patch(`/listings/${id}/status`, { status });
    return res.data;
  },

  deleteListing: async (id) => {
    const res = await api.delete(`/listings/${id}`);
    return res.data;
  },

  getMyListings: async () => {
    const res = await api.get('/listings/user/my-listings');
    return res.data;
  },
};

export default listingService;
