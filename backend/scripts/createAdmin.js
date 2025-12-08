const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

// Use environment variable or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Company';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Normalize email
    const adminEmail = 'admin@gmail.com'.toLowerCase().trim();
    
    // Check if admin already exists (case-insensitive)
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Username: ${existingAdmin.username}`);
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: adminEmail,
      password: 'admin123', // Will be hashed automatically
      role: 'super_admin'
    });

    await admin.save();
    console.log('Default admin created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

