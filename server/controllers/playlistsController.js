/**
 * ====================================================================
 * Playlists Controller
 * The BEAT - Music Streaming Backend
 * ====================================================================
 * Full CRUD management of user playlists and track associations.
 */

const dbService = require('../services/dbService');

exports.getPlaylists = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId, 10) || 1;
    const playlists = await dbService.getPlaylists(userId);
    res.json({ success: true, count: playlists.length, data: playlists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = parseInt(req.query.userId, 10) || 1;
    const playlist = await dbService.getPlaylistById(playlistId, userId);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    res.json({ success: true, data: playlist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { title, description, cover_url, is_public } = req.body;
    const userId = parseInt(req.body.userId, 10) || 1;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Playlist title is required' });
    }

    const newPlaylist = await dbService.createPlaylist({
      title: title.trim(),
      description: description ? description.trim() : '',
      cover_url,
      is_public: is_public !== undefined ? is_public : true,
      user_id: userId
    });

    res.status(201).json({ success: true, data: newPlaylist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, description, cover_url } = req.body;

    const updated = await dbService.updatePlaylist(playlistId, { title, description, cover_url });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Playlist not found or could not be updated' });
    }

    res.json({ success: true, message: 'Playlist updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const deleted = await dbService.deletePlaylist(playlistId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Playlist not found or already deleted' });
    }
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addTrackToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;

    if (!trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required' });
    }

    await dbService.addTrackToPlaylist(playlistId, trackId);
    res.json({ success: true, message: 'Track added to playlist' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.removeTrackFromPlaylist = async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    await dbService.removeTrackFromPlaylist(playlistId, trackId);
    res.json({ success: true, message: 'Track removed from playlist' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
