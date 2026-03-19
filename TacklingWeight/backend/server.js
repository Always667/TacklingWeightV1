require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const weighinRoutes = require('./routes/weighins');
const progressRoutes = require('./routes/progress');
const adviceRoutes = require('./routes/advice');
const challengeRoutes = require('./routes/challenges');
const leaderboardRoutes = require('./routes/leaderboard');
const userDataRoutes = require('./routes/userData');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Ensure DB is connected on every request (safe for serverless)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/weighins', weighinRoutes);
app.use('/progress', progressRoutes);
app.use('/advice', adviceRoutes);
app.use('/challenges', challengeRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/user', userDataRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
