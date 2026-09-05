const mongoose = require('mongoose');

const assistanceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  technicianName: { type: String, required: true },
  vehicleType: { type: String, required: true },
  problemType: { type: String, required: true },
  problemDescription: { type: String, default: '' },
  userLocation: {
    address: { type: String, default: '' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  distanceKm: { type: Number, default: 0 },
  totalCharges: { type: Number, required: true },
  estimatedWaitTime: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AssistanceRequest', assistanceRequestSchema);
