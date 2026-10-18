const express = require('express');
const ctrl = require('../controllers/employee.controller');
const auth = require('../middleware/auth');
const validate = require('../validators/validate');
const asyncHandler = require('../utils/asyncHandler');
const { employeeRules, atLeastOneField, eidParam, eidQuery } = require('../validators/employee.validators');

const router = express.Router();

router.use(auth); // every employee route requires a valid JWT

router
  .route('/employees')
  .get(asyncHandler(ctrl.getAll))
  .post(employeeRules(), validate, asyncHandler(ctrl.create))
  .delete(eidQuery, validate, asyncHandler(ctrl.remove));

router
  .route('/employees/:eid')
  .get(eidParam, validate, asyncHandler(ctrl.getOne))
  .put(eidParam, employeeRules(true), atLeastOneField, validate, asyncHandler(ctrl.update));

module.exports = router;