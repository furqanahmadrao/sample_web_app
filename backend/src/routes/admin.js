const express = require('express');
const db = require('../db');
const router = express.Router();

// This is a simplified admin endpoint. In a real app, this would be protected.
router.get('/analytics', async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const noteCount = await db.query('SELECT COUNT(*) FROM notes WHERE is_archived = FALSE');
    const archivedCount = await db.query('SELECT COUNT(*) FROM notes WHERE is_archived = TRUE');
    const pinnedCount = await db.query('SELECT COUNT(*) FROM notes WHERE is_pinned = TRUE');
    const taggedCount = await db.query('SELECT COUNT(*) FROM notes WHERE array_length(tags, 1) > 0');
    
    res.json({
      users: parseInt(userCount.rows[0].count, 10),
      notes: parseInt(noteCount.rows[0].count, 10),
      archived: parseInt(archivedCount.rows[0].count, 10),
      pinned: parseInt(pinnedCount.rows[0].count, 10),
      tagged: parseInt(taggedCount.rows[0].count, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;