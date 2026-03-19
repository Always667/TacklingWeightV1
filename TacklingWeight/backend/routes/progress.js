const express = require('express');
const authenticate = require('../middleware/auth');
const User = require('../models/User');
const WeighIn = require('../models/WeighIn');

const router = express.Router();

function getBmiCategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// GET /progress/summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const weighIns = await WeighIn.find({ userId: req.userId }).sort({ date: 1 });

    const latestWeight = weighIns.length > 0
      ? weighIns[weighIns.length - 1].weightKg
      : user.startWeightKg;

    let bmi = null;
    let bmiCategory = null;
    if (user.heightCm && latestWeight) {
      const heightM = user.heightCm / 100;
      bmi = parseFloat((latestWeight / (heightM * heightM)).toFixed(1));
      bmiCategory = getBmiCategory(bmi);
    }

    const weightChange = (user.startWeightKg && latestWeight)
      ? parseFloat((latestWeight - user.startWeightKg).toFixed(1))
      : null;

    res.json({
      alias: user.alias,
      goal: user.goal,
      heightCm: user.heightCm,
      startWeightKg: user.startWeightKg,
      currentWeightKg: latestWeight,
      weightChange,
      bmi,
      bmiCategory,
      totalWeighIns: weighIns.length,
      weighIns: weighIns.map(w => ({ date: w.date, weightKg: w.weightKg })),
    });
  } catch (err) {
    console.error('Progress summary error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;
