const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    default: 'Independent Garage'
  },
  location: {
    address: { type: String, default: 'Downtown Service Center' },
    lat: { type: Number, default: 28.6150 },
    lng: { type: Number, default: 77.2100 }
  },
  charges: {
    baseFee: { type: Number, required: true, default: 350 }, // in currency unit (e.g. INR / USD)
    ratePerKm: { type: Number, default: 25 }
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    required: true,
    default: 15
  },
  skills: [{
    type: String,
    enum: [
      'Engine Repair',
      'Flat Tire & Replacement',
      'Battery Jumpstart & Replace',
      'Towing Service',
      'Fuel Delivery',
      'Brake & Clutch Repair',
      'Lockout Assistance',
      'EV Charging & Diagnostics'
    ]
  }],
  vehicleTypes: [{
    type: String,
    enum: [
      '2-Wheeler',
      'Car / Sedan / SUV',
      'Truck / Bus',
      'Electric Vehicle (EV)'
    ]
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.8
  },
  totalRepairsCompleted: {
    type: Number,
    default: 24
  },
  role: {
    type: String,
    default: 'technician'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Technician', technicianSchema);
