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
app.options('*', cors({
  origin: "https://tackling-weight-v1-d66a.vercel.app/",
  credentials: true
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

// Only start the HTTP server when run directly (local dev).
// On Vercel the file is imported as a module — do NOT call listen().
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
