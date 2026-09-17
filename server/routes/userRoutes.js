const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getUserProfile,
  updateProfile,
} = require('../controllers/userController');

router.use(authenticate);

router.put('/profile', updateProfile);
router.get('/:id', getUserProfile);

module.exports = router;
