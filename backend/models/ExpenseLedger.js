const mongoose = require('mongoose');

const expenseLedgerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  travellingExpense: {
    type: Number,
    default: 0,
    min: 0
  },
  refreshment: {
    type: Number,
    default: 0,
    min: 0
  },
  cargo: {
    type: Number,
    default: 0,
    min: 0
  },
  salaryExpense: {
    type: Number,
    default: 0,
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
  }
}, {
  timestamps: true
});

// Calculate total expense
expenseLedgerSchema.virtual('totalExpense').get(function() {
  return (this.travellingExpense || 0) + 
         (this.refreshment || 0) + 
         (this.cargo || 0) + 
         (this.salaryExpense || 0);
});

module.exports = mongoose.model('ExpenseLedger', expenseLedgerSchema);


