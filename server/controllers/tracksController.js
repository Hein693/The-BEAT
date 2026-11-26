/**
 * ====================================================================
 * Tracks Controller
 * The BEAT - Music Streaming Backend
 * ====================================================================
 */

const dbService = require('../services/dbService');
const musicApiService = require('../services/musicApiService');

exports.getTrending = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;
    const tracks = await dbService.getTrendingTracks(limit);
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRecentlyPlayed = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const history = await dbService.getRecentlyPlayed(userId, limit);
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.recordPlay = async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = parseInt(req.body.userId, 10) || 1;
    await dbService.recordPlay(trackId, userId);
    res.json({ success: true, message: 'Playback recorded' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId, 10) || 1;
    const favorites = await dbService.getFavorites(userId);
    res.json({ success: true, count: favorites.length, data: favorites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = parseInt(req.body.userId, 10) || 1;
    const result = await dbService.toggleFavorite(trackId, userId);
    res.json({ success: true, is_favorite: result.is_favorite });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTrackById = async (req, res) => {
  try {
    const { trackId } = req.params;
    const track = await dbService.getTrackById(trackId);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, data: track });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const charts = await musicApiService.getTopCharts();
    res.json({ success: true, count: charts.length, data: charts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
