const verifyWalletSignature = async (req, res, next) => {
  try {
    // For now, we'll just get the wallet address from the Authorization header
    const walletAddress = req.headers.authorization;
    
    if (!walletAddress) {
      return res.status(401).json({ error: 'Missing wallet address' });
    }

    // Add wallet address to request
    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { verifyWalletSignature };
