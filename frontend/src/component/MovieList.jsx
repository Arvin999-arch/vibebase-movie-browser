import React from "react";
// src/component/MovieList.jsx
/**
 * MovieList Component
 * Renders a grid of movie cards from an array of movie data
 * Handles loading states and empty results gracefully
 */

import MovieCard from "./MovieCard";

function MovieList({ movies }) {
  // Debug logging to see what's being received
  console.log('MovieList received:', movies, 'Type:', typeof movies, 'Is Array:', Array.isArray(movies));
  
  // Check if movies is undefined or null
  if (!movies) {
    console.warn('MovieList: movies prop is undefined or null');
    return <p className="error-message">Unable to load movies. Please try again later.</p>;
  }
  
  // Check if movies is an array
  if (!Array.isArray(movies)) {
    console.error('MovieList: movies prop is not an array! Received:', typeof movies);
    return <p className="error-message">Invalid movie data format. Please refresh the page.</p>;
  }
  
  // Check if array is empty
  if (movies.length === 0) {
    return <p className="no-results">No movies found. Try a different search term!</p>;
  }

  // Render movie grid with all safety checks passed
  return (
    <div className="movies-grid">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export default MovieList;