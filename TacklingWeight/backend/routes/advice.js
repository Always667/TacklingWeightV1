const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { adviceLimiter, chatLimiter } = require('../middleware/rateLimiter');
const { generateAdvice } = require('../services/adviceEngine');
const AdviceLog = require('../models/AdviceLog');
const User = require('../models/User');
const WeighIn = require('../models/WeighIn');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// POST /advice/chat  — AI-powered freeform health Q&A
router.post(
  '/chat',
  authenticate,
  chatLimiter,
  [
    body('message')
      .isString().withMessage('Message must be a string')
      .trim()
      .isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
    body('history')
      .optional()
      .isArray({ max: 20 }).withMessage('History must be an array of up to 20 messages'),
  ],
  validate,
  async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: 'AI chat is not configured on this server.' });
      }

      const user = await User.findById(req.userId).select('goal heightCm displayName');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const latestWeighIn = await WeighIn.findOne({ userId: req.userId }).sort({ date: -1 });
      const currentWeight = latestWeighIn ? `${latestWeighIn.weightKg} kg` : 'unknown';

      const { message, history = [] } = req.body;

      // Build conversation messages
      const systemPrompt = `You are a friendly, knowledgeable health and wellness coach inside the TacklingWeight app.

User profile:
- Name: ${user.displayName || 'User'}
- Goal: ${user.goal || 'maintain weight'}
- Height: ${user.heightCm ? user.heightCm + ' cm' : 'unknown'}
- Latest weight: ${currentWeight}

Your role:
- Answer questions about nutrition, exercise, hydration, sleep, and general wellness.
- Give practical, evidence-based tips tailored to the user's goal.
- Be encouraging, concise, and easy to understand.
- Use bullet points or numbered lists where helpful.

Strict limits — you MUST refuse and redirect if asked about:
- Medical diagnoses, symptoms, or treatments
- Prescription medications or supplements
- Extreme diets (e.g. prolonged fasting, very low calorie diets under 1200 kcal)
- Any topic unrelated to health and wellness

End every response with a one-sentence motivational note.`;

      // Validate history shape (each entry must have role and content strings)
      const safeHistory = (Array.isArray(history) ? history : [])
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-20) // keep last 20 turns max
        .map(m => ({ role: m.role, content: m.content.slice(0, 500) }));

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...safeHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

      res.json({ reply });
    } catch (err) {
      console.error('AI chat error:', err);
      if (err?.status === 429) {
        return res.status(429).json({ error: 'AI service rate limit reached. Please try again shortly.' });
      }
      res.status(500).json({ error: 'Failed to get AI response.' });
    }
  }
);

module.exports = router;
