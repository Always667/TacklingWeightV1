const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
  },
  metric: {
    type: String,
    enum: ['yesno', 'weight'],
    required: true,
  },
  targetValue: {
    type: Number,
    default: 0,
  },
  pointsPerCompletion: {
    type: Number,
    required: true,
    min: 1,
  },
  startAt: {
    type: Date,
    required: true,
  },
  endAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  goal: {
    type: [String],
    enum: ['lose', 'gain', 'maintain'],
    default: ['lose', 'gain', 'maintain'],
  },
});

module.exports = mongoose.model('Challenge', challengeSchema);
