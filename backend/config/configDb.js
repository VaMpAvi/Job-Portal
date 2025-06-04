const mongoose = require('mongoose');
const initializeDatabase = require('./dbInit');

const defaultLocalURI = 'mongodb://localhost:27017/JobPortal';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');

    const envURI = process.env.MONGODB_URI;
    const isLocal = !envURI;

    if (isLocal) {
      console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
      console.error('➡️  Please set it in your Render or deployment platform.');
      throw new Error('Missing MONGODB_URI environment variable');
    }

    // Ensure the URI contains `/JobPortal`
    const connectionString = envURI.includes('/?')
      ? envURI.replace('/?', '/JobPortal?')
      : envURI.replace('?', '/JobPortal?');

    const safeLog = connectionString.replace(/\/\/[^@]+@/, '//****:****@');
    console.log('🔌 Connecting to:', safeLog);

    await mongoose.connect(connectionString, {
      // useNewUrlParser & useUnifiedTopology are deprecated in Mongoose 7+
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
    await initializeDatabase();
    console.log('📦 Database initialized successfully');
    
  } catch (err) {
    console.error('❗ MongoDB connection error details:');
    console.error('- Name:', err.name);
    console.error('- Message:', err.message);
    if (err.reason) console.error('- Reason:', err.reason);

    if (err.message.includes('Authentication failed')) {
      console.error('🔒 Authentication failed - check username/password');
    }

    if (err.message.includes('ECONNREFUSED')) {
      console.error('🌐 Connection refused - potential causes:');
      console.error('1. Wrong URI or missing MONGODB_URI');
      console.error('2. Network/firewall issues');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
