
// frontend/src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { 
  register as registerAPI, 
  login as loginAPI, 
  logout as logoutAPI, 
  getCurrentUser 
} from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
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

  const register = async (username, email, password) => {
    setError(null);
    const result = await registerAPI(username, email, password);
    
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    } else {
      setError(result.error);
    }
    return result;
  };

  const login = async (email, password) => {
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return { success: false, error: 'Please enter both email and password' };
    }
    
    const result = await loginAPI(email, password);
    
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    } else {
      setError(result.error);
    }
    return result;
  };

  const logout = () => {
    logoutAPI();
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
