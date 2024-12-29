const express = require('express');
const router = express.Router();
const Raffle = require('../models/Raffle');

// Get all raffles
router.get('/', async (req, res) => {
  try {
    const raffles = await Raffle.find()
      .sort({ startDate: -1 });
    res.json(raffles);
  } catch (error) {
    console.error('Error fetching raffles:', error);
    res.status(500).json({ message: 'Error fetching raffles' });
  }
});

// Get active raffles
router.get('/active', async (req, res) => {
  try {
    const activeRaffles = await Raffle.getActiveRaffles();
    res.json(activeRaffles);
  } catch (error) {
    console.error('Error fetching active raffles:', error);
    res.status(500).json({ message: 'Error fetching active raffles' });
  }
});

// Create a new raffle (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      prizeAmount,
      costPerTicket
    } = req.body;

    // TODO: Add admin authorization check
    const newRaffle = new Raffle({
      name,
      description,
      startDate,
      endDate,
      prizeAmount,
      costPerTicket
    });

    await newRaffle.save();
    res.status(201).json(newRaffle);
  } catch (error) {
    console.error('Error creating raffle:', error);
    res.status(500).json({ message: 'Error creating raffle' });
  }
});

// Complete a raffle (admin only)
router.post('/:id/complete', async (req, res) => {
  try {
    const { winnerWallet, winningTicket } = req.body;
    // TODO: Add admin authorization check
    const updatedRaffle = await Raffle.completeRaffle(req.params.id, winnerWallet, winningTicket);
    res.json(updatedRaffle);
  } catch (error) {
    console.error('Error completing raffle:', error);
    res.status(500).json({ message: 'Error completing raffle' });
  }
});

module.exports = router;
