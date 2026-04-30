import React from "react";
// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🎬</div>
            <h1>Welcome to VibeBase</h1>
            <p>Sign in to start your movie journey</p>
          </div>

          {error && (
            <div className="error-message general-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                Email Address
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? <span className="loading-spinner-small"></span> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="decoration-content">
            <h2>VibeBase</h2>
            <p>Your ultimate destination for discovering amazing movies</p>
            <div className="decoration-features">
              <div className="feature">
                <span>-</span>
                <span>Thousands of Movies</span>
              </div>
              <div className="feature">
                <span>-</span>
                <span>Advanced Search</span>
              </div>
              <div className="feature">
                <span>-</span>
                <span>User Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;



