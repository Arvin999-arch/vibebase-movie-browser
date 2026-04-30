
// frontend/src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

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

// Register new user - ONLY creates account if backend approves
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    // ONLY set auth data if backend says success
    if (data.success) {
      setAuthData(data.data.token, data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Connection error. Please try again.' };
  }
};

// Login user - ONLY if backend verifies user exists
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    // ONLY set auth data if backend says success (user exists in database)
    if (data.success) {
      setAuthData(data.data.token, data.data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Connection error. Please try again.' };
  }
};

// Logout user
export const logout = () => {
  setAuthData(null, null);
};

// Get current user - validates token with backend
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
      // Token is invalid, clear storage
      logout();
      return null;
    }
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};


