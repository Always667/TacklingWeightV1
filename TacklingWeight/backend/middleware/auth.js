const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  // Accept token from Authorization: Bearer header (works cross-origin)
  // or cookie as fallback for local dev
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = req.cookies?.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verify the user still exists (guards against stale JWTs after re-seed / account deletion)
    const exists = await User.exists({ _id: decoded.userId });
    if (!exists) {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
