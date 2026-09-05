const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');
const AssistanceRequest = require('../models/AssistanceRequest');
const { isDbConnected, memoryStore, calculateDistance } = require('../store/memoryStore');

// GET nearby technicians with calculated distance, fees, and ETA
router.get('/technicians', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.userLat) || 28.6139;
    const userLng = parseFloat(req.query.userLng) || 77.2090;
    const vehicleTypeFilter = req.query.vehicleType;
    const skillFilter = req.query.skill;
    const maxDistance = req.query.maxDistance ? parseFloat(req.query.maxDistance) : null;
    const maxCharges = req.query.maxCharges ? parseFloat(req.query.maxCharges) : null;

    let rawTechs = [];

    if (isDbConnected()) {
      rawTechs = await Technician.find({ isAvailable: true }).lean();
    } else {
      rawTechs = memoryStore.technicians.filter(t => t.isAvailable);
    }

    // Transform and enrich technicians with computed distance, fee, wait time
    let enriched = rawTechs.map(tech => {
      const techLat = tech.location ? tech.location.lat : 28.6150;
      const techLng = tech.location ? tech.location.lng : 77.2100;
      const distance = calculateDistance(userLat, userLng, techLat, techLng);

      const baseFee = tech.charges ? (tech.charges.baseFee || 350) : 350;
      const ratePerKm = tech.charges ? (tech.charges.ratePerKm || 25) : 25;
      const totalCharges = Math.round(baseFee + (ratePerKm * distance));
      
      // Dynamic waiting time based on technician base wait time + travel time (approx 2 mins per km)
      const baseWait = tech.estimatedWaitTime || 15;
      const travelTime = Math.round(distance * 2.5);
      const computedWaitTime = baseWait + travelTime;

      return {
        _id: tech._id || tech.id,
        id: tech._id || tech.id,
        name: tech.name,
        email: tech.email,
        phone: tech.phone,
        businessName: tech.businessName || 'Independent Garage',
        location: tech.location,
        charges: tech.charges,
        baseFee,
        ratePerKm,
        totalCharges,
        estimatedWaitTime: tech.estimatedWaitTime,
        computedWaitTime,
        distanceKm: distance,
        skills: tech.skills || [],
        vehicleTypes: tech.vehicleTypes || [],
        isAvailable: tech.isAvailable,
        rating: tech.rating || 4.8,
        totalRepairsCompleted: tech.totalRepairsCompleted || 15
      };
    });

    // Apply Filters
    if (vehicleTypeFilter && vehicleTypeFilter !== 'All') {
      enriched = enriched.filter(t => t.vehicleTypes.includes(vehicleTypeFilter));
    }
    if (skillFilter && skillFilter !== 'All') {
      enriched = enriched.filter(t => t.skills.includes(skillFilter));
    }
    if (maxDistance) {
      enriched = enriched.filter(t => t.distanceKm <= maxDistance);
    }
    if (maxCharges) {
      enriched = enriched.filter(t => t.totalCharges <= maxCharges);
    }

    // Sort by distance ascending by default
    enriched.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ success: true, count: enriched.length, technicians: enriched });
  } catch (err) {
    console.error('Error fetching technicians:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve technicians.' });
  }
});

// POST request roadside assistance
router.post('/request-assistance', async (req, res) => {
  try {
    const { userId, userName, userPhone, technicianId, vehicleType, problemType, problemDescription, userLat, userLng, userAddress } = req.body;

    if (!userId || !technicianId || !problemType || !userLat || !userLng) {
      return res.status(400).json({ success: false, message: 'Missing required request details.' });
    }

    // Get technician info for fee calculation
    let tech = null;
    if (isDbConnected()) {
      tech = await Technician.findById(technicianId);
    } else {
      tech = memoryStore.technicians.find(t => (t._id == technicianId || t.id == technicianId));
    }

    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technician not found.' });
    }

    const techLat = tech.location ? tech.location.lat : 28.6150;
    const techLng = tech.location ? tech.location.lng : 77.2100;
    const distanceKm = calculateDistance(parseFloat(userLat), parseFloat(userLng), techLat, techLng);
    const baseFee = tech.charges ? tech.charges.baseFee : 350;
    const ratePerKm = tech.charges ? tech.charges.ratePerKm : 25;
    const totalCharges = Math.round(baseFee + (ratePerKm * distanceKm));
    const estimatedWaitTime = (tech.estimatedWaitTime || 15) + Math.round(distanceKm * 2.5);

    const requestData = {
      userId,
      userName: userName || 'Vehicle Owner',
      userPhone: userPhone || 'Not provided',
      technicianId: tech._id || tech.id,
      technicianName: tech.name + ` (${tech.businessName})`,
      vehicleType: vehicleType || 'Car / Sedan / SUV',
      problemType: problemType,
      problemDescription: problemDescription || '',
      userLocation: {
        address: userAddress || 'Emergency Breakdown Location',
        lat: parseFloat(userLat),
        lng: parseFloat(userLng)
      },
      distanceKm,
      totalCharges,
      estimatedWaitTime,
      status: 'pending',
      createdAt: new Date()
    };

    let newReq = null;
    if (isDbConnected()) {
      const doc = new AssistanceRequest(requestData);
      newReq = await doc.save();
    } else {
      const id = 'req_' + Date.now();
      newReq = { id, _id: id, ...requestData };
      memoryStore.requests.push(newReq);
    }

    res.json({ success: true, message: 'Breakdown assistance request sent to technician!', request: newReq });
  } catch (err) {
    console.error('Error creating assistance request:', err);
    res.status(500).json({ success: false, message: 'Failed to create breakdown assistance request.' });
  }
});

// GET user request history & active status
router.get('/requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let requests = [];

    if (isDbConnected()) {
      requests = await AssistanceRequest.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      requests = memoryStore.requests.filter(r => r.userId == userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching user requests:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch request history.' });
  }
});

module.exports = router;
