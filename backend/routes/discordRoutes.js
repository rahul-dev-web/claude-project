const express = require('express');
const router = express.Router();
const { getUserServers, getActionHistory } = require('../controllers/discordController');
const { supabase } = require('../server');

// GET /api/discord/servers
router.get('/servers', async (req, res) => {
  const { discordId } = req.query;

  if (!discordId) {
    return res.status(400).json({ error: 'Discord ID required' });
  }

  try {
    const result = await getUserServers(discordId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/discord/actions/:guildId
router.get('/actions/:guildId', async (req, res) => {
  const { guildId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const result = await getActionHistory(guildId, parseInt(limit), parseInt(offset));

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;