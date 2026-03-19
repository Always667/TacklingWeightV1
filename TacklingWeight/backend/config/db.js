const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((m) => {
        console.log('MongoDB connected');
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
