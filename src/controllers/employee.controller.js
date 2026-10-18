const { matchedData } = require('express-validator');
const Employee = require('../models/Employee');
const logger = require('../utils/logger');
const { getOwnedEmployee } = require('../services/employee.service');

const ALLOWED_FIELDS = ['first_name', 'last_name', 'email', 'position', 'salary', 'date_of_joining', 'department'];

// Keep only real employee fields that were actually sent (never user or _id)
const pickEmployeeFields = (req) => {
  const data = matchedData(req, { locations: ['body'] });
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => ALLOWED_FIELDS.includes(key) && value !== undefined)
  );
};

exports.getAll = async (req, res) => {
  // Filter by owner in the query itself — other users' employees are never returned
  const employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 });
  res.status(200).json({ status: true, count: employees.length, data: employees });
};

exports.create = async (req, res) => {
  const data = pickEmployeeFields(req);
  const employee = await Employee.create({ ...data, user: req.user.id });
  logger.info('Employee created', { user_id: req.user.id, employee_id: employee.id });
  res.status(201).json({
    status: true,
    message: 'Employee created successfully',
    employee_id: employee.id,
    data: employee,
  });
};

exports.getOne = async (req, res) => {
  const employee = await getOwnedEmployee(req.params.eid, req.user.id);
  res.status(200).json({ status: true, data: employee });
};

exports.update = async (req, res) => {
  const employee = await getOwnedEmployee(req.params.eid, req.user.id);
  const data = pickEmployeeFields(req);
  Object.assign(employee, data);
  await employee.save();
  logger.info('Employee updated', { user_id: req.user.id, employee_id: employee.id });
  res.status(200).json({ status: true, message: 'Employee updated successfully', data: employee });
};

exports.remove = async (req, res) => {
  const { eid } = req.query;
  await getOwnedEmployee(eid, req.user.id);
  await Employee.deleteOne({ _id: eid, user: req.user.id });
  logger.info('Employee deleted', { user_id: req.user.id, employee_id: eid });
  res.status(204).send();
};