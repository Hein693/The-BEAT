/**
 * ====================================================================
 * Views Renderer & Router Module
 * The BEAT - Modern Music Streaming Platform
 * ====================================================================
 * Renders Home, Browse, Artists, Genres, Playlists, and Settings views,
 * dynamically populating music cards, track rows, and details.
 */

const Views = {
  activeTab: 'home',
  cachedTrending: [],
  cachedArtists: [],
  cachedPlaylists: [],

  init() {
    this.container = document.getElementById('views-container');
    this.toastEl = document.getElementById('toast-notice');
  },

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2800);
  },

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update active nav items (desktop sidebar & mobile bar)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === tabName);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === tabName);
    });

    // Hide all view sections, show requested one
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${tabName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Scroll to top of main area
    const mainEl = document.querySelector('.app-main');
    if (mainEl) mainEl.scrollTop = 0;

    // Load content for active view
    switch (tabName) {
      case 'home':
        this.loadHomeView();
        break;
      case 'browse':
        this.loadBrowseView();
        break;
      case 'artists':
        this.loadArtistsView();
        break;
      case 'genres':
        this.loadGenresView();
        break;
      case 'playlists':
        this.loadPlaylistsView();
        break;
      case 'settings':
        this.loadSettingsView();
        break;
    }
  },

  // ================= HOME VIEW =================
  async loadHomeView() {
    try {
      const [trendingRes, recentRes, playlistsRes] = await Promise.all([
        window.API.getTrending(8),
        window.API.getRecentlyPlayed(6),
        window.API.getPlaylists()
      ]);

      this.cachedTrending = trendingRes.data || [];
      const recentTracks = recentRes.data || [];
      this.cachedPlaylists = playlistsRes.data || [];

      // 1. Trending Tracks Grid
      const trendingGrid = document.getElementById('home-trending-grid');
      if (trendingGrid) {
        trendingGrid.innerHTML = this.cachedTrending.map(track => this.renderMusicCard(track)).join('');
      }

      // 2. Recently Played List
      const recentList = document.getElementById('home-recent-list');
      if (recentList) {
        if (recentTracks.length > 0) {
          recentList.innerHTML = recentTracks.map((track, i) => this.renderTrackRow(track, i + 1, recentTracks)).join('');
        } else {
          recentList.innerHTML = `<p style="color:var(--text-muted); padding:1rem 0;">No playback history yet. Pick a track above to start jamming!</p>`;
        }
      }

      // 3. Featured Playlists Grid
      const playlistGrid = document.getElementById('home-playlists-grid');
      if (playlistGrid) {
        playlistGrid.innerHTML = this.cachedPlaylists.slice(0, 4).map(p => this.renderPlaylistCard(p)).join('');
      }

      // Hero Play Button
      const heroBtn = document.getElementById('hero-play-btn');
      if (heroBtn && this.cachedTrending.length > 0) {
        heroBtn.onclick = () => {
          window.player.playTrack(this.cachedTrending[0], this.cachedTrending);
        };
      }
    } catch (err) {
      console.error('Error loading home view:', err);
    }
  },

  // ================= BROWSE VIEW =================
  async loadBrowseView() {
    try {
      const [genresRes, chartsRes] = await Promise.all([
        window.API.getGenres(),
        window.API.getCharts()
      ]);

      const genres = genresRes.data || [];
      const charts = chartsRes.data || [];

      // Genre chips
      const chipsEl = document.getElementById('browse-genre-chips');
      if (chipsEl) {
        chipsEl.innerHTML = `
          <button class="filter-chip active" data-genre-filter="all">All Music</button>
          ${genres.map(g => `<button class="filter-chip" data-genre-filter="${g.slug}">${g.name}</button>`).join('')}
        `;

        chipsEl.querySelectorAll('.filter-chip').forEach(btn => {
          btn.addEventListener('click', () => {
            chipsEl.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const slug = btn.dataset.genreFilter;
            if (slug === 'all') {
              this.renderBrowseResults(charts, 'Top Worldwide Charts');
            } else {
              this.filterBrowseByGenre(slug);
            }
          });
        });
      }

      // Default to top charts
      this.renderBrowseResults(charts, 'Top Global Discoveries');

      // Setup Search Input Listener
      const searchInput = document.getElementById('browse-search-input');
      if (searchInput && !searchInput._bound) {
        searchInput._bound = true;
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          const q = e.target.value.trim();
          debounceTimer = setTimeout(() => {
            if (q) {
              this.performSearch(q);
            } else {
              this.renderBrowseResults(charts, 'Top Global Discoveries');
            }
          }, 350);
        });
      }
    } catch (err) {
      console.error('Error loading browse view:', err);
    }
  },

  async performSearch(query) {
    try {
      const res = await window.API.search(query);
      const tracks = (res.data && res.data.tracks) || [];
      const artists = (res.data && res.data.artists) || [];
      this.renderBrowseResults(tracks, `Search Results for "${query}"`, artists);
    } catch (err) {
      console.error('Search failed:', err);
    }
  },

  async filterBrowseByGenre(slug) {
    try {
      const res = await window.API.getTracksByGenre(slug);
      const tracks = res.data || [];
      this.renderBrowseResults(tracks, `Genre: ${slug.toUpperCase()}`);
    } catch (err) {
      console.error('Error filtering genre:', err);
    }
  },

  renderBrowseResults(tracks, title, artists = []) {
    const titleEl = document.getElementById('browse-results-title');
    const container = document.getElementById('browse-results-content');
    if (titleEl) titleEl.textContent = title;
    if (!container) return;

    let html = '';

    // If artists match
    if (artists.length > 0) {
      html += `
        <h3 style="margin-bottom:1rem; font-size:1.15rem;">Matching Artists</h3>
        <div class="artist-grid" style="margin-bottom:2rem;">
          ${artists.map(a => this.renderArtistCard(a)).join('')}
        </div>
        <h3 style="margin-bottom:1rem; font-size:1.15rem;">Tracks</h3>
      `;
    }

    if (tracks.length === 0) {
      html += `<p style="color:var(--text-muted); padding:2rem 0;">No tracks found for this query. Try another keyword!</p>`;
    } else {
      html += `
        <div class="card-grid">
          ${tracks.map(t => this.renderMusicCard(t, tracks)).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  },

  // ================= ARTISTS VIEW =================
  async loadArtistsView() {
    try {
      const res = await window.API.getArtists(24);
      this.cachedArtists = res.data || [];

      const listContainer = document.getElementById('artists-list-section');
      const detailContainer = document.getElementById('artist-detail-section');
      if (listContainer) listContainer.style.display = 'block';
      if (detailContainer) detailContainer.style.display = 'none';

      const grid = document.getElementById('artists-grid');
      if (grid) {
        grid.innerHTML = this.cachedArtists.map(artist => this.renderArtistCard(artist)).join('');
      }
    } catch (err) {
      console.error('Error loading artists:', err);
    }
  },

  async openArtistDetail(artistId) {
    try {
      const res = await window.API.getArtistById(artistId);
      const { artist, tracks, albums } = res.data || {};
      if (!artist) return;

      const listContainer = document.getElementById('artists-list-section');
      const detailContainer = document.getElementById('artist-detail-section');
      if (listContainer) listContainer.style.display = 'none';
      if (detailContainer) detailContainer.style.display = 'block';

      detailContainer.innerHTML = `
        <button class="see-all-btn" id="back-to-artists-btn" style="margin-bottom:1.5rem;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to all Artists
        </button>

        <div class="artist-detail-header">
          <img src="${artist.image_url}" alt="${artist.name}" class="artist-detail-avatar">
          <div class="artist-detail-info">
            <span class="badge">Verified Artist</span>
            <h1>${artist.name}</h1>
            <p style="color:var(--text-secondary); max-width:650px; line-height:1.5; font-size:0.92rem; margin-top:0.4rem;">
              ${artist.bio || 'Global recording artist on The BEAT.'}
            </p>
            <div class="artist-detail-stats">
              <span><strong>${(artist.monthly_listeners || 50000000).toLocaleString()}</strong> Monthly Listeners</span>
              <span><strong>${artist.popularity || 85}%</strong> Popularity Index</span>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-title">Top Tracks</h2>
          ${tracks && tracks.length > 0 ? `
            <button class="hero-btn" id="play-artist-all-btn" style="padding:0.5rem 1.25rem; font-size:0.85rem;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Play All
            </button>
          ` : ''}
        </div>

        <div class="track-list">
          ${tracks && tracks.length > 0 ? tracks.map((t, idx) => this.renderTrackRow(t, idx + 1, tracks)).join('') : '<p style="color:var(--text-muted)">No tracks found.</p>'}
        </div>

        ${albums && albums.length > 0 ? `
          <div class="section-header" style="margin-top:2.5rem;">
            <h2 class="section-title">Albums & Discography</h2>
          </div>
          <div class="card-grid">
            ${albums.map(alb => `
              <div class="music-card">
                <div class="card-img-wrap">
                  <img src="${alb.cover_url}" alt="${alb.title}" class="card-img">
                </div>
                <div class="card-title truncate-1">${alb.title}</div>
                <div class="card-subtitle truncate-1">${alb.release_date || 'Album'} • ${alb.total_tracks || 1} tracks</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;

      document.getElementById('back-to-artists-btn').onclick = () => {
        detailContainer.style.display = 'none';
        listContainer.style.display = 'block';
      };

      const playAllBtn = document.getElementById('play-artist-all-btn');
      if (playAllBtn && tracks && tracks.length > 0) {
        playAllBtn.onclick = () => {
          window.player.playTrack(tracks[0], tracks);
        };
      }
    } catch (err) {
      console.error('Error opening artist detail:', err);
    }
  },

  // ================= GENRES VIEW =================
  async loadGenresView() {
    try {
      const res = await window.API.getGenres();
      const genres = res.data || [];

      const listContainer = document.getElementById('genres-list-section');
      const detailContainer = document.getElementById('genre-detail-section');
      if (listContainer) listContainer.style.display = 'block';
      if (detailContainer) detailContainer.style.display = 'none';

      const grid = document.getElementById('genres-grid');
      if (grid) {
        grid.innerHTML = genres.map(g => `
          <div class="genre-card" style="background: ${g.color_gradient};" data-genre-slug="${g.slug}" data-genre-name="${g.name}">
            <span class="genre-title">${g.name}</span>
            <svg class="genre-icon-bg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
          </div>
        `).join('');

        grid.querySelectorAll('.genre-card').forEach(card => {
          card.onclick = () => this.openGenreDetail(card.dataset.genreSlug, card.dataset.genreName);
        });
      }
    } catch (err) {
      console.error('Error loading genres:', err);
    }
  },

  async openGenreDetail(slug, name) {
    try {
      const res = await window.API.getTracksByGenre(slug);
      const tracks = res.data || [];

      const listContainer = document.getElementById('genres-list-section');
      const detailContainer = document.getElementById('genre-detail-section');
      if (listContainer) listContainer.style.display = 'none';
      if (detailContainer) detailContainer.style.display = 'block';

      detailContainer.innerHTML = `
        <button class="see-all-btn" id="back-to-genres-btn" style="margin-bottom:1.5rem;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to all Genres
        </button>

        <div class="section-header">
          <div>
            <span class="badge">Genre Explorer</span>
            <h1 style="font-size:2.2rem; margin-top:0.4rem;">${name}</h1>
          </div>
          ${tracks.length > 0 ? `
            <button class="hero-btn" id="play-genre-all-btn" style="padding:0.5rem 1.25rem; font-size:0.85rem;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Play All
            </button>
          ` : ''}
        </div>

        <div class="track-list">
          ${tracks.length > 0 ? tracks.map((t, idx) => this.renderTrackRow(t, idx + 1, tracks)).join('') : '<p style="color:var(--text-muted)">No tracks currently found in this genre.</p>'}
        </div>
      `;

      document.getElementById('back-to-genres-btn').onclick = () => {
        detailContainer.style.display = 'none';
        listContainer.style.display = 'block';
      };

      const playAllBtn = document.getElementById('play-genre-all-btn');
      if (playAllBtn && tracks.length > 0) {
        playAllBtn.onclick = () => {
          window.player.playTrack(tracks[0], tracks);
        };
      }
    } catch (err) {
      console.error('Error opening genre detail:', err);
    }
  },

  // ================= PLAYLISTS VIEW =================
  async loadPlaylistsView() {
    try {
      const res = await window.API.getPlaylists();
      this.cachedPlaylists = res.data || [];

      const listContainer = document.getElementById('playlists-list-section');
      const detailContainer = document.getElementById('playlist-detail-section');
      if (listContainer) listContainer.style.display = 'block';
      if (detailContainer) detailContainer.style.display = 'none';

      const grid = document.getElementById('playlists-grid');
      if (grid) {
        grid.innerHTML = this.cachedPlaylists.map(p => this.renderPlaylistCard(p)).join('');
      }
    } catch (err) {
      console.error('Error loading playlists:', err);
    }
  },

  async openPlaylistDetail(playlistId) {
    try {
      const res = await window.API.getPlaylistById(playlistId);
      const playlist = res.data;
      if (!playlist) return;

      const listContainer = document.getElementById('playlists-list-section');
      const detailContainer = document.getElementById('playlist-detail-section');
      if (listContainer) listContainer.style.display = 'none';
      if (detailContainer) detailContainer.style.display = 'block';

      const tracks = playlist.tracks || [];

      detailContainer.innerHTML = `
        <button class="see-all-btn" id="back-to-playlists-btn" style="margin-bottom:1.5rem;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to all Playlists
        </button>

        <div class="playlist-detail-banner">
          <img src="${playlist.cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'}" alt="${playlist.title}" class="playlist-banner-cover">
          <div class="playlist-banner-details">
            <span class="badge">Curated Playlist</span>
            <h1>${playlist.title}</h1>
            <p>${playlist.description || 'Collection curated on The BEAT'}</p>
            <div class="playlist-banner-actions">
              ${tracks.length > 0 ? `
                <button class="hero-btn" id="play-playlist-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Play All
                </button>
              ` : ''}
              <button class="btn-secondary" id="delete-playlist-btn" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.3);">
                Delete Playlist
              </button>
            </div>
          </div>
        </div>

        <div class="track-list">
          ${tracks.length > 0 ? tracks.map((t, idx) => this.renderTrackRow(t, idx + 1, tracks, playlist.id)).join('') : '<p style="color:var(--text-muted); padding:2rem 0;">This playlist has no tracks yet. Browse songs and click the + icon to add them!</p>'}
        </div>
      `;

      document.getElementById('back-to-playlists-btn').onclick = () => {
        detailContainer.style.display = 'none';
        listContainer.style.display = 'block';
      };

      const playBtn = document.getElementById('play-playlist-btn');
      if (playBtn && tracks.length > 0) {
        playBtn.onclick = () => {
          window.player.playTrack(tracks[0], tracks);
        };
      }

      const delBtn = document.getElementById('delete-playlist-btn');
      if (delBtn) {
        delBtn.onclick = () => {
          window.PlaylistManager.deletePlaylist(playlist.id, playlist.title);
        };
      }
    } catch (err) {
      console.error('Error opening playlist detail:', err);
    }
  },

  // ================= SETTINGS VIEW =================
  async loadSettingsView() {
    try {
      const res = await window.API.getSettings();
      const user = res.data || {};

      const nameInput = document.getElementById('settings-display-name');
      const qualitySelect = document.getElementById('settings-audio-quality');
      const notifToggle = document.getElementById('settings-notifications');

      if (nameInput) nameInput.value = user.display_name || 'Alex Rivera';
      if (qualitySelect) qualitySelect.value = user.audio_quality || 'high';
      if (notifToggle) notifToggle.checked = user.notifications_enabled !== false;

      // Theme cards
      document.querySelectorAll('.theme-choice-card').forEach(card => {
        card.classList.toggle('active', card.dataset.themeValue === window.ThemeManager.currentTheme);
        card.onclick = () => {
          window.ThemeManager.setTheme(card.dataset.themeValue);
        };
      });

      // Save button
      const saveBtn = document.getElementById('save-settings-btn');
      if (saveBtn) {
        saveBtn.onclick = async () => {
          try {
            await window.API.updateSettings({
              display_name: nameInput ? nameInput.value.trim() : 'Alex Rivera',
              audio_quality: qualitySelect ? qualitySelect.value : 'high',
              notifications_enabled: notifToggle ? notifToggle.checked : true,
              theme_preference: window.ThemeManager.currentTheme
            });
            const nameDisplay = document.getElementById('user-name-display');
            if (nameDisplay && nameInput) nameDisplay.textContent = nameInput.value.trim();
            this.showToast('Settings saved successfully!');
          } catch (err) {
            alert('Failed to save settings: ' + err.message);
          }
        };
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  },

  async loadSidebarPlaylists() {
    try {
      const res = await window.API.getPlaylists();
      const playlists = res.data || [];
      const listEl = document.getElementById('sidebar-playlists-list');
      if (listEl) {
        listEl.innerHTML = playlists.map(p => `
          <div class="playlist-quick-item truncate-1" data-playlist-id="${p.id}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span>${p.title}</span>
          </div>
        `).join('');

        listEl.querySelectorAll('.playlist-quick-item').forEach(el => {
          el.onclick = () => {
            this.switchTab('playlists');
            this.openPlaylistDetail(el.dataset.playlistId);
          };
        });
      }
    } catch (err) {
      console.error('Failed to load sidebar playlists:', err);
    }
  },

  // ================= TEMPLATE RENDERING HELPERS =================
  renderMusicCard(track, queue = null) {
    const queueData = queue ? encodeURIComponent(JSON.stringify(queue)) : '';
    const trackData = encodeURIComponent(JSON.stringify(track));

    return `
      <div class="music-card" data-track-data="${trackData}" data-queue-data="${queueData}">
        <div class="card-img-wrap">
          <img src="${track.cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80'}" alt="${track.title}" class="card-img" loading="lazy">
          <button class="card-play-btn" title="Play ${track.title}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
        <div class="card-title truncate-1">${track.title}</div>
        <div class="card-subtitle truncate-1">${track.artist_name || 'Artist'}</div>
      </div>
    `;
  },

  renderArtistCard(artist) {
    return `
      <div class="artist-card" data-artist-id="${artist.id}">
        <div class="artist-avatar-wrap">
          <img src="${artist.image_url}" alt="${artist.name}" class="artist-avatar-img" loading="lazy">
        </div>
        <div class="artist-name truncate-1">${artist.name}</div>
        <div class="artist-meta">Verified Artist</div>
      </div>
    `;
  },

  renderPlaylistCard(playlist) {
    return `
      <div class="music-card playlist-card" data-playlist-id="${playlist.id}">
        <div class="card-img-wrap">
          <img src="${playlist.cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80'}" alt="${playlist.title}" class="card-img" loading="lazy">
          <button class="card-play-btn" title="View Playlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
        <div class="card-title truncate-1">${playlist.title}</div>
        <div class="card-subtitle truncate-1">${playlist.track_count || 0} tracks</div>
      </div>
    `;
  },

  renderTrackRow(track, index = 1, queue = [], playlistId = null) {
    const queueData = encodeURIComponent(JSON.stringify(queue));
    const trackData = encodeURIComponent(JSON.stringify(track));
    const duration = window.player ? window.player.formatTime(track.duration_seconds || 180) : '3:00';

    return `
      <div class="track-row" data-track-id="${track.id}" data-track-data="${trackData}" data-queue-data="${queueData}">
        <div class="track-num">
          <span class="track-num-text">${index}</span>
          <svg class="row-play-icon" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <img src="${track.cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80'}" alt="${track.title}" class="track-thumb" loading="lazy">
        <div class="track-info min-w-0">
          <span class="track-row-title truncate-1">${track.title}</span>
          <span class="track-row-artist truncate-1">${track.artist_name || 'Artist'}</span>
        </div>
        <div class="track-row-album truncate-1">${track.album_title || 'Single'}</div>
        <div class="track-row-duration">${duration}</div>
        <div class="track-row-actions">
          <button class="action-icon-btn ${track.is_favorite ? 'liked' : ''}" data-track-fav-id="${track.id}" title="Like">
            <svg viewBox="0 0 24 24" fill="${track.is_favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          ${playlistId ? `
            <button class="action-icon-btn remove-track-btn" data-playlist-id="${playlistId}" data-track-remove-id="${track.id}" title="Remove from playlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : `
            <button class="action-icon-btn add-track-btn" data-track-add-id="${track.id}" data-track-title="${track.title}" title="Add to playlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          `}
        </div>
      </div>
    `;
  }
};

window.Views = Views;
