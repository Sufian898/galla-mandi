const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  serialNumber: {
    type: String,
    default: ''
  },
  supplierName: {
    type: String,
    default: ''
  },
  supplierNameUrdu: {
    type: String,
    default: ''
  },
  supplierVehicleNumber: {
    type: String,
    default: ''
  },
  sellerName: {
    type: String,
    default: ''
  },
  sellerNameUrdu: {
    type: String,
    default: ''
  },
  sellerNumber: {
    type: String,
    default: ''
  },
  customerPartyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LedgerParty',
    default: null
  },
  items: [{
    description: {
      type: String,
      default: ''
    },
    descriptionUrdu: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      default: 0
    },
    ratePerUnit: {
      type: Number,
      default: 0
    },
    lineTotal: {
      type: Number,
      default: 0
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  salesTax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: ''
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);

