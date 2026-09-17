const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { createReport } = require('../controllers/reportController');

router.use(authenticate);

router.post('/', createReport);

module.exports = router;
