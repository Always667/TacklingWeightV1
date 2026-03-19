const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const WeighIn = require('../models/WeighIn');

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tacklingweight_test');
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await WeighIn.deleteMany({});

  const passwordHash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    email: 'weighin@example.com',
    passwordHash,
    alias: 'WeighUser',
    heightCm: 175,
    startWeightKg: 80,
    goal: 'lose',
  });
  userId = user._id;
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test_secret_key_for_testing_1234', { expiresIn: '1h' });
});

describe('Weigh-ins', () => {
  describe('POST /weighins', () => {
    it('should add a weigh-in', async () => {
      const res = await request(app)
        .post('/weighins')
        .set('Cookie', `token=${token}`)
        .send({ date: '2026-03-15', weightKg: 79.5 });

      expect(res.status).toBe(201);
      expect(res.body.weighIn.weightKg).toBe(79.5);
    });

    it('should reject invalid weight', async () => {
      const res = await request(app)
        .post('/weighins')
        .set('Cookie', `token=${token}`)
        .send({ date: '2026-03-15', weightKg: 5 });

      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/weighins')
        .send({ date: '2026-03-15', weightKg: 79.5 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /weighins', () => {
    it('should return user weigh-ins', async () => {
      await WeighIn.create({ userId, date: new Date('2026-03-10'), weightKg: 80 });
      await WeighIn.create({ userId, date: new Date('2026-03-15'), weightKg: 79.5 });

      const res = await request(app)
        .get('/weighins')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.weighIns.length).toBe(2);
    });
  });
});
