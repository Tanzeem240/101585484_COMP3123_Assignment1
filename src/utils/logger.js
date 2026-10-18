const fs = require('fs');
const path = require('path');
const winston = require('winston');
const env = require('../config/env');

// Vercel's filesystem is read-only except /tmp
const logDir = env.isVercel ? '/tmp/logs' : path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

module.exports = logger;