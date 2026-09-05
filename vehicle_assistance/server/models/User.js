const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  location: {
    address: { type: String, default: 'Default City Center' },
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 }
  },
  vehicleDetails: {
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    vehicleType: { 
      type: String, 
      enum: ['2-Wheeler', 'Car / Sedan / SUV', 'Truck / Bus', 'Electric Vehicle (EV)'],
      default: 'Car / Sedan / SUV'
    },
    licensePlate: { type: String, default: '' }
  },
  role: {
    type: String,
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
