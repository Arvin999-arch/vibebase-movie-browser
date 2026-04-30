// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout,
  getUsers 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validation');

// Public routes (anyone can access)
router.post('/register', validateRegister, checkValidation, register);
router.post('/login', validateLogin, checkValidation, login);

// Testing route - view all users (remove in production)
router.get('/users', getUsers);

// Protected routes (only logged in users)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
