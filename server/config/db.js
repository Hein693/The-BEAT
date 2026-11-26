/**
 * ====================================================================
 * Database Configuration & Connection Pool
 * The BEAT - Music Streaming Backend
 * ====================================================================
 * Connects to MySQL using connection pooling and environment variables.
 * Gracefully provides fallback mock/seed database if MySQL is not running,
 * ensuring beginner developers can immediately run and test the application.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isMySQLConnected = false;

// Attempt MySQL connection pool initialization
async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'the_beat_db';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;

  try {
    // First, connect without database to ensure database exists if user is root
    const tempConnection = await mysql.createConnection({
      host,
      user,
      password,
      port
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConnection.end();

    // Now initialize pool with the specific database
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    connection.release();
    isMySQLConnected = true;
    console.log(`[Database] Successfully connected to MySQL at ${host}:${port}/${database}`);

    // Create tables if they do not exist
    await createTablesIfMissing();
  } catch (error) {
    isMySQLConnected = false;
    console.warn(`[Database Notice] MySQL connection failed (${error.code || error.message}).`);
    console.info(`[Database Notice] The BEAT will run using its built-in in-memory fallback database populated with sample seed data.`);
    console.info(`[Database Notice] To use real MySQL: Start MySQL and update your .env file with your DB credentials.`);
  }
}

// Automatic schema creation in MySQL if tables are absent
async function createTablesIfMissing() {
  if (!pool) return;
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'tracks'");
    if (tables.length === 0) {
      console.log("[Database] Initializing tables in MySQL...");
      // Users
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) DEFAULT NULL,
          display_name VARCHAR(100) NOT NULL,
          avatar_url VARCHAR(255) DEFAULT NULL,
          theme_preference VARCHAR(20) DEFAULT 'dark',
          audio_quality VARCHAR(20) DEFAULT 'high',
          notifications_enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Artists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS artists (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          api_id VARCHAR(50) UNIQUE,
          image_url VARCHAR(255) DEFAULT NULL,
          bio TEXT DEFAULT NULL,
          popularity INT DEFAULT 85,
          monthly_listeners BIGINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Albums
      await pool.query(`
        CREATE TABLE IF NOT EXISTS albums (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          artist_id INT NOT NULL,
          api_id VARCHAR(50) UNIQUE,
          cover_url VARCHAR(255) DEFAULT NULL,
          release_date VARCHAR(30) DEFAULT NULL,
          total_tracks INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Genres
      await pool.query(`
        CREATE TABLE IF NOT EXISTS genres (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          slug VARCHAR(50) NOT NULL UNIQUE,
          color_gradient VARCHAR(100) DEFAULT 'linear-gradient(135deg, #4facfe, #00f2fe)',
          icon_name VARCHAR(50) DEFAULT 'music',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Tracks
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tracks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          artist_id INT NOT NULL,
          album_id INT DEFAULT NULL,
          genre_id INT DEFAULT NULL,
          api_id VARCHAR(50) UNIQUE,
          duration_seconds INT DEFAULT 180,
          preview_url VARCHAR(500) NOT NULL,
          cover_url VARCHAR(255) DEFAULT NULL,
          play_count BIGINT DEFAULT 0,
          is_trending BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
          FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL,
          FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Playlists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS playlists (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(150) NOT NULL,
          description TEXT DEFAULT NULL,
          cover_url VARCHAR(255) DEFAULT NULL,
          is_public BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Playlist Tracks
      await pool.query(`
        CREATE TABLE IF NOT EXISTS playlist_tracks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          playlist_id INT NOT NULL,
          track_id INT NOT NULL,
          position INT DEFAULT 0,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
          FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
          UNIQUE KEY unique_playlist_track (playlist_id, track_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Favorites
      await pool.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          track_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_favorite (user_id, track_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Recently Played
      await pool.query(`
        CREATE TABLE IF NOT EXISTS recently_played (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          track_id INT NOT NULL,
          played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      console.log("[Database] MySQL tables created successfully.");
    }
  } catch (err) {
    console.error("[Database] Error creating missing tables in MySQL:", err.message);
  }
}

module.exports = {
  getPool: () => pool,
  isMySQLConnected: () => isMySQLConnected,
  initDatabase
};
