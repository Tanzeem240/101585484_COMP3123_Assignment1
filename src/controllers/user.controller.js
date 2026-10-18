const { matchedData } = require('express-validator');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const env = require('../config/env');
const { signToken } = require('../services/token.service');

exports.signup = async (req, res) => {
  const { username, email, password } = matchedData(req, { locations: ['body'] });

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    const field = existing.username === username ? 'Username' : 'Email';
    logger.warn('Signup rejected: duplicate', { field });
    throw new AppError(409, `${field} already exists`);
  }

  const user = await User.create({ username, email, password });
  logger.info('User registered', { user_id: user.id });

  res.status(201).json({
    status: true,
    message: 'User created successfully',
    user_id: user.id,
    data: user,
  });
};

exports.login = async (req, res) => {
  const { username, email, password } = matchedData(req, { locations: ['body'] });
  const query = email ? { email } : { username };

  const user = await User.findOne(query).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    logger.warn('Login failed: invalid credentials', { identifier: email || username });
    throw new AppError(401, 'Invalid username/email or password');
  }

  const token = signToken(user);
  logger.info('Login successful', { user_id: user.id });

  res.status(200).json({
    status: true,
    message: 'Login successful',
    token,
    token_type: 'Bearer',
    expires_in: env.jwtExpiresIn,
    data: user,
  });
};