const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const ADMIN_EMAIL = 'vatsal@prepbridge.com'; // Change to your email
const ADMIN_PASSWORD = 'Admin@123'; // Change this after first login

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin already exists:', ADMIN_EMAIL);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Vatsal (Admin)',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true
    });

    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('\n⚠️  Change password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
