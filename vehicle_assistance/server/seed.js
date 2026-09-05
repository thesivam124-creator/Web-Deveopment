const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Technician = require('./models/Technician');
const AssistanceRequest = require('./models/AssistanceRequest');
const { memoryStore } = require('./store/memoryStore');

const initialTechnicians = [
  {
    name: 'Rajesh Sharma',
    email: 'rajesh@apexrescue.com',
    password: 'password123',
    phone: '+91 98765 43210',
    businessName: 'Apex Auto Rescue & Repair',
    location: {
      address: 'Connaught Place, Central Hub',
      lat: 28.6315,
      lng: 77.2167
    },
    charges: {
      baseFee: 350,
      ratePerKm: 25
    },
    estimatedWaitTime: 12,
    skills: [
      'Engine Repair',
      'Flat Tire & Replacement',
      'Battery Jumpstart & Replace',
      'Towing Service',
      'Lockout Assistance'
    ],
    vehicleTypes: [
      '2-Wheeler',
      'Car / Sedan / SUV',
      'Electric Vehicle (EV)'
    ],
    isAvailable: true,
    rating: 4.9,
    totalRepairsCompleted: 48,
    role: 'technician'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@quickassist.com',
    password: 'password123',
    phone: '+91 98123 45678',
    businessName: 'QuickAssist Tow & Mechanic',
    location: {
      address: 'Karol Bagh Service Zone',
      lat: 28.6514,
      lng: 77.1907
    },
    charges: {
      baseFee: 280,
      ratePerKm: 20
    },
    estimatedWaitTime: 15,
    skills: [
      'Flat Tire & Replacement',
      'Battery Jumpstart & Replace',
      'Fuel Delivery',
      'Towing Service'
    ],
    vehicleTypes: [
      '2-Wheeler',
      'Car / Sedan / SUV',
      'Truck / Bus'
    ],
    isAvailable: true,
    rating: 4.7,
    totalRepairsCompleted: 32,
    role: 'technician'
  },
  {
    name: 'Priya Verma',
    email: 'priya@evspecialist.com',
    password: 'password123',
    phone: '+91 97111 22334',
    businessName: 'EV & High-Tech Auto Specialist',
    location: {
      address: 'Cyber City Hub',
      lat: 28.4950,
      lng: 77.0890
    },
    charges: {
      baseFee: 450,
      ratePerKm: 30
    },
    estimatedWaitTime: 18,
    skills: [
      'EV Charging & Diagnostics',
      'Engine Repair',
      'Battery Jumpstart & Replace',
      'Brake & Clutch Repair',
      'Lockout Assistance'
    ],
    vehicleTypes: [
      'Car / Sedan / SUV',
      'Electric Vehicle (EV)'
    ],
    isAvailable: true,
    rating: 5.0,
    totalRepairsCompleted: 64,
    role: 'technician'
  },
  {
    name: 'Anil Kumar',
    email: 'anil@heavycare.com',
    password: 'password123',
    phone: '+91 99887 76655',
    businessName: 'Highway Heavy & Truck Care',
    location: {
      address: 'Ring Road Bypass Station',
      lat: 28.5800,
      lng: 77.2400
    },
    charges: {
      baseFee: 500,
      ratePerKm: 35
    },
    estimatedWaitTime: 20,
    skills: [
      'Towing Service',
      'Engine Repair',
      'Brake & Clutch Repair',
      'Battery Jumpstart & Replace'
    ],
    vehicleTypes: [
      '2-Wheeler',
      'Car / Sedan / SUV',
      'Truck / Bus'
    ],
    isAvailable: true,
    rating: 4.8,
    totalRepairsCompleted: 90,
    role: 'technician'
  }
];

const initialUsers = [
  {
    name: 'Amit Patel',
    email: 'user@example.com',
    password: 'user123',
    phone: '+91 91234 56789',
    location: {
      address: 'Rajiv Chowk Metro Exit 3',
      lat: 28.6328,
      lng: 77.2197
    },
    vehicleDetails: {
      make: 'Hyundai',
      model: 'Creta 2022',
      vehicleType: 'Car / Sedan / SUV',
      licensePlate: 'DL 01 AB 1234'
    },
    role: 'user'
  }
];

async function seedData() {
  console.log('Seeding initial roadside assistance database...');

  const hashedTechPassword = await bcrypt.hash('password123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  // Populate memory store for immediate runtime access
  memoryStore.technicians = initialTechnicians.map((t, idx) => ({
    id: `tech_seed_${idx + 1}`,
    _id: `tech_seed_${idx + 1}`,
    ...t,
    password: hashedTechPassword
  }));

  memoryStore.users = initialUsers.map((u, idx) => ({
    id: `user_seed_${idx + 1}`,
    _id: `user_seed_${idx + 1}`,
    ...u,
    password: hashedUserPassword
  }));

  // Also seed MongoDB if connected
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/roadside_assistance';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    
    await User.deleteMany({});
    await Technician.deleteMany({});
    await AssistanceRequest.deleteMany({});

    for (let u of initialUsers) {
      const userObj = new User({ ...u, password: hashedUserPassword });
      await userObj.save();
    }

    for (let t of initialTechnicians) {
      const techObj = new Technician({ ...t, password: hashedTechPassword });
      await techObj.save();
    }

    console.log('✅ MongoDB database successfully seeded with initial Technicians and Demo User!');
  } catch (err) {
    console.log('ℹ️ MongoDB seed note:', err.message);
    console.log('✅ Memory fallback populated with 4 pre-configured Technicians and 1 Demo User for instant local usage!');
  }
}

if (require.main === module) {
  seedData().then(() => process.exit(0));
}

module.exports = seedData;
