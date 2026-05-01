// frontend/src/services/authService.js
// Use the new Render backend URL
const API_URL = 'https://vibebase-backend.onrender.com/api/auth';

// Store auth data
const setAuthData = (token, user) => {
  if (token && user) {
    localStorage.setItem('vibebase_token', token);
    localStorage.setItem('vibebase_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vibebase_token');
    localStorage.removeItem('vibebase_user');
  }
};

// Register new user
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setAuthData(data.data.token, data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Connection error. Please try again.' };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setAuthData(data.data.token, data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Connection error. Please try again.' };
  }
};

// Logout
export const logout = () => {
  setAuthData(null, null);
};

// Get current user
export const getCurrentUser = async () => {
  const token = localStorage.getItem('vibebase_token');
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.user;
    } else {
      logout();
      return null;
    }
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
};