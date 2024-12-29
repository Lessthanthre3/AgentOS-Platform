const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Raffle = require('../models/Raffle');

// Get tickets by wallet address
router.get('/wallet/:address', async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByWallet(req.params.address);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

// Get tickets by raffle ID
router.get('/raffle/:raffleId', async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByRaffle(req.params.raffleId);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching raffle tickets:', error);
    res.status(500).json({ message: 'Error fetching raffle tickets' });
  }
});

// Purchase ticket
router.post('/purchase', async (req, res) => {
  try {
    const { raffleId, walletAddress, transactionSignature } = req.body;

    // Verify raffle exists and is active
    const raffle = await Raffle.findById(raffleId);
    if (!raffle || !raffle.isActive()) {
      return res.status(400).json({ message: 'Invalid or inactive raffle' });
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
    res.status(500).json({ message: 'Error purchasing ticket' });
  }
});

module.exports = router;
