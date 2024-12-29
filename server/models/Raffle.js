const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  prizeAmount: {
    type: Number,
    required: true,
    min: 0
  },
  costPerTicket: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  winner: {
    type: String,  // Winner's wallet address
    sparse: true,
    index: true
  },
  winningTicket: {
    type: String,
    sparse: true
  },
  totalTickets: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for finding active raffles efficiently
raffleSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Methods
raffleSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
};

// Static methods
raffleSchema.statics.getActiveRaffles = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ endDate: 1 });
};

raffleSchema.statics.completeRaffle = async function(raffleId, winnerWallet, winningTicketNumber) {
  return this.findByIdAndUpdate(
    raffleId,
    {
      $set: {
        status: 'completed',
        winner: winnerWallet,
        winningTicket: winningTicketNumber
      }
    },
    { new: true }
  );
};

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;
