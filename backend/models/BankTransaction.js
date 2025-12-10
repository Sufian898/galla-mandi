const mongoose = require('mongoose');

const bankTransactionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    default: null
  },
  recoveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recovery',
    default: null
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseLedger',
    default: null
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  descriptionUrdu: {
    type: String,
    default: ''
  },
  balanceAfter: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankTransaction', bankTransactionSchema);

