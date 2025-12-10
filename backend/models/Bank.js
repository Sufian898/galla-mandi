const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  bankNameUrdu: {
    type: String,
    default: '',
    trim: true
  },
  accountNumber: {
    type: String,
    default: '',
    trim: true
  },
  accountTitle: {
    type: String,
    default: '',
    trim: true
  },
  branchName: {
    type: String,
    default: '',
    trim: true
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdminManaged: {
    type: Boolean,
    default: false
  },
  addedByAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bank', bankSchema);

