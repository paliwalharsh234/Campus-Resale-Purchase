const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const SavedItem = require('../models/SavedItem');
const Report = require('../models/Report');

dotenv.config();

const clearUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-resale';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('🍃 Connected to MongoDB...');

    // Delete users and user-associated mock records
    const userRes = await User.deleteMany({});
    console.log(`🗑️ Deleted ${userRes.deletedCount} users.`);

    const listRes = await Listing.deleteMany({});
    console.log(`🗑️ Deleted ${listRes.deletedCount} listings.`);

    const convRes = await Conversation.deleteMany({});
    console.log(`🗑️ Deleted ${convRes.deletedCount} conversations.`);

    const msgRes = await Message.deleteMany({});
    console.log(`🗑️ Deleted ${msgRes.deletedCount} messages.`);

    const savedRes = await SavedItem.deleteMany({});
    console.log(`🗑️ Deleted ${savedRes.deletedCount} saved items.`);

    const reportRes = await Report.deleteMany({});
    console.log(`🗑️ Deleted ${reportRes.deletedCount} reports.`);

    console.log('✅ Database is now completely clean of users and sample data! Campuses remain intact.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing users:', err.message);
    process.exit(1);
  }
};

clearUsers();
