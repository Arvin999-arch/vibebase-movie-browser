
// frontend/src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

// Log API URL in development only
if (import.meta.env.DEV) {
  console.log('🔗 Auth API URL:', API_URL);
}

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

// Helper for API calls with better error handling
const apiCall = async (endpoint, method, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data);
      return { 
        success: false, 
        error: data.error || `Server error: ${response.status}` 
      };
    }
    
    return data;
  } catch (error) {
    console.error(`Network error calling ${endpoint}:`, error);
    return { 
      success: false, 
      error: 'Connection error. Please check your internet connection and try again.' 
    };
  }
};

// Register new user
export const register = async (username, email, password) => {
  const result = await apiCall('/register', 'POST', { username, email, password });
  
  if (result.success) {
    setAuthData(result.data.token, result.data.user);
  }
  
  return result;
};

// Login user
export const login = async (email, password) => {
  const result = await apiCall('/login', 'POST', { email, password });
  
  if (result.success) {
    setAuthData(result.data.token, result.data.user);
  }
  
  return result;
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
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('vibebase_token');
  const user = localStorage.getItem('vibebase_user');
  return !!(token && user);
};

// Get token for API requests
export const getToken = () => {
  return localStorage.getItem('vibebase_token');
};