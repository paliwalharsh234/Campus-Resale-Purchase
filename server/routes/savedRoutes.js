const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getSavedItems,
  checkIfSaved,
  saveItem,
  unsaveItem,
} = require('../controllers/savedController');

router.use(authenticate);

router.get('/', getSavedItems);
router.get('/check/:listingId', checkIfSaved);
router.post('/:listingId', saveItem);
router.delete('/:listingId', unsaveItem);

module.exports = router;
