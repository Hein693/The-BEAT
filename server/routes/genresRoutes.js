const express = require('express');
const router = express.Router();
const genresController = require('../controllers/genresController');

// GET /api/genres - Get all music genres
router.get('/', genresController.getGenres);

// GET /api/genres/:genreSlugOrId/tracks - Get tracks for a specific genre
router.get('/:genreSlugOrId/tracks', genresController.getTracksByGenre);

module.exports = router;
