const isAdmin = (req, res, next) => {
  try {
    const walletAddress = req.walletAddress;
    const adminWallet = process.env.ADMIN_WALLET;

    if (!walletAddress || !adminWallet) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (walletAddress !== adminWallet) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { isAdmin };
