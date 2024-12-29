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

// Get all raffles with pagination (public route)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [raffles, total] = await Promise.all([
      Raffle.find({ status: 'active' }) // Only show active raffles
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit),
      Raffle.countDocuments({ status: 'active' })
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

// Get active raffles (public route)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const activeRaffles = await Raffle.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
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

    const newRaffle = new Raffle({
      name,
      description,
      startDate,
      endDate,
      prizeAmount,
      costPerTicket,
      status: 'active'
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

// Update raffle status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const raffle = await Raffle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    res.json(raffle);
  } catch (error) {
    console.error('Error updating raffle status:', error);
    res.status(500).json({ 
      message: 'Error updating raffle status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;
