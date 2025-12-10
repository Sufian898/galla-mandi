const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleUrdu: {
    type: String,
    default: '',
    trim: true
  },
  excerpt: {
    type: String,
    default: '',
    trim: true
  },
  excerptUrdu: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  contentUrdu: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: '',
    trim: true
  },
  authorUrdu: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    default: '',
    trim: true
  },
  categoryUrdu: {
    type: String,
    default: '',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  publishedDate: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);

