const express = require('express');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const healthRoutes = require('./routes/health.routes');
const userRoutes = require('./routes/user.routes');
const employeeRoutes = require('./routes/employee.routes');

const app = express();

app.set('trust proxy', 1);              // correct client IPs behind Vercel (rate limiting)
app.use(helmet());                      // security headers
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.status(200).json({ status: true, message: 'COMP3123 Assignment 1 API', health: '/health' });
});
app.use('/health', healthRoutes);

// Make sure the DB is connected before any API route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api', apiLimiter);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;