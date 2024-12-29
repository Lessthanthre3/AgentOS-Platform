const adminAuth = (req, res, next) => {
  const adminWallet = process.env.ADMIN_WALLET;
  const walletAddress = req.headers['x-wallet-address'];

  // Log for debugging
  console.log('Admin auth check:', {
    adminWallet: adminWallet ? 'configured' : 'not configured',
    requestWallet: walletAddress || 'not provided'
  });

  if (!adminWallet) {
    console.warn('ADMIN_WALLET not configured in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  if (!walletAddress) {
    return res.status(401).json({ message: 'No wallet address provided' });
  }

  if (walletAddress !== adminWallet) {
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }

  next();
};

module.exports = adminAuth;
