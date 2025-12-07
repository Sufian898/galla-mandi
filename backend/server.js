const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://atsjourney.com',
  'https://www.atsjourney.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Normalize origin (remove trailing slash, convert to lowercase for comparison)
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(o => o.toLowerCase().replace(/\/$/, ''));
    
    // Check if origin is in allowed list (case-insensitive)
    if (normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true);
    } else {
      // Log the blocked origin for debugging
      console.log('CORS blocked origin:', origin);
      // Allow for now to test - you can restrict this later
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Debug middleware to log requests (remove in production if not needed)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// MongoDB Connection (optimized for serverless)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Company';

// Cache the connection to reuse in serverless environment
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected Successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB Connection Error:', e);
    throw e;
  }

  return cached.conn;
}

// Connect to MongoDB
connectDB().catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Bexon Backend API' });
});

// Only listen if not in serverless environment (Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

