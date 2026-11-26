/**
 * ====================================================================
 * Settings Controller
 * The BEAT - Music Streaming Backend
 * ====================================================================
 */

const dbService = require('../services/dbService');

exports.getSettings = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId, 10) || 1;
    const user = await dbService.getUserSettings(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = parseInt(req.body.userId, 10) || 1;
    const { display_name, theme_preference, audio_quality, notifications_enabled } = req.body;

    const updated = await dbService.updateUserSettings(userId, {
      display_name,
      theme_preference,
      audio_quality,
      notifications_enabled
    });

    if (!updated) {
      return res.status(400).json({ success: false, message: 'Could not update settings' });
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
