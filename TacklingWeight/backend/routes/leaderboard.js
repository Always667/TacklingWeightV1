const express = require('express');
const authenticate = require('../middleware/auth');
const { getLeaderboard } = require('../services/leaderboardService');

const router = express.Router();

// GET /leaderboard?period=weekly|allTime
router.get('/', authenticate, async (req, res) => {
  try {
    const period = req.query.period === 'allTime' ? 'allTime' : 'weekly';
    const entries = await getLeaderboard(period);

    const leaderboard = entries.map((entry, index) => ({
      rank: index + 1,
      alias: entry.userId?.alias || 'Unknown',
      userId: entry.userId?._id,
      points: entry.points,
    }));

    res.json({ period, leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
