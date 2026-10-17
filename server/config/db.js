const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 MongoDB connected: ${conn.connection.host}`);

    // Ensure Poornima University / College campus is always active in the DB
    try {
      const Campus = require('../models/Campus');
      const poornimaExists = await Campus.findOne({ emailDomain: 'poornima.org' });
      if (!poornimaExists) {
        await Campus.create({
          campusName: 'Poornima Group of Colleges',
          emailDomain: 'poornima.org',
          city: 'Jaipur',
          state: 'Rajasthan',
          isActive: true,
        });
        console.log('🎓 Auto-registered Poornima Group of Colleges (@poornima.org)');
      }
    } catch (err) {
      console.warn('Campus auto-registration notice:', err.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
