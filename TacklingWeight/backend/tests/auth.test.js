const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tacklingweight_test');
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'testpass123', alias: 'Tester' });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.alias).toBe('Tester');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'testpass123', alias: 'First' });

      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'testpass123', alias: 'Second' });

      expect(res.status).toBe(409);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'short@example.com', password: '123', alias: 'Short' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('testpass123', 10);
      await User.create({ email: 'login@example.com', passwordHash, alias: 'Login' });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'login@example.com', password: 'testpass123' });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'testpass123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear cookie', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out');
    });
  });
});
