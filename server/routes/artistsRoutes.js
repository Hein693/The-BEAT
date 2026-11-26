const express = require('express');
const router = express.Router();
const artistsController = require('../controllers/artistsController');

// GET /api/artists - List popular artists
router.get('/', artistsController.getArtists);

// GET /api/artists/:artistId - Get artist details, albums, top tracks
router.get('/:artistId', artistsController.getArtistById);

module.exports = router;
