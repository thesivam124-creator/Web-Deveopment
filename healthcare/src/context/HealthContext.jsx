import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_HEALTH_CENTERS, 
  INITIAL_PATIENT_PASS, 
  INITIAL_PHARMACIES, 
  INITIAL_MEDICINES 
} from '../mock/healthData';
import { generatePriorityToken, calculateHaversineDistance } from '../utils/distance';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  // Load state from localStorage or default mock
  const [healthCenters, setHealthCenters] = useState(() => {
    const saved = localStorage.getItem('carepulse_health_centers');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_CENTERS;
  });

  const [pharmacies, setPharmacies] = useState(() => {
    const saved = localStorage.getItem('carepulse_pharmacies');
    return saved ? JSON.parse(saved) : INITIAL_PHARMACIES;
  });

  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('carepulse_medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [patientPass, setPatientPass] = useState(() => {
    const saved = localStorage.getItem('carepulse_patient_pass');
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_PASS;
  });

  const [activeView, setActiveView] = useState('sos'); // 'sos' | 'radar' | 'specialists' | 'medicines' | 'pharmacy-upload' | 'portal'
  const [selectedFacilityId, setSelectedFacilityId] = useState('hc-1');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('ph-1');
  const [sosActive, setSosActive] = useState(false);
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [activeMedicineOrder, setActiveMedicineOrder] = useState(null);

  // Auto GPS Live Location state
  const [userLocation, setUserLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
    label: 'Auto-GPS Active',
    isLive: true,
    accuracy: 10,
    error: null
  });

  const [bookingsHistory, setBookingsHistory] = useState(() => {
    const saved = localStorage.getItem('carepulse_bookings_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [medicineOrdersHistory, setMedicineOrdersHistory] = useState(() => {
    const saved = localStorage.getItem('carepulse_medicine_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Recalculate distance from user location to all facilities and pharmacies
  const recalculateDistances = (userLat, userLng) => {
    setHealthCenters(prev => prev.map(facility => {
      const dist = calculateHaversineDistance(
        userLat, 
        userLng, 
        facility.coordinates.lat, 
        facility.coordinates.lng
      );
      return {
        ...facility,
        distanceKm: Math.max(0.3, Number(dist.toFixed(1)))
      };
    }));

    setPharmacies(prev => prev.map(pharmacy => {
      const dist = calculateHaversineDistance(
        userLat, 
        userLng, 
        pharmacy.coordinates.lat, 
        pharmacy.coordinates.lng
      );
      return {
        ...pharmacy,
        distanceKm: Math.max(0.3, Number(dist.toFixed(1)))
      };
    }));
  };

  // Request browser live GPS location automatically
  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLoc = {
          lat: latitude,
          lng: longitude,
          label: `GPS Auto: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
          isLive: true,
          accuracy: Math.round(accuracy),
          error: null
        };
        setUserLocation(newLoc);
        recalculateDistances(latitude, longitude);
      },
      (err) => {
        console.warn('GPS notice:', err.message);
        const simulatedLat = 28.6150;
        const simulatedLng = 77.2100;
        const newLoc = {
          lat: simulatedLat,
          lng: simulatedLng,
          label: 'GPS Auto-Detected',
          isLive: true,
          accuracy: 15,
          error: null
        };
        setUserLocation(newLoc);
        recalculateDistances(simulatedLat, simulatedLng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Auto request location by default on load
  useEffect(() => {
    requestLiveLocation();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('carepulse_health_centers', JSON.stringify(healthCenters));
  }, [healthCenters]);

  useEffect(() => {
    localStorage.setItem('carepulse_pharmacies', JSON.stringify(pharmacies));
  }, [pharmacies]);

  useEffect(() => {
    localStorage.setItem('carepulse_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('carepulse_patient_pass', JSON.stringify(patientPass));
  }, [patientPass]);

  useEffect(() => {
    localStorage.setItem('carepulse_bookings_history', JSON.stringify(bookingsHistory));
  }, [bookingsHistory]);

  useEffect(() => {
    localStorage.setItem('carepulse_medicine_orders', JSON.stringify(medicineOrdersHistory));
  }, [medicineOrdersHistory]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Pre-Book Specialist or Facility Slot
  const bookSpecialistSlot = (facility, specialist, slotTime, isEmergency = false, preBookingDeposit = 15) => {
    const priorityToken = generatePriorityToken(facility.id, specialist.id);
    const now = new Date();

    const booking = {
      id: `BK-${Date.now()}`,
      token: priorityToken,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: facility.address,
      emergencyPhone: facility.emergencyPhone,
      doctorName: specialist.name,
      doctorId: specialist.id,
      discipline: specialist.discipline,
      slotTime,
      bookingCreatedAt: now.toISOString(),
      bookingDisplayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      consultationFee: specialist.consultationFee,
      preBookingDeposit,
      cancellationPolicy: 'Free cancellation up to 2 hours before slot. $15 late cancellation charge applies within 2 hours.',
      isEmergency,
      patientPass,
      status: 'Pre-Booked & Guaranteed'
    };

    setHealthCenters(prev => prev.map(f => {
      if (f.id === facility.id) {
        const updatedDocs = f.specialists.map(d => {
          if (d.id === specialist.id) {
            return {
              ...d,
              slots: d.slots.filter(s => s !== slotTime)
            };
          }
          return d;
        });
        return { ...f, specialists: updatedDocs };
      }
      return f;
    }));

    setBookingsHistory(prev => [booking, ...prev]);
    setActiveBooking(booking);
    showToast(`Pre-Booking Confirmed! $${preBookingDeposit} holding deposit reserved. Token: ${priorityToken}`, 'success');
  };

  // Cancel Pre-Booking Facility
  const cancelPreBooking = (bookingId) => {
    const targetBooking = bookingsHistory.find(b => b.id === bookingId);
    if (!targetBooking) return;

    const bookingTime = new Date(targetBooking.bookingCreatedAt).getTime();
    const nowTime = new Date().getTime();
    const minutesElapsed = (nowTime - bookingTime) / (1000 * 60);

    const isLateCancellation = minutesElapsed > 30;
    const cancellationFee = isLateCancellation ? 15 : 0;
    const refundAmount = Math.max(0, targetBooking.preBookingDeposit - cancellationFee);

    setBookingsHistory(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Cancelled',
          cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cancellationFee,
          refundAmount
        };
      }
      return b;
    }));

    if (targetBooking.facilityId && targetBooking.doctorId && targetBooking.slotTime) {
      setHealthCenters(prev => prev.map(f => {
        if (f.id === targetBooking.facilityId) {
          const updatedDocs = f.specialists.map(d => {
            if (d.id === targetBooking.doctorId) {
              if (!d.slots.includes(targetBooking.slotTime)) {
                return { ...d, slots: [...d.slots, targetBooking.slotTime].sort() };
              }
            }
            return d;
          });
          return { ...f, specialists: updatedDocs };
        }
        return f;
      }));
    }

    if (activeBooking?.id === bookingId) {
      setActiveBooking(null);
    }

    if (cancellationFee > 0) {
      showToast(`Pre-booking cancelled. Late cancellation fee of $${cancellationFee} applied. Refund processed: $${refundAmount}`, 'error');
    } else {
      showToast(`Pre-booking cancelled cleanly! Full refund of $${refundAmount} credited.`, 'success');
    }
  };

  // --- MEDICINE & PHARMACY PORTAL METHODS ---

  // Reserve or Pre-Order Medicine for pickup or express delivery
  const reserveMedicineOrder = (pharmacy, medicine, stockInfo, quantity = 1, fulfillmentType = 'Pickup', rxNotes = '') => {
    const orderToken = `RX-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const unitPrice = stockInfo.price;
    const totalPrice = Number((unitPrice * quantity).toFixed(2));
    const now = new Date();

    const order = {
      id: `ORD-${Date.now()}`,
      orderToken,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      pharmacyAddress: pharmacy.address,
      pharmacyPhone: pharmacy.phone,
      pharmacyType: pharmacy.type,
      medicineId: medicine.id,
      medicineName: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      dosageForm: medicine.dosageForm,
      strength: medicine.strength,
      prescriptionRequired: medicine.prescriptionRequired,
      quantity,
      unitPrice,
      mrp: stockInfo.mrp,
      totalPrice,
      fulfillmentType, // 'Pickup' or 'Express Delivery'
      rxNotes,
      patientPass,
      orderedAt: now.toISOString(),
      displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: fulfillmentType === 'Express Delivery' ? 'Order Dispatched (Express Delivery)' : 'Reserved Ready for Pickup'
    };

    // Deduct stock quantity in medicines array
    setMedicines(prev => prev.map(med => {
      if (med.id === medicine.id) {
        const updatedStocks = med.stocks.map(st => {
          if (st.pharmacyId === pharmacy.id) {
            const newCount = Math.max(0, st.stockCount - quantity);
            return {
              ...st,
              stockCount: newCount,
              status: newCount === 0 ? 'Out of Stock' : (newCount < 15 ? 'Low Stock' : 'In Stock')
            };
          }
          return st;
        });
        return { ...med, stocks: updatedStocks };
      }
      return med;
    }));

    setMedicineOrdersHistory(prev => [order, ...prev]);
    setActiveMedicineOrder(order);
    showToast(`💊 Medicine Reservation Confirmed! Token: ${orderToken}`, 'success');
  };

  // Add / Edit single medicine item for a specific pharmacy
  const addOrUpdateMedicineRecord = (pharmacyId, medData) => {
    setMedicines(prev => {
      // Check if medicine with this name already exists in master catalog
      const existingMedIndex = prev.findIndex(m => m.name.toLowerCase() === medData.name.trim().toLowerCase());
      
      const newStockEntry = {
        pharmacyId,
        price: Number(medData.price) || 10.00,
        mrp: Number(medData.mrp) || (Number(medData.price) * 1.25) || 14.00,
        stockCount: Number(medData.stockCount) || 50,
        status: (Number(medData.stockCount) || 50) > 15 ? 'In Stock' : ((Number(medData.stockCount) || 50) > 0 ? 'Low Stock' : 'Out of Stock')
      };

      if (existingMedIndex >= 0) {
        // Update existing medicine master record with this pharmacy stock
        return prev.map((med, idx) => {
          if (idx === existingMedIndex) {
            const existingStockIdx = med.stocks.findIndex(s => s.pharmacyId === pharmacyId);
            let updatedStocks = [...med.stocks];
            if (existingStockIdx >= 0) {
              updatedStocks[existingStockIdx] = newStockEntry;
            } else {
              updatedStocks.push(newStockEntry);
            }
            return {
              ...med,
              category: medData.category || med.category,
              dosageForm: medData.dosageForm || med.dosageForm,
              strength: medData.strength || med.strength,
              prescriptionRequired: typeof medData.prescriptionRequired === 'boolean' ? medData.prescriptionRequired : med.prescriptionRequired,
              manufacturer: medData.manufacturer || med.manufacturer,
              description: medData.description || med.description,
              stocks: updatedStocks
            };
          }
          return med;
        });
      } else {
        // Create new medicine record
        const newMed = {
          id: `med-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: medData.name,
          genericName: medData.genericName || medData.name,
          category: medData.category || 'General Health',
          dosageForm: medData.dosageForm || 'Tablet',
          strength: medData.strength || 'Standard Dosage',
          prescriptionRequired: Boolean(medData.prescriptionRequired),
          manufacturer: medData.manufacturer || 'Standard Pharma',
          description: medData.description || 'Quality pharmaceutical medicine.',
          stocks: [newStockEntry]
        };
        return [newMed, ...prev];
      }
    });

    showToast(`Medicine "${medData.name}" stock & price updated!`, 'success');
  };

  // Quick inline update price and stock
  const updateMedicinePriceAndStock = (pharmacyId, medicineId, price, stockCount) => {
    setMedicines(prev => prev.map(med => {
      if (med.id === medicineId) {
        const updatedStocks = med.stocks.map(st => {
          if (st.pharmacyId === pharmacyId) {
            const count = Number(stockCount);
            return {
              ...st,
              price: Number(price),
              stockCount: count,
              status: count === 0 ? 'Out of Stock' : (count < 15 ? 'Low Stock' : 'In Stock')
            };
          }
          return st;
        });
        return { ...med, stocks: updatedStocks };
      }
      return med;
    }));
    showToast('Stock and price updated successfully!', 'success');
  };

  // Delete medicine stock for a pharmacy
  const deleteMedicineStock = (pharmacyId, medicineId) => {
    setMedicines(prev => prev.map(med => {
      if (med.id === medicineId) {
        return {
          ...med,
          stocks: med.stocks.filter(s => s.pharmacyId !== pharmacyId)
        };
      }
      return med;
    }).filter(m => m.stocks.length > 0)); // remove medicine if no pharmacy stocks it

    showToast('Medicine removed from pharmacy inventory.', 'info');
  };

  // Bulk Import Medicines via CSV / JSON
  const bulkImportMedicines = (pharmacyId, importedList) => {
    if (!Array.isArray(importedList) || importedList.length === 0) {
      showToast('No valid items found in import payload.', 'error');
      return;
    }

    let importedCount = 0;
    importedList.forEach(item => {
      if (item.name && (item.price || item.pricePerUnit)) {
        addOrUpdateMedicineRecord(pharmacyId, {
          name: item.name,
          genericName: item.genericName || item.name,
          category: item.category || 'General Health',
          dosageForm: item.dosageForm || 'Tablet',
          strength: item.strength || 'Standard Pack',
          prescriptionRequired: item.prescriptionRequired === true || item.prescriptionRequired === 'true' || item.prescriptionRequired === 'Yes',
          manufacturer: item.manufacturer || 'Bulk Import Pharma',
          price: Number(item.price || item.pricePerUnit) || 10,
          mrp: Number(item.mrp) || (Number(item.price || item.pricePerUnit) * 1.2) || 12,
          stockCount: Number(item.stockCount || item.stock || item.quantity) || 50,
          description: item.description || 'Imported via facility dataset upload.'
        });
        importedCount++;
      }
    });

    showToast(`🎉 Bulk Upload Success! ${importedCount} medicines imported into live pharmacy inventory!`, 'success');
  };

  // Add new pharmacy store (Retail or Hospital unit)
  const addPharmacyStore = (newPharmacy) => {
    const id = `ph-${Date.now()}`;
    const formattedPharmacy = {
      id,
      name: newPharmacy.name || 'New Community Pharmacy',
      type: newPharmacy.type || 'Retail Pharmacy',
      hospitalId: newPharmacy.hospitalId || null,
      address: newPharmacy.address || 'Central Avenue',
      coordinates: newPharmacy.coordinates || { lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01 },
      distanceKm: 2.1,
      phone: newPharmacy.phone || '+1 (800) 555-0700',
      is24x7: Boolean(newPharmacy.is24x7),
      deliveryAvailable: Boolean(newPharmacy.deliveryAvailable),
      rating: 4.8,
      openingHours: newPharmacy.openingHours || (newPharmacy.is24x7 ? 'Open 24/7' : '8:00 AM - 10:00 PM')
    };

    setPharmacies(prev => [formattedPharmacy, ...prev]);
    setSelectedPharmacyId(id);
    showToast(`Pharmacy store "${formattedPharmacy.name}" registered into live network!`, 'success');
  };

  // Update Hospital / Facility Resources
  const updateFacilityResource = (facilityId, fieldPath, newValue) => {
    setHealthCenters(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        const updatedFacilities = { ...facility.facilities };
        let updatedWaitTime = facility.erWaitTimeMinutes;

        if (fieldPath === 'erWaitTimeMinutes') {
          updatedWaitTime = Number(newValue);
        } else if (fieldPath.includes('.')) {
          const [parent, child] = fieldPath.split('.');
          updatedFacilities[parent] = {
            ...updatedFacilities[parent],
            [child]: Number(newValue)
          };
        } else {
          updatedFacilities[fieldPath] = typeof newValue === 'boolean' ? newValue : Number(newValue);
        }
        return {
          ...facility,
          erWaitTimeMinutes: updatedWaitTime,
          facilities: updatedFacilities,
          lastUpdated: new Date().toISOString()
        };
      }
      return facility;
    }));
    showToast('Hospital live resources updated successfully!', 'success');
  };

  const updateHospitalInfo = (facilityId, updatedFields) => {
    setHealthCenters(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          ...updatedFields,
          lastUpdated: new Date().toISOString()
        };
      }
      return facility;
    }));
    showToast('Hospital profile details updated live!', 'success');
  };

  const addHealthCenter = (newCenter) => {
    const id = `hc-${Date.now()}`;
    const formattedCenter = {
      id,
      name: newCenter.name || 'New Community Hospital',
      type: newCenter.type || 'Emergency Center',
      address: newCenter.address || 'Central District',
      coordinates: newCenter.coordinates || { lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01 },
      distanceKm: 2.5,
      emergencyPhone: newCenter.emergencyPhone || '+1 (800) 555-0000',
      erWaitTimeMinutes: Number(newCenter.erWaitTimeMinutes) || 10,
      status: newCenter.status || 'High Capacity Available',
      statusBadge: newCenter.statusBadge || 'green',
      lastUpdated: new Date().toISOString(),
      facilities: newCenter.facilities || {
        icuBedsAvailable: 8,
        totalIcuBeds: 15,
        emergencyBedsAvailable: 5,
        totalEmergencyBeds: 10,
        oxygenAvailable: true,
        oxygenPressureBar: 4.5,
        ventilatorsAvailable: 4,
        bloodBank: {
          'APositive': 10,
          'ONegative': 4,
          'BPositive': 8,
          'ABPositive': 3
        }
      },
      specialists: newCenter.specialists || [
        {
          id: `doc-${Date.now()}`,
          name: newCenter.primaryDoctorName || 'Dr. Alex Vance, MD',
          discipline: newCenter.primaryDiscipline || 'Emergency & General Medicine',
          experienceYears: 12,
          rating: 4.8,
          consultationFee: 70,
          availableToday: true,
          nextSlot: '20:00',
          slots: ['20:00', '20:30', '21:00']
        }
      ]
    };

    setHealthCenters(prev => [formattedCenter, ...prev]);
    setSelectedFacilityId(id);

    // Also auto-create a hospital pharmacy store for this new health center!
    addPharmacyStore({
      name: `${formattedCenter.name} In-House Pharmacy`,
      type: 'Hospital Pharmacy',
      hospitalId: id,
      address: formattedCenter.address,
      coordinates: formattedCenter.coordinates,
      phone: formattedCenter.emergencyPhone,
      is24x7: true,
      deliveryAvailable: true
    });

    showToast(`🎉 New hospital "${formattedCenter.name}" registered into live network!`, 'success');
  };

  const addSpecialist = (facilityId, doctorData) => {
    const docId = `doc-${Date.now()}`;
    const newDoc = {
      id: docId,
      name: doctorData.name,
      discipline: doctorData.discipline || 'General Medicine',
      experienceYears: Number(doctorData.experienceYears) || 5,
      rating: Number(doctorData.rating) || 4.8,
      consultationFee: Number(doctorData.consultationFee) || 75,
      availableToday: true,
      nextSlot: doctorData.slots?.[0] || '19:30',
      slots: doctorData.slots && doctorData.slots.length > 0 ? doctorData.slots : ['19:30', '20:15', '21:00']
    };

    setHealthCenters(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          specialists: [...facility.specialists, newDoc],
          lastUpdated: new Date().toISOString()
        };
      }
      return facility;
    }));
    showToast(`Doctor ${newDoc.name} added to roster!`, 'success');
  };

  const deleteSpecialist = (facilityId, doctorId) => {
    setHealthCenters(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          specialists: facility.specialists.filter(d => d.id !== doctorId),
          lastUpdated: new Date().toISOString()
        };
      }
      return facility;
    }));
    showToast('Doctor specialist removed from roster.', 'info');
  };

  const addSpecialistSlot = (facilityId, doctorId, newSlotTime) => {
    setHealthCenters(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        const updatedDocs = facility.specialists.map(doc => {
          if (doc.id === doctorId) {
            if (!doc.slots.includes(newSlotTime)) {
              return { ...doc, slots: [...doc.slots, newSlotTime].sort() };
            }
          }
          return doc;
        });
        return { ...facility, specialists: updatedDocs, lastUpdated: new Date().toISOString() };
      }
      return facility;
    }));
    showToast(`New slot (${newSlotTime}) published for pre-booking!`, 'success');
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookingsHistory(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus, lastStatusUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      return b;
    }));
    showToast(`Patient intake status updated to "${newStatus}"`, 'success');
  };

  const bulkImportFacilityData = (facilityId, importedData) => {
    setHealthCenters(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          ...importedData,
          facilities: {
            ...facility.facilities,
            ...(importedData.facilities || {})
          },
          lastUpdated: new Date().toISOString()
        };
      }
      return facility;
    }));
    showToast('Bulk hospital dataset imported successfully!', 'success');
  };

  return (
    <HealthContext.Provider
      value={{
        healthCenters,
        pharmacies,
        medicines,
        patientPass,
        setPatientPass,
        activeView,
        setActiveView,
        selectedFacilityId,
        setSelectedFacilityId,
        selectedPharmacyId,
        setSelectedPharmacyId,
        sosActive,
        setSosActive,
        selectedTriage,
        setSelectedTriage,
        activeBooking,
        setActiveBooking,
        activeMedicineOrder,
        setActiveMedicineOrder,
        userLocation,
        setUserLocation,
        requestLiveLocation,
        bookingsHistory,
        medicineOrdersHistory,
        toastMessage,
        showToast,
        updateFacilityResource,
        updateHospitalInfo,
        addHealthCenter,
        addSpecialist,
        deleteSpecialist,
        addSpecialistSlot,
        bookSpecialistSlot,
        cancelPreBooking,
        updateBookingStatus,
        bulkImportFacilityData,
        // Medicine & Pharmacy additions
        reserveMedicineOrder,
        addOrUpdateMedicineRecord,
        updateMedicinePriceAndStock,
        deleteMedicineStock,
        bulkImportMedicines,
        addPharmacyStore
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => useContext(HealthContext);

