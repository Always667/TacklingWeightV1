const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  period: {
    type: String,
    enum: ['weekly', 'allTime'],
    required: true,
  },
  weekStart: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

leaderboardSchema.index({ period: 1, weekStart: 1, points: -1 });
leaderboardSchema.index({ userId: 1, period: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
