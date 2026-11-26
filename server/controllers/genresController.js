/**
 * ====================================================================
 * Genres Controller
 * The BEAT - Music Streaming Backend
 * ====================================================================
 */

const dbService = require('../services/dbService');

exports.getGenres = async (req, res) => {
  try {
    const genres = await dbService.getGenres();
    res.json({ success: true, count: genres.length, data: genres });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTracksByGenre = async (req, res) => {
  try {
    const { genreSlugOrId } = req.params;
    const userId = parseInt(req.query.userId, 10) || 1;
    const tracks = await dbService.getTracksByGenre(genreSlugOrId, userId);
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
