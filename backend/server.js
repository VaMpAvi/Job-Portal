const express = require('express');
const cors = require('cors');
const connectDB = require('./config/configDb');
require('dotenv').config();

// Set default JWT secret if not provided in environment variables
if (!process.env.JWT_SECRET) {
    console.log('No JWT_SECRET found in environment, using default secret');
    process.env.JWT_SECRET = 'your_super_secret_and_long_jwt_key_2024';
}

// Log environment details (without sensitive info)
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
    JWT_SECRET: 'Set'
});

const app = express();

// Configure CORS
app.use(cors({
    origin: ['https://job-portal-frontend.onrender.com', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

const startServer = async (port) => {
    try {
        console.log('Starting server initialization...');
        await connectDB();
        
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error('Server initialization error:', err);
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server failed to start:', err);
            process.exit(1);
        }
    }
};

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

const PORT = process.env.PORT || 8080;
startServer(PORT);