
// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user storage for development (remove this when using real database)
let users = [];

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    
    if (existingUser) {
      const error = existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken';
      return res.status(400).json({ success: false, error });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: users.length + 1,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(user);

    // Return user without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    // Generate token
    const token = generateToken(userData);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { user: userData, token }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'No account found with this email. Please register first.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password. Please try again.' 
      });
    }

    // Return user without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    // Generate token
    const token = generateToken(userData);

    res.json({
      success: true,
      message: 'Login successful!',
      data: { user: userData, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { register, login, getMe, logout };


