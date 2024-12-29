const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Raffle = require('../models/Raffle');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for ticket purchases
const purchaseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many ticket purchases, please try again later'
});

// Validation middleware
const validatePurchase = [
  body('raffleId').isMongoId().withMessage('Invalid raffle ID'),
  body('walletAddress').matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).withMessage('Invalid Solana wallet address'),
  body('transactionSignature').notEmpty().withMessage('Transaction signature required')
];

// Get tickets by wallet address
router.get('/wallet/:address', 
  param('address').matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).withMessage('Invalid Solana wallet address'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tickets = await Ticket.getTicketsByWallet(req.params.address);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ 
        message: 'Error fetching tickets',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
});

// Get tickets by raffle ID
router.get('/raffle/:raffleId',
  param('raffleId').isMongoId().withMessage('Invalid raffle ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tickets = await Ticket.getTicketsByRaffle(req.params.raffleId);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching raffle tickets:', error);
      res.status(500).json({ 
        message: 'Error fetching raffle tickets',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
});

// Purchase ticket
router.post('/purchase', purchaseLimiter, validatePurchase, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { raffleId, walletAddress, transactionSignature } = req.body;

    // Verify raffle exists and is active
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.isActive()) {
      return res.status(400).json({ message: 'Raffle is not active' });
    }

    // Check ticket limit (10 per wallet)
    const userTickets = await Ticket.countDocuments({ 
      raffleId, 
      walletAddress 
    });
    if (userTickets >= 10) {
      return res.status(400).json({ 
        message: 'Maximum ticket limit reached for this raffle' 
      });
    }

    // Verify transaction signature hasn't been used before
    const existingTicket = await Ticket.findOne({ transactionSignature });
    if (existingTicket) {
      return res.status(400).json({ 
        message: 'Transaction signature has already been used' 
      });
    }

    // Create the ticket
    const ticket = await Ticket.purchaseTicket(
      raffleId,
      walletAddress,
      transactionSignature
    );

    // Update raffle ticket count
    await Raffle.findByIdAndUpdate(raffleId, {
      $inc: { totalTickets: 1 }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    res.status(500).json({ 
      message: 'Error purchasing ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;
