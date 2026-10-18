const env = require('./src/config/env');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

// Locally: connect to DB then listen. On Vercel: just export the app.
if (!env.isVercel) {
  connectDB()
    .then(() => {
      app.listen(env.port, () => {
        logger.info(`Server started on port ${env.port}`, { environment: env.nodeEnv });
      });
    })
    .catch((err) => {
      logger.error('Failed to start server', { message: err.message });
      process.exit(1);
    });
}

module.exports = app;