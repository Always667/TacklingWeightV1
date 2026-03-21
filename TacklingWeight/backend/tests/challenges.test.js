const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const ChallengeEntry = require('../models/ChallengeEntry');
const WeighIn = require('../models/WeighIn');
const Leaderboard = require('../models/Leaderboard');

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tacklingweight_test');
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Challenge.deleteMany({}),
    ChallengeEntry.deleteMany({}),
    WeighIn.deleteMany({}),
    Leaderboard.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    email: 'challenge@example.com',
    passwordHash,
    alias: 'Challenger',
    heightCm: 175,
    startWeightKg: 80,
    goal: 'lose',
  });
  userId = user._id;
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test_secret_key_for_testing_1234', { expiresIn: '1h' });
});

describe('Challenges', () => {
  describe('POST /challenges/:id/submit (yesno)', () => {
    it('should submit a yesno challenge and award points', async () => {
      const now = new Date();
      const future = new Date(now);
      future.setDate(future.getDate() + 7);

      const challenge = await Challenge.create({
        title: 'Drink water',
        type: 'daily',
        metric: 'yesno',
        targetValue: 0,
        pointsPerCompletion: 10,
        startAt: now,
        endAt: future,
        isActive: true,
      });

      const res = await request(app)
        .post(`/challenges/${challenge._id}/submit`)
        .set('Cookie', `token=${token}`)
        .send({ status: 'yes' });

      expect(res.status).toBe(201);
      expect(res.body.entry.pointsAwarded).toBe(10);
      expect(res.body.entry.status).toBe('yes');
    });

    it('should reject duplicate submission for same day', async () => {
      const now = new Date();
      const future = new Date(now);
      future.setDate(future.getDate() + 7);

      const challenge = await Challenge.create({
        title: 'Walk',
        type: 'daily',
        metric: 'yesno',
        targetValue: 0,
        pointsPerCompletion: 15,
        startAt: now,
        endAt: future,
        isActive: true,
      });

      await request(app)
        .post(`/challenges/${challenge._id}/submit`)
        .set('Cookie', `token=${token}`)
        .send({ status: 'yes' });

      const res = await request(app)
        .post(`/challenges/${challenge._id}/submit`)
        .set('Cookie', `token=${token}`)
        .send({ status: 'yes' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /challenges/:id/submit (weight)', () => {
    it('should auto-verify weight challenge', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const challenge = await Challenge.create({
        title: 'Lose 0.5 kg',
        type: 'weekly',
        metric: 'weight',
        targetValue: 0.5,
        pointsPerCompletion: 50,
        startAt: startDate,
        endAt: endDate,
        isActive: true,
      });

      // Create weigh-ins showing weight loss
      await WeighIn.create({ userId, date: startDate, weightKg: 80 });
      await WeighIn.create({ userId, date: new Date(), weightKg: 79 });

      const res = await request(app)
        .post(`/challenges/${challenge._id}/submit`)
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(201);
      expect(res.body.entry.status).toBe('auto');
      expect(res.body.entry.pointsAwarded).toBe(50);
    });
  });
});
