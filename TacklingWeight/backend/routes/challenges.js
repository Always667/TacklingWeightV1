const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { challengeSubmitLimiter } = require('../middleware/rateLimiter');
const Challenge = require('../models/Challenge');
const ChallengeEntry = require('../models/ChallengeEntry');
const WeighIn = require('../models/WeighIn');
const User = require('../models/User');
const { awardPoints } = require('../services/leaderboardService');

const router = express.Router();

// GET /challenges/active
router.get('/active', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('goal');
    const userGoal = user?.goal || 'maintain';
    const now = new Date();

    const challenges = await Challenge.find({
      isActive: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
      goal: userGoal,
    });

    // Get user's entries for these challenges
    const challengeIds = challenges.map(c => c._id);
    const entries = await ChallengeEntry.find({
      userId: req.userId,
      challengeId: { $in: challengeIds },
    });

    const entriesByChallenge = {};
    for (const entry of entries) {
      const key = entry.challengeId.toString();
      if (!entriesByChallenge[key]) entriesByChallenge[key] = [];
      entriesByChallenge[key].push(entry);
    }

    const result = challenges.map(c => ({
      ...c.toObject(),
      userEntries: entriesByChallenge[c._id.toString()] || [],
    }));

    res.json({ challenges: result });
  } catch (err) {
    console.error('Get challenges error:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// POST /challenges/:id/submit
router.post(
  '/:id/submit',
  authenticate,
  challengeSubmitLimiter,
  [
    body('status').optional().isIn(['yes', 'no']).withMessage('Status must be yes or no'),
  ],
  validate,
  async (req, res) => {
    try {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
      if (!challenge.isActive) return res.status(400).json({ error: 'Challenge is not active' });

      const now = new Date();
      if (now < challenge.startAt || now > challenge.endAt) {
        return res.status(400).json({ error: 'Challenge is not in active period' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check for existing entry today
      const existing = await ChallengeEntry.findOne({
        challengeId: challenge._id,
        userId: req.userId,
        date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      });

      // For yesno challenges, block re-submission entirely.
      // For weight challenges, allow a retry today only if the previous attempt
      // was unverified (pointsAwarded === 0), so the user can log more weigh-ins
      // and try again within the same day.
      if (existing) {
        if (challenge.metric !== 'weight' || existing.pointsAwarded > 0) {
          return res.status(409).json({ error: 'Already submitted for today' });
        }
        // Delete the failed entry so we can re-evaluate
        await existing.deleteOne();
      }

      let status = 'no';
      let pointsAwarded = 0;

      if (challenge.metric === 'yesno') {
        // Manual submit
        status = req.body.status || 'yes';
        if (status === 'yes') {
          pointsAwarded = challenge.pointsPerCompletion;
        }
      } else if (challenge.metric === 'weight') {
        // Goal-aware weight verification
        const user = await User.findById(req.userId).select('goal');
        const userGoal = user?.goal || 'maintain';

        const allWeighIns = await WeighIn.find({ userId: req.userId }).sort({ date: 1 });

        const preChallenge = allWeighIns.filter(w => w.date <= challenge.startAt);
        const baseline = preChallenge.length ? preChallenge[preChallenge.length - 1] : null;

        const inPeriod = allWeighIns.filter(w => w.date > challenge.startAt);
        const latest = inPeriod.length ? inPeriod[inPeriod.length - 1] : null;

        const startWeight = baseline?.weightKg ?? (inPeriod.length >= 2 ? inPeriod[0].weightKg : null);
        const currentWeight = latest?.weightKg ?? null;

        if (startWeight != null && currentWeight != null) {
          let met = false;
          if (userGoal === 'lose') {
            met = parseFloat((startWeight - currentWeight).toFixed(1)) >= challenge.targetValue;
          } else if (userGoal === 'gain') {
            met = parseFloat((currentWeight - startWeight).toFixed(1)) >= challenge.targetValue;
          } else {
            // maintain: stayed within targetValue of start
            met = Math.abs(parseFloat((currentWeight - startWeight).toFixed(1))) <= challenge.targetValue;
          }
          if (met) {
            status = 'auto';
            pointsAwarded = challenge.pointsPerCompletion;
          }
        }
      }

      const entry = await ChallengeEntry.create({
        challengeId: challenge._id,
        userId: req.userId,
        date: now,
        status,
        pointsAwarded,
      });

      if (pointsAwarded > 0) {
        await awardPoints(req.userId, pointsAwarded);
      }

      res.status(201).json({ entry });
    } catch (err) {
      console.error('Challenge submit error:', err);
      res.status(500).json({ error: 'Failed to submit challenge' });
    }
  }
);

module.exports = router;
