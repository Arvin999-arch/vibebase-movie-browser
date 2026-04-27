// src/routes/movies.js
const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  addReview
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateMovie, checkValidation } = require('../middleware/validation');

// Public routes
router.get('/', getMovies);
router.get('/:id', getMovieById);

// Protected routes
router.post('/:id/reviews', protect, addReview);

// Admin only routes
router.post('/', protect, adminOnly, validateMovie, checkValidation, createMovie);
router.put('/:id', protect, adminOnly, validateMovie, checkValidation, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;