import React from "react";

// frontend/src/component/MovieCard.jsx
import { useNavigate } from 'react-router-dom';

function MovieCard({ movie }) {
  const navigate = useNavigate();
  
  // Safe image handling
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Poster";

  // Format rating
  const rating = movie.vote_average && movie.vote_average > 0 
    ? movie.vote_average.toFixed(1) 
    : 'N/A';

  // Format year
  const year = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'N/A';

  // Truncate overview
  const truncateText = (text, maxLength = 120) => {
    if (!text) return 'No description available.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="movie-poster">
        <img src={imageUrl} alt={movie.title} />
        <div className="movie-overlay">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-year">{year}</p>
          <div className="movie-rating">
            <span className="rating-star">★</span>
            <span>{rating}</span>
          </div>
          <p className="movie-overview">{truncateText(movie.overview, 100)}</p>
          <button className="view-details-btn">View Details</button>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">{year}</span>
          <div className="movie-rating">
            <span className="rating-star">★</span>
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;

