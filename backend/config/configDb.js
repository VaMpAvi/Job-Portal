const mongoose = require("mongoose");
const initializeDatabase = require("./dbInit");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");

    await mongoose.connect(
      "mongodb+srv://AvinashBanyal:Aumw46aT0CAJUNIO@cluster0.mt7fdep.mongodb.net/JobPortal?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: "majority",
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log("MongoDB connected successfully");
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("MongoDB connection error details:");
    console.error("- Error name:", err.name);
    console.error("- Error message:", err.message);
    if (err.reason) console.error("- Reason:", err.reason);

    // Check if the error is related to authentication
    if (err.message.includes("Authentication failed")) {
      console.error(
        "Authentication failed - please check your MongoDB username and password"
      );
    }

    // Check if the error is related to network connectivity
    if (err.message.includes("ECONNREFUSED")) {
      console.error("Connection refused - this usually means:");
      console.error(
        "1. The MONGODB_URI environment variable is not being read correctly"
      );
      console.error("2. Or there might be network connectivity issues");
    }

    process.exit(1);
  }
};

module.exports = connectDB;