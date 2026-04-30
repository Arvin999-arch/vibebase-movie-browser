// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { findUserById } = require('../utils/userStorage');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibebase_secret_key_2024');
      
      // Get user from file storage
      const user = findUserById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not found or inactive' 
        });
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      };
      next();
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid token' 
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Token expired' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized, no token' 
    });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
};

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role || 'user' },
    process.env.JWT_SECRET || 'vibebase_secret_key_2024',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'vibebase_refresh_secret_2024',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  
  return { accessToken, refreshToken };
};

module.exports = { protect, adminOnly, generateTokens };
