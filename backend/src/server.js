
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users = [];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VibeBase Backend is running!',
    timestamp: new Date().toISOString()
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
  
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must be at least 6 characters' 
    });
  }
  
  // Check if user exists
  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email already registered' 
    });
  }
  
  // Create user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password, // In production, hash this!
    createdAt: new Date()
  };
  
  users.push(newUser);
  console.log('✅ User registered:', { id: newUser.id, email: newUser.email });
  console.log('📊 Total users:', users.length);
  
  // Simple token (base64 encoded)
  const token = Buffer.from(JSON.stringify({ id: newUser.id, email: newUser.email })).toString('base64');
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    data: {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
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
      error: 'Invalid password' 
    });
  }
  
  console.log('✅ User logged in:', { id: user.id, email: user.email });
  
  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
  
  res.json({
    success: true,
    message: 'Login successful!',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    }
  });
});

// Get current user (protected route)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found` 
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 VibeBase Backend Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`\n✅ Ready to accept connections\n`);
});
