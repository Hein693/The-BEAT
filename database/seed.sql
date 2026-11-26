-- ====================================================================
-- Sample Seed Data for "The BEAT" Music Streaming Platform
-- Database: the_beat_db
-- ====================================================================

USE `the_beat_db`;

-- --------------------------------------------------------------------
-- 1. Seed Users
-- --------------------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `theme_preference`, `audio_quality`, `notifications_enabled`)
VALUES 
(1, 'beat_listener', 'alex@thebeat.fm', '$2b$10$wKxH8aZ...', 'Alex Rivera', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'dark', 'high', TRUE),
(2, 'sarah_groove', 'sarah@thebeat.fm', '$2b$10$wKxH8aZ...', 'Sarah Vance', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', 'cyber', 'high', TRUE);

-- --------------------------------------------------------------------
-- 2. Seed Genres
-- --------------------------------------------------------------------
INSERT INTO `genres` (`id`, `name`, `slug`, `color_gradient`, `icon_name`)
VALUES
(1, 'Pop', 'pop', 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)', 'sparkles'),
(2, 'Hip-Hop', 'hip-hop', 'linear-gradient(135deg, #ff7b00 0%, #ff0055 100%)', 'mic'),
(3, 'R&B', 'r-and-b', 'linear-gradient(135deg, #7928ca 0%, #4facfe 100%)', 'heart'),
(4, 'Electronic', 'electronic', 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', 'cpu'),
(5, 'Rock', 'rock', 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', 'zap'),
(6, 'K-Pop', 'k-pop', 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 'star'),
(7, 'Indie & Alt', 'indie', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'compass'),
(8, 'Jazz', 'jazz', 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 'music'),
(9, 'Latin', 'latin', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 'flame');

-- --------------------------------------------------------------------
-- 3. Seed Artists
-- --------------------------------------------------------------------
INSERT INTO `artists` (`id`, `name`, `api_id`, `image_url`, `bio`, `popularity`, `monthly_listeners`)
VALUES
(1, 'The Weeknd', 'dz-96356', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer, songwriter, and record producer renowned for his cinematic sonic explorations.', 98, 108450000),
(2, 'Dua Lipa', 'dz-8493113', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', 'English and Albanian singer Dua Lipa possesses a signature mezzo-soprano vocal range and modern disco-pop hooks.', 95, 78200000),
(3, 'Billie Eilish', 'dz-10884214', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', 'American singer and songwriter known for her ethereal whispered vocals and genre-blending avant-pop productions.', 96, 91500000),
(4, 'Kendrick Lamar', 'dz-3007', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80', 'Pulitzer Prize-winning hip-hop artist celebrated for his poetic storytelling, incisive social commentary, and versatile flow.', 94, 69400000),
(5, 'SZA', 'dz-4573117', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80', 'American singer-songwriter defining contemporary R&B with candid lyrics, dreamy melodic hooks, and lush soundscapes.', 94, 67800000),
(6, 'Daft Punk', 'dz-27', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 'Iconic French electronic music duo who revolutionized French touch, house, and synth-pop with their robotic mystique.', 91, 32100000),
(7, 'Bad Bunny', 'dz-10583405', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', 'Puerto Rican superstar known for reggaeton and Latin trap, dominating global music charts worldwide.', 97, 79200000);

-- --------------------------------------------------------------------
-- 4. Seed Albums
-- --------------------------------------------------------------------
INSERT INTO `albums` (`id`, `title`, `artist_id`, `api_id`, `cover_url`, `release_date`, `total_tracks`)
VALUES
(1, 'After Hours', 1, 'dz-alb-138379052', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', '2020-03-20', 14),
(2, 'Future Nostalgia', 2, 'dz-alb-135898822', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', '2020-03-27', 11),
(3, 'HIT ME HARD AND SOFT', 3, 'dz-alb-584729112', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', '2024-05-17', 10),
(4, 'DAMN.', 4, 'dz-alb-39257671', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', '2017-04-14', 14),
(5, 'SOS', 5, 'dz-alb-375990217', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', '2022-12-09', 23),
(6, 'Discovery', 6, 'dz-alb-302127', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', '2001-03-12', 14);

-- --------------------------------------------------------------------
-- 5. Seed Tracks
-- Includes legitimate preview clips (MP3 previews that play seamlessly in HTML5 audio)
-- --------------------------------------------------------------------
INSERT INTO `tracks` (`id`, `title`, `artist_id`, `album_id`, `genre_id`, `api_id`, `duration_seconds`, `preview_url`, `cover_url`, `play_count`, `is_trending`)
VALUES
(1, 'Blinding Lights', 1, 1, 1, 'dz-trk-908604612', 200, 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fac9a381e73be73611e977782e1-7.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', 3894210, TRUE),
(2, 'Save Your Tears', 1, 1, 1, 'dz-trk-908604642', 215, 'https://cdns-preview-b.dzcdn.net/stream/c-b26a6a164b18ff01ae2032e8d356fa6a-7.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', 2910400, TRUE),
(3, 'Levitating', 2, 2, 1, 'dz-trk-915998182', 203, 'https://cdns-preview-3.dzcdn.net/stream/c-3f2d2427a9235e12f6d2da3f678f142b-5.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 3421100, TRUE),
(4, 'Don\'t Start Now', 2, 2, 1, 'dz-trk-783307562', 183, 'https://cdns-preview-b.dzcdn.net/stream/c-b7168db1e7a57a1599ce5b0ff72e51a6-5.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 2810000, FALSE),
(5, 'LUNCH', 3, 3, 7, 'dz-trk-2819859102', 180, 'https://cdns-preview-f.dzcdn.net/stream/c-f1797c5e2ec715699742ef0132fae17f-3.mp3', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 2150000, TRUE),
(6, 'BIRDS OF A FEATHER', 3, 3, 7, 'dz-trk-2819859132', 196, 'https://cdns-preview-a.dzcdn.net/stream/c-ae0ef9ef5fb6d3d95ef41a9675276cf0-3.mp3', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 3912000, TRUE),
(7, 'HUMBLE.', 4, 4, 2, 'dz-trk-350410711', 177, 'https://cdns-preview-1.dzcdn.net/stream/c-12b4e548235552ea6374ee32aa28fdf4-6.mp3', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', 3120000, TRUE),
(8, 'DNA.', 4, 4, 2, 'dz-trk-350410691', 185, 'https://cdns-preview-4.dzcdn.net/stream/c-49aa2bf415ff68182f76aa8c2c7ae007-6.mp3', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', 1890000, FALSE),
(9, 'Kill Bill', 5, 5, 3, 'dz-trk-2062590217', 153, 'https://cdns-preview-6.dzcdn.net/stream/c-6fc22fe11c1d4eb611a91e5926ec0022-4.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', 4120300, TRUE),
(10, 'Snooze', 5, 5, 3, 'dz-trk-2062590247', 201, 'https://cdns-preview-e.dzcdn.net/stream/c-ee43eef6bbbbfa0d235c34e8be56858e-4.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', 2740000, TRUE),
(11, 'One More Time', 6, 6, 4, 'dz-trk-3135556', 320, 'https://cdns-preview-7.dzcdn.net/stream/c-7d9a1744beea82e06cbe16c3983272ce-5.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 2950000, FALSE),
(12, 'Harder, Better, Faster, Stronger', 6, 6, 4, 'dz-trk-3135559', 224, 'https://cdns-preview-9.dzcdn.net/stream/c-9f6fa1e479a05dfaa599cbb2e061ad58-5.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 3650000, TRUE);

-- --------------------------------------------------------------------
-- 6. Seed Playlists
-- --------------------------------------------------------------------
INSERT INTO `playlists` (`id`, `user_id`, `title`, `description`, `cover_url`, `is_public`)
VALUES
(1, 1, 'Neon Nights 🌃', 'Synthwave, neon rhythms, and late night sonic adventures for nocturnal spirits.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', TRUE),
(2, 1, 'The BEAT Global 50 🔥', 'The hottest tracks trending across the world right this second. Updated hourly.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', TRUE),
(3, 1, 'Deep Focus & Flow 🎧', 'High fidelity beats and ambient electronic soundscapes to keep you in the zone.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', TRUE),
(4, 2, 'Velvet Soul & R&B ✨', 'Smooth vocals, mellow baselines, and sweet grooves for relaxed evenings.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', TRUE);

-- --------------------------------------------------------------------
-- 7. Seed Playlist Tracks
-- --------------------------------------------------------------------
INSERT INTO `playlist_tracks` (`playlist_id`, `track_id`, `position`)
VALUES
(1, 1, 1),
(1, 3, 2),
(1, 11, 3),
(1, 12, 4),
(2, 6, 1),
(2, 1, 2),
(2, 9, 3),
(2, 7, 4),
(2, 5, 5),
(3, 11, 1),
(3, 12, 2),
(3, 2, 3),
(4, 9, 1),
(4, 10, 2),
(4, 2, 3);

-- --------------------------------------------------------------------
-- 8. Seed Favorites
-- --------------------------------------------------------------------
INSERT INTO `favorites` (`user_id`, `track_id`)
VALUES
(1, 1),
(1, 6),
(1, 9),
(1, 12);

-- --------------------------------------------------------------------
-- 9. Seed Recently Played
-- --------------------------------------------------------------------
INSERT INTO `recently_played` (`user_id`, `track_id`, `played_at`)
VALUES
(1, 6, NOW() - INTERVAL 10 MINUTE),
(1, 1, NOW() - INTERVAL 25 MINUTE),
(1, 9, NOW() - INTERVAL 45 MINUTE),
(1, 3, NOW() - INTERVAL 2 HOUR),
(1, 12, NOW() - INTERVAL 5 HOUR);
