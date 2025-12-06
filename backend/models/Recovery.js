const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  serialNumber: {
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
  customerVehicleNumber: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  recoveryAmount: {
    type: Number,
    default: 0
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
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recovery', recoverySchema);

