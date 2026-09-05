const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roadside_assistance', {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s if MongoDB server is down
    });
    console.log(`[MongoDB Connected]: Host ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning]: ${error.message}`);
    console.warn(`[Fallback Mode]: MongoDB connection failed or server not running locally. The server will run in fallback state with in-memory persistence for demonstration.`);
    return false;
  }
};

module.exports = connectDB;
