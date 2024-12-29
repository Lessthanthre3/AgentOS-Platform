const express = require('express');
const router = express.Router();
const Raffle = require('../models/Raffle');
const { adminAuth } = require('../middleware/adminAuth');
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

// Get all raffles (public route)
router.get('/', async (req, res) => {
  try {
    const raffles = await Raffle.find()
      .sort({ startDate: -1 });

    res.json(raffles);
  } catch (error) {
    console.error('Error fetching raffles:', error);
    res.status(500).json({ 
      message: 'Error fetching raffles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Get active raffles (public route)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const activeRaffles = await Raffle.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    }).sort({ endDate: 1 });
    
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

    const raffle = new Raffle({
      name,
      description,
      startDate,
      endDate,
      prizeAmount,
      costPerTicket,
      status: 'active'
    });

    await raffle.save();
    res.status(201).json(raffle);
  } catch (error) {
    console.error('Error creating raffle:', error);
    res.status(500).json({ 
      message: 'Error creating raffle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Delete a raffle (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const raffle = await Raffle.findById(req.params.id);
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    await raffle.deleteOne();
    res.json({ message: 'Raffle deleted successfully' });
  } catch (error) {
    console.error('Error deleting raffle:', error);
    res.status(500).json({ 
      message: 'Error deleting raffle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Update a raffle (admin only)
router.put('/:id', adminAuth, validateRaffle, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const raffle = await Raffle.findById(req.params.id);
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      prizeAmount,
      costPerTicket,
      status
    } = req.body;

    raffle.name = name;
    raffle.description = description;
    raffle.startDate = startDate;
    raffle.endDate = endDate;
    raffle.prizeAmount = prizeAmount;
    raffle.costPerTicket = costPerTicket;
    if (status) raffle.status = status;

    await raffle.save();
    res.json(raffle);
  } catch (error) {
    console.error('Error updating raffle:', error);
    res.status(500).json({ 
      message: 'Error updating raffle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;
