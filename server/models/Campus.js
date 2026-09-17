const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema(
  {
    campusName: {
      type: String,
      required: [true, 'Campus name is required'],
      trim: true,
    },
    emailDomain: {
      type: String,
      required: [true, 'Email domain is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // e.g. "iitb.ac.in" or "nitk.edu.in"
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast domain lookups during registration
campusSchema.index({ emailDomain: 1 });
campusSchema.index({ isActive: 1 });

module.exports = mongoose.model('Campus', campusSchema);
