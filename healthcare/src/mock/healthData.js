export const INITIAL_HEALTH_CENTERS = [
  {
    id: 'hc-1',
    name: 'Apex City Trauma & Heart Institute',
    type: 'Super Specialty Hospital',
    address: '42 Health Boulevard, Central District',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    distanceKm: 1.2,
    emergencyPhone: '+1 (800) 555-0199',
    erWaitTimeMinutes: 5,
    status: 'High Capacity Available',
    statusBadge: 'green',
    lastUpdated: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    facilities: {
      icuBedsAvailable: 14,
      totalIcuBeds: 25,
      emergencyBedsAvailable: 8,
      totalEmergencyBeds: 12,
      oxygenAvailable: true,
      oxygenPressureBar: 4.8,
      ventilatorsAvailable: 6,
      bloodBank: {
        'APositive': 12,
        'ONegative': 4,
        'BPositive': 18,
        'ABPositive': 6
      }
    },
    specialists: [
      {
        id: 'doc-1',
        name: 'Dr. Sarah Jenkins, MD',
        discipline: 'Cardiology & Emergency Care',
        experienceYears: 16,
        rating: 4.9,
        consultationFee: 75,
        availableToday: true,
        nextSlot: '19:15',
        slots: ['19:15', '19:45', '20:30', '21:00']
      },
      {
        id: 'doc-2',
        name: 'Dr. Robert Vance, MS',
        discipline: 'Trauma & General Surgery',
        experienceYears: 20,
        rating: 4.8,
        consultationFee: 90,
        availableToday: true,
        nextSlot: '19:30',
        slots: ['19:30', '20:15', '21:15']
      }
    ]
  },
  {
    id: 'hc-2',
    name: 'St. Jude Emergency Medical Center',
    type: 'Emergency & Urgent Care',
    address: '109 Riverside Drive, West Ward',
    coordinates: { lat: 28.6210, lng: 77.2150 },
    distanceKm: 2.8,
    emergencyPhone: '+1 (800) 555-0244',
    erWaitTimeMinutes: 12,
    status: 'Moderate Capacity',
    statusBadge: 'yellow',
    facilities: {
      icuBedsAvailable: 4,
      totalIcuBeds: 15,
      emergencyBedsAvailable: 3,
      totalEmergencyBeds: 10,
      oxygenAvailable: true,
      oxygenPressureBar: 4.2,
      ventilatorsAvailable: 2,
      bloodBank: {
        'APositive': 8,
        'ONegative': 2,
        'BPositive': 10,
        'ABPositive': 3
      }
    },
    specialists: [
      {
        id: 'doc-3',
        name: 'Dr. Elena Rostova, MD',
        discipline: 'Neurology & Stroke Unit',
        experienceYears: 14,
        rating: 4.9,
        consultationFee: 85,
        availableToday: true,
        nextSlot: '19:30',
        slots: ['19:30', '20:00', '20:45']
      },
      {
        id: 'doc-4',
        name: 'Dr. Marcus Thorne, MD',
        discipline: 'Pulmonology & Respiratory',
        experienceYears: 11,
        rating: 4.7,
        consultationFee: 65,
        availableToday: true,
        nextSlot: '20:00',
        slots: ['20:00', '20:30', '21:00']
      }
    ]
  },
  {
    id: 'hc-3',
    name: 'Metro Children & Pediatric Hospital',
    type: 'Pediatric Specialty',
    address: '88 Oakridge Lane, North Suburbs',
    coordinates: { lat: 28.6300, lng: 77.2000 },
    distanceKm: 4.5,
    emergencyPhone: '+1 (800) 555-0811',
    erWaitTimeMinutes: 8,
    status: 'High Capacity Available',
    statusBadge: 'green',
    facilities: {
      icuBedsAvailable: 9,
      totalIcuBeds: 12,
      emergencyBedsAvailable: 6,
      totalEmergencyBeds: 8,
      oxygenAvailable: true,
      oxygenPressureBar: 5.0,
      ventilatorsAvailable: 4,
      bloodBank: {
        'APositive': 15,
        'ONegative': 5,
        'BPositive': 14,
        'ABPositive': 4
      }
    },
    specialists: [
      {
        id: 'doc-5',
        name: 'Dr. Priya Nair, MD',
        discipline: 'Pediatrics & Pediatric Emergency',
        experienceYears: 15,
        rating: 5.0,
        consultationFee: 70,
        availableToday: true,
        nextSlot: '19:20',
        slots: ['19:20', '19:50', '20:20', '21:00']
      }
    ]
  },
  {
    id: 'hc-4',
    name: 'Green Valley Orthopedic & Rehabilitation',
    type: 'Specialized Clinic',
    address: '15 High Tech Park, South Ring',
    coordinates: { lat: 28.5980, lng: 77.2250 },
    distanceKm: 5.9,
    emergencyPhone: '+1 (800) 555-0999',
    erWaitTimeMinutes: 25,
    status: 'Limited Capacity',
    statusBadge: 'red',
    facilities: {
      icuBedsAvailable: 1,
      totalIcuBeds: 8,
      emergencyBedsAvailable: 1,
      totalEmergencyBeds: 6,
      oxygenAvailable: true,
      oxygenPressureBar: 3.9,
      ventilatorsAvailable: 1,
      bloodBank: {
        'APositive': 4,
        'ONegative': 0,
        'BPositive': 6,
        'ABPositive': 1
      }
    },
    specialists: [
      {
        id: 'doc-6',
        name: 'Dr. Alan Harper, MS',
        discipline: 'Orthopedics & Fracture Surgery',
        experienceYears: 18,
        rating: 4.8,
        consultationFee: 80,
        availableToday: true,
        nextSlot: '20:15',
        slots: ['20:15', '21:00']
      }
    ]
  }
];

export const TRIAGE_CATEGORIES = [
  {
    id: 'cardiac',
    name: 'Cardiac & Chest Pain',
    description: 'Severe chest discomfort, shortness of breath, left arm pain',
    priority: 'Critical Emergency',
    color: 'rose',
    recommendedDiscipline: 'Cardiology & Emergency Care'
  },
  {
    id: 'stroke',
    name: 'Neurological / Stroke',
    description: 'Sudden weakness, facial drooping, speech difficulty, severe headache',
    priority: 'Critical Emergency',
    color: 'rose',
    recommendedDiscipline: 'Neurology & Stroke Unit'
  },
  {
    id: 'trauma',
    name: 'Trauma & Fractures',
    description: 'Accident injuries, severe bone injury, deep laceration, bleeding',
    priority: 'High Priority',
    color: 'amber',
    recommendedDiscipline: 'Trauma & General Surgery'
  },
  {
    id: 'respiratory',
    name: 'Severe Respiratory Distress',
    description: 'Low oxygen levels, asthma attack, acute breathing trouble',
    priority: 'High Priority',
    color: 'amber',
    recommendedDiscipline: 'Pulmonology & Respiratory'
  },
  {
    id: 'pediatric',
    name: 'Child Emergency',
    description: 'High fever in infant, severe pediatric allergic reaction or injury',
    priority: 'High Priority',
    color: 'amber',
    recommendedDiscipline: 'Pediatrics & Pediatric Emergency'
  }
];

export const INITIAL_PATIENT_PASS = {
  fullName: 'Alexander Wright',
  age: 34,
  gender: 'Male',
  bloodGroup: 'O Negative',
  emergencyContact: '+1 (555) 019-2831 (Spouse)',
  allergies: 'Penicillin, Latex',
  chronicConditions: 'Mild Asthma',
  insuranceProvider: 'BlueShield Premier #8829-X',
  qrCodeId: 'PAT-PASS-2026-8891'
};

export const INITIAL_PHARMACIES = [
  {
    id: 'ph-1',
    name: 'Apex Hospital Pharmacy & Emergency Store',
    type: 'Hospital Pharmacy',
    hospitalId: 'hc-1',
    address: '42 Health Boulevard, Central District',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    distanceKm: 1.2,
    phone: '+1 (800) 555-0199',
    is24x7: true,
    deliveryAvailable: true,
    rating: 4.9,
    openingHours: 'Open 24/7 (Emergency Stocking)'
  },
  {
    id: 'ph-2',
    name: 'HealthMed 24/7 Retail Pharmacy',
    type: 'Retail Pharmacy',
    address: '14 Central Plaza, Main Market',
    coordinates: { lat: 28.6180, lng: 77.2110 },
    distanceKm: 1.6,
    phone: '+1 (800) 555-0310',
    is24x7: true,
    deliveryAvailable: true,
    rating: 4.8,
    openingHours: 'Open 24/7 (Express Delivery)'
  },
  {
    id: 'ph-3',
    name: 'St. Jude In-House Pharmacy',
    type: 'Hospital Pharmacy',
    hospitalId: 'hc-2',
    address: '109 Riverside Drive, West Ward',
    coordinates: { lat: 28.6210, lng: 77.2150 },
    distanceKm: 2.8,
    phone: '+1 (800) 555-0244',
    is24x7: true,
    deliveryAvailable: false,
    rating: 4.7,
    openingHours: '24 Hours Emergency Intake'
  },
  {
    id: 'ph-4',
    name: 'CureAll Discount Chemist & Wellness',
    type: 'Retail Pharmacy',
    address: '77 Park Avenue, North Sector',
    coordinates: { lat: 28.6280, lng: 77.2050 },
    distanceKm: 3.4,
    phone: '+1 (800) 555-0455',
    is24x7: false,
    deliveryAvailable: true,
    rating: 4.6,
    openingHours: '8:00 AM - 11:00 PM'
  },
  {
    id: 'ph-5',
    name: 'Metro Pediatric & General Pharmacy',
    type: 'Hospital Pharmacy',
    hospitalId: 'hc-3',
    address: '88 Oakridge Lane, North Suburbs',
    coordinates: { lat: 28.6300, lng: 77.2000 },
    distanceKm: 4.5,
    phone: '+1 (800) 555-0811',
    is24x7: true,
    deliveryAvailable: true,
    rating: 4.9,
    openingHours: 'Open 24/7'
  }
];

export const INITIAL_MEDICINES = [
  {
    id: 'med-1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotics',
    dosageForm: 'Capsule',
    strength: '500mg (10 Caps / Pack)',
    prescriptionRequired: true,
    manufacturer: 'Pfizer Pharmaceuticals',
    description: 'Broad-spectrum penicillin antibiotic for bacterial infections, chest infections, and dental abscesses.',
    stocks: [
      { pharmacyId: 'ph-1', price: 12.50, mrp: 18.00, stockCount: 150, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 10.99, mrp: 18.00, stockCount: 85, status: 'In Stock' },
      { pharmacyId: 'ph-3', price: 13.00, mrp: 18.00, stockCount: 40, status: 'Low Stock' },
      { pharmacyId: 'ph-4', price: 9.75, mrp: 18.00, stockCount: 210, status: 'In Stock' }
    ]
  },
  {
    id: 'med-2',
    name: 'Paracetamol Extra 650mg',
    genericName: 'Acetaminophen / Paracetamol',
    category: 'Painkiller & Fever',
    dosageForm: 'Tablet',
    strength: '650mg (15 Tablets / Strip)',
    prescriptionRequired: false,
    manufacturer: 'GSK Healthcare',
    description: 'Fast-acting fever reducer and mild-to-moderate pain reliever for headache, fever, and muscle aches.',
    stocks: [
      { pharmacyId: 'ph-1', price: 4.50, mrp: 6.00, stockCount: 300, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 3.99, mrp: 6.00, stockCount: 500, status: 'In Stock' },
      { pharmacyId: 'ph-3', price: 4.80, mrp: 6.00, stockCount: 180, status: 'In Stock' },
      { pharmacyId: 'ph-4', price: 3.50, mrp: 6.00, stockCount: 420, status: 'In Stock' },
      { pharmacyId: 'ph-5', price: 4.00, mrp: 6.00, stockCount: 250, status: 'In Stock' }
    ]
  },
  {
    id: 'med-3',
    name: 'Lipitor (Atorvastatin) 20mg',
    genericName: 'Atorvastatin Calcium',
    category: 'Heart & Blood Pressure',
    dosageForm: 'Tablet',
    strength: '20mg (30 Tablets / Pack)',
    prescriptionRequired: true,
    manufacturer: 'Viatris / Pfizer',
    description: 'Statin medication used to prevent cardiovascular disease and lower LDL cholesterol.',
    stocks: [
      { pharmacyId: 'ph-1', price: 28.50, mrp: 35.00, stockCount: 90, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 24.99, mrp: 35.00, stockCount: 60, status: 'In Stock' },
      { pharmacyId: 'ph-4', price: 22.00, mrp: 35.00, stockCount: 15, status: 'Low Stock' }
    ]
  },
  {
    id: 'med-4',
    name: 'Humalog Insulin Pen (100u/ml)',
    genericName: 'Insulin Lispro Rapid-Acting',
    category: 'Diabetes Care',
    dosageForm: 'Injection / Pen',
    strength: '3ml Pen (100 units/ml)',
    prescriptionRequired: true,
    manufacturer: 'Eli Lilly & Co.',
    description: 'Rapid-acting human insulin analog for mealtime blood sugar control in Type 1 and Type 2 diabetes.',
    stocks: [
      { pharmacyId: 'ph-1', price: 45.00, mrp: 55.00, stockCount: 35, status: 'In Stock' },
      { pharmacyId: 'ph-3', price: 48.00, mrp: 55.00, stockCount: 12, status: 'Low Stock' },
      { pharmacyId: 'ph-5', price: 44.00, mrp: 55.00, stockCount: 25, status: 'In Stock' }
    ]
  },
  {
    id: 'med-5',
    name: 'Ventolin Salbutamol Inhaler 100mcg',
    genericName: 'Salbutamol Sulfate (Albuterol)',
    category: 'Respiratory & Asthma',
    dosageForm: 'Inhaler',
    strength: '200 Actuations (100mcg/dose)',
    prescriptionRequired: true,
    manufacturer: 'GSK Respiratory',
    description: 'Bronchodilator fast-relief rescue inhaler for asthma attacks, wheezing, and COPD shortness of breath.',
    stocks: [
      { pharmacyId: 'ph-1', price: 18.00, mrp: 24.00, stockCount: 80, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 16.50, mrp: 24.00, stockCount: 110, status: 'In Stock' },
      { pharmacyId: 'ph-3', price: 19.00, mrp: 24.00, stockCount: 20, status: 'Low Stock' },
      { pharmacyId: 'ph-5', price: 17.00, mrp: 24.00, stockCount: 95, status: 'In Stock' }
    ]
  },
  {
    id: 'med-6',
    name: 'Metformin SR 850mg',
    genericName: 'Metformin Hydrochloride Extended Release',
    category: 'Diabetes Care',
    dosageForm: 'Tablet',
    strength: '850mg (20 Tablets / Strip)',
    prescriptionRequired: true,
    manufacturer: 'Sun Pharmaceutical',
    description: 'First-line medication for treatment of type 2 diabetes, controlling blood glucose levels.',
    stocks: [
      { pharmacyId: 'ph-1', price: 8.50, mrp: 12.00, stockCount: 200, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 7.20, mrp: 12.00, stockCount: 140, status: 'In Stock' },
      { pharmacyId: 'ph-4', price: 6.80, mrp: 12.00, stockCount: 300, status: 'In Stock' }
    ]
  },
  {
    id: 'med-7',
    name: 'Ibuprofen 400mg Liquid Gel',
    genericName: 'Ibuprofen Rapid Solubilized',
    category: 'Painkiller & Fever',
    dosageForm: 'Capsule',
    strength: '400mg (10 Softgels / Pack)',
    prescriptionRequired: false,
    manufacturer: 'Advil / Haleon',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) for muscle inflammation, joint pain, and fever.',
    stocks: [
      { pharmacyId: 'ph-1', price: 6.20, mrp: 8.50, stockCount: 180, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 5.50, mrp: 8.50, stockCount: 220, status: 'In Stock' },
      { pharmacyId: 'ph-4', price: 4.99, mrp: 8.50, stockCount: 350, status: 'In Stock' }
    ]
  },
  {
    id: 'med-8',
    name: 'Azithromycin 500mg (3-Day Pack)',
    genericName: 'Azithromycin Dihydrate',
    category: 'Antibiotics',
    dosageForm: 'Tablet',
    strength: '500mg (3 Tablets / Pack)',
    prescriptionRequired: true,
    manufacturer: 'Zithromax / Pfizer',
    description: 'Macrolide antibiotic for respiratory tract infections, tonsillitis, ear infections, and skin infections.',
    stocks: [
      { pharmacyId: 'ph-1', price: 15.00, mrp: 21.00, stockCount: 95, status: 'In Stock' },
      { pharmacyId: 'ph-2', price: 13.80, mrp: 21.00, stockCount: 50, status: 'In Stock' },
      { pharmacyId: 'ph-3', price: 16.00, mrp: 21.00, stockCount: 10, status: 'Low Stock' }
    ]
  }
];

