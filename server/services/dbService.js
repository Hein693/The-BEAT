/**
 * ====================================================================
 * Database Service & Repository
 * The BEAT - Music Streaming Backend
 * ====================================================================
 * Unified database abstraction providing CRUD methods for tracks,
 * artists, albums, genres, playlists, favorites, and history.
 * Supports both real MySQL connections and in-memory seed store fallback.
 */

const { getPool, isMySQLConnected } = require('../config/db');

// In-Memory Seed Storage for fallback and instantaneous offline operation
const memoryDb = {
  users: [
    {
      id: 1,
      username: 'beat_listener',
      email: 'alex@thebeat.fm',
      display_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      theme_preference: 'dark',
      audio_quality: 'high',
      notifications_enabled: true
    }
  ],
  genres: [
    { id: 1, name: 'Pop', slug: 'pop', color_gradient: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)', icon_name: 'sparkles' },
    { id: 2, name: 'Hip-Hop', slug: 'hip-hop', color_gradient: 'linear-gradient(135deg, #ff7b00 0%, #ff0055 100%)', icon_name: 'mic' },
    { id: 3, name: 'R&B', slug: 'r-and-b', color_gradient: 'linear-gradient(135deg, #7928ca 0%, #4facfe 100%)', icon_name: 'heart' },
    { id: 4, name: 'Electronic', slug: 'electronic', color_gradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', icon_name: 'cpu' },
    { id: 5, name: 'Rock', slug: 'rock', color_gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', icon_name: 'zap' },
    { id: 6, name: 'K-Pop', slug: 'k-pop', color_gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', icon_name: 'star' },
    { id: 7, name: 'Indie & Alt', slug: 'indie', color_gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon_name: 'compass' },
    { id: 8, name: 'Jazz', slug: 'jazz', color_gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', icon_name: 'music' },
    { id: 9, name: 'Latin', slug: 'latin', color_gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon_name: 'flame' }
  ],
  artists: [
    {
      id: 1,
      name: 'The Weeknd',
      api_id: 'dz-96356',
      image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      bio: 'Renowned Canadian singer, songwriter, and producer known for his cinematic synth-wave and R&B narratives.',
      popularity: 98,
      monthly_listeners: 108450000
    },
    {
      id: 2,
      name: 'Dua Lipa',
      api_id: 'dz-8493113',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      bio: 'Global disco-pop phenomenon with signature mezzo-soprano vocals and dancefloor-filling anthems.',
      popularity: 95,
      monthly_listeners: 78200000
    },
    {
      id: 3,
      name: 'Billie Eilish',
      api_id: 'dz-10884214',
      image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      bio: 'Grammy and Oscar-winning vanguard of intimate alt-pop and atmospheric sonic landscapes.',
      popularity: 96,
      monthly_listeners: 91500000
    },
    {
      id: 4,
      name: 'Kendrick Lamar',
      api_id: 'dz-3007',
      image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
      bio: 'Pulitzer Prize-winning hip-hop luminary known for vivid storytelling and cultural impact.',
      popularity: 94,
      monthly_listeners: 69400000
    },
    {
      id: 5,
      name: 'SZA',
      api_id: 'dz-4573117',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
      bio: 'Top contemporary R&B visionary with emotionally resonant lyrics and fluid melodic flows.',
      popularity: 94,
      monthly_listeners: 67800000
    },
    {
      id: 6,
      name: 'Daft Punk',
      api_id: 'dz-27',
      image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      bio: 'Legendary French electronic pioneers who defined modern house, synth-funk, and vocoder music.',
      popularity: 91,
      monthly_listeners: 32100000
    },
    {
      id: 7,
      name: 'Bad Bunny',
      api_id: 'dz-10583405',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      bio: 'Puerto Rican trailblazer dominating Latin trap, reggaeton, and global streaming charts.',
      popularity: 97,
      monthly_listeners: 79200000
    }
  ],
  albums: [
    { id: 1, title: 'After Hours', artist_id: 1, cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', release_date: '2020-03-20', total_tracks: 14 },
    { id: 2, title: 'Future Nostalgia', artist_id: 2, cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', release_date: '2020-03-27', total_tracks: 11 },
    { id: 3, title: 'HIT ME HARD AND SOFT', artist_id: 3, cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', release_date: '2024-05-17', total_tracks: 10 },
    { id: 4, title: 'DAMN.', artist_id: 4, cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', release_date: '2017-04-14', total_tracks: 14 },
    { id: 5, title: 'SOS', artist_id: 5, cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', release_date: '2022-12-09', total_tracks: 23 },
    { id: 6, title: 'Discovery', artist_id: 6, cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', release_date: '2001-03-12', total_tracks: 14 }
  ],
  tracks: [
    {
      id: 1,
      title: 'Blinding Lights',
      artist_id: 1,
      album_id: 1,
      genre_id: 1,
      duration_seconds: 200,
      preview_url: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fac9a381e73be73611e977782e1-7.mp3',
      cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
      play_count: 3894210,
      is_trending: true
    },
    {
      id: 2,
      title: 'Save Your Tears',
      artist_id: 1,
      album_id: 1,
      genre_id: 1,
      duration_seconds: 215,
      preview_url: 'https://cdns-preview-b.dzcdn.net/stream/c-b26a6a164b18ff01ae2032e8d356fa6a-7.mp3',
      cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
      play_count: 2910400,
      is_trending: true
    },
    {
      id: 3,
      title: 'Levitating',
      artist_id: 2,
      album_id: 2,
      genre_id: 1,
      duration_seconds: 203,
      preview_url: 'https://cdns-preview-3.dzcdn.net/stream/c-3f2d2427a9235e12f6d2da3f678f142b-5.mp3',
      cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      play_count: 3421100,
      is_trending: true
    },
    {
      id: 4,
      title: 'Don\'t Start Now',
      artist_id: 2,
      album_id: 2,
      genre_id: 1,
      duration_seconds: 183,
      preview_url: 'https://cdns-preview-b.dzcdn.net/stream/c-b7168db1e7a57a1599ce5b0ff72e51a6-5.mp3',
      cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      play_count: 2810000,
      is_trending: false
    },
    {
      id: 5,
      title: 'LUNCH',
      artist_id: 3,
      album_id: 3,
      genre_id: 7,
      duration_seconds: 180,
      preview_url: 'https://cdns-preview-f.dzcdn.net/stream/c-f1797c5e2ec715699742ef0132fae17f-3.mp3',
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      play_count: 2150000,
      is_trending: true
    },
    {
      id: 6,
      title: 'BIRDS OF A FEATHER',
      artist_id: 3,
      album_id: 3,
      genre_id: 7,
      duration_seconds: 196,
      preview_url: 'https://cdns-preview-a.dzcdn.net/stream/c-ae0ef9ef5fb6d3d95ef41a9675276cf0-3.mp3',
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      play_count: 3912000,
      is_trending: true
    },
    {
      id: 7,
      title: 'HUMBLE.',
      artist_id: 4,
      album_id: 4,
      genre_id: 2,
      duration_seconds: 177,
      preview_url: 'https://cdns-preview-1.dzcdn.net/stream/c-12b4e548235552ea6374ee32aa28fdf4-6.mp3',
      cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      play_count: 3120000,
      is_trending: true
    },
    {
      id: 8,
      title: 'DNA.',
      artist_id: 4,
      album_id: 4,
      genre_id: 2,
      duration_seconds: 185,
      preview_url: 'https://cdns-preview-4.dzcdn.net/stream/c-49aa2bf415ff68182f76aa8c2c7ae007-6.mp3',
      cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      play_count: 1890000,
      is_trending: false
    },
    {
      id: 9,
      title: 'Kill Bill',
      artist_id: 5,
      album_id: 5,
      genre_id: 3,
      duration_seconds: 153,
      preview_url: 'https://cdns-preview-6.dzcdn.net/stream/c-6fc22fe11c1d4eb611a91e5926ec0022-4.mp3',
      cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      play_count: 4120300,
      is_trending: true
    },
    {
      id: 10,
      title: 'Snooze',
      artist_id: 5,
      album_id: 5,
      genre_id: 3,
      duration_seconds: 201,
      preview_url: 'https://cdns-preview-e.dzcdn.net/stream/c-ee43eef6bbbbfa0d235c34e8be56858e-4.mp3',
      cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      play_count: 2740000,
      is_trending: true
    },
    {
      id: 11,
      title: 'One More Time',
      artist_id: 6,
      album_id: 6,
      genre_id: 4,
      duration_seconds: 320,
      preview_url: 'https://cdns-preview-7.dzcdn.net/stream/c-7d9a1744beea82e06cbe16c3983272ce-5.mp3',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      play_count: 2950000,
      is_trending: false
    },
    {
      id: 12,
      title: 'Harder, Better, Faster, Stronger',
      artist_id: 6,
      album_id: 6,
      genre_id: 4,
      duration_seconds: 224,
      preview_url: 'https://cdns-preview-9.dzcdn.net/stream/c-9f6fa1e479a05dfaa599cbb2e061ad58-5.mp3',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      play_count: 3650000,
      is_trending: true
    }
  ],
  playlists: [
    {
      id: 1,
      user_id: 1,
      title: 'Neon Nights 🌃',
      description: 'Synthwave, neon rhythms, and late night sonic adventures for nocturnal spirits.',
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      is_public: true,
      created_at: new Date()
    },
    {
      id: 2,
      user_id: 1,
      title: 'The BEAT Global 50 🔥',
      description: 'The hottest tracks trending across the world right this second. Updated hourly.',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      is_public: true,
      created_at: new Date()
    },
    {
      id: 3,
      user_id: 1,
      title: 'Deep Focus & Flow 🎧',
      description: 'High fidelity beats and ambient electronic soundscapes to keep you in the zone.',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      is_public: true,
      created_at: new Date()
    },
    {
      id: 4,
      user_id: 1,
      title: 'Velvet Soul & R&B ✨',
      description: 'Smooth vocals, mellow baselines, and sweet grooves for relaxed evenings.',
      cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      is_public: true,
      created_at: new Date()
    }
  ],
  playlist_tracks: [
    { playlist_id: 1, track_id: 1, position: 1 },
    { playlist_id: 1, track_id: 3, position: 2 },
    { playlist_id: 1, track_id: 11, position: 3 },
    { playlist_id: 1, track_id: 12, position: 4 },
    { playlist_id: 2, track_id: 6, position: 1 },
    { playlist_id: 2, track_id: 1, position: 2 },
    { playlist_id: 2, track_id: 9, position: 3 },
    { playlist_id: 2, track_id: 7, position: 4 },
    { playlist_id: 2, track_id: 5, position: 5 },
    { playlist_id: 3, track_id: 11, position: 1 },
    { playlist_id: 3, track_id: 12, position: 2 },
    { playlist_id: 3, track_id: 2, position: 3 },
    { playlist_id: 4, track_id: 9, position: 1 },
    { playlist_id: 4, track_id: 10, position: 2 },
    { playlist_id: 4, track_id: 2, position: 3 }
  ],
  favorites: [
    { user_id: 1, track_id: 1 },
    { user_id: 1, track_id: 6 },
    { user_id: 1, track_id: 9 },
    { user_id: 1, track_id: 12 }
  ],
  recently_played: [
    { user_id: 1, track_id: 6, played_at: new Date(Date.now() - 10 * 60000) },
    { user_id: 1, track_id: 1, played_at: new Date(Date.now() - 25 * 60000) },
    { user_id: 1, track_id: 9, played_at: new Date(Date.now() - 45 * 60000) },
    { user_id: 1, track_id: 3, played_at: new Date(Date.now() - 120 * 60000) },
    { user_id: 1, track_id: 12, played_at: new Date(Date.now() - 300 * 60000) }
  ]
};

// Helper: Enrich track with artist name, album name, and favorite status
function enrichTrack(track, userId = 1) {
  const artist = memoryDb.artists.find(a => a.id === track.artist_id) || { name: 'Unknown Artist' };
  const album = memoryDb.albums.find(a => a.id === track.album_id) || { title: 'Single' };
  const genre = memoryDb.genres.find(g => g.id === track.genre_id) || { name: 'General' };
  const isFavorite = memoryDb.favorites.some(f => f.user_id === userId && f.track_id === track.id);

  return {
    ...track,
    artist_name: artist.name,
    artist_image: artist.image_url,
    album_title: album.title,
    genre_name: genre.name,
    is_favorite: isFavorite
  };
}

class DbService {
  // ================= TRACKS =================

  async getTrendingTracks(limit = 12, userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          `SELECT t.*, a.name AS artist_name, a.image_url AS artist_image, 
                  alb.title AS album_title, g.name AS genre_name,
                  CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite
           FROM tracks t
           JOIN artists a ON t.artist_id = a.id
           LEFT JOIN albums alb ON t.album_id = alb.id
           LEFT JOIN genres g ON t.genre_id = g.id
           LEFT JOIN favorites f ON f.track_id = t.id AND f.user_id = ?
           ORDER BY t.play_count DESC, t.id DESC
           LIMIT ?`,
          [userId, limit]
        );
        return rows;
      } catch (err) {
        console.error('[DbService] getTrendingTracks MySQL error:', err.message);
      }
    }

    return memoryDb.tracks
      .slice()
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, limit)
      .map(t => enrichTrack(t, userId));
  }

  async getRecentlyPlayed(userId = 1, limit = 8) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          `SELECT t.*, a.name AS artist_name, a.image_url AS artist_image, 
                  alb.title AS album_title, g.name AS genre_name,
                  rp.played_at,
                  CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite
           FROM recently_played rp
           JOIN tracks t ON rp.track_id = t.id
           JOIN artists a ON t.artist_id = a.id
           LEFT JOIN albums alb ON t.album_id = alb.id
           LEFT JOIN genres g ON t.genre_id = g.id
           LEFT JOIN favorites f ON f.track_id = t.id AND f.user_id = ?
           WHERE rp.user_id = ?
           ORDER BY rp.played_at DESC
           LIMIT ?`,
          [userId, userId, limit]
        );
        return rows;
      } catch (err) {
        console.error('[DbService] getRecentlyPlayed MySQL error:', err.message);
      }
    }

    const userHistory = memoryDb.recently_played
      .filter(rp => rp.user_id === userId)
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
      .slice(0, limit);

    return userHistory.map(rp => {
      const track = memoryDb.tracks.find(t => t.id === rp.track_id) || {};
      return {
        ...enrichTrack(track, userId),
        played_at: rp.played_at
      };
    });
  }

  async recordPlay(trackId, userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        // Update play count
        await pool.query('UPDATE tracks SET play_count = play_count + 1 WHERE id = ?', [trackId]);
        // Insert or update recently played
        await pool.query(
          'INSERT INTO recently_played (user_id, track_id, played_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE played_at = NOW()',
          [userId, trackId]
        );
        return true;
      } catch (err) {
        console.error('[DbService] recordPlay MySQL error:', err.message);
      }
    }

    const track = memoryDb.tracks.find(t => t.id === parseInt(trackId, 10));
    if (track) {
      track.play_count = (track.play_count || 0) + 1;
    }
    const existing = memoryDb.recently_played.find(r => r.user_id === userId && r.track_id === parseInt(trackId, 10));
    if (existing) {
      existing.played_at = new Date();
    } else {
      memoryDb.recently_played.unshift({ user_id: userId, track_id: parseInt(trackId, 10), played_at: new Date() });
    }
    return true;
  }

  async getTrackById(trackId, userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          `SELECT t.*, a.name AS artist_name, a.image_url AS artist_image, 
                  alb.title AS album_title, g.name AS genre_name,
                  CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite
           FROM tracks t
           JOIN artists a ON t.artist_id = a.id
           LEFT JOIN albums alb ON t.album_id = alb.id
           LEFT JOIN genres g ON t.genre_id = g.id
           LEFT JOIN favorites f ON f.track_id = t.id AND f.user_id = ?
           WHERE t.id = ?`,
          [userId, trackId]
        );
        return rows[0] || null;
      } catch (err) {
        console.error('[DbService] getTrackById MySQL error:', err.message);
      }
    }

    const track = memoryDb.tracks.find(t => t.id === parseInt(trackId, 10));
    return track ? enrichTrack(track, userId) : null;
  }

  // ================= ARTISTS =================

  async getArtists(limit = 20) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          'SELECT * FROM artists ORDER BY popularity DESC LIMIT ?',
          [limit]
        );
        return rows;
      } catch (err) {
        console.error('[DbService] getArtists MySQL error:', err.message);
      }
    }

    return memoryDb.artists.slice(0, limit);
  }

  async getArtistById(artistId, userId = 1) {
    let artist = null;
    let tracks = [];
    let albums = [];

    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [aRows] = await pool.query('SELECT * FROM artists WHERE id = ?', [artistId]);
        artist = aRows[0] || null;

        if (artist) {
          const [tRows] = await pool.query(
            `SELECT t.*, a.name AS artist_name, alb.title AS album_title,
                    CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite
             FROM tracks t
             JOIN artists a ON t.artist_id = a.id
             LEFT JOIN albums alb ON t.album_id = alb.id
             LEFT JOIN favorites f ON f.track_id = t.id AND f.user_id = ?
             WHERE t.artist_id = ?
             ORDER BY t.play_count DESC`,
            [userId, artistId]
          );
          tracks = tRows;

          const [albRows] = await pool.query(
            'SELECT * FROM albums WHERE artist_id = ? ORDER BY release_date DESC',
            [artistId]
          );
          albums = albRows;
        }
        return { artist, tracks, albums };
      } catch (err) {
        console.error('[DbService] getArtistById MySQL error:', err.message);
      }
    }

    artist = memoryDb.artists.find(a => a.id === parseInt(artistId, 10)) || null;
    if (artist) {
      tracks = memoryDb.tracks
        .filter(t => t.artist_id === artist.id)
        .map(t => enrichTrack(t, userId));
      albums = memoryDb.albums.filter(alb => alb.artist_id === artist.id);
    }
    return { artist, tracks, albums };
  }

  // ================= GENRES =================

  async getGenres() {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM genres ORDER BY id ASC');
        return rows;
      } catch (err) {
        console.error('[DbService] getGenres MySQL error:', err.message);
      }
    }

    return memoryDb.genres;
  }

  async getTracksByGenre(genreSlugOrId, userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          `SELECT t.*, a.name AS artist_name, a.image_url AS artist_image, 
                  alb.title AS album_title, g.name AS genre_name,
                  CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite
           FROM tracks t
           JOIN artists a ON t.artist_id = a.id
           LEFT JOIN albums alb ON t.album_id = alb.id
           JOIN genres g ON t.genre_id = g.id
           LEFT JOIN favorites f ON f.track_id = t.id AND f.user_id = ?
           WHERE g.slug = ? OR g.id = ?
           ORDER BY t.play_count DESC`,
          [userId, genreSlugOrId, genreSlugOrId]
        );
        return rows;
      } catch (err) {
        console.error('[DbService] getTracksByGenre MySQL error:', err.message);
      }
    }

    const genre = memoryDb.genres.find(g => g.slug === genreSlugOrId || g.id === parseInt(genreSlugOrId, 10));
    if (!genre) return [];

    return memoryDb.tracks
      .filter(t => t.genre_id === genre.id)
      .map(t => enrichTrack(t, userId));
  }

  // ================= PLAYLISTS =================

  async getPlaylists(userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          `SELECT p.*, COUNT(pt.track_id) AS track_count
           FROM playlists p
           LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
           WHERE p.user_id = ? OR p.is_public = TRUE
           GROUP BY p.id
           ORDER BY p.id ASC`,
          [userId]
        );
        return rows;
      } catch (err) {
        console.error('[DbService] getPlaylists MySQL error:', err.message);
      }
    }

    return memoryDb.playlists.map(p => {
      const count = memoryDb.playlist_tracks.filter(pt => pt.playlist_id === p.id).length;
      return {
        ...p,
        track_count: count
      };
    });
  }

  async getPlaylistById(playlistId, userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [pRows] = await pool.query('SELECT * FROM playlists WHERE id = ?', [playlistId]);
        const playlist = pRows[0] || null;
        if (!playlist) return null;

        const [tRows] = await pool.query(
          `SELECT t.*, a.name AS artist_name, a.image_url AS artist_image, 
                  alb.title AS album_title, g.name AS genre_name,
                  pt.position, pt.added_at,
                  CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite
           FROM playlist_tracks pt
           JOIN tracks t ON pt.track_id = t.id
           JOIN artists a ON t.artist_id = a.id
           LEFT JOIN albums alb ON t.album_id = alb.id
           LEFT JOIN genres g ON t.genre_id = g.id
           LEFT JOIN favorites f ON f.track_id = t.id AND f.user_id = ?
           WHERE pt.playlist_id = ?
           ORDER BY pt.position ASC, pt.added_at ASC`,
          [userId, playlistId]
        );

        return { ...playlist, tracks: tRows };
      } catch (err) {
        console.error('[DbService] getPlaylistById MySQL error:', err.message);
      }
    }

    const playlist = memoryDb.playlists.find(p => p.id === parseInt(playlistId, 10));
    if (!playlist) return null;

    const links = memoryDb.playlist_tracks
      .filter(pt => pt.playlist_id === playlist.id)
      .sort((a, b) => a.position - b.position);

    const tracks = links.map(pt => {
      const track = memoryDb.tracks.find(t => t.id === pt.track_id) || {};
      return {
        ...enrichTrack(track, userId),
        position: pt.position
      };
    });

    return { ...playlist, tracks };
  }

  async createPlaylist({ title, description, cover_url, is_public = true, user_id = 1 }) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [res] = await pool.query(
          'INSERT INTO playlists (user_id, title, description, cover_url, is_public) VALUES (?, ?, ?, ?, ?)',
          [user_id, title, description || '', cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', is_public]
        );
        return {
          id: res.insertId,
          user_id,
          title,
          description,
          cover_url: cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
          is_public,
          track_count: 0
        };
      } catch (err) {
        console.error('[DbService] createPlaylist MySQL error:', err.message);
      }
    }

    const newId = memoryDb.playlists.length ? Math.max(...memoryDb.playlists.map(p => p.id)) + 1 : 1;
    const newPlaylist = {
      id: newId,
      user_id,
      title,
      description: description || '',
      cover_url: cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      is_public: !!is_public,
      created_at: new Date(),
      track_count: 0
    };
    memoryDb.playlists.push(newPlaylist);
    return newPlaylist;
  }

  async updatePlaylist(playlistId, { title, description, cover_url }) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        await pool.query(
          'UPDATE playlists SET title = ?, description = ?, cover_url = COALESCE(?, cover_url) WHERE id = ?',
          [title, description, cover_url, playlistId]
        );
        return true;
      } catch (err) {
        console.error('[DbService] updatePlaylist MySQL error:', err.message);
      }
    }

    const playlist = memoryDb.playlists.find(p => p.id === parseInt(playlistId, 10));
    if (playlist) {
      if (title) playlist.title = title;
      if (description !== undefined) playlist.description = description;
      if (cover_url) playlist.cover_url = cover_url;
      return true;
    }
    return false;
  }

  async deletePlaylist(playlistId) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        await pool.query('DELETE FROM playlists WHERE id = ?', [playlistId]);
        return true;
      } catch (err) {
        console.error('[DbService] deletePlaylist MySQL error:', err.message);
      }
    }

    const id = parseInt(playlistId, 10);
    const idx = memoryDb.playlists.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDb.playlists.splice(idx, 1);
      memoryDb.playlist_tracks = memoryDb.playlist_tracks.filter(pt => pt.playlist_id !== id);
      return true;
    }
    return false;
  }

  async addTrackToPlaylist(playlistId, trackId) {
    const pId = parseInt(playlistId, 10);
    const tId = parseInt(trackId, 10);

    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [maxPos] = await pool.query(
          'SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM playlist_tracks WHERE playlist_id = ?',
          [pId]
        );
        const position = maxPos[0].nextPos;
        await pool.query(
          'INSERT IGNORE INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)',
          [pId, tId, position]
        );
        return true;
      } catch (err) {
        console.error('[DbService] addTrackToPlaylist MySQL error:', err.message);
      }
    }

    const exists = memoryDb.playlist_tracks.some(pt => pt.playlist_id === pId && pt.track_id === tId);
    if (!exists) {
      const currentTracks = memoryDb.playlist_tracks.filter(pt => pt.playlist_id === pId);
      memoryDb.playlist_tracks.push({
        playlist_id: pId,
        track_id: tId,
        position: currentTracks.length + 1
      });
    }
    return true;
  }

  async removeTrackFromPlaylist(playlistId, trackId) {
    const pId = parseInt(playlistId, 10);
    const tId = parseInt(trackId, 10);

    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        await pool.query('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [pId, tId]);
        return true;
      } catch (err) {
        console.error('[DbService] removeTrackFromPlaylist MySQL error:', err.message);
      }
    }

    memoryDb.playlist_tracks = memoryDb.playlist_tracks.filter(
      pt => !(pt.playlist_id === pId && pt.track_id === tId)
    );
    return true;
  }

  // ================= FAVORITES =================

  async getFavorites(userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          `SELECT t.*, a.name AS artist_name, a.image_url AS artist_image, 
                  alb.title AS album_title, g.name AS genre_name,
                  TRUE AS is_favorite, f.created_at AS liked_at
           FROM favorites f
           JOIN tracks t ON f.track_id = t.id
           JOIN artists a ON t.artist_id = a.id
           LEFT JOIN albums alb ON t.album_id = alb.id
           LEFT JOIN genres g ON t.genre_id = g.id
           WHERE f.user_id = ?
           ORDER BY f.created_at DESC`,
          [userId]
        );
        return rows;
      } catch (err) {
        console.error('[DbService] getFavorites MySQL error:', err.message);
      }
    }

    const userFavs = memoryDb.favorites.filter(f => f.user_id === userId);
    return userFavs.map(f => {
      const track = memoryDb.tracks.find(t => t.id === f.track_id) || {};
      return {
        ...enrichTrack(track, userId),
        is_favorite: true
      };
    });
  }

  async toggleFavorite(trackId, userId = 1) {
    const tId = parseInt(trackId, 10);

    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [exists] = await pool.query(
          'SELECT id FROM favorites WHERE user_id = ? AND track_id = ?',
          [userId, tId]
        );

        if (exists.length > 0) {
          await pool.query('DELETE FROM favorites WHERE user_id = ? AND track_id = ?', [userId, tId]);
          return { is_favorite: false };
        } else {
          await pool.query('INSERT INTO favorites (user_id, track_id) VALUES (?, ?)', [userId, tId]);
          return { is_favorite: true };
        }
      } catch (err) {
        console.error('[DbService] toggleFavorite MySQL error:', err.message);
      }
    }

    const idx = memoryDb.favorites.findIndex(f => f.user_id === userId && f.track_id === tId);
    if (idx !== -1) {
      memoryDb.favorites.splice(idx, 1);
      return { is_favorite: false };
    } else {
      memoryDb.favorites.push({ user_id: userId, track_id: tId });
      return { is_favorite: true };
    }
  }

  // ================= USER & SETTINGS =================

  async getUserSettings(userId = 1) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        return rows[0] || null;
      } catch (err) {
        console.error('[DbService] getUserSettings MySQL error:', err.message);
      }
    }

    return memoryDb.users.find(u => u.id === userId) || null;
  }

  async updateUserSettings(userId = 1, { display_name, theme_preference, audio_quality, notifications_enabled }) {
    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        await pool.query(
          `UPDATE users SET 
            display_name = COALESCE(?, display_name),
            theme_preference = COALESCE(?, theme_preference),
            audio_quality = COALESCE(?, audio_quality),
            notifications_enabled = COALESCE(?, notifications_enabled)
           WHERE id = ?`,
          [display_name, theme_preference, audio_quality, notifications_enabled, userId]
        );
        return true;
      } catch (err) {
        console.error('[DbService] updateUserSettings MySQL error:', err.message);
      }
    }

    const user = memoryDb.users.find(u => u.id === userId);
    if (user) {
      if (display_name !== undefined) user.display_name = display_name;
      if (theme_preference !== undefined) user.theme_preference = theme_preference;
      if (audio_quality !== undefined) user.audio_quality = audio_quality;
      if (notifications_enabled !== undefined) user.notifications_enabled = notifications_enabled;
      return true;
    }
    return false;
  }

  // ================= SAVE API TRACK INTO DB =================
  async saveApiTrack(trackData) {
    const { title, artist_name, album_title, preview_url, cover_url, duration, api_id } = trackData;
    if (!title || !preview_url) return null;

    if (isMySQLConnected()) {
      try {
        const pool = getPool();
        // Check if track already exists by api_id or title+artist
        const [existing] = await pool.query('SELECT id FROM tracks WHERE api_id = ? OR title = ?', [api_id, title]);
        if (existing.length > 0) return existing[0].id;

        // Upsert artist
        let artistId;
        const [artRow] = await pool.query('SELECT id FROM artists WHERE name = ?', [artist_name]);
        if (artRow.length > 0) {
          artistId = artRow[0].id;
        } else {
          const [artIns] = await pool.query(
            'INSERT INTO artists (name, image_url, popularity) VALUES (?, ?, 80)',
            [artist_name, cover_url]
          );
          artistId = artIns.insertId;
        }

        // Upsert album
        let albumId = null;
        if (album_title) {
          const [albRow] = await pool.query('SELECT id FROM albums WHERE title = ? AND artist_id = ?', [album_title, artistId]);
          if (albRow.length > 0) {
            albumId = albRow[0].id;
          } else {
            const [albIns] = await pool.query(
              'INSERT INTO albums (title, artist_id, cover_url) VALUES (?, ?, ?)',
              [album_title, artistId, cover_url]
            );
            albumId = albIns.insertId;
          }
        }

        const [trkIns] = await pool.query(
          `INSERT INTO tracks (title, artist_id, album_id, api_id, duration_seconds, preview_url, cover_url, play_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1000)`,
          [title, artistId, albumId, api_id, duration || 180, preview_url, cover_url]
        );
        return trkIns.insertId;
      } catch (err) {
        console.error('[DbService] saveApiTrack MySQL error:', err.message);
      }
    }

    // In-Memory cache
    let artist = memoryDb.artists.find(a => a.name.toLowerCase() === artist_name.toLowerCase());
    if (!artist) {
      artist = {
        id: memoryDb.artists.length + 1,
        name: artist_name,
        image_url: cover_url,
        popularity: 80,
        monthly_listeners: 15000000
      };
      memoryDb.artists.push(artist);
    }

    let album = memoryDb.albums.find(a => a.title.toLowerCase() === (album_title || '').toLowerCase() && a.artist_id === artist.id);
    if (!album && album_title) {
      album = {
        id: memoryDb.albums.length + 1,
        title: album_title,
        artist_id: artist.id,
        cover_url: cover_url
      };
      memoryDb.albums.push(album);
    }

    let track = memoryDb.tracks.find(t => t.api_id === api_id || t.title.toLowerCase() === title.toLowerCase());
    if (!track) {
      track = {
        id: memoryDb.tracks.length + 1,
        title,
        artist_id: artist.id,
        album_id: album ? album.id : null,
        genre_id: 1,
        api_id,
        duration_seconds: duration || 180,
        preview_url,
        cover_url,
        play_count: 5000,
        is_trending: false
      };
      memoryDb.tracks.push(track);
    }
    return track.id;
  }
}

module.exports = new DbService();
