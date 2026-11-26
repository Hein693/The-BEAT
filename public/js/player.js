/**
 * ====================================================================
 * Audio Player Engine & Controller
 * The BEAT - Modern Music Streaming Platform
 * ====================================================================
 * Manages HTML5 audio playback, queues, shuffling, repeat modes,
 * scrubbing timeline, volume states, and UI synchronization.
 */

class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isShuffle = false;
    this.repeatMode = 'off'; // 'off' | 'all' | 'one'
    this.volume = 0.8;
    this.isMuted = false;

    // Cache DOM Elements
    this.playerEl = document.getElementById('bottom-player');
    this.coverEl = document.getElementById('player-cover');
    this.titleEl = document.getElementById('player-title');
    this.artistEl = document.getElementById('player-artist');
    this.favBtn = document.getElementById('player-fav-btn');

    this.playBtn = document.getElementById('ctrl-play-btn');
    this.prevBtn = document.getElementById('ctrl-prev-btn');
    this.nextBtn = document.getElementById('ctrl-next-btn');
    this.shuffleBtn = document.getElementById('ctrl-shuffle-btn');
    this.repeatBtn = document.getElementById('ctrl-repeat-btn');

    this.currentTimeEl = document.getElementById('current-time');
    this.totalTimeEl = document.getElementById('total-time');
    this.timelineBar = document.getElementById('timeline-bar');
    this.timelineProgress = document.getElementById('timeline-progress');

    this.volBtn = document.getElementById('vol-btn');
    this.volSlider = document.getElementById('vol-slider');
    this.volProgress = document.getElementById('vol-progress');

    this.initAudioEvents();
    this.initUiEvents();
  }

  initAudioEvents() {
    // Time Update
    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio.duration) return;
      const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
      this.timelineProgress.style.width = `${progressPercent}%`;
      this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    });

    // Metadata Loaded
    this.audio.addEventListener('loadedmetadata', () => {
      this.totalTimeEl.textContent = this.formatTime(this.audio.duration || 30);
    });

    // Track Ended
    this.audio.addEventListener('ended', () => {
      if (this.repeatMode === 'one') {
        this.audio.currentTime = 0;
        this.play();
      } else {
        this.next();
      }
    });

    // Audio Errors
    this.audio.addEventListener('error', (e) => {
      console.warn('[Audio Playback] Error or preview clip unavailable:', e);
      // Attempt next after brief pause if queue exists
      if (this.queue.length > 1) {
        setTimeout(() => this.next(), 1000);
      }
    });
  }

  initUiEvents() {
    // Play / Pause toggle
    this.playBtn.addEventListener('click', () => this.togglePlay());

    // Next / Prev
    this.nextBtn.addEventListener('click', () => this.next());
    this.prevBtn.addEventListener('click', () => this.prev());

    // Shuffle
    this.shuffleBtn.addEventListener('click', () => {
      this.isShuffle = !this.isShuffle;
      this.shuffleBtn.classList.toggle('active', this.isShuffle);
    });

    // Repeat mode toggle: off -> all -> one -> off
    this.repeatBtn.addEventListener('click', () => {
      if (this.repeatMode === 'off') {
        this.repeatMode = 'all';
        this.repeatBtn.classList.add('active');
        this.repeatBtn.title = 'Repeat: All';
      } else if (this.repeatMode === 'all') {
        this.repeatMode = 'one';
        this.repeatBtn.classList.add('active');
        this.repeatBtn.title = 'Repeat: One Track';
      } else {
        this.repeatMode = 'off';
        this.repeatBtn.classList.remove('active');
        this.repeatBtn.title = 'Repeat: Off';
      }
    });

    // Seeking Scrubber
    this.timelineBar.addEventListener('click', (e) => {
      const rect = this.timelineBar.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      if (this.audio.duration) {
        this.audio.currentTime = clickPos * this.audio.duration;
      }
    });

    // Volume Slider Click
    this.volSlider.addEventListener('click', (e) => {
      const rect = this.volSlider.getBoundingClientRect();
      const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.setVolume(vol);
    });

    // Mute Button Toggle
    this.volBtn.addEventListener('click', () => {
      if (this.isMuted) {
        this.setVolume(this.volume || 0.8);
      } else {
        this.setVolume(0);
      }
    });

    // Favorite Button in Player
    this.favBtn.addEventListener('click', async () => {
      const currentTrack = this.getCurrentTrack();
      if (!currentTrack) return;
      try {
        const res = await window.API.toggleFavorite(currentTrack.id);
        currentTrack.is_favorite = res.is_favorite;
        this.favBtn.classList.toggle('liked', res.is_favorite);
        // Refresh favorite state in current view list if present
        document.querySelectorAll(`[data-track-fav-id="${currentTrack.id}"]`).forEach(btn => {
          btn.classList.toggle('liked', res.is_favorite);
        });
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      }
    });
  }

  getCurrentTrack() {
    return this.queue[this.currentIndex] || null;
  }

  loadTrack(track) {
    if (!track || !track.preview_url) return;
    this.audio.src = track.preview_url;
    this.audio.load();

    // Update Player UI
    this.coverEl.src = track.cover_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80';
    this.titleEl.textContent = track.title || 'Unknown Track';
    this.artistEl.textContent = track.artist_name || 'Unknown Artist';
    this.favBtn.classList.toggle('liked', !!track.is_favorite);
    this.timelineProgress.style.width = '0%';
    this.currentTimeEl.textContent = '0:00';
    this.totalTimeEl.textContent = this.formatTime(track.duration_seconds || 30);

    // Update active highlight on all visible list rows
    document.querySelectorAll('.track-row').forEach(row => {
      const rowId = row.dataset.trackId;
      row.classList.toggle('playing', rowId == track.id);
    });
  }

  async playTrack(track, newQueue = null) {
    if (newQueue && newQueue.length > 0) {
      this.queue = [...newQueue];
      this.currentIndex = this.queue.findIndex(t => t.id === track.id);
      if (this.currentIndex === -1) {
        this.queue.unshift(track);
        this.currentIndex = 0;
      }
    } else if (!this.queue.some(t => t.id === track.id)) {
      this.queue.push(track);
      this.currentIndex = this.queue.length - 1;
    } else {
      this.currentIndex = this.queue.findIndex(t => t.id === track.id);
    }

    this.loadTrack(track);
    await this.play();

    // Record playback on backend
    window.API.recordPlay(track.id).catch(() => {});
  }

  async play() {
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.updatePlayStateUI();
    } catch (err) {
      console.warn('[Audio Play Failed (Autoplay restriction)]:', err);
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayStateUI();
  }

  togglePlay() {
    if (this.currentIndex === -1 && this.queue.length > 0) {
      this.currentIndex = 0;
      this.loadTrack(this.queue[0]);
    }

    if (this.isPlaying) {
      this.pause();
    } else if (this.audio.src) {
      this.play();
    }
  }

  next() {
    if (this.queue.length === 0) return;

    if (this.isShuffle) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * this.queue.length);
      } while (this.queue.length > 1 && nextIdx === this.currentIndex);
      this.currentIndex = nextIdx;
    } else {
      if (this.currentIndex + 1 < this.queue.length) {
        this.currentIndex++;
      } else if (this.repeatMode === 'all') {
        this.currentIndex = 0;
      } else {
        this.pause();
        return;
      }
    }

    const nextTrack = this.queue[this.currentIndex];
    this.loadTrack(nextTrack);
    this.play();
  }

  prev() {
    if (this.queue.length === 0) return;

    // If more than 3 seconds into track, restart current track
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    if (this.currentIndex - 1 >= 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.queue.length - 1;
    }

    const prevTrack = this.queue[this.currentIndex];
    this.loadTrack(prevTrack);
    this.play();
  }

  setVolume(val) {
    this.volume = val;
    this.audio.volume = val;
    this.isMuted = val === 0;
    this.volProgress.style.width = `${val * 100}%`;

    // Update speaker icon
    const icon = this.volBtn.querySelector('svg');
    if (icon) {
      if (val === 0) {
        this.volBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        `;
      } else {
        this.volBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        `;
      }
    }
  }

  updatePlayStateUI() {
    this.playerEl.classList.toggle('is-playing', this.isPlaying);
    this.playBtn.classList.toggle('is-playing', this.isPlaying);

    if (this.isPlaying) {
      this.playBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1.5"></rect>
          <rect x="14" y="4" width="4" height="16" rx="1.5"></rect>
        </svg>
      `;
    } else {
      this.playBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

window.MusicPlayer = MusicPlayer;
