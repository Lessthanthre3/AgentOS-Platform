// For development, we'll use a simple middleware that allows all requests
// In production, this should be replaced with proper authentication

const authenticateUser = (req, res, next) => {
  // For development, allow all requests
  next();
};

const isAdmin = (req, res, next) => {
  // For development, grant admin access to all requests
  next();
};

module.exports = {
  authenticateUser,
  isAdmin
};
