const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Technician = require('../models/Technician');
const { isDbConnected, memoryStore } = require('../store/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_roadside_assistance_key_2026';

// Register User
router.post('/user/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, lat, lng, vehicleMake, vehicleModel, vehicleType, licensePlate } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      location: {
        address: address || 'Current Location',
        lat: parseFloat(lat) || 28.6139,
        lng: parseFloat(lng) || 77.2090
      },
      vehicleDetails: {
        make: vehicleMake || '',
        model: vehicleModel || '',
        vehicleType: vehicleType || 'Car / Sedan / SUV',
        licensePlate: licensePlate || ''
      },
      role: 'user'
    };

    if (isDbConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User email already registered.' });
      }
      const user = new User(userData);
      await user.save();
      
      const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, vehicleDetails: user.vehicleDetails, location: user.location, role: 'user' } });
    } else {
      // Fallback In-Memory
      const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'User email already registered.' });
      }
      const id = 'usr_' + Date.now();
      const newUser = { id, _id: id, ...userData };
      memoryStore.users.push(newUser);

      const token = jwt.sign({ id: newUser.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, vehicleDetails: newUser.vehicleDetails, location: newUser.location, role: 'user' } });
    }
  } catch (err) {
    console.error('User register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login User
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, vehicleDetails: user.vehicleDetails, location: user.location, role: 'user' } });
    } else {
      const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, vehicleDetails: user.vehicleDetails, location: user.location, role: 'user' } });
    }
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Register Technician
router.post('/technician/register', async (req, res) => {
  try {
    const { name, email, password, phone, businessName, address, lat, lng, baseFee, ratePerKm, estimatedWaitTime, skills, vehicleTypes } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please enter required fields.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const techData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      businessName: businessName || `${name}'s Garage`,
      location: {
        address: address || 'City Service Center',
        lat: parseFloat(lat) || 28.6140,
        lng: parseFloat(lng) || 77.2100
      },
      charges: {
        baseFee: parseFloat(baseFee) || 350,
        ratePerKm: parseFloat(ratePerKm) || 25
      },
      estimatedWaitTime: parseInt(estimatedWaitTime) || 15,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',') : ['Engine Repair', 'Flat Tire & Replacement', 'Battery Jumpstart & Replace']),
      vehicleTypes: Array.isArray(vehicleTypes) ? vehicleTypes : (vehicleTypes ? vehicleTypes.split(',') : ['2-Wheeler', 'Car / Sedan / SUV', 'Truck / Bus', 'Electric Vehicle (EV)']),
      isAvailable: true,
      rating: 4.9,
      totalRepairsCompleted: 10,
      role: 'technician'
    };

    if (isDbConnected()) {
      const existing = await Technician.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Technician email already registered.' });
      }
      const tech = new Technician(techData);
      await tech.save();

      const token = jwt.sign({ id: tech._id, role: 'technician' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, technician: tech });
    } else {
      const existing = memoryStore.technicians.find(t => t.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'Technician email already registered.' });
      }
      const id = 'tech_' + Date.now();
      const newTech = { id, _id: id, ...techData };
      memoryStore.technicians.push(newTech);

      const token = jwt.sign({ id: newTech.id, role: 'technician' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, technician: newTech });
    }
  } catch (err) {
    console.error('Technician register error:', err);
    res.status(500).json({ success: false, message: 'Server error during technician registration.' });
  }
});

// Login Technician
router.post('/technician/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (isDbConnected()) {
      const tech = await Technician.findOne({ email: email.toLowerCase() });
      if (!tech) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }
      const isMatch = await bcrypt.compare(password, tech.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: tech._id, role: 'technician' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, technician: tech });
    } else {
      const tech = memoryStore.technicians.find(t => t.email.toLowerCase() === email.toLowerCase());
      if (!tech) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }
      const isMatch = await bcrypt.compare(password, tech.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: tech.id, role: 'technician' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, technician: tech });
    }
  } catch (err) {
    console.error('Technician login error:', err);
    res.status(500).json({ success: false, message: 'Server error during technician login.' });
  }
});

module.exports = router;
