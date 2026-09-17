const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get or create a conversation for a listing
// @route   POST /api/conversations
// @access  Protected
const getOrCreateConversation = asyncHandler(async (req, res, next) => {
  const { listingId } = req.body;

  if (!listingId) {
    return next(ApiError.badRequest('Listing ID is required.'));
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return next(ApiError.notFound('Listing not found.'));
  }

  // Prevent messaging oneself
  if (listing.seller.toString() === req.user.userId) {
    return next(ApiError.badRequest('You cannot start a conversation with yourself on your own listing.'));
  }

  // Campus check
  if (listing.campus.toString() !== req.user.campusId && req.user.role !== 'admin') {
    return next(ApiError.forbidden('Cannot message sellers from another campus.'));
  }

  // Find existing conversation between these 2 users on this listing
  let conversation = await Conversation.findOne({
    listing: listing._id,
    participants: { $all: [req.user.userId, listing.seller] },
  })
    .populate('participants', 'name email profileImage course branch')
    .populate('listing', 'title price images status');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user.userId, listing.seller],
      listing: listing._id,
      lastMessage: '',
      lastMessageSender: req.user.userId,
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email profileImage course branch')
      .populate('listing', 'title price images status');
  }

  res.status(200).json({
    success: true,
    conversation,
  });
});

// @desc    Get all conversations of current user
// @route   GET /api/conversations
// @access  Protected
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.userId,
  })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name email profileImage course branch')
    .populate('listing', 'title price images status')
    .lean();

  res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});

// @desc    Get messages inside a conversation
// @route   GET /api/conversations/:id/messages
// @access  Protected
const getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(ApiError.notFound('Conversation not found.'));
  }

  // Verify caller is a participant
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user.userId
  );
  if (!isParticipant && req.user.role !== 'admin') {
    return next(ApiError.forbidden('You are not a participant in this conversation.'));
  }

  // Mark all unread incoming messages as read
  await Message.updateMany(
    {
      conversation: conversation._id,
      receiver: req.user.userId,
      isRead: false,
    },
    { isRead: true }
  );

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profileImage')
    .lean();

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Protected
const sendMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return next(ApiError.badRequest('Message text cannot be empty.'));
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return next(ApiError.notFound('Conversation not found.'));
  }

  // Verify participant
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user.userId
  );
  if (!isParticipant) {
    return next(ApiError.forbidden('You are not a participant in this conversation.'));
  }

  // Receiver is the other participant
  const receiverId = conversation.participants.find(
    (p) => p.toString() !== req.user.userId
  );

  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: req.user.userId,
    receiver: receiverId,
    listing: conversation.listing,
    message: message.trim(),
    isRead: false,
  });

  // Update conversation last message timestamp & snippet
  conversation.lastMessage = message.trim();
  conversation.lastMessageSender = req.user.userId;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('sender', 'name profileImage')
    .lean();

  // Emit real-time Socket.IO event to conversation room
  if (req.io) {
    req.io.to(conversation._id.toString()).emit('new_message', populatedMessage);
  }

  res.status(201).json({
    success: true,
    message: populatedMessage,
  });
});

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
};
