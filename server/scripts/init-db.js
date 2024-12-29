const mongoose = require('mongoose');
const UserProgress = require('../models/UserProgress');

async function initializeDatabase() {
  try {
    // Connect to MongoDB using IP address instead of localhost
    await mongoose.connect('mongodb://127.0.0.1:27017/agentos-learning', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB successfully');

    // Create indexes
    await UserProgress.createIndexes();
    
    console.log('Database initialized successfully');
    
    // Close the connection
    await mongoose.connection.close();
    
    console.log('Connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
