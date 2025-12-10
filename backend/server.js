const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Allowed Origins
const allowedOrigins = [
  'https://atsjourney.com',
  'https://www.atsjourney.com',
  'http://localhost:3000',
  'https://easycomission.com',
'https://www.easycomission.com',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

// --- FIXED CORS (Vercel-Compatible) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Additional express settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MongoDB Connection ---
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0';

let cached = global.mongoose || { conn: null, promise: null };

if (!cached.promise) {
  cached.promise = mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB Connected Successfully');
      return mongoose;
    })
    .catch((err) => {
      console.error('MongoDB Error:', err);
    });
}

cached.conn = cached.promise;
global.mongoose = cached;

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/company', require('./routes/company'));
app.use('/api/bill', require('./routes/bill'));
app.use('/api/sale', require('./routes/sale'));
app.use('/api/recovery', require('./routes/recovery'));
app.use('/api/ledger', require('./routes/ledger'));
app.use('/api/expense-ledger', require('./routes/expenseLedger'));
app.use('/api/payment-method', require('./routes/paymentMethod'));
app.use('/api/bank', require('./routes/bank'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Bexon Backend API' });
});

// Local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
