const { body } = require('express-validator');

const signupRules = [
  body('username')
    .exists({ values: 'falsy' }).withMessage('Username is required').bail()
    .isString().withMessage('Username must be text').bail()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters').bail()
    .matches(/^[a-zA-Z0-9_.]+$/).withMessage('Username may only contain letters, numbers, _ and .'),
  body('email')
    .exists({ values: 'falsy' }).withMessage('Email is required').bail()
    .isString().withMessage('Email must be text').bail()
    .trim()
    .isEmail().withMessage('Invalid email format').bail()
    .isLength({ max: 100 }).withMessage('Email is too long')
    .toLowerCase(),
  body('password')
    .exists({ values: 'falsy' }).withMessage('Password is required').bail()
    .isString().withMessage('Password must be text').bail()
    .isLength({ min: 8, max: 64 }).withMessage('Password must be 8-64 characters').bail()
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

const loginRules = [
  body('username').optional().isString().trim().notEmpty().withMessage('Username cannot be empty'),
  body('email').optional().isString().trim().isEmail().withMessage('Invalid email format').toLowerCase(),
  body('password')
    .exists({ values: 'falsy' }).withMessage('Password is required').bail()
    .isString().withMessage('Password must be text'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error('Provide either username or email');
    }
    return true;
  }),
];

module.exports = { signupRules, loginRules };