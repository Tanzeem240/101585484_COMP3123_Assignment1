const { body, param, query } = require('express-validator');

const FIELDS = ['first_name', 'last_name', 'email', 'position', 'salary', 'date_of_joining', 'department'];

const employeeRules = (isUpdate = false) => {
  // On create every field is required; on update each field is optional
  const field = (name) =>
    isUpdate ? body(name).optional() : body(name).exists({ values: 'null' }).withMessage(`${name} is required`).bail();

  const text = (name, max) =>
    field(name)
      .isString().withMessage(`${name} must be text`).bail()
      .trim()
      .isLength({ min: 1, max }).withMessage(`${name} must be 1-${max} characters`);

  return [
    text('first_name', 50),
    text('last_name', 50),
    field('email')
      .isString().withMessage('email must be text').bail()
      .trim()
      .isEmail().withMessage('Invalid email format').bail()
      .isLength({ max: 100 }).withMessage('email is too long')
      .toLowerCase(),
    text('position', 100),
    text('department', 100),
    field('salary')
      .isFloat({ gt: 0, max: 100000000 }).withMessage('salary must be a positive number')
      .toFloat(),
    field('date_of_joining')
      .isISO8601({ strict: true }).withMessage('date_of_joining must be a valid date (YYYY-MM-DD)')
      .toDate(),
    // The client is never allowed to choose the owner
    body('user').not().exists().withMessage('user cannot be set by the client'),
    body('_id').not().exists().withMessage('_id cannot be set by the client'),
  ];
};

const atLeastOneField = body().custom((value, { req }) => {
  if (!FIELDS.some((f) => req.body[f] !== undefined)) {
    throw new Error(`Provide at least one field to update: ${FIELDS.join(', ')}`);
  }
  return true;
});

const eidParam = [param('eid').isMongoId().withMessage('Invalid employee id')];

const eidQuery = [
  query('eid')
    .exists({ values: 'falsy' }).withMessage('eid query parameter is required').bail()
    .isMongoId().withMessage('Invalid employee id'),
];

module.exports = { employeeRules, atLeastOneField, eidParam, eidQuery };