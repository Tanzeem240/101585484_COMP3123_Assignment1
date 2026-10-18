const logger = require('../utils/logger');

// Logs method, path, status and timing — never bodies or headers (no passwords/tokens)
module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const meta = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      ip: req.ip,
      user_id: req.user ? req.user.id : undefined,
    };
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, 'HTTP request', meta);
  });

  next();
};