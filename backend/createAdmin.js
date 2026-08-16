const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'gokulnath2006mg@gmail.com' });
    if (existingAdmin) {
      console.log('Admin account already exists. Deleting it...');
      await User.deleteOne({ email: 'gokulnath2006mg@gmail.com' });
      console.log('Old admin account deleted');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('gokul_gh2006', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Gokulnath M',
      email: 'gokulnath2006mg@gmail.com',
      password: hashedPassword,
      isApproved: true,
      color: '#10b981'
    });

    console.log('✅ Admin account created successfully!');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Password: gokul_gh2006');
    console.log('Is Approved:', admin.isApproved);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
