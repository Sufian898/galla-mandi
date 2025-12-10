const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const TeamMember = require('../models/TeamMember');
const Recognition = require('../models/Recognition');
const Blog = require('../models/Blog');
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

// ========== Team Member Routes ==========

// Get all team members (public route - no auth required)
router.get('/team-members', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ teamMembers });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all team members (admin route - with auth)
router.get('/team-members/all', verifyAdmin, async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ order: 1, createdAt: -1 });
    res.json({ teamMembers });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single team member
router.get('/team-members/:id', verifyAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ teamMember });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new team member
router.post('/team-members', verifyAdmin, async (req, res) => {
  try {
    const { name, nameUrdu, title, titleUrdu, image, bio, bioUrdu, email, phone, order, isActive } = req.body;

    if (!name || !title) {
      return res.status(400).json({ message: 'Please provide name and title' });
    }

    const teamMember = new TeamMember({
      name,
      nameUrdu: nameUrdu || '',
      title,
      titleUrdu: titleUrdu || '',
      image: image || '',
      bio: bio || '',
      bioUrdu: bioUrdu || '',
      email: email || '',
      phone: phone || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await teamMember.save();

    res.status(201).json({
      message: 'Team member created successfully',
      teamMember
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update team member
router.put('/team-members/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, nameUrdu, title, titleUrdu, image, bio, bioUrdu, email, phone, order, isActive } = req.body;

    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    if (name) teamMember.name = name;
    if (nameUrdu !== undefined) teamMember.nameUrdu = nameUrdu;
    if (title) teamMember.title = title;
    if (titleUrdu !== undefined) teamMember.titleUrdu = titleUrdu;
    if (image !== undefined) teamMember.image = image;
    if (bio !== undefined) teamMember.bio = bio;
    if (bioUrdu !== undefined) teamMember.bioUrdu = bioUrdu;
    if (email !== undefined) teamMember.email = email;
    if (phone !== undefined) teamMember.phone = phone;
    if (order !== undefined) teamMember.order = order;
    if (typeof isActive === 'boolean') teamMember.isActive = isActive;

    await teamMember.save();

    res.json({
      message: 'Team member updated successfully',
      teamMember
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete team member
router.delete('/team-members/:id', verifyAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== Recognition Routes ==========

// Get all recognitions (public route - no auth required)
router.get('/recognitions', async (req, res) => {
  try {
    const recognitions = await Recognition.find({ isActive: true }).sort({ order: 1, year: -1, createdAt: -1 });
    res.json({ recognitions });
  } catch (error) {
    console.error('Get recognitions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all recognitions (admin route - with auth)
router.get('/recognitions/all', verifyAdmin, async (req, res) => {
  try {
    const recognitions = await Recognition.find().sort({ order: 1, year: -1, createdAt: -1 });
    res.json({ recognitions });
  } catch (error) {
    console.error('Get recognitions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single recognition
router.get('/recognitions/:id', verifyAdmin, async (req, res) => {
  try {
    const recognition = await Recognition.findById(req.params.id);
    
    if (!recognition) {
      return res.status(404).json({ message: 'Recognition not found' });
    }

    res.json({ recognition });
  } catch (error) {
    console.error('Get recognition error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new recognition
router.post('/recognitions', verifyAdmin, async (req, res) => {
  try {
    const { title, titleUrdu, description, descriptionUrdu, image, year, category, categoryUrdu, order, isActive } = req.body;

    if (!title || !year) {
      return res.status(400).json({ message: 'Please provide title and year' });
    }

    const recognition = new Recognition({
      title,
      titleUrdu: titleUrdu || '',
      description: description || '',
      descriptionUrdu: descriptionUrdu || '',
      image: image || '',
      year,
      category: category || '',
      categoryUrdu: categoryUrdu || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await recognition.save();

    res.status(201).json({
      message: 'Recognition created successfully',
      recognition
    });
  } catch (error) {
    console.error('Create recognition error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update recognition
router.put('/recognitions/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, titleUrdu, description, descriptionUrdu, image, year, category, categoryUrdu, order, isActive } = req.body;

    const recognition = await Recognition.findById(req.params.id);

    if (!recognition) {
      return res.status(404).json({ message: 'Recognition not found' });
    }

    if (title) recognition.title = title;
    if (titleUrdu !== undefined) recognition.titleUrdu = titleUrdu;
    if (description !== undefined) recognition.description = description;
    if (descriptionUrdu !== undefined) recognition.descriptionUrdu = descriptionUrdu;
    if (image !== undefined) recognition.image = image;
    if (year) recognition.year = year;
    if (category !== undefined) recognition.category = category;
    if (categoryUrdu !== undefined) recognition.categoryUrdu = categoryUrdu;
    if (order !== undefined) recognition.order = order;
    if (typeof isActive === 'boolean') recognition.isActive = isActive;

    await recognition.save();

    res.json({
      message: 'Recognition updated successfully',
      recognition
    });
  } catch (error) {
    console.error('Update recognition error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete recognition
router.delete('/recognitions/:id', verifyAdmin, async (req, res) => {
  try {
    const recognition = await Recognition.findByIdAndDelete(req.params.id);

    if (!recognition) {
      return res.status(404).json({ message: 'Recognition not found' });
    }

    res.json({ message: 'Recognition deleted successfully' });
  } catch (error) {
    console.error('Delete recognition error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== Blog Routes ==========

// Get all blogs (public route - no auth required)
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ order: 1, publishedDate: -1 });
    res.json({ blogs });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all blogs (admin route - with auth) - MUST be before /blogs/:id
router.get('/blogs/all', verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ order: 1, publishedDate: -1 });
    res.json({ blogs });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single blog (public route)
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single blog (admin route)
router.get('/blogs/admin/:id', verifyAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new blog
router.post('/blogs', verifyAdmin, async (req, res) => {
  try {
    const { title, titleUrdu, excerpt, excerptUrdu, content, contentUrdu, image, author, authorUrdu, category, categoryUrdu, tags, publishedDate, order, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const blog = new Blog({
      title,
      titleUrdu: titleUrdu || '',
      excerpt: excerpt || '',
      excerptUrdu: excerptUrdu || '',
      content,
      contentUrdu: contentUrdu || '',
      image: image || '',
      author: author || '',
      authorUrdu: authorUrdu || '',
      category: category || '',
      categoryUrdu: categoryUrdu || '',
      tags: tags || [],
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update blog
router.put('/blogs/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, titleUrdu, excerpt, excerptUrdu, content, contentUrdu, image, author, authorUrdu, category, categoryUrdu, tags, publishedDate, order, isPublished } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (title) blog.title = title;
    if (titleUrdu !== undefined) blog.titleUrdu = titleUrdu;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (excerptUrdu !== undefined) blog.excerptUrdu = excerptUrdu;
    if (content) blog.content = content;
    if (contentUrdu !== undefined) blog.contentUrdu = contentUrdu;
    if (image !== undefined) blog.image = image;
    if (author !== undefined) blog.author = author;
    if (authorUrdu !== undefined) blog.authorUrdu = authorUrdu;
    if (category !== undefined) blog.category = category;
    if (categoryUrdu !== undefined) blog.categoryUrdu = categoryUrdu;
    if (tags !== undefined) blog.tags = tags;
    if (publishedDate) blog.publishedDate = new Date(publishedDate);
    if (order !== undefined) blog.order = order;
    if (typeof isPublished === 'boolean') blog.isPublished = isPublished;

    await blog.save();

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete blog
router.delete('/blogs/:id', verifyAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

