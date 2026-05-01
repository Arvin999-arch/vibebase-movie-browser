const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

// Simple CORS - Allow all Vercel domains
app.use(cors({
  origin: function(origin, callback) {
    // Allow all Vercel domains, localhost, and no-origin requests
    if (!origin) return callback(null, true);
    if (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    console.log(`CORS blocked: ${origin}`);
    return callback(new Error('CORS not allowed'), false);
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
      error: error.message
    });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(`Register attempt: ${username}, ${email}`);

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true }
    });

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
  console.log(`Login attempt: ${email}`);

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
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 VibeBase Backend Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
  console.log(`\n✅ Ready to accept connections\n`);
});
