/**
 * ====================================================================
 * Main Application Bootstrapper
 * The BEAT - Modern Music Streaming Platform
 * ====================================================================
 * Initializes core services, registers global delegation events,
 * and boots the initial view.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Theme Engine
  window.ThemeManager.init();

  // 2. Initialize Audio Player Engine
  window.player = new window.MusicPlayer();

  // 3. Initialize Playlist Manager
  window.PlaylistManager.init();

  // 4. Initialize Views Renderer
  window.Views.init();

  // 5. Setup Navigation Clicks (Desktop Sidebar & Mobile Nav Bar)
  document.querySelectorAll('[data-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.nav;
      window.Views.switchTab(targetTab);
      closeMobileSidebar();
    });
  });

  // Mobile Menu Drawer Toggles
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileSidebar);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }

  // Header Search Input - jumps straight to browse view
  const headerSearchInput = document.getElementById('header-search-input');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('focus', () => {
      window.Views.switchTab('browse');
    });
    headerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.Views.switchTab('browse');
        const browseInput = document.getElementById('browse-search-input');
        if (browseInput) {
          browseInput.value = headerSearchInput.value;
          window.Views.performSearch(headerSearchInput.value);
        }
      }
    });
  }

  // 6. Global Event Delegation
  document.addEventListener('click', async (e) => {
    // A. Favorite Button Click
    const favBtn = e.target.closest('[data-track-fav-id]');
    if (favBtn) {
      e.stopPropagation();
      const trackId = favBtn.dataset.trackFavId;
      try {
        const res = await window.API.toggleFavorite(trackId);
        favBtn.classList.toggle('liked', res.is_favorite);
        const svg = favBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', res.is_favorite ? 'currentColor' : 'none');

        // Sync with player favorite button if currently active
        const cur = window.player.getCurrentTrack();
        if (cur && cur.id == trackId) {
          window.player.favBtn.classList.toggle('liked', res.is_favorite);
        }
      } catch (err) {
        console.error('Favorite toggle failed:', err);
      }
      return;
    }

    // B. Add to Playlist Button Click
    const addBtn = e.target.closest('[data-track-add-id]');
    if (addBtn) {
      e.stopPropagation();
      const trackId = addBtn.dataset.trackAddId;
      const trackTitle = addBtn.dataset.trackTitle || 'this track';
      window.PlaylistManager.promptAddTrackToPlaylist(trackId, trackTitle);
      return;
    }

    // C. Remove from Playlist Button Click
    const removeBtn = e.target.closest('[data-track-remove-id]');
    if (removeBtn) {
      e.stopPropagation();
      const trackId = removeBtn.dataset.trackRemoveId;
      const playlistId = removeBtn.dataset.playlistId;
      window.PlaylistManager.removeTrack(playlistId, trackId);
      return;
    }

    // D. Artist Card Click
    const artistCard = e.target.closest('[data-artist-id]');
    if (artistCard && !e.target.closest('.card-play-btn')) {
      const artistId = artistCard.dataset.artistId;
      window.Views.switchTab('artists');
      window.Views.openArtistDetail(artistId);
      return;
    }

    // E. Playlist Card Click
    const playlistCard = e.target.closest('.playlist-card');
    if (playlistCard) {
      const playlistId = playlistCard.dataset.playlistId;
      window.Views.switchTab('playlists');
      window.Views.openPlaylistDetail(playlistId);
      return;
    }

    // F. Music Card Play/Select
    const musicCard = e.target.closest('.music-card:not(.playlist-card)');
    if (musicCard) {
      try {
        const trackData = JSON.parse(decodeURIComponent(musicCard.dataset.trackData));
        const queueData = musicCard.dataset.queueData ? JSON.parse(decodeURIComponent(musicCard.dataset.queueData)) : null;
        window.player.playTrack(trackData, queueData);
      } catch (err) {
        console.error('Error starting track from card:', err);
      }
      return;
    }

    // G. Track Row Click
    const trackRow = e.target.closest('.track-row');
    if (trackRow && !e.target.closest('.action-icon-btn')) {
      try {
        const trackData = JSON.parse(decodeURIComponent(trackRow.dataset.trackData));
        const queueData = trackRow.dataset.queueData ? JSON.parse(decodeURIComponent(trackRow.dataset.queueData)) : null;
        window.player.playTrack(trackData, queueData);
      } catch (err) {
        console.error('Error starting track from row:', err);
      }
      return;
    }
  });

  // 7. Initial Data Load & Render
  await window.Views.loadHomeView();
  await window.Views.loadSidebarPlaylists();

  // 8. Pre-load first trending track into bottom player
  if (window.Views.cachedTrending.length > 0) {
    window.player.queue = [...window.Views.cachedTrending];
    window.player.currentIndex = 0;
    window.player.loadTrack(window.Views.cachedTrending[0]);
  }
});
