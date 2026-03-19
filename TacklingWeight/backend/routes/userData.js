const express = require('express');
const authenticate = require('../middleware/auth');
const User = require('../models/User');
const WeighIn = require('../models/WeighIn');
const ChallengeEntry = require('../models/ChallengeEntry');
const Leaderboard = require('../models/Leaderboard');
const AdviceLog = require('../models/AdviceLog');

const router = express.Router();

// DELETE /user/data
router.delete('/data', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    await Promise.all([
      WeighIn.deleteMany({ userId }),
      ChallengeEntry.deleteMany({ userId }),
      Leaderboard.deleteMany({ userId }),
      AdviceLog.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.clearCookie('token');
    res.json({ message: 'All user data deleted' });
  } catch (err) {
    console.error('Data deletion error:', err);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

module.exports = router;
