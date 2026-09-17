const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');

router.use(authenticate);

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

module.exports = router;
