import React from "react";
// src/pages/SearchResults.jsx
/**
 * SearchResults Component
 * Displays search results for movie queries
 * Handles URL parameter synchronization and search form submission
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import MovieList from '../component/MovieList';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults, searchQuery, setSearchQuery, loading, performSearch, error } = useMovies();
  const [localQuery, setLocalQuery] = useState(searchQuery || '');

  // Debug logging
  console.log('SearchResults - searchResults:', searchResults, 'Is Array:', Array.isArray(searchResults));

  // Get search query from URL and perform search when page loads
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query && query !== searchQuery) {
      setSearchQuery(query);
      setLocalQuery(query);
      performSearch(query);
    }
  }, [location.search, setSearchQuery, searchQuery, performSearch]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery && localQuery.trim()) {
      setSearchQuery(localQuery);
      navigate(`/search?q=${encodeURIComponent(localQuery)}`);
      performSearch(localQuery);
    }
  };

  // Handle clear search
  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    navigate('/search');
  };

  // Ensure searchResults is always an array for MovieList
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
  const hasSearchQuery = searchQuery && searchQuery.trim();

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Search Movies</h1>
        <p className="search-subtitle">Find your next favorite film</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, actor, or genre..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              autoFocus
              className="search-input-field"
            />
            {localQuery && (
              <button type="button" className="search-clear-btn" onClick={handleClear}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>
      </div>
      
      {/* Loading State */}
      {loading && hasSearchQuery && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Searching for "{searchQuery}"...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h3>Search Failed</h3>
          <p>{error}</p>
          <button onClick={() => performSearch(searchQuery)} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
      
      {/* Results Display */}
      {!loading && !error && (
        <>
          {hasSearchQuery && (
            <div className="results-header">
              <h2 className="results-title">
                Search Results for <span className="search-term">"{searchQuery}"</span>
              </h2>
              <p className="results-count">
                Found <strong>{safeSearchResults.length}</strong> movies
              </p>
            </div>
          )}
          
          {safeSearchResults.length === 0 && hasSearchQuery ? (
            <div className="no-results">
              <div className="no-results-icon">🎬</div>
              <h3>No movies found</h3>
              <p>We couldn't find any movies matching "{searchQuery}"</p>
              <div className="suggestions">
                <p>Try:</p>
                <ul>
                  <li>Checking your spelling</li>
                  <li>Using different keywords</li>
                  <li>Searching for a popular movie title</li>
                </ul>
              </div>
            </div>
          ) : (
            safeSearchResults.length > 0 && (
              <div className="results-grid">
                <MovieList movies={safeSearchResults} />
              </div>
            )
          )}
          
          {!hasSearchQuery && (
            <div className="empty-search">
              <div className="empty-search-icon">🔍</div>
              <h3>Ready to search?</h3>
              <p>Enter a movie title above to start exploring</p>
              <div className="popular-searches">
                <p>Popular searches:</p>
                <div className="popular-tags">
                  <button onClick={() => {
                    setLocalQuery('Inception');
                    handleSearch({ preventDefault: () => {} });
                  }}>Inception</button>
                  <button onClick={() => {
                    setLocalQuery('The Dark Knight');
                    handleSearch({ preventDefault: () => {} });
                  }}>The Dark Knight</button>
                  <button onClick={() => {
                    setLocalQuery('Interstellar');
                    handleSearch({ preventDefault: () => {} });
                  }}>Interstellar</button>
                  <button onClick={() => {
                    setLocalQuery('Avatar');
                    handleSearch({ preventDefault: () => {} });
                  }}>Avatar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;



