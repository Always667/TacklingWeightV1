const mongoose = require('mongoose');

const challengeEntrySchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['yes', 'no', 'auto'],
    required: true,
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
});

challengeEntrySchema.index({ challengeId: 1, userId: 1, date: 1 });

module.exports = mongoose.model('ChallengeEntry', challengeEntrySchema);
