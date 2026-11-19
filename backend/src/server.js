const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before importing app and db
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception] ${err.name}: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `[StayScape Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  console.log(`[StayScape Server] Health check available at: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
