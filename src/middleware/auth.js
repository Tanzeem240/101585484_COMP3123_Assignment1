const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const { verifyToken } = require('../services/token.service');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    logger.warn('Auth failed: missing token', { path: req.originalUrl });
    throw new AppError(401, 'Authentication token missing. Use Authorization: Bearer <token>');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    logger.warn(`Auth failed: ${message}`, { path: req.originalUrl });
    throw new AppError(401, message);
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    logger.warn('Auth failed: user no longer exists', { path: req.originalUrl });
    throw new AppError(401, 'User for this token no longer exists');
  }

  // Owner identity comes ONLY from the verified token, never from the request body
  req.user = { id: user.id, username: user.username };
  next();
});