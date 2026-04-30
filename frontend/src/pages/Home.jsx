import React from "react";
// src/pages/Home.jsx
/**
 * Home Component
 * Displays popular movies and handles search functionality
 * Manages tab state between popular movies and search results
 */

import { useState } from 'react';
import { useMovies } from '../hooks/useMovies';
import MovieList from '../component/MovieList';
import SearchBar from '../component/SearchBar';

function Home() {
  const { popularMovies, searchResults, searchQuery, setSearchQuery, loading } = useMovies();
  const [activeTab, setActiveTab] = useState('popular');

  // Debug logging to see what we're getting from context
  console.log('Home - popularMovies:', popularMovies, 'Is Array:', Array.isArray(popularMovies));
  console.log('Home - searchResults:', searchResults, 'Is Array:', Array.isArray(searchResults));
  
  // Ensure displayMovies is always an array with proper fallbacks
  let displayMovies = [];
  
  if (activeTab === 'popular') {
    // Ensure popularMovies is an array, fallback to empty array if not
    displayMovies = Array.isArray(popularMovies) ? popularMovies : [];
  } else {
    // Ensure searchResults is an array, fallback to empty array if not
    displayMovies = Array.isArray(searchResults) ? searchResults : [];
  }
  
  // Check if we're showing search results (has active search query)
  const isSearching = searchQuery && searchQuery.trim() !== '';

  // Handle tab switching with safety
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="home-page">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {/* Only show tabs when not searching */}
      {!isSearching && (
        <div className="tabs">
          <button 
            className={activeTab === 'popular' ? 'active' : ''} 
            onClick={() => handleTabChange('popular')}
          >
            Popular Movies
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading movies...</p>
        </div>
      ) : (
        <>
          {/* Show search info if searching */}
          {isSearching && activeTab !== 'popular' && (
            <h2>Search Results for "{searchQuery}"</h2>
          )}
          
          {/* Render movie list component with safe array */}
          <MovieList movies={displayMovies} />
        </>
      )}
    </div>
  );
}

export default Home;

