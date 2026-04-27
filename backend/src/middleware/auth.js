
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, error: 'User not found or inactive' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired' });
      }
      
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Admin access required' });
  }
};

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
  
  return { accessToken, refreshToken };
};

module.exports = { protect, adminOnly, generateTokens };
