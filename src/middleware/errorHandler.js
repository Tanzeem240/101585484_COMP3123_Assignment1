const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let errors = err instanceof AppError ? err.errors : undefined;

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {}).filter((f) => f !== 'user');
    message = `${fields.join(', ') || 'Resource'} already exists`;
  } else if (!err.statusCode) {
    statusCode = 500;
    message = 'Internal server error';
  }

  if (statusCode >= 500) {
    logger.error('Server error', { message: err.message, stack: err.stack, path: req.originalUrl });
  } else {
    logger.warn('Request error', { status: statusCode, message, path: req.originalUrl });
  }

  res.status(statusCode).json({ status: false, message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };