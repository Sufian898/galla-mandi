const mongoose = require('mongoose');

const recognitionSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
    trim: true
  },
  descriptionUrdu: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    required: true,
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
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recognition', recognitionSchema);

