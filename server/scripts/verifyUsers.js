/**
 * Script to manually verify all @poornima.org users in the database.
 * Run with: node scripts/verifyUsers.js
 */
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await User.updateMany(
      { email: { $regex: /@poornima\.org$/ } },
      {
        $set: { isEmailVerified: true },
        $unset: { verificationToken: '', verificationTokenExpires: '' },
      }
    );
    console.log('✅ Verified users count:', result.modifiedCount);

    const users = await User.find({ email: { $regex: /@poornima\.org$/ } })
      .select('name email isEmailVerified role');
    console.log('📋 All @poornima.org users:');
    users.forEach(u => {
      console.log(`  - ${u.name} | ${u.email} | verified: ${u.isEmailVerified} | role: ${u.role}`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
