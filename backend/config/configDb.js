const mongoose = require('mongoose');
const initializeDatabase = require('./dbInit');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/JobPortal';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not found in environment variables, using default local connection');
        }
        
        // Ensure we're connecting to the JobPortal database
        const connectionString = process.env.MONGODB_URI 
            ? `${process.env.MONGODB_URI.includes('/?') 
                ? process.env.MONGODB_URI.replace('/?', '/JobPortal?')
                : process.env.MONGODB_URI.replace('?', '/JobPortal?')}`
            : mongoURI;

        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('MongoDB connected successfully');
        await initializeDatabase();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.error('Connection string used (without credentials):', 
            process.env.MONGODB_URI 
                ? process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//****:****@')
                : 'default local connection');
        process.exit(1);
    }
};

module.exports = connectDB;