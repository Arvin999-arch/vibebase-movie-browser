// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getReviews,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateMovieId, checkValidation } = require('../middleware/validation');

// Watchlist routes
router.get('/watchlist', protect, getWatchlist);
router.post('/watchlist', protect, validateMovieId, checkValidation, addToWatchlist);
router.delete('/watchlist/:movieId', protect, removeFromWatchlist);

// Favorites routes
router.get('/favorites', protect, getFavorites);
router.post('/favorites', protect, validateMovieId, checkValidation, addToFavorites);
router.delete('/favorites/:movieId', protect, removeFromFavorites);

// Reviews routes
router.get('/reviews', protect, getReviews);

// Profile routes
router.put('/profile', protect, updateProfile);

module.exports = router;