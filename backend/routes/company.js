const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { verifyCompany } = require('../middleware/auth');

// Get company profile
router.get('/profile', verifyCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user.id).select('-password');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update company profile
router.put('/profile', verifyCompany, async (req, res) => {
  try {
    const { shopName, logo, address, persons } = req.body;

    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (shopName !== undefined) company.shopName = shopName;
    if (logo !== undefined) company.logo = logo;
    if (address !== undefined) company.address = address;
    if (persons !== undefined && Array.isArray(persons)) {
      company.persons = persons;
    }

    await company.save();

    res.json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add person to company
router.post('/persons', verifyCompany, async (req, res) => {
  try {
    const { name, contactNumber } = req.body;

    if (!name || !contactNumber) {
      return res.status(400).json({ message: 'Please provide name and contact number' });
    }

    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.persons.push({ name, contactNumber });
    await company.save();

    res.json({
      message: 'Person added successfully',
      company: {
        id: company._id,
        persons: company.persons
      }
    });
  } catch (error) {
    console.error('Add person error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update person
router.put('/persons/:personId', verifyCompany, async (req, res) => {
  try {
    const { name, contactNumber } = req.body;

    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const person = company.persons.id(req.params.personId);

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    if (name) person.name = name;
    if (contactNumber) person.contactNumber = contactNumber;

    await company.save();

    res.json({
      message: 'Person updated successfully',
      person
    });
  } catch (error) {
    console.error('Update person error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete person
router.delete('/persons/:personId', verifyCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.persons.id(req.params.personId).remove();
    await company.save();

    res.json({
      message: 'Person deleted successfully',
      company: {
        id: company._id,
        persons: company.persons
      }
    });
  } catch (error) {
    console.error('Delete person error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

