// frontend/src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('vibebase_token');
        const storedUser = localStorage.getItem('vibebase_user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // eslint-disable-next-line no-unused-vars
  const register = async (username, email, password) => {
    setError(null);
    try {
      const newUser = { 
        id: Date.now(), 
        username, 
        email,
        createdAt: new Date().toISOString()
      };
      const token = 'mock_token_' + Date.now();
      
      localStorage.setItem('vibebase_token', token);
      localStorage.setItem('vibebase_user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, data: { user: newUser, token } };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // eslint-disable-next-line no-unused-vars
  const login = async (email, password) => {
    setError(null);
    try {
      const mockUser = { 
        id: 1, 
        username: email.split('@')[0], 
        email,
        createdAt: new Date().toISOString()
      };
      const token = 'mock_token_' + Date.now();
      
      localStorage.setItem('vibebase_token', token);
      localStorage.setItem('vibebase_user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, data: { user: mockUser, token } };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('vibebase_token');
    localStorage.removeItem('vibebase_user');
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

