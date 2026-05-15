const express = require('express');

const router = express.Router();

// GET /api/healthz — health check endpoint used by Replit
router.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
