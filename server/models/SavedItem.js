const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate saves of the same item by a user
savedItemSchema.index({ user: 1, listing: 1 }, { unique: true });
savedItemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedItem', savedItemSchema);
