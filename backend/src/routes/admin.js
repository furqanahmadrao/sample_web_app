const express = require('express');
const pool = require('../db');

const router = express.Router();

// Basic admin analytics
router.get('/analytics', async (req, res) => {
  try {
    // Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');

    // Get total notes count
    const notesResult = await pool.query('SELECT COUNT(*) FROM notes');

    // Get notes per user (average)
    const avgNotesResult = await pool.query(
      'SELECT AVG(note_count) FROM (SELECT user_id, COUNT(*) as note_count FROM notes GROUP BY user_id) user_notes'
    );

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalNotes: parseInt(notesResult.rows[0].count),
      averageNotesPerUser: parseFloat(avgNotesResult.rows[0].avg || 0).toFixed(2)
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');

    res.json({
      database: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      database: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;