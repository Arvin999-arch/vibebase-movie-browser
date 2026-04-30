import React from "react";

// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateForm = () => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (!agreeTerms) return 'You must agree to the Terms of Service';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    console.log('Attempting to register:', { username, email, password });
    
    const result = await register(username, email, password);
    console.log('Registration result:', result);
    
    if (result.success) {
      alert('Registration successful! Redirecting to home...');
      navigate('/');
    } else {
      alert('Registration failed: ' + (result.error || 'Unknown error'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🎬</div>
            <h1>Create Account</h1>
            <p>Join VibeBase and start your movie journey</p>
          </div>

          {error && (
            <div className="error-message general-error">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username *</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
              <small>Must be at least 6 characters</small>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
              </label>
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? <span className="loading-spinner-small"></span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="decoration-content">
            <h2>Join VibeBase</h2>
            <p>Get personalized recommendations and track your favorite movies</p>
            <div className="decoration-features">
              <div className="feature">
                <span>🎬</span>
                <span>Thousands of Movies</span>
              </div>
              <div className="feature">
                <span>⭐</span>
                <span>User Ratings</span>
              </div>
              <div className="feature">
                <span>📝</span>
                <span>Create Watchlists</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
