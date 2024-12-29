const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  raffleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  transactionSignature: {
    type: String,
    required: true,
    unique: true  // Ensure each transaction is only used once
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true  // Ensure unique ticket numbers
  }
});

// Compound index for efficient queries by raffle and wallet
ticketSchema.index({ raffleId: 1, walletAddress: 1 });

// Methods
ticketSchema.methods.toPublicJSON = function() {
  return {
    ticketNumber: this.ticketNumber,
    purchaseDate: this.purchaseDate,
    transactionSignature: this.transactionSignature
  };
};

// Static methods
ticketSchema.statics.purchaseTicket = async function(raffleId, walletAddress, transactionSignature) {
  // Generate a unique ticket number (you might want to implement a more sophisticated system)
  const ticketCount = await this.countDocuments({ raffleId });
  const ticketNumber = `${raffleId}-${ticketCount + 1}`;

  const ticket = await this.create({
    raffleId,
    walletAddress,
    transactionSignature,
    ticketNumber
  });

  // Update the raffle's total tickets
  await mongoose.model('Raffle').findByIdAndUpdate(
    raffleId,
    { $inc: { totalTickets: 1 } }
  );

  return ticket;
};

ticketSchema.statics.getTicketsByWallet = function(walletAddress) {
  return this.find({ walletAddress })
    .populate('raffleId')
    .sort({ purchaseDate: -1 });
};

ticketSchema.statics.getTicketsByRaffle = function(raffleId) {
  return this.find({ raffleId })
    .sort({ purchaseDate: 1 });
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
