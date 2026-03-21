/**
 * Seed script — creates demo users, weigh-ins, and challenges.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const WeighIn = require('./models/WeighIn');
const Challenge = require('./models/Challenge');
const ChallengeEntry = require('./models/ChallengeEntry');
const Leaderboard = require('./models/Leaderboard');

const SALT_ROUNDS = 12;

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    WeighIn.deleteMany({}),
    Challenge.deleteMany({}),
    ChallengeEntry.deleteMany({}),
    Leaderboard.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create demo users
  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

  const users = await User.insertMany([
    { email: 'alice@example.com', passwordHash, alias: 'Alice', heightCm: 165, startWeightKg: 78, goal: 'lose' },
    { email: 'bob@example.com', passwordHash, alias: 'Bob', heightCm: 180, startWeightKg: 70, goal: 'maintain' },
    { email: 'charlie@example.com', passwordHash, alias: 'Charlie', heightCm: 175, startWeightKg: 60, goal: 'gain' },
  ]);
  console.log(`Created ${users.length} demo users`);

  // Create weigh-ins for Alice (showing weight loss progress)
  const alice = users[0];
  const weighIns = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i <= 30; i += 3) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    weighIns.push({
      userId: alice._id,
      date,
      weightKg: parseFloat((78 - (i * 0.15)).toFixed(1)),
    });
  }

  // Add weigh-ins for Bob
  const bob = users[1];
  for (let i = 0; i <= 30; i += 5) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    weighIns.push({
      userId: bob._id,
      date,
      weightKg: parseFloat((70 + (Math.random() * 2 - 1)).toFixed(1)),
    });
  }

  await WeighIn.insertMany(weighIns);
  console.log(`Created ${weighIns.length} weigh-ins`);

  // Create challenges — goal-specific + shared
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const monthFromNow = new Date(now);
  monthFromNow.setDate(monthFromNow.getDate() + 30);

  const challenges = await Challenge.insertMany([
    // ── Shared (all goals) ──
    {
      title: 'Drink 8 glasses of water today',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 10,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['lose', 'gain', 'maintain'],
    },
    {
      title: 'Eat 5 portions of fruit & veg today',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 10,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['lose', 'gain', 'maintain'],
    },
    {
      title: 'Get at least 7 hours of sleep',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 10,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['lose', 'gain', 'maintain'],
    },

    // ── Lose weight ──
    {
      title: 'Take a 20-minute walk',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 15,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['lose'],
    },
    {
      title: 'Choose a healthy snack over junk food',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 10,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['lose'],
    },
    {
      title: 'Lose 0.5 kg this week',
      type: 'weekly', metric: 'weight', targetValue: 0.5,
      pointsPerCompletion: 50,
      startAt: now, endAt: weekFromNow, isActive: true,
      goal: ['lose'],
    },

    // ── Gain weight ──
    {
      title: 'Eat a protein-rich snack between meals',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 10,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['gain'],
    },
    {
      title: 'Do a strength training session',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 20,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['gain'],
    },
    {
      title: 'Gain 0.5 kg this week',
      type: 'weekly', metric: 'weight', targetValue: 0.5,
      pointsPerCompletion: 50,
      startAt: now, endAt: weekFromNow, isActive: true,
      goal: ['gain'],
    },

    // ── Maintain weight ──
    {
      title: 'Log your weight today',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 10,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['maintain'],
    },
    {
      title: 'Try a new healthy recipe',
      type: 'daily', metric: 'yesno', targetValue: 0,
      pointsPerCompletion: 15,
      startAt: now, endAt: monthFromNow, isActive: true,
      goal: ['maintain'],
    },
    {
      title: 'Stay within 0.5 kg of your target this week',
      type: 'weekly', metric: 'weight', targetValue: 0.5,
      pointsPerCompletion: 50,
      startAt: now, endAt: weekFromNow, isActive: true,
      goal: ['maintain'],
    },
  ]);
  console.log(`Created ${challenges.length} challenges`);

  // Seed leaderboard entries
  await Leaderboard.insertMany([
    { userId: alice._id, period: 'allTime', weekStart: null, points: 120 },
    { userId: bob._id, period: 'allTime', weekStart: null, points: 85 },
    { userId: users[2]._id, period: 'allTime', weekStart: null, points: 60 },
  ]);
  console.log('Created leaderboard entries');

  console.log('\n✅ Seed complete!');
  console.log('Demo credentials:');
  console.log('  alice@example.com / password123');
  console.log('  bob@example.com / password123');
  console.log('  charlie@example.com / password123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
