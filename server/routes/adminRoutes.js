const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getAdminStats,
  getAllUsers,
  toggleUserSuspension,
  getAllListings,
  adminDeleteListing,
  getReports,
  updateReportStatus,
  getCampuses,
  addCampus,
  updateCampus,
  toggleCampusStatus,
} = require('../controllers/adminController');

// All admin routes strictly require authentication and 'admin' role
router.use(authenticate, authorize('admin'));

// Stats
router.get('/stats', getAdminStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/suspend', toggleUserSuspension);

// Listings
router.get('/listings', getAllListings);
router.delete('/listings/:id', adminDeleteListing);

// Reports
router.get('/reports', getReports);
router.patch('/reports/:id/status', updateReportStatus);

// Campuses
router.get('/campuses', getCampuses);
router.post('/campuses', addCampus);
router.put('/campuses/:id', updateCampus);
router.patch('/campuses/:id/toggle', toggleCampusStatus);

module.exports = router;
