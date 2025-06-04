const mongoose = require('mongoose');

const initializeDatabase = async () => {
    try {
        // Get the default connection
        const db = mongoose.connection;

        // Create Users collection if it doesn't exist
        if (!(await db.db.listCollections({ name: 'users' }).hasNext())) {
            await db.createCollection('users');
            console.log('Users collection created');
        }

        // Create indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('Email index created on users collection');

        // Create Jobs collection if it doesn't exist
        if (!(await db.db.listCollections({ name: 'jobs' }).hasNext())) {
            await db.createCollection('jobs');
            console.log('Jobs collection created');
        }

        // Create Applications collection if it doesn't exist
        if (!(await db.db.listCollections({ name: 'applications' }).hasNext())) {
            await db.createCollection('applications');
            console.log('Applications collection created');
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

module.exports = initializeDatabase; 