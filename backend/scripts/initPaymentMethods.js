const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PaymentMethod = require('../models/PaymentMethod');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'MONGODB_URI=mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0';

const defaultPaymentMethods = [
  {
    name: 'Easypaisa',
    nameUrdu: 'ایزی پیسہ',
    isActive: true,
    order: 1
  },
  {
    name: 'Punjab Bank',
    nameUrdu: 'پنجاب بینک',
    isActive: true,
    order: 2
  },
  {
    name: 'Nakad Raqam',
    nameUrdu: 'نقد رقم',
    isActive: true,
    order: 0
  }
];

async function initPaymentMethods() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Check if payment methods already exist
    const existingMethods = await PaymentMethod.find();
    
    if (existingMethods.length > 0) {
      console.log('Payment methods already exist. Skipping initialization.');
      console.log('Existing methods:', existingMethods.map(m => m.nameUrdu || m.name));
      process.exit(0);
    }

    // Insert default payment methods
    const inserted = await PaymentMethod.insertMany(defaultPaymentMethods);
    console.log('Default payment methods created successfully:');
    inserted.forEach(method => {
      console.log(`- ${method.nameUrdu || method.name} (${method.name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error initializing payment methods:', error);
    process.exit(1);
  }
}

initPaymentMethods();

