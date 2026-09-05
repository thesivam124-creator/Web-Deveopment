const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');
const AssistanceRequest = require('../models/AssistanceRequest');
const { isDbConnected, memoryStore } = require('../store/memoryStore');

// GET technician profile details
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let tech = null;

    if (isDbConnected()) {
      tech = await Technician.findById(id).lean();
    } else {
      tech = memoryStore.technicians.find(t => (t._id == id || t.id == id));
    }

    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technician profile not found.' });
    }

    res.json({ success: true, technician: tech });
  } catch (err) {
    console.error('Error fetching technician profile:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
});

// UPDATE technician profile (charges, wait time, skills, vehicle types, location, availability)
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessName, phone, baseFee, ratePerKm, estimatedWaitTime, skills, vehicleTypes, isAvailable, address, lat, lng } = req.body;

    const updateFields = {};
    if (businessName !== undefined) updateFields.businessName = businessName;
    if (phone !== undefined) updateFields.phone = phone;
    if (isAvailable !== undefined) updateFields.isAvailable = Boolean(isAvailable);
    if (estimatedWaitTime !== undefined) updateFields.estimatedWaitTime = parseInt(estimatedWaitTime);
    if (skills !== undefined) updateFields.skills = Array.isArray(skills) ? skills : skills.split(',');
    if (vehicleTypes !== undefined) updateFields.vehicleTypes = Array.isArray(vehicleTypes) ? vehicleTypes : vehicleTypes.split(',');

    if (baseFee !== undefined || ratePerKm !== undefined) {
      updateFields.charges = {
        baseFee: baseFee !== undefined ? parseFloat(baseFee) : 350,
        ratePerKm: ratePerKm !== undefined ? parseFloat(ratePerKm) : 25
      };
    }

    if (address !== undefined || lat !== undefined || lng !== undefined) {
      updateFields.location = {
        address: address || 'Service Location',
        lat: lat ? parseFloat(lat) : 28.6140,
        lng: lng ? parseFloat(lng) : 77.2100
      };
    }

    let updatedTech = null;

    if (isDbConnected()) {
      updatedTech = await Technician.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    } else {
      const idx = memoryStore.technicians.findIndex(t => (t._id == id || t.id == id));
      if (idx !== -1) {
        memoryStore.technicians[idx] = {
          ...memoryStore.technicians[idx],
          ...updateFields,
          charges: updateFields.charges ? { ...memoryStore.technicians[idx].charges, ...updateFields.charges } : memoryStore.technicians[idx].charges,
          location: updateFields.location ? { ...memoryStore.technicians[idx].location, ...updateFields.location } : memoryStore.technicians[idx].location
        };
        updatedTech = memoryStore.technicians[idx];
      }
    }

    if (!updatedTech) {
      return res.status(404).json({ success: false, message: 'Technician not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully!', technician: updatedTech });
  } catch (err) {
    console.error('Error updating technician profile:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// GET requests assigned to technician
router.get('/requests/:technicianId', async (req, res) => {
  try {
    const { technicianId } = req.params;
    let requests = [];

    if (isDbConnected()) {
      requests = await AssistanceRequest.find({ technicianId }).sort({ createdAt: -1 }).lean();
    } else {
      requests = memoryStore.requests.filter(r => (r.technicianId == technicianId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching technician requests:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve requests.' });
  }
});

// PATCH update status of assistance request
router.patch('/request/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'in_transit', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    let updatedReq = null;

    if (isDbConnected()) {
      updatedReq = await AssistanceRequest.findByIdAndUpdate(requestId, { status }, { new: true });
    } else {
      const idx = memoryStore.requests.findIndex(r => (r._id == requestId || r.id == requestId));
      if (idx !== -1) {
        memoryStore.requests[idx].status = status;
        updatedReq = memoryStore.requests[idx];
      }
    }

    if (!updatedReq) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.json({ success: true, message: `Request status updated to ${status}`, request: updatedReq });
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

module.exports = router;
