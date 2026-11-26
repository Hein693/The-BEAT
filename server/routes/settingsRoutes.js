const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET /api/settings - Get current user profile and audio settings
router.get('/', settingsController.getSettings);

// PUT /api/settings - Update profile preferences and theme
router.put('/', settingsController.updateSettings);

module.exports = router;
