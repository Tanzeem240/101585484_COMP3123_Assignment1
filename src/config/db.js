const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const DB_NAME = 'comp3123_assignment1';

// Cache the connection so serverless (Vercel) invocations reuse it
const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.mongoUri, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        logger.info('MongoDB connected', { database: m.connection.name });
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        logger.error('MongoDB connection failed', { message: err.message });
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };