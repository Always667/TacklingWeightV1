const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const WeighIn = require('../models/WeighIn');

const router = express.Router();

// GET /weighins
router.get('/', authenticate, async (req, res) => {
  try {
    const weighIns = await WeighIn.find({ userId: req.userId }).sort({ date: -1 }).limit(100);
    res.json({ weighIns });
  } catch (err) {
    console.error('Get weighins error:', err);
    res.status(500).json({ error: 'Failed to fetch weigh-ins' });
  }
});

// POST /weighins
router.post(
  '/',
  authenticate,
  [
    body('date').isISO8601().withMessage('Valid date required'),
    body('weightKg').isFloat({ min: 20, max: 500 }).withMessage('Weight must be 20–500 kg'),
  ],
  validate,
  async (req, res) => {
    try {
      const { date, weightKg } = req.body;
      const weighIn = await WeighIn.create({
        userId: req.userId,
        date: new Date(date),
        weightKg,
      });
      res.status(201).json({ weighIn });
    } catch (err) {
      console.error('Create weighin error:', err);
      res.status(500).json({ error: 'Failed to add weigh-in' });
    }
  }
);

module.exports = router;
