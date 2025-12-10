const mongoose = require('mongoose');

const ledgerPartySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameUrdu: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['customer', 'supplier'],
    required: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  balanceType: {
    type: String,
    enum: ['receivable', 'payable'],
    default: 'receivable' // receivable = we are owed (positive), payable = we owe (negative)
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LedgerParty', ledgerPartySchema);


