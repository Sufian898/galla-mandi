const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// ------------------ CORS FIX (Vercel Compatible) ------------------
const allowedOrigins = [
  "https://atsjourney.com",
  "https://www.atsjourney.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// ------------------ EXPRESS ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------ MONGODB (Cached for Vercel) ------------------
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/?appName=Cluster0";

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => {
        console.log("MongoDB Connected Successfully");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB Error:", err);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB();

// ------------------ ROUTES ------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/company", require("./routes/company"));
app.use("/api/bill", require("./routes/bill"));
app.use("/api/sale", require("./routes/sale"));
app.use("/api/recovery", require("./routes/recovery"));
app.use("/api/ledger", require("./routes/ledger"));
app.use("/api/expense-ledger", require("./routes/expenseLedger"));
app.use("/api/payment-method", require("./routes/paymentMethod"));
app.use("/api/bank", require("./routes/bank"));

// ------------------ HEALTH CHECK ------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server running fine" });
});

// ------------------ ROOT ------------------
app.get("/", (req, res) => {
  res.json({ message: "Bexon Backend API" });
});

// ------------------ LOCAL SERVER ONLY ------------------
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
