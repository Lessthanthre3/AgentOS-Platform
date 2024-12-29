const adminAuth = (req, res, next) => {
  const adminWallet = process.env.ADMIN_WALLET;
  const walletAddress = req.headers['x-wallet-address'];

  if (!walletAddress || walletAddress !== adminWallet) {
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }

  next();
};

module.exports = adminAuth;
