const express = require('express');
const ctrl = require('../controllers/user.controller');
const { signupRules, loginRules } = require('../validators/user.validators');
const validate = require('../validators/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/signup', authLimiter, signupRules, validate, asyncHandler(ctrl.signup));
router.post('/login', authLimiter, loginRules, validate, asyncHandler(ctrl.login));

module.exports = router;