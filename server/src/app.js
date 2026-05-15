const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();

// Middleware
app.use(cors());                         // Allow requests from the React frontend
app.use(express.json());                 // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// All API routes are prefixed with /api
app.use('/api', routes);

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
