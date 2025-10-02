const express = require('express');
const multer = require('multer');
const pool = require('../db');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Get all notes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, file_url, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create new note
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, content } = req.body;
    let fileUrl = null;

    // If file uploaded, store in Azure Blob (simulated for now)
    if (req.file) {
      // In production, this would upload to Azure Blob Storage
      fileUrl = `/uploads/${Date.now()}-${req.file.originalname}`;
    }

    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, file_url) VALUES ($1, $2, $3, $4) RETURNING id, title, content, file_url, created_at',
      [req.userId, title, content, fileUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING id, title, content, file_url, updated_at',
      [title, content, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;