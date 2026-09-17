const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/uploadMiddleware');
const {
  validate,
  listingValidationRules,
} = require('../middleware/validator');
const {
  getListings,
  createListing,
  getListingById,
  updateListing,
  updateListingStatus,
  deleteListing,
  getMyListings,
} = require('../controllers/listingController');

router.use(authenticate);

router.get('/user/my-listings', getMyListings);
router.get('/', getListings);
router.post('/', upload.array('images', 6), listingValidationRules(), validate, createListing);
router.get('/:id', getListingById);
router.put('/:id', upload.array('images', 6), updateListing);
router.patch('/:id/status', updateListingStatus);
router.delete('/:id', deleteListing);

module.exports = router;
