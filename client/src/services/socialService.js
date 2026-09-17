import api from './api';

export const socialService = {
  // ── Saved / Wishlist ──
  getSavedItems: async () => {
    const res = await api.get('/saved');
    return res.data;
  },

  checkIfSaved: async (listingId) => {
    const res = await api.get(`/saved/check/${listingId}`);
    return res.data;
  },

  saveItem: async (listingId) => {
    const res = await api.post(`/saved/${listingId}`);
    return res.data;
  },

  unsaveItem: async (listingId) => {
    const res = await api.delete(`/saved/${listingId}`);
    return res.data;
  },

  // ── Messaging ──
  getConversations: async () => {
    const res = await api.get('/conversations');
    return res.data;
  },

  getOrCreateConversation: async (listingId) => {
    const res = await api.post('/conversations', { listingId });
    return res.data;
  },

  getMessages: async (conversationId) => {
    const res = await api.get(`/conversations/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (conversationId, message) => {
    const res = await api.post(`/conversations/${conversationId}/messages`, { message });
    return res.data;
  },

  // ── Profile ──
  getUserProfile: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },
};

export default socialService;
