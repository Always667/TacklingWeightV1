const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /profile
router.patch(
  '/',
  authenticate,
  [
    body('alias').optional().trim().isLength({ min: 1, max: 30 }).withMessage('Alias max 30 chars'),
    body('heightCm').optional().isFloat({ min: 50, max: 300 }).withMessage('Height must be 50–300 cm'),
    body('startWeightKg').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be 20–500 kg'),
    body('goal').optional().isIn(['lose', 'gain', 'maintain']).withMessage('Goal must be lose, gain, or maintain'),
  ],
  validate,
  async (req, res) => {
    try {
      const allowed = ['alias', 'heightCm', 'startWeightKg', 'goal'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-passwordHash');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

module.exports = router;
