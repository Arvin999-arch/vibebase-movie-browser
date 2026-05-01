const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

// Configure CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vibebase-movie-browser.vercel.app'  // Your Vercel frontend URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`CORS blocked origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    console.log(`CORS allowed origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'vibebase-secret-key',
    { expiresIn: '7d' }
  );
};

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VibeBase API is running!',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login',
      me: '/api/auth/me',
      users: '/api/auth/users',
      watchlist: '/api/users/watchlist',
      favorites: '/api/users/favorites'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VibeBase Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all registered users (for debugging)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log(`Registration attempt: ${username}, ${email}`);

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Username must be at least 3 characters'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid email address'
    });
  }

  try {
    // Check if user exists in database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      const error = existingUser.email === email
        ? 'Email already registered. Please login.'
        : 'Username already taken. Please choose another.';
      return res.status(400).json({ success: false, error });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    console.log(`✅ User registered: ${newUser.id} - ${newUser.email}`);

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(`Login attempt: ${email}`);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No account found with this email. Please register first.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please try again.'
      });
    }

    console.log(`✅ User logged in: ${user.id} - ${user.email}`);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibebase-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Watchlist endpoints
app.get('/api/users/watchlist', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibebase-secret-key');
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: decoded.id },
      include: { movie: true }
    });
    res.json({ success: true, watchlist });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

app.post('/api/users/watchlist', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { movieId, movieTitle, posterPath } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibebase-secret-key');

    // Check if movie already in watchlist
    const existing = await prisma.watchlist.findFirst({
      where: { userId: decoded.id, movieId }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Movie already in watchlist' });
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: decoded.id,
        movieId,
        movieTitle,
        posterPath
      }
    });

    res.json({ success: true, watchlistItem });
  } catch (error) {
    console.error('Watchlist add error:', error);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

app.delete('/api/users/watchlist/:movieId', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const movieId = parseInt(req.params.movieId);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibebase-secret-key');

    await prisma.watchlist.deleteMany({
      where: {
        userId: decoded.id,
        movieId
      }
    });

    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: 'Available endpoints: /api/health, /api/auth/register, /api/auth/login, /api/auth/me'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 VibeBase Backend Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Users: http://localhost:${PORT}/api/auth/users`);
  console.log(`\n✅ Ready to accept connections\n`);
  console.log(`🌐 CORS enabled for origins:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
});

