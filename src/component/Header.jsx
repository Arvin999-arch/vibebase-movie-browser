
// frontend/src/component/Header.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/VibeBase Browser Logo (2).png';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    // Redirect to login page after logout
    navigate('/login');
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={logo} alt="VibeBase logo" className="logo-image" />
          <span className="logo-text">VibeBase</span>
        </Link>

        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Browse Movies
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-link active register-btn' : 'nav-link register-btn'}>
            + Add Movie
          </NavLink>
          
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{user?.username || 'User'}</span>
                <span className="user-dropdown">▼</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-avatar">👤</span>
                    <div>
                      <div className="dropdown-user-name">{user?.username}</div>
                      <div className="dropdown-user-email">{user?.email}</div>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">👤 My Profile</Link>
                  <Link to="/watchlist" className="dropdown-item">📋 My Watchlist</Link>
                  <Link to="/favorites" className="dropdown-item">❤️ My Favorites</Link>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link register-btn">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

