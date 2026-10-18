const express = require('express');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const env = require('../config/env');

const router = express.Router();
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

router.get('/', async (req, res) => {
  try {
    await connectDB();
  } catch (e) {
    // still report health, just show DB as down
  }

  res.status(200).json({
    status: true,
    message: 'API is running',
    environment: env.nodeEnv,
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      name: mongoose.connection.name || null,
      state: DB_STATES[mongoose.connection.readyState] || 'unknown',
    },
  });
});

module.exports = router;