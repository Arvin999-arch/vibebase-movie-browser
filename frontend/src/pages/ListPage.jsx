import React from "react";
import { useState, useEffect } from 'react';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../component/MovieCard';

// Genre list based on TMDB genre IDs
const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

// Sorting options
const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'Title A-Z' },
  { value: 'title.desc', label: 'Title Z-A' }
];

function ListPage() {
  const { popularMovies, loading } = useMovies();
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    if (!popularMovies || popularMovies.length === 0) return;

    let movies = [...popularMovies];

    // Filter by genre
    if (selectedGenre) {
      movies = movies.filter(movie => 
        movie.genre_ids && movie.genre_ids.includes(parseInt(selectedGenre))
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      movies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    movies.sort((a, b) => {
      switch (sortBy) {
        case 'popularity.desc':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'vote_average.desc':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'release_date.desc':
          return new Date(b.release_date) - new Date(a.release_date);
        case 'release_date.asc':
          return new Date(a.release_date) - new Date(b.release_date);
        case 'title.asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title.desc':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    setFilteredMovies(movies);
  }, [popularMovies, selectedGenre, sortBy, searchTerm]);

  // Get genre name by ID
  const getGenreName = (genreId) => {
    const genre = GENRES.find(g => g.id === parseInt(genreId));
    return genre ? genre.name : '';
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>Browse All Movies</h1>
        <p>Discover and explore our complete movie collection</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* Search Input */}
          <div className="filter-group">
            <label>🔍 Search Movies</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Genre Filter */}
          <div className="filter-group">
            <label>🎭 Filter by Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="filter-select"
            >
              <option value="">All Genres</option>
              {GENRES.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <label>📊 Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          Found <strong>{filteredMovies.length}</strong> movies
          {selectedGenre && ` in ${getGenreName(selectedGenre)}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🎬</div>
          <h3>No movies found</h3>
          <p>Try adjusting your filters or search term</p>
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSelectedGenre('');
              setSearchTerm('');
              setSortBy('popularity.desc');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ListPage;