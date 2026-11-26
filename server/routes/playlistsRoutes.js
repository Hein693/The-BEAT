const express = require('express');
const router = express.Router();
const playlistsController = require('../controllers/playlistsController');

// GET /api/playlists - List all playlists
router.get('/', playlistsController.getPlaylists);

// POST /api/playlists - Create new playlist
router.post('/', playlistsController.createPlaylist);

// GET /api/playlists/:playlistId - Get playlist details and tracks
router.get('/:playlistId', playlistsController.getPlaylistById);

// PUT /api/playlists/:playlistId - Update playlist metadata
router.put('/:playlistId', playlistsController.updatePlaylist);

// DELETE /api/playlists/:playlistId - Delete playlist
router.delete('/:playlistId', playlistsController.deletePlaylist);

// POST /api/playlists/:playlistId/tracks - Add track to playlist
router.post('/:playlistId/tracks', playlistsController.addTrackToPlaylist);

// DELETE /api/playlists/:playlistId/tracks/:trackId - Remove track from playlist
router.delete('/:playlistId/tracks/:trackId', playlistsController.removeTrackFromPlaylist);

module.exports = router;
