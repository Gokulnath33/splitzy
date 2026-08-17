const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const ADMIN_EMAIL = 'gokulnath2006mg@gmail.com';
    const ADMIN_PASSWORD = 'gokul_gh2006';
    const ADMIN_NAME = 'Gokulnath M';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('✅ Admin account already exists in database');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Approved: ${existingAdmin.isApproved}`);
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

  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
  }
}

seedAdmin();
