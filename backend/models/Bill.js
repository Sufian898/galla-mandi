const mongoose = require('mongoose');

const billFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true
  },
  fieldNameUrdu: {
    type: String,
    default: ''
  },
  fieldType: {
    type: String,
    enum: ['text', 'number', 'date', 'textarea'],
    default: 'text'
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  _id: true
});

const billSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  serialNumber: {
    type: String,
    default: ''
  },
  voucherNumber: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    default: ''
  },
  customerNameUrdu: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  receivedMessage: {
    type: String,
    default: 'Received, thanks for selling'
  },
  receivedMessageUrdu: {
    type: String,
    default: 'وصول ہوا ہے بیجنے کا شکریہ'
  },
  goodsMessage: {
    type: String,
    default: 'Your goods via consignment/bill of lading'
  },
  goodsMessageUrdu: {
    type: String,
    default: 'آپکا مال بذریعہ بلٹی'
  },
  // Dynamic fields for expenses
  expenseFields: [billFieldSchema],
  // Dynamic fields for sales
  salesFields: [billFieldSchema],
  // Expense values
  expenses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Sales values
  sales: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Bill template settings
  templateSettings: {
    companyName: {
      type: String,
      default: ''
    },
    companyNameUrdu: {
      type: String,
      default: ''
    },
    businessType: {
      type: String,
      default: 'Fruit Commission Agent'
    },
    businessTypeUrdu: {
      type: String,
      default: 'فروٹ کمیشن ایجنٹ'
    },
    logo: {
      type: String,
      default: ''
    },
    logoType: {
      type: String,
      enum: ['link', 'upload'],
      default: 'link'
    },
    trademark: {
      type: String,
      default: ''
    },
    trademarkUrdu: {
      type: String,
      default: 'ٹریڈ مارک'
    },
    address: {
      type: String,
      default: ''
    },
    addressUrdu: {
      type: String,
      default: ''
    },
    contactInfo: [{
      name: String,
      nameUrdu: String,
      phone: String
    }],
    headerBackground: {
      type: String,
      enum: ['gradient', 'solid', 'image'],
      default: 'gradient'
    },
    headerBackgroundColor: {
      type: String,
      default: '#4f46e5'
    },
    headerBackgroundImage: {
      type: String,
      default: ''
    }
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  rawSale: {
    type: Number,
    default: 0
  },
  netSale: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);

