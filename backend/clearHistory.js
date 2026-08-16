const mongoose = require('mongoose');
const ApprovalHistory = require('./models/ApprovalHistory');
require('dotenv').config();

async function clearHistory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Count history records before deletion
    const count = await ApprovalHistory.countDocuments();
    console.log(`Found ${count} approval history records`);

    if (count > 0) {
      // Delete all history records
      const result = await ApprovalHistory.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} approval history records`);
    } else {
      console.log('No approval history to delete');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearHistory();
