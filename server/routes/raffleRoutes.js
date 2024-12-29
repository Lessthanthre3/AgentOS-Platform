const express = require('express');
const router = express.Router();
const Raffle = require('../models/Raffle');
const adminAuth = require('../middleware/adminAuth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRaffle = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('prizeAmount').isFloat({ min: 0 }).withMessage('Prize amount must be positive'),
  body('costPerTicket').isFloat({ min: 0 }).withMessage('Cost per ticket must be positive'),
];

// Get all raffles with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [raffles, total] = await Promise.all([
      Raffle.find()
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit),
      Raffle.countDocuments()
    ]);

    res.json({
      raffles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching raffles:', error);
    res.status(500).json({ 
      message: 'Error fetching raffles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Get active raffles
router.get('/active', async (req, res) => {
  try {
    const activeRaffles = await Raffle.getActiveRaffles();
    res.json(activeRaffles);
  } catch (error) {
    console.error('Error fetching active raffles:', error);
    res.status(500).json({ 
      message: 'Error fetching active raffles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Create a new raffle (admin only)
router.post('/', adminAuth, validateRaffle, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      prizeAmount,
      costPerTicket
    } = req.body;

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
    res.status(500).json({ 
      message: 'Error creating raffle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Complete a raffle (admin only)
router.post('/:id/complete', adminAuth, async (req, res) => {
  try {
    const { winnerWallet, winningTicket } = req.body;
    
    // Verify raffle exists and is active
    const raffle = await Raffle.findById(req.params.id);
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }
    
    if (raffle.status !== 'active') {
      return res.status(400).json({ message: 'Raffle is not active' });
    }
    
    if (new Date() < raffle.endDate) {
      return res.status(400).json({ message: 'Raffle has not ended yet' });
    }

    const updatedRaffle = await Raffle.completeRaffle(
      req.params.id, 
      winnerWallet, 
      winningTicket
    );
    
    res.json(updatedRaffle);
  } catch (error) {
    console.error('Error completing raffle:', error);
    res.status(500).json({ 
      message: 'Error completing raffle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;
