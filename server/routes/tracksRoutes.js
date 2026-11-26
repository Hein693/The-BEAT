const express = require('express');
const router = express.Router();
const tracksController = require('../controllers/tracksController');

// GET /api/tracks/trending - Get top trending tracks
router.get('/trending', tracksController.getTrending);

// GET /api/tracks/charts - Get live top charts (Deezer/iTunes or DB fallback)
router.get('/charts', tracksController.getCharts);

// GET /api/tracks/recently-played - Get user playback history
router.get('/recently-played', tracksController.getRecentlyPlayed);

// GET /api/tracks/favorites - Get user liked tracks
router.get('/favorites', tracksController.getFavorites);

// POST /api/tracks/:trackId/favorite - Toggle favorite status
router.post('/:trackId/favorite', tracksController.toggleFavorite);

// POST /api/tracks/:trackId/play - Record a playback event
router.post('/:trackId/play', tracksController.recordPlay);

// GET /api/tracks/:trackId - Get single track details
router.get('/:trackId', tracksController.getTrackById);

module.exports = router;
