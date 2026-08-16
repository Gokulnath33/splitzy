const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Count users before deletion
    const count = await User.countDocuments();
    console.log(`Found ${count} users in database`);

    if (count > 0) {
      // Delete all users
      const result = await User.deleteMany({});
      console.log(`Deleted ${result.deletedCount} users`);
    } else {
      console.log('No users to delete');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearUsers();
