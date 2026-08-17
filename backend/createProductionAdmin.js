const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createProductionAdmin() {
  // You need to provide your MongoDB Atlas connection string here
  const MONGO_URI = 'mongodb+srv://your_username:your_password@your_cluster.mongodb.net/splitzy';
  
  const ADMIN_EMAIL = 'gokulnath2006mg@gmail.com';
  const ADMIN_PASSWORD = 'gokul_gh2006';
  const ADMIN_NAME = 'Gokulnath M';

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Approved: ${existingAdmin.isApproved}`);
      
      // Ask if they want to reset the password
      console.log('\nWould you like to reset the admin password?');
      console.log('To reset, uncomment the password reset code below and run this script again.');
      
      await mongoose.connection.close();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isApproved: true,
      color: '#10b981'
    });

    console.log('✅ Admin account created successfully!');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Approved: ${admin.isApproved}`);
    console.log(`   User ID: ${admin._id}`);

    await mongoose.connection.close();
    console.log('\n✅ Done! You can now login with these credentials.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// To reset password, uncomment this:
/*
async function resetAdminPassword() {
  const ADMIN_EMAIL = 'gokulnath2006mg@gmail.com';
  const NEW_PASSWORD = 'gokul_gh2006';
  
  try {
    await mongoose.connect(MONGO_URI);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    await User.findOneAndUpdate({ email: ADMIN_EMAIL }, { password: hashedPassword });
    console.log('✅ Admin password reset successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}
*/

createProductionAdmin();
