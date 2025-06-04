const mongoose = require('mongoose');
const initializeDatabase = require('./dbInit');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/JobPortal';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        await initializeDatabase();
    } catch (err) {
        process.exit(1);
    }
};

module.exports = connectDB;