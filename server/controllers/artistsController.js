/**
 * ====================================================================
 * Artists Controller
 * The BEAT - Music Streaming Backend
 * ====================================================================
 */

const dbService = require('../services/dbService');
const musicApiService = require('../services/musicApiService');

exports.getArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const artists = await dbService.getArtists(limit);
    res.json({ success: true, count: artists.length, data: artists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = parseInt(req.query.userId, 10) || 1;
    const details = await dbService.getArtistById(artistId, userId);

    if (!details.artist) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    // If tracks are few, attempt to fetch additional tracks from live music API
    if (details.tracks.length < 3 && details.artist.name) {
      const liveTracks = await musicApiService.getArtistTopTracks(details.artist.name);
      if (liveTracks.length > 0) {
        details.tracks = liveTracks;
      }
    }

    res.json({ success: true, data: details });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
