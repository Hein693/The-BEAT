/**
 * ====================================================================
 * Theme Controller Module
 * The BEAT - Modern Music Streaming Platform
 * ====================================================================
 * Manages Dark Obsidian, Cyber Beat, and Clean Light themes
 * with localStorage persistence and backend user settings sync.
 */

const ThemeManager = {
  currentTheme: 'dark',

  init() {
    const saved = localStorage.getItem('the_beat_theme') || 'dark';
    this.setTheme(saved, false);

    // Theme toggle button in header
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const next = this.currentTheme === 'dark' ? 'cyber' : (this.currentTheme === 'cyber' ? 'light' : 'dark');
        this.setTheme(next);
      });
    }
  },

  setTheme(themeName, syncBackend = true) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('the_beat_theme', themeName);

    // Update settings radio cards if on Settings page
    document.querySelectorAll('.theme-choice-card').forEach(card => {
      card.classList.toggle('active', card.dataset.themeValue === themeName);
    });

    if (syncBackend && window.API) {
      window.API.updateSettings({ theme_preference: themeName }).catch(() => {});
    }
  }
};

window.ThemeManager = ThemeManager;
