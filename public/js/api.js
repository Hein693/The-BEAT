/**
 * ====================================================================
 * API Client Module
 * The BEAT - Modern Music Streaming Platform
 * ====================================================================
 * Handles all asynchronous communication with the Express backend REST API.
 */

const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  },

  // Tracks
  async getTrending(limit = 12) {
    return this.request(`/tracks/trending?limit=${limit}`);
  },

  async getCharts() {
    return this.request('/tracks/charts');
  },

  async getRecentlyPlayed(limit = 8) {
    return this.request(`/tracks/recently-played?limit=${limit}`);
  },

  async getFavorites() {
    return this.request('/tracks/favorites');
  },

  async toggleFavorite(trackId) {
    return this.request(`/tracks/${trackId}/favorite`, { method: 'POST' });
  },

  async recordPlay(trackId) {
    return this.request(`/tracks/${trackId}/play`, { method: 'POST' });
  },

  // Artists
  async getArtists(limit = 20) {
    return this.request(`/artists?limit=${limit}`);
  },

  async getArtistById(artistId) {
    return this.request(`/artists/${artistId}`);
  },

  // Genres
  async getGenres() {
    return this.request('/genres');
  },

  async getTracksByGenre(genreSlugOrId) {
    return this.request(`/genres/${genreSlugOrId}/tracks`);
  },

  // Playlists
  async getPlaylists() {
    return this.request('/playlists');
  },

  async getPlaylistById(playlistId) {
    return this.request(`/playlists/${playlistId}`);
  },

  async createPlaylist(data) {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updatePlaylist(playlistId, data) {
    return this.request(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deletePlaylist(playlistId) {
    return this.request(`/playlists/${playlistId}`, {
      method: 'DELETE'
    });
  },

  async addTrackToPlaylist(playlistId, trackId) {
    return this.request(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ trackId })
    });
  },

  async removeTrackFromPlaylist(playlistId, trackId) {
    return this.request(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE'
    });
  },

  // Search
  async search(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  },

  // Settings
  async getSettings() {
    return this.request('/settings');
  },

  async updateSettings(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

window.API = API;
