const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();
const app = express();

// Rate limiting for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/auth', limiter);

// CORS Configuration - Add all your Vercel URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vibebase-movie-browser.vercel.app',
  'https://vibebase-movie-browser-pi1bwjhjc-arvin999-archs-projects.vercel.app',
  'https://vibebase-movie-browser-pilbwjhc-arvin999-archs-projects.vercel.app',
  'https://vibebase-movie-browser-ln32ssfcy-arvin999-archs-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`❌ CORS blocked: ${origin}`);
      return callback(new Error('CORS not allowed'), false);
    }
    console.log(`✅ CORS allowed: ${origin}`);
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// JWT Token Generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'vibebase-secret-key',
    { expiresIn: '7d' }
  );
};

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'VibeBase Backend is running!',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'OK',
      message: 'VibeBase Backend is running!',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all users (debugging)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, createdAt: true }
    });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(`📝 Register attempt: ${username}, ${email}`);

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  if (username.length < 3) {
    return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      const error = existingUser.email === email
        ? 'Email already registered. Please login.'
        : 'Username already taken. Please choose another.';
      return res.status(400).json({ success: false, error });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true }
    });

    console.log(`✅ User registered: ${newUser.id}`);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { user: newUser, token }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt: ${email}`);

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found. Please register first.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid password. Please try again.' });
    }

    console.log(`✅ User logged in: ${user.id}`);
    const token = generateToken({ id: user.id, username: user.username, email: user.email });

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibebase-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 VibeBase Backend Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
  console.log(`\n✅ Ready to accept connections\n`);
  console.log(`🌐 CORS enabled for origins:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
});