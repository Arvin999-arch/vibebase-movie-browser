// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter  
    future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
      <AuthProvider>
        <MovieProvider>
          <App />
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);