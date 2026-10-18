const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Loads an employee and confirms the logged-in user owns it
const getOwnedEmployee = async (eid, userId) => {
  const employee = await Employee.findById(eid);
  if (!employee) throw new AppError(404, 'Employee not found');

  if (employee.user.toString() !== userId) {
    logger.warn('Authorization failed: employee belongs to another user', {
      user_id: userId,
      employee_id: eid,
    });
    throw new AppError(403, 'You do not have permission to access this employee');
  }
  return employee;
};

module.exports = { getOwnedEmployee };