
// frontend/src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './component/Header';
import Footer from './component/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import SearchResults from './pages/SearchResults';
import ListPage from './pages/ListPage';
import AddMovie from './pages/AddMovie';

// Protected Route - Only accessible when logged in
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route - For login/register pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {/* Only show header and footer when authenticated */}
      {isAuthenticated && <Header />}
      
      <main className="main-content">
        <Routes>
          {/* Public Routes - Login/Register (no auth needed) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes - Need authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />
          <Route path="/movie/:id" element={
            <ProtectedRoute>
              <MovieDetails />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          } />
          <Route path="/list" element={
            <ProtectedRoute>
              <ListPage />
            </ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute>
              <AddMovie />
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect based on auth status */}
          <Route path="*" element={
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          } />
        </Routes>
      </main>
      
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;