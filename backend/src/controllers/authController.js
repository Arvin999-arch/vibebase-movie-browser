
// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  findUserByEmail, 
  findUserByUsername, 
  createUser, 
  findUserById, 
  updateUser 
} = require('../utils/userStorage');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'vibebase_secret_key_2024',
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 Registration attempt:', { username, email });

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Check if user already exists in our database
    const existingUserByEmail = findUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered. Please login.' 
      });
    }

    const existingUserByUsername = findUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already taken. Please choose another.' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in our database
    const newUser = createUser({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    console.log('✅ User registered:', { id: newUser.id, email: newUser.email });

    // Return user without password
    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
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
    res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  }
};

// @desc    Login user - ONLY REGISTERED USERS
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // CRITICAL: Find user in our registered users database
    const user = findUserByEmail(email);

    // If user does NOT exist in our database, REJECT login
    if (!user) {
      console.log('❌ Login rejected: User not registered -', email);
      return res.status(401).json({ 
        success: false, 
        error: 'No account found with this email. Please register first.' 
      });
    }

    // Verify password against stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Login rejected: Invalid password for -', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password. Please try again.' 
      });
    }

    // Update last login time
    updateUser(user.id, { lastLogin: new Date().toISOString() });

    console.log('✅ Login successful for registered user:', { id: user.id, email: user.email });

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
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    res.json({ 
      success: true, 
      data: { user: userData } 
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// @desc    Get all registered users (for testing)
// @route   GET /api/auth/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const { readUsers } = require('../utils/userStorage');
    const users = readUsers();
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt
    }));
    res.json({ 
      success: true, 
      count: users.length,
      users: safeUsers 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  logout, 
  getAllUsers 
};

