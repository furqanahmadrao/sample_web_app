const express = require('express');
const db = require('../db');
const router = express.Router();

// This is a simplified admin endpoint. In a real app, this would be protected.
router.get('/analytics', async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const noteCount = await db.query('SELECT COUNT(*) FROM notes');
    res.json({
      users: parseInt(userCount.rows[0].count, 10),
      notes: parseInt(noteCount.rows[0].count, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;