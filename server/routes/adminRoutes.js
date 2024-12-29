const express = require('express');
const router = express.Router();
const { adminAuth, generateAdminToken } = require('../middleware/adminAuth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const token = generateAdminToken(password);
    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error);
    if (error.message === 'Invalid admin password') {
      return res.status(401).json({ message: 'Invalid password' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin dashboard - protected route
router.get('/dashboard', adminAuth, (req, res) => {
  res.json({ message: 'Welcome to admin dashboard' });
});

// Create raffle - protected route
router.post('/raffles', adminAuth, async (req, res) => {
  try {
    // Add raffle creation logic here
    res.json({ message: 'Raffle created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update raffle - protected route
router.put('/raffles/:id', adminAuth, async (req, res) => {
  try {
    // Add raffle update logic here
    res.json({ message: 'Raffle updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
