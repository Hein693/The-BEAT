/**
 * ====================================================================
 * Playlists Management Module
 * The BEAT - Modern Music Streaming Platform
 * ====================================================================
 * Handles client-side playlist creation, editing, deletion,
 * track additions, and track removals.
 */

const PlaylistManager = {
  activePlaylistId: null,

  init() {
    this.createModal = document.getElementById('create-playlist-modal');
    this.createForm = document.getElementById('create-playlist-form');
    this.closeModalBtn = document.getElementById('close-playlist-modal');
    this.cancelModalBtn = document.getElementById('cancel-playlist-btn');
    this.openModalBtn = document.getElementById('open-create-playlist-btn');

    if (this.openModalBtn) {
      this.openModalBtn.addEventListener('click', () => this.openCreateModal());
    }

    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closeCreateModal());
    }

    if (this.cancelModalBtn) {
      this.cancelModalBtn.addEventListener('click', () => this.closeCreateModal());
    }

    if (this.createModal) {
      this.createModal.addEventListener('click', (e) => {
        if (e.target === this.createModal) this.closeCreateModal();
      });
    }

    if (this.createForm) {
      this.createForm.addEventListener('submit', (e) => this.handleCreateSubmit(e));
    }
  },

  openCreateModal() {
    if (!this.createModal) return;
    this.createModal.classList.add('active');
    const input = document.getElementById('new-playlist-title');
    if (input) {
      input.value = '';
      input.focus();
    }
    const desc = document.getElementById('new-playlist-desc');
    if (desc) desc.value = '';
  },

  closeCreateModal() {
    if (!this.createModal) return;
    this.createModal.classList.remove('active');
  },

  async handleCreateSubmit(e) {
    e.preventDefault();
    const titleInput = document.getElementById('new-playlist-title');
    const descInput = document.getElementById('new-playlist-desc');
    const title = titleInput.value.trim();
    const description = descInput ? descInput.value.trim() : '';

    if (!title) return;

    try {
      const res = await window.API.createPlaylist({
        title,
        description,
        cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
      });

      this.closeCreateModal();
      window.Views.showToast(`Playlist "${title}" created!`);

      // Refresh playlists view and sidebar
      await window.Views.loadPlaylistsView();
      await window.Views.loadSidebarPlaylists();

      // Open newly created playlist
      if (res && res.data && res.data.id) {
        window.Views.openPlaylistDetail(res.data.id);
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
      alert('Could not create playlist: ' + err.message);
    }
  },

  async deletePlaylist(playlistId, title) {
    if (!confirm(`Are you sure you want to delete the playlist "${title || 'this playlist'}"?`)) return;

    try {
      await window.API.deletePlaylist(playlistId);
      window.Views.showToast('Playlist deleted');
      await window.Views.loadPlaylistsView();
      await window.Views.loadSidebarPlaylists();
      window.Views.switchTab('playlists');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
      alert('Could not delete playlist: ' + err.message);
    }
  },

  async promptAddTrackToPlaylist(trackId, trackTitle) {
    try {
      const res = await window.API.getPlaylists();
      const playlists = res.data || [];

      if (playlists.length === 0) {
        alert('You have no playlists yet. Create one first!');
        this.openCreateModal();
        return;
      }

      // Display simple selector prompt or choose first available
      const playlistNames = playlists.map((p, idx) => `${idx + 1}. ${p.title}`).join('\n');
      const choice = prompt(`Add "${trackTitle}" to which playlist?\nEnter number:\n${playlistNames}`);

      if (choice) {
        const selectedIdx = parseInt(choice, 10) - 1;
        if (selectedIdx >= 0 && selectedIdx < playlists.length) {
          const target = playlists[selectedIdx];
          await window.API.addTrackToPlaylist(target.id, trackId);
          window.Views.showToast(`Added to "${target.title}"!`);
        } else {
          alert('Invalid selection.');
        }
      }
    } catch (err) {
      console.error('Failed to add track to playlist:', err);
    }
  },

  async removeTrack(playlistId, trackId) {
    try {
      await window.API.removeTrackFromPlaylist(playlistId, trackId);
      window.Views.showToast('Track removed from playlist');
      window.Views.openPlaylistDetail(playlistId);
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  }
};

window.PlaylistManager = PlaylistManager;
