const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Runs after validation rules; turns any failures into a 400 response
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new AppError(400, 'Validation failed', errors));
};