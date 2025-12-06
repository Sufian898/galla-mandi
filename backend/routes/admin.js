const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { verifyAdmin } = require('../middleware/auth');

// Get all companies
router.get('/companies', verifyAdmin, async (req, res) => {
  try {
    const companies = await Company.find().select('-password');
    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single company
router.get('/companies/:id', verifyAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select('-password');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new company
router.post('/companies', verifyAdmin, async (req, res) => {
  try {
    const { username, email, password, logo, contactNumber } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [{ email }, { username }]
    });

    if (existingCompany) {
      return res.status(400).json({ message: 'Company with this email or username already exists' });
    }

    // Create new company
    const company = new Company({
      username,
      email,
      password,
      logo: logo || '',
      contactNumber: contactNumber || ''
    });

    await company.save();

    res.status(201).json({
      message: 'Company created successfully',
      company: {
        id: company._id,
        username: company.username,
        email: company.email,
        shopName: company.shopName,
        logo: company.logo,
        address: company.address,
        contactNumber: company.contactNumber,
        persons: company.persons
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update company
router.put('/companies/:id', verifyAdmin, async (req, res) => {
  try {
    const { username, email, password, isActive, language, websiteLanguage, logo, contactNumber } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (username) company.username = username;
    if (email) company.email = email;
    if (password) company.password = password;
    if (typeof isActive === 'boolean') company.isActive = isActive;
    if (language) company.language = language;
    if (websiteLanguage) company.websiteLanguage = websiteLanguage;
    if (logo !== undefined) company.logo = logo;
    if (contactNumber !== undefined) company.contactNumber = contactNumber;

    await company.save();

    res.json({
      message: 'Company updated successfully',
      company: {
        id: company._id,
        username: company.username,
        email: company.email,
        shopName: company.shopName,
        logo: company.logo,
        address: company.address,
        contactNumber: company.contactNumber,
        persons: company.persons,
        isActive: company.isActive,
        language: company.language,
        websiteLanguage: company.websiteLanguage
      }
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete company
router.delete('/companies/:id', verifyAdmin, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

