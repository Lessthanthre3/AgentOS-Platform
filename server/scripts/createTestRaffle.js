require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');

const createTestRaffle = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const testRaffle = new Raffle({
      name: 'Test Raffle',
      description: 'This is a test raffle to verify the system',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      prizeAmount: 1000,
      costPerTicket: 10,
      status: 'active'
    });

    await testRaffle.save();
    console.log('Test raffle created:', testRaffle);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

createTestRaffle();
