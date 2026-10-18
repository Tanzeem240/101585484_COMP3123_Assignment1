const { rateLimit } = require('express-rate-limit');
const logger = require('../utils/logger');

const createLimiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', { ip: req.ip, path: req.originalUrl });
      res.status(options.statusCode).json({ status: false, message });
    },
  });

// Signup + login: 10 requests per 15 minutes per IP
const authLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts. Try again in 15 minutes.');

// All /api traffic: 100 requests per 15 minutes per IP
const apiLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests. Please try again later.');

module.exports = { authLimiter, apiLimiter };