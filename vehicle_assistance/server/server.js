const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const seedData = require('./seed');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const technicianRoutes = require('./routes/technicianRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/technician', technicianRoutes);

// Catch-all route to serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 5000;

// Initialize Database & Start Server
const startServer = async () => {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚗 Roadside Breakdown Assistance Server is Running!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
};

startServer();
