const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { adviceLimiter } = require('../middleware/rateLimiter');
const { generateAdvice } = require('../services/adviceEngine');
const AdviceLog = require('../models/AdviceLog');
const User = require('../models/User');
const WeighIn = require('../models/WeighIn');

const router = express.Router();

function getBmiCategory(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// POST /advice
router.post(
  '/',
  authenticate,
  adviceLimiter,
  [
    body('flags').optional().isArray().withMessage('Flags must be an array'),
    body('prompt').optional().isString().isLength({ max: 300 }).withMessage('Prompt max 300 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select('-passwordHash');
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Get latest weight for BMI
      const latestWeighIn = await WeighIn.findOne({ userId: req.userId }).sort({ date: -1 });
      const currentWeight = latestWeighIn ? latestWeighIn.weightKg : user.startWeightKg;
      const bmiCategory = getBmiCategory(user.heightCm, currentWeight);

      const goal = user.goal || 'maintain';
      const flags = req.body.flags || [];
      const prompt = req.body.prompt || '';

      const result = generateAdvice({ goal, bmiCategory, flags, prompt });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Log the advice request
      await AdviceLog.create({ userId: req.userId, goal, flags });

      res.json(result);
    } catch (err) {
      console.error('Advice error:', err);
      res.status(500).json({ error: 'Failed to generate advice' });
    }
  }
);

module.exports = router;
