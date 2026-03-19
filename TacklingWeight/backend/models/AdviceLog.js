const mongoose = require('mongoose');

const adviceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  goal: {
    type: String,
    enum: ['lose', 'gain', 'maintain'],
    required: true,
  },
  flags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AdviceLog', adviceLogSchema);
