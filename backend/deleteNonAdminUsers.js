const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function deleteNonAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Count all users
    const totalCount = await User.countDocuments();
    console.log(`Total users in database: ${totalCount}`);

    // Count admin user
    const adminUser = await User.findOne({ email: 'gokulnath2006mg@gmail.com' });
    if (adminUser) {
      console.log(`Admin user found: ${adminUser.name} (${adminUser.email})`);
    } else {
      console.log('Admin user not found in database');
    }

    // Delete all users except admin
    const result = await User.deleteMany({ email: { $ne: 'gokulnath2006mg@gmail.com' } });
    console.log(`✅ Deleted ${result.deletedCount} non-admin users`);

    // Verify remaining users
    const remainingCount = await User.countDocuments();
    console.log(`Remaining users in database: ${remainingCount}`);

    if (remainingCount === 1 && adminUser) {
      console.log('✅ Only admin user remains in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteNonAdminUsers();
