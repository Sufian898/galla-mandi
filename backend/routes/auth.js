const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || 'company' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Company Login
router.post('/company/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`Login attempt for email: ${normalizedEmail}`);

    // Find company by email (case-insensitive)
    const company = await Company.findOne({ email: normalizedEmail });

    if (!company) {
      console.log(`Company not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!company.isActive) {
      console.log(`Company account is inactive: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Company account is deactivated. Please contact administrator.' });
    }

    // Check password - CRITICAL: This must work correctly
    console.log(`Checking password for company: ${company.username}`);
    const isMatch = await company.comparePassword(password);

    if (!isMatch) {
      console.log(`Password mismatch for company: ${company.username}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`Login successful for company: ${company.username}`);

    // Generate token
    const token = generateToken({ ...company.toObject(), role: 'company' });

    if (!token) {
      console.error('Token generation failed');
      return res.status(500).json({ message: 'Failed to generate authentication token' });
    }

    res.json({
      message: 'Login successful',
      token,
      company: {
        id: company._id,
        username: company.username,
        email: company.email,
        shopName: company.shopName,
        logo: company.logo,
        address: company.address,
        persons: company.persons
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`Admin login attempt for email: ${normalizedEmail}`);

    // Find admin by normalized email
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      console.log(`Admin not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`Admin found: ${admin.username}`);

    // Check password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      console.log(`Password mismatch for admin: ${admin.username}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`Login successful for admin: ${admin.username}`);

    // Generate token
    const token = generateToken({ ...admin.toObject(), role: 'super_admin' });

    if (!token) {
      console.error('Token generation failed');
      return res.status(500).json({ message: 'Failed to generate authentication token' });
    }

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

