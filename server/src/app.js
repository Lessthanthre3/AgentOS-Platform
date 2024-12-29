const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const metricsRoutes = require('../routes/metrics');
const modulesRoutes = require('../routes/modules');
require('dotenv').config();

const moduleRoutes = require('./routes/moduleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const raffleRoutes = require('../routes/raffleRoutes');
const ticketRoutes = require('../routes/ticketRoutes');

const app = express();

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'", 
        "https://api.devnet.solana.com", 
        "https://api.mainnet-beta.solana.com",
        "wss://api.devnet.solana.com",
        "wss://api.mainnet-beta.solana.com"
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.ALLOWED_ORIGINS || 'https://agent-os-platform.vercel.app']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Feature flags available to the application
app.locals.featureFlags = {
  SENTINEL: 'SENTINEL',
  ALPHA_CALENDAR: 'ALPHA_CALENDAR',
  REWARDS: 'REWARDS',
  BETA_TESTING: 'BETA_TESTING'
};

// Routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/module', moduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server is running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS allowed origins:`, corsOptions.origin);
});

module.exports = app;
