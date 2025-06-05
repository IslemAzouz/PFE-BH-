// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const creditRoutes = require('./routes/creditRoutes');
const reclamationRoutes = require('./routes/reclamationRoutes');
const emailRoutes = require('./routes/emailRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Create contracts directory if it doesn't exist
const contractsDir = path.join(__dirname, 'contracts');
fs.ensureDirSync(contractsDir);

// Serve static files from the contracts directory
app.use('/contracts', express.static(contractsDir));

app.use('/api/auth', authRoutes);
app.use('/api/req', creditRoutes);
app.use('/api/rec', reclamationRoutes);
app.use('/api/email', emailRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});
