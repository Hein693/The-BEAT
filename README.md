# 🎵 The BEAT — Modern Full-Stack Music Streaming Platform

A full-stack, responsive music streaming web application built with **HTML5, CSS3, vanilla JavaScript, Node.js (Express), and MySQL**.

Designed with an original, dark, energetic, and aesthetic visual identity inspired by modern streaming usability—without copying Spotify's branding, logos, or assets.

---

## 🌟 Key Features

- **Responsive Single-Page Application (SPA)**:
  - Uninterrupted audio playback across page navigation.
  - Seamless desktop sidebar navigation, tablet fluid grids, and mobile bottom navigation with drawer menu.
- **Main Pages & Views**:
  - **Home**: Trending tracks, featured artists banner, recently played history, and curated playlists.
  - **Browse**: Real-time search with debouncing, music discovery sections, and category filters.
  - **Artists**: Popular artist catalog with biography, popularity scores, monthly listener stats, discography, and top tracks.
  - **Music Genres**: Explore colorful genre tiles (Pop, Hip-Hop, Rock, R&B, Electronic, K-Pop, Jazz, Indie, Latin) with dedicated track listings.
  - **Playlists**: Full CRUD capabilities—Create new playlists, edit details, delete playlists, and add/remove tracks.
  - **Settings**: Profile customizer, theme selector (Dark Obsidian, Cyber Beat, Clean Light), audio quality selector, and notifications toggle.
- **Persistent Bottom Music Player**:
  - Track artwork thumbnail, song title, artist name, and like/favorite heart button.
  - Controls: Shuffle, Previous, Play/Pause, Next, and Repeat (off / all / one).
  - Scrubbable progress bar with elapsed and remaining duration timestamps.
  - Volume control slider with one-click mute/unmute toggle.
  - HTML5 audio playback of legitimate 30-second preview clips.
- **Legitimate Public Music APIs**:
  - Integrates with the **Deezer API** and **iTunes Search API** to fetch real, current music metadata and preview audio clips without scraping.
  - Server-side proxy and database caching for speed, rate-limit protection, and offline resilience.
- **MySQL Integration with Automatic Fallback**:
  - Full relational MySQL schema with foreign keys and cascade rules.
  - Dual-mode database layer: connects to MySQL when configured, and falls back gracefully to a built-in memory store with rich seed data so beginners can test instantly even before configuring MySQL!

---

## 📁 Folder Structure

```
The BEAT/
├── package.json             # Node.js dependencies and scripts
├── .env.example             # Template for environment variables
├── .env                     # Local environment configuration
├── README.md                # Documentation and setup instructions
├── database/
│   ├── schema.sql           # MySQL database and tables creation script
│   └── seed.sql             # Sample seed data (artists, tracks, playlists)
├── server/
│   ├── server.js            # Express app entrypoint & static serving
│   ├── config/
│   │   └── db.js            # MySQL connection pool & automatic fallback
│   ├── controllers/
│   │   ├── tracksController.js    # Trending, favorites, playback history
│   │   ├── artistsController.js   # Artists list and profile details
│   │   ├── genresController.js    # Music genres and genre-specific tracks
│   │   ├── playlistsController.js # Playlist CRUD operations
│   │   ├── searchController.js    # Multi-source search (API + database)
│   │   └── settingsController.js  # Profile & playback preferences
│   ├── routes/
│   │   ├── tracksRoutes.js
│   │   ├── artistsRoutes.js
│   │   ├── genresRoutes.js
│   │   ├── playlistsRoutes.js
│   │   ├── searchRoutes.js
│   │   └── settingsRoutes.js
│   └── services/
│       ├── dbService.js     # Unified database query repository
│       └── musicApiService.js # Deezer & iTunes API client
└── public/
    ├── index.html           # Semantic HTML5 Single-Page Application
    ├── assets/
    │   └── logo.svg         # The BEAT brand logo vector
    ├── css/
    │   ├── variables.css    # Design tokens & color palettes
    │   ├── base.css         # Reset, typography, and utility classes
    │   ├── layout.css       # Sidebar, header, and main layout grid
    │   ├── components.css   # Cards, track rows, badges, and modals
    │   ├── player.css       # Persistent bottom player styles
    │   ├── pages.css        # View-specific styles for Home, Browse, etc.
    │   └── responsive.css   # Breakpoints for laptop, tablet, and mobile
    └── js/
        ├── api.js           # REST API fetch client
        ├── player.js        # HTML5 Audio engine & control state
        ├── playlists.js     # Playlist CRUD & dialog management
        ├── theme.js         # Dark / Cyber / Light theme switcher
        ├── views.js         # SPA view rendering engine
        └── app.js           # App bootstrapper & global event delegation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL**: (Optional for initial demo, recommended for full persistence) MySQL Server 8.0+ or MariaDB / XAMPP.

### 2. Install Dependencies
In the project root directory, run:
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```ini
PORT=3000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=the_beat_db
DB_PORT=3306

# Music API Endpoints
DEEZER_API_BASE=https://api.deezer.com
ITUNES_API_BASE=https://itunes.apple.com
```

### 4. Setup MySQL Database (Optional but Recommended)
If you have MySQL running locally:

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or terminal):
   ```bash
   mysql -u root -p
   ```
2. Run the schema creation script:
   ```sql
   source database/schema.sql;
   ```
3. Load the sample seed data:
   ```sql
   source database/seed.sql;
   ```

*(Note: If MySQL is not running or credentials are left blank, the server will automatically detect this and run in **In-Memory Fallback Mode** with sample seed data pre-loaded so you can explore all features immediately!)*

### 5. Start the Application
Start the server:
```bash
npm start
```
Or with auto-reload during development:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🎧 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status and database mode diagnosis |
| `GET` | `/api/tracks/trending` | Get trending tracks |
| `GET` | `/api/tracks/charts` | Live top chart tracks |
| `GET` | `/api/tracks/recently-played` | Get user playback history |
| `GET` | `/api/tracks/favorites` | Get user liked tracks |
| `POST` | `/api/tracks/:id/favorite` | Toggle liked/favorite status |
| `POST` | `/api/tracks/:id/play` | Record a playback event |
| `GET` | `/api/artists` | Get popular artists list |
| `GET` | `/api/artists/:id` | Get artist profile, top tracks, and albums |
| `GET` | `/api/genres` | List all music genres |
| `GET` | `/api/genres/:slug/tracks` | Get tracks filtered by genre |
| `GET` | `/api/playlists` | List all user & curated playlists |
| `POST` | `/api/playlists` | Create a new playlist |
| `GET` | `/api/playlists/:id` | Get playlist details and track listing |
| `PUT` | `/api/playlists/:id` | Update playlist title and description |
| `DELETE` | `/api/playlists/:id` | Delete a playlist |
| `POST` | `/api/playlists/:id/tracks` | Add a track to a playlist |
| `DELETE` | `/api/playlists/:id/tracks/:trackId` | Remove a track from a playlist |
| `GET` | `/api/search?q=query` | Search tracks and artists (queries Deezer/iTunes) |
| `GET` | `/api/settings` | Get user profile and audio preferences |
| `PUT` | `/api/settings` | Update user settings and visual theme |

---

## 💡 Beginner Developer Concepts Explained

1. **Continuous Audio Playback in SPAs**:
   In traditional multi-page websites, navigating to a new URL reloads the entire page and stops audio playback. In **The BEAT**, we use client-side view switching (`Views.switchTab()`) within a Single-Page Application (SPA) architecture. The `<audio>` element stays alive in the DOM, allowing music to stream seamlessly without pauses when moving between views.

2. **Database Fallback Pattern**:
   In `server/config/db.js` and `server/services/dbService.js`, the application attempts a MySQL connection pool on startup. If MySQL is unreachable, it logs a gentle notice and delegates requests to an in-memory mock repository. This prevents unhandled promise rejections and lets developers run the app with `npm start` immediately.

3. **External API Proxying & Caching**:
   Directly calling external APIs from the browser often triggers Cross-Origin Resource Sharing (CORS) blocks and rate limit issues. In `server/services/musicApiService.js`, the Express backend performs the API request to Deezer / iTunes on the server side, normalizes the payload into consistent JSON, caches the results into the database, and serves it cleanly to the frontend.

4. **Accessible Color Contrast & Themes**:
   The CSS variables in `public/css/variables.css` adhere to WCAG 2.1 AA contrast standards with deep obsidian backgrounds (`#080a0e`) and electric cyber cyan (`#00f2fe`) and neon accents (`#7928ca`), switchable in real time through `data-theme`.

---

## 📄 License
MIT License. Built for education and showcase purposes.
