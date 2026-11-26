-- ====================================================================
-- Database Schema for "The BEAT" Music Streaming Platform
-- Database: the_beat_db
-- ====================================================================

-- 1. Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS `the_beat_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `the_beat_db`;

-- --------------------------------------------------------------------
-- 2. Drop existing tables if needed (in reverse order of foreign keys)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `recently_played`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `playlist_tracks`;
DROP TABLE IF EXISTS `playlists`;
DROP TABLE IF EXISTS `tracks`;
DROP TABLE IF EXISTS `genres`;
DROP TABLE IF EXISTS `albums`;
DROP TABLE IF EXISTS `artists`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------------------
-- 3. Users Table
-- Stores user accounts, profile details, and UI preferences
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `theme_preference` VARCHAR(20) DEFAULT 'dark',
  `audio_quality` VARCHAR(20) DEFAULT 'high',
  `notifications_enabled` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (`username`),
  INDEX idx_email (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Artists Table
-- Stores popular artists and live music metadata
-- --------------------------------------------------------------------
CREATE TABLE `artists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `api_id` VARCHAR(50) DEFAULT NULL UNIQUE,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `popularity` INT DEFAULT 85,
  `monthly_listeners` BIGINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_artist_name (`name`),
  INDEX idx_artist_api_id (`api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. Albums Table
-- Stores album collections linked to artists
-- --------------------------------------------------------------------
CREATE TABLE `albums` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `artist_id` INT NOT NULL,
  `api_id` VARCHAR(50) DEFAULT NULL UNIQUE,
  `cover_url` VARCHAR(255) DEFAULT NULL,
  `release_date` VARCHAR(30) DEFAULT NULL,
  `total_tracks` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_album_title (`title`),
  FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. Genres Table
-- Stores music genres with visual accents and gradients
-- --------------------------------------------------------------------
CREATE TABLE `genres` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `color_gradient` VARCHAR(100) DEFAULT 'linear-gradient(135deg, #4facfe, #00f2fe)',
  `icon_name` VARCHAR(50) DEFAULT 'music',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_genre_slug (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. Tracks Table
-- Stores track details, audio preview URLs, play counts, and associations
-- --------------------------------------------------------------------
CREATE TABLE `tracks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `artist_id` INT NOT NULL,
  `album_id` INT DEFAULT NULL,
  `genre_id` INT DEFAULT NULL,
  `api_id` VARCHAR(50) DEFAULT NULL UNIQUE,
  `duration_seconds` INT DEFAULT 180,
  `preview_url` VARCHAR(500) NOT NULL,
  `cover_url` VARCHAR(255) DEFAULT NULL,
  `play_count` BIGINT DEFAULT 0,
  `is_trending` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_track_title (`title`),
  INDEX idx_track_api_id (`api_id`),
  FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. Playlists Table
-- Stores user-curated and custom playlists
-- --------------------------------------------------------------------
CREATE TABLE `playlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `cover_url` VARCHAR(255) DEFAULT NULL,
  `is_public` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. Playlist_Tracks Table
-- Many-to-many relationship linking playlists and tracks with ordering
-- --------------------------------------------------------------------
CREATE TABLE `playlist_tracks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `playlist_id` INT NOT NULL,
  `track_id` INT NOT NULL,
  `position` INT DEFAULT 0,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_playlist_track` (`playlist_id`, `track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. Favorites Table
-- Stores tracks liked by users
-- --------------------------------------------------------------------
CREATE TABLE `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `track_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_favorite` (`user_id`, `track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 11. Recently_Played Table
-- Tracks playback history for individual users
-- --------------------------------------------------------------------
CREATE TABLE `recently_played` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `track_id` INT NOT NULL,
  `played_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE CASCADE,
  INDEX idx_played_at (`played_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
