/**
 * ====================================================================
 * The BEAT - Music Streaming Application Server
 * ====================================================================
 * Express application entrypoint providing RESTful endpoints,
 * database connectivity (MySQL with automatic mock fallback),
 * and static file serving for the SPA frontend.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, isMySQLConnected } = require('./config/db');

// Import Route Handlers
const tracksRoutes = require('./routes/tracksRoutes');
const artistsRoutes = require('./routes/artistsRoutes');
const genresRoutes = require('./routes/genresRoutes');
const playlistsRoutes = require('./routes/playlistsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/ directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/tracks', tracksRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);

// System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'The BEAT',
    version: '1.0.0',
    databaseMode: isMySQLConnected() ? 'MySQL Connected' : 'In-Memory Fallback Store',
    timestamp: new Date().toISOString()
  });
});

// SPA Fallback: Any route not handled by API serves public/index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server & Database Initialization
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` 🎵 The BEAT - Music Streaming Platform is running!`);
    console.log(` 🚀 Local:   http://localhost:${PORT}`);
    console.log(` 💾 DB Mode: ${isMySQLConnected() ? 'MySQL Live' : 'In-Memory Store (Ready)'}`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = app;
