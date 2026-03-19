const Leaderboard = require('../models/Leaderboard');
const ChallengeEntry = require('../models/ChallengeEntry');

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

async function awardPoints(userId, points) {
  const weekStart = getWeekStart();

  // Update weekly leaderboard
  await Leaderboard.findOneAndUpdate(
    { userId, period: 'weekly', weekStart },
    { $inc: { points } },
    { upsert: true }
  );

  // Update all-time leaderboard
  await Leaderboard.findOneAndUpdate(
    { userId, period: 'allTime', weekStart: null },
    { $inc: { points } },
    { upsert: true }
  );
}

async function getLeaderboard(period, limit = 20) {
  const query = { period };
  if (period === 'weekly') {
    query.weekStart = getWeekStart();
  }
  if (period === 'allTime') {
    query.weekStart = null;
  }

  return Leaderboard.find(query)
    .sort({ points: -1 })
    .limit(limit)
    .populate('userId', 'alias');
}

module.exports = { awardPoints, getLeaderboard, getWeekStart };
