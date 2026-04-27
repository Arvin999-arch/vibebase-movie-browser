
// src/controllers/movieController.js
const { prisma } = require('../config/database');

// @desc    Get all movies (with pagination)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        skip,
        take: limit,
        orderBy: { popularity: 'desc' }
      }),
      prisma.movie.count()
    ]);

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    // Calculate average rating
    const averageRating = movie.reviews.length > 0
      ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
      : 0;

    // Get user interaction if authenticated
    let userInteraction = {};
    if (req.user) {
      const [inWatchlist, inFavorites, userReview] = await Promise.all([
        prisma.watchlist.findUnique({
          where: {
            userId_movieId: {
              userId: req.user.id,
              movieId: id
            }
          }
        }),
        prisma.favorite.findUnique({
          where: {
            userId_movieId: {
              userId: req.user.id,
              movieId: id
            }
          }
        }),
        prisma.review.findUnique({
          where: {
            userId_movieId: {
              userId: req.user.id,
              movieId: id
            }
          }
        })
      ]);

      userInteraction = {
        inWatchlist: !!inWatchlist,
        inFavorites: !!inFavorites,
        userRating: userReview?.rating || null,
        userReview: userReview?.review || null
      };
    }

    res.json({
      success: true,
      data: {
        ...movie,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: movie.reviews.length,
        userInteraction
      }
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Create a new movie (Admin only)
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const { id, title, overview, posterPath, backdropPath, releaseDate, voteAverage, voteCount, popularity } = req.body;

    // Check if movie already exists
    const existingMovie = await prisma.movie.findUnique({ where: { id } });
    if (existingMovie) {
      return res.status(400).json({ success: false, error: 'Movie already exists' });
    }

    const movie = await prisma.movie.create({
      data: {
        id,
        title,
        overview,
        posterPath,
        backdropPath,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        voteAverage: voteAverage || 0,
        voteCount: voteCount || 0,
        popularity: popularity || 0
      }
    });

    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update movie (Admin only)
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, overview, posterPath, backdropPath, releaseDate, voteAverage, voteCount, popularity } = req.body;

    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title,
        overview,
        posterPath,
        backdropPath,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        voteAverage,
        voteCount,
        popularity
      }
    });

    res.json({ success: true, data: movie });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete movie (Admin only)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.movie.delete({ where: { id } });
    
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Add review to movie
// @route   POST /api/movies/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const { rating, review } = req.body;

    // Check if movie exists
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    // Upsert review
    const userReview = await prisma.review.upsert({
      where: {
        userId_movieId: {
          userId: req.user.id,
          movieId
        }
      },
      update: { rating, review },
      create: {
        userId: req.user.id,
        movieId,
        rating,
        review
      }
    });

    res.json({ success: true, data: userReview });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  addReview
};
