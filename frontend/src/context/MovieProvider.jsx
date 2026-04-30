// src/context/MovieProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MovieContext } from './MovieContext';
import { getPopularMovies, searchMovies, getMovieDetails } from '../services/api';

export function MovieProvider({ children }) {
  // ===== STATE MANAGEMENT =====
  const [popularMovies, setPopularMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // ===== API CALL FUNCTIONS =====
  
  /**
   * Fetch Popular Movies
   * Loads initial set of popular movies from TMDB API
   */
  const fetchPopularMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching popular movies...");
      
      const movies = await getPopularMovies();
      console.log("Movies received:", movies?.length || 0);
      
      setPopularMovies(Array.isArray(movies) ? movies : []);
      
      if (!movies || movies.length === 0) {
        setError("No movies found. Please check your API key or try again later.");
      }
    } catch (err) {
      console.error("Failed to load movies:", err);
      setError(err.message || "Failed to load movies. Please check your API key and internet connection.");
      setPopularMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Perform Search
   * Searches for movies based on user query
   * @param {string} query - Search term
   */
  const performSearch = useCallback(async (query) => {
    // Don't search if query is empty
    if (!query || query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      console.log("Searching for:", query);
      
      const results = await searchMovies(query);
      console.log("Search results:", results?.length || 0);
      
      // Ensure results is an array before setting
      setSearchResults(Array.isArray(results) ? results : []);
      
      if (!results || results.length === 0) {
        setError(`No results found for "${query}". Try a different search term.`);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || "Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Fetch Movie Details
   * Gets detailed information for a specific movie
   * @param {string|number} id - Movie ID
   */
  const fetchMovieDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching details for movie ID:", id);
      
      const movie = await getMovieDetails(id);
      setSelectedMovie(movie);
      return movie;
    } catch (err) {
      console.error("Failed to fetch movie details:", err);
      setError(err.message || "Failed to load movie details. Please try again.");
      setSelectedMovie(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear Search
   * Resets search results and query
   */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  }, []);

  /**
   * Retry Loading
   * Attempts to reload popular movies
   */
  const retryLoading = useCallback(() => {
    fetchPopularMovies();
  }, [fetchPopularMovies]);

  // ===== SIDE EFFECTS =====
  
  // Load popular movies on app start
  useEffect(() => {
    fetchPopularMovies();
  }, [fetchPopularMovies]);

  // Debounced search effect
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(delaySearch);
  }, [searchQuery, performSearch]);

  // ===== PROVIDER VALUE =====
  const contextValue = {
    // State values
    popularMovies,
    searchResults,
    searchQuery,
    setSearchQuery,
    loading,
    isSearching,
    error,
    selectedMovie,
    
    // Functions
    fetchPopularMovies,
    performSearch,
    fetchMovieDetails,
    clearSearch,
    retryLoading,
    
    // Helper values
    hasMovies: popularMovies.length > 0,
    hasSearchResults: searchResults.length > 0,
    isPopularMoviesEmpty: popularMovies.length === 0 && !loading,
    isSearchResultsEmpty: searchResults.length === 0 && !isSearching && searchQuery,
  };

  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
}



