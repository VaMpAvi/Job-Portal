const express = require('express');
const cors = require('cors');
const connectDB = require('./config/configDb');
require('dotenv').config();

// Set default JWT secret if not provided in environment variables
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your_super_secret_and_long_jwt_key_2024';
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

const startServer = async (port) => {
    try {
        await connectDB();
        app.listen(port);
        console.log(`Server running on port ${port}`);
    } catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server failed to start:', err);
            process.exit(1);
        }
    }
};

const PORT = process.env.PORT || 8080;
startServer(PORT);