const express = require('express');
const cors = require('cors');

const app = express();

// Configure CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vibebase-movie-browser.netlify.app',
  'https://vibebase.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// In-memory storage (for development - use database in production)
const users = [];

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
app.get('/api/auth/users', (req, res) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  }));
  
  res.json({
    success: true,
    count: users.length,
    users: safeUsers
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('📝 Registration attempt:', { username, email });
  
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
  
  // Check if user exists
  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email already registered. Please login.' 
    });
  }
  
  const usernameExists = users.find(u => u.username === username);
  if (usernameExists) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username already taken. Please choose another.' 
    });
  }
  
  // Create user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password, // In production, hash this with bcrypt!
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  console.log('✅ User registered:', { id: newUser.id, email: newUser.email });
  console.log('📊 Total users:', users.length);
  
  // Generate token
  const token = Buffer.from(JSON.stringify({ 
    id: newUser.id, 
    email: newUser.email,
    username: newUser.username 
  })).toString('base64');
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    data: {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      },
      token
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email });
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required' 
    });
  }
  
  // Find user
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'No account found with this email. Please register first.' 
    });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid password. Please try again.' 
    });
  }
  
  console.log('✅ User logged in:', { id: user.id, email: user.email });
  
  const token = Buffer.from(JSON.stringify({ 
    id: user.id, 
    email: user.email,
    username: user.username 
  })).toString('base64');
  
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
});

// Get current user (protected route)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No token provided. Please login.' 
    });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
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
app.get('/api/users/watchlist', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      watchlist: user.watchlist || []
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

app.post('/api/users/watchlist', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { movieId, movieTitle, posterPath } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!user.watchlist) user.watchlist = [];
    
    const exists = user.watchlist.some(item => item.movieId === movieId);
    if (exists) {
      return res.status(400).json({ success: false, error: 'Movie already in watchlist' });
    }
    
    user.watchlist.push({ movieId, movieTitle, posterPath, addedAt: new Date() });
    
    res.json({
      success: true,
      message: 'Added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

app.delete('/api/users/watchlist/:movieId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const movieId = parseInt(req.params.movieId);
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    user.watchlist = (user.watchlist || []).filter(item => item.movieId !== movieId);
    
    res.json({
      success: true,
      message: 'Removed from watchlist',
      watchlist: user.watchlist
    });
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

// Start server - use PORT from environment variable for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 VibeBase Backend Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Users: http://localhost:${PORT}/api/auth/users`);
  console.log(`\n✅ Ready to accept connections\n`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});
