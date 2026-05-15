const mongoose = require('mongoose');

// Connect to MongoDB
// Set MONGODB_URI in your .env file
// Get a free URI from https://mongodb.com/atlas

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('');
    console.error('ERROR: MONGODB_URI is not set!');
    console.error('');
    console.error('Steps to fix:');
    console.error('  1. Go to https://mongodb.com/atlas and create a free account');
    console.error('  2. Create a free cluster and get your connection string');
    console.error('  3. Add MONGODB_URI to your Replit Secrets (the lock icon)');
    console.error('  4. Example URI: mongodb+srv://user:pass@cluster.mongodb.net/tarashop');
    console.error('');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
