/**
 * ====================================================================
 * Music API Service (Deezer & iTunes Integration)
 * The BEAT - Music Streaming Backend
 * ====================================================================
 * Interacts with approved public music metadata APIs (Deezer & iTunes)
 * to provide real artists, albums, tracks, and 30-second audio previews.
 * Results are cached in the database for optimal speed and offline resilience.
 */

const dbService = require('./dbService');

const DEEZER_BASE = process.env.DEEZER_API_BASE || 'https://api.deezer.com';
const ITUNES_BASE = process.env.ITUNES_API_BASE || 'https://itunes.apple.com';

class MusicApiService {
  /**
   * Search for songs, artists, or albums
   * @param {string} query
   * @param {number} limit
   */
  async searchMusic(query, limit = 20) {
    if (!query || query.trim() === '') return [];

    try {
      // 1. First attempt Deezer Search API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `${DEEZER_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          const formattedTracks = [];
          for (const item of data.data) {
            // Save to DB in background
            const trackObj = {
              title: item.title,
              artist_name: item.artist ? item.artist.name : 'Unknown Artist',
              album_title: item.album ? item.album.title : 'Single',
              duration: item.duration || 180,
              preview_url: item.preview,
              cover_url: item.album && item.album.cover_medium 
                ? item.album.cover_medium 
                : (item.artist && item.artist.picture_medium ? item.artist.picture_medium : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'),
              api_id: `dz-${item.id}`
            };

            // If item has a valid audio preview
            if (trackObj.preview_url) {
              const savedId = await dbService.saveApiTrack(trackObj);
              formattedTracks.push({
                id: savedId || `api-${item.id}`,
                title: trackObj.title,
                artist_name: trackObj.artist_name,
                album_title: trackObj.album_title,
                duration_seconds: trackObj.duration,
                preview_url: trackObj.preview_url,
                cover_url: trackObj.cover_url,
                is_favorite: false
              });
            }
          }

          if (formattedTracks.length > 0) {
            return formattedTracks;
          }
        }
      }
    } catch (err) {
      console.warn('[MusicApi] Deezer search failed or timed out:', err.message);
    }

    // 2. Fallback to iTunes Search API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          const formattedTracks = [];
          for (const item of data.results) {
            if (item.previewUrl) {
              const highResArtwork = (item.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg');
              const trackObj = {
                title: item.trackName,
                artist_name: item.artistName,
                album_title: item.collectionName || 'Single',
                duration: Math.round((item.trackTimeMillis || 180000) / 1000),
                preview_url: item.previewUrl,
                cover_url: highResArtwork || item.artworkUrl100,
                api_id: `itunes-${item.trackId}`
              };

              const savedId = await dbService.saveApiTrack(trackObj);
              formattedTracks.push({
                id: savedId || `api-itunes-${item.trackId}`,
                title: trackObj.title,
                artist_name: trackObj.artist_name,
                album_title: trackObj.album_title,
                duration_seconds: trackObj.duration,
                preview_url: trackObj.preview_url,
                cover_url: trackObj.cover_url,
                is_favorite: false
              });
            }
          }
          if (formattedTracks.length > 0) return formattedTracks;
        }
      }
    } catch (itunesErr) {
      console.warn('[MusicApi] iTunes fallback search failed:', itunesErr.message);
    }

    // 3. Fallback to local database search
    const localTracks = await dbService.getTrendingTracks(50);
    const qLower = query.toLowerCase();
    return localTracks.filter(t => 
      t.title.toLowerCase().includes(qLower) || 
      t.artist_name.toLowerCase().includes(qLower) ||
      (t.album_title && t.album_title.toLowerCase().includes(qLower))
    );
  }

  /**
   * Fetch live global charts
   */
  async getTopCharts() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${DEEZER_BASE}/chart/0/tracks?limit=15`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          const chartTracks = [];
          for (const item of data.data) {
            const trackObj = {
              title: item.title,
              artist_name: item.artist ? item.artist.name : 'Unknown Artist',
              album_title: item.album ? item.album.title : 'Single',
              duration: item.duration || 180,
              preview_url: item.preview,
              cover_url: item.album ? item.album.cover_medium : item.artist.picture_medium,
              api_id: `dz-${item.id}`
            };

            if (trackObj.preview_url) {
              const savedId = await dbService.saveApiTrack(trackObj);
              chartTracks.push({
                id: savedId || `api-${item.id}`,
                title: trackObj.title,
                artist_name: trackObj.artist_name,
                album_title: trackObj.album_title,
                duration_seconds: trackObj.duration,
                preview_url: trackObj.preview_url,
                cover_url: trackObj.cover_url,
                is_trending: true,
                is_favorite: false
              });
            }
          }
          if (chartTracks.length > 0) return chartTracks;
        }
      }
    } catch (err) {
      console.warn('[MusicApi] Failed to fetch live charts from Deezer:', err.message);
    }

    // Fallback to local trending tracks
    return dbService.getTrendingTracks(15);
  }

  /**
   * Get artist top tracks
   */
  async getArtistTopTracks(artistName) {
    if (!artistName) return [];
    return this.searchMusic(artistName, 10);
  }
}

module.exports = new MusicApiService();
