/**
 * ====================================================================
 * Search Controller
 * The BEAT - Music Streaming Backend
 * ====================================================================
 * Handles search queries across tracks, artists, and albums
 * integrating both local database records and live music API results.
 */

const musicApiService = require('../services/musicApiService');
const dbService = require('../services/dbService');

exports.search = async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit, 10) || 20;

    if (!query || query.trim() === '') {
      return res.json({ success: true, count: 0, data: { tracks: [], artists: [] } });
    }

    // 1. Search tracks (queries live Deezer/iTunes API or local fallback)
    const tracks = await musicApiService.searchMusic(query.trim(), limit);

    // 2. Search artists in local database
    const allArtists = await dbService.getArtists(50);
    const qLower = query.toLowerCase();
    const matchingArtists = allArtists.filter(a => a.name.toLowerCase().includes(qLower));

    res.json({
      success: true,
      query: query.trim(),
      data: {
        tracks,
        artists: matchingArtists
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
