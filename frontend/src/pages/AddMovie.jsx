import React from "react";
// src/pages/AddMovie.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'

// Genre options for the form
const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War'
];

function AddMovie() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: '',
    genre: '',
    releaseDate: '',
    posterUrl: '',
    runtime: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.rating) {
      newErrors.rating = 'Rating is required';
    } else {
      const rating = parseFloat(formData.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        newErrors.rating = 'Rating must be between 0 and 10';
      }
    }

    if (!formData.genre) {
      newErrors.genre = 'Please select a genre';
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Release date is required';
    } else {
      const year = new Date(formData.releaseDate).getFullYear();
      if (year < 1888 || year > new Date().getFullYear() + 5) {
        newErrors.releaseDate = 'Please enter a valid release year';
      }
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Form is valid - save to localStorage or state
      const existingMovies = JSON.parse(localStorage.getItem('userMovies') || '[]');
      const newMovie = {
        id: Date.now(),
        ...formData,
        rating: parseFloat(formData.rating),
        createdAt: new Date().toISOString()
      };
      
      existingMovies.push(newMovie);
      localStorage.setItem('userMovies', JSON.stringify(existingMovies));
      
      setSubmitted(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        setSubmitted(false);
        navigate('/list');
      }, 2000);
    } else {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Clear form
  const handleClear = () => {
    setFormData({
      title: '',
      description: '',
      rating: '',
      genre: '',
      releaseDate: '',
      posterUrl: '',
      runtime: ''
    });
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>Movie Added Successfully!</h2>
        <p>Redirecting to movie list...</p>
      </div>
    );
  }

  return (
    <div className="add-movie-page">
      <div className="form-header">
        <h1>Add New Movie</h1>
        <p>Share your favorite movie with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="add-movie-form">
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title">
            Movie Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter movie title"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the movie plot, themes, and highlights..."
            rows="5"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Rating Field */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rating">
              Rating (0-10) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g., 8.5"
              className={errors.rating ? 'error' : ''}
            />
            {errors.rating && <span className="error-message">{errors.rating}</span>}
          </div>

          {/* Genre Field */}
          <div className="form-group">
            <label htmlFor="genre">
              Genre <span className="required">*</span>
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={errors.genre ? 'error' : ''}
            >
              <option value="">Select a genre</option>
              {GENRE_OPTIONS.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            {errors.genre && <span className="error-message">{errors.genre}</span>}
          </div>
        </div>

        {/* Release Date and Runtime */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="releaseDate">
              Release Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className={errors.releaseDate ? 'error' : ''}
            />
            {errors.releaseDate && <span className="error-message">{errors.releaseDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="runtime">
              Runtime (minutes)
            </label>
            <input
              type="number"
              id="runtime"
              name="runtime"
              value={formData.runtime}
              onChange={handleChange}
              placeholder="e.g., 120"
              min="1"
              max="500"
            />
          </div>
        </div>

        {/* Poster URL Field */}
        <div className="form-group">
          <label htmlFor="posterUrl">
            Poster Image URL
          </label>
          <input
            type="url"
            id="posterUrl"
            name="posterUrl"
            value={formData.posterUrl}
            onChange={handleChange}
            placeholder="https://example.com/poster.jpg"
          />
          <small>Enter a valid image URL for the movie poster</small>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            🎬 Add Movie
          </button>
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMovie;