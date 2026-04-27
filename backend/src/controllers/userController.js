
// src/controllers/userController.js
const { prisma } = require('../config/database');

// @desc    Get user's watchlist
// @route   GET /api/users/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
      orderBy: { addedAt: 'desc' }
    });
    
    res.json({ success: true, data: watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/users/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;

    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: req.user.id,
        movieId
      },
      include: { movie: true }
    });

    res.json({ success: true, data: watchlistItem });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Movie already in watchlist' });
    }
    console.error('Add to watchlist error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Remove from watchlist
// @route   DELETE /api/users/watchlist/:movieId
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);

    await prisma.watchlist.delete({
      where: {
        userId_movieId: {
          userId: req.user.id,
          movieId
        }
      }
    });

    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Similar functions for favorites...
const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
      orderBy: { addedAt: 'desc' }
    });
    
    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { movieId } = req.body;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        movieId
      },
      include: { movie: true }
    });

    res.json({ success: true, data: favorite });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Movie already in favorites' });
    }
    console.error('Add to favorites error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);

    await prisma.favorite.delete({
      where: {
        userId_movieId: {
          userId: req.user.id,
          movieId
        }
      }
    });

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  addToFavorites,
  removeFromFavorites
};