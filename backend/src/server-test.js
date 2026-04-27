const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test auth endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  res.json({ success: true, message: 'Registration successful!' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({ success: true, message: 'Login successful!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
