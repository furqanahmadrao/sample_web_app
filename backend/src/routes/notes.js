const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Middleware to authenticate all routes in this file
router.use(authenticateToken);

// Get all notes for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { search, tag, archived, pinned } = req.query;
    let query = 'SELECT * FROM notes WHERE user_id = $1';
    const params = [req.user.userId];
    let paramCount = 1;

    // Filter by archived status (default: show non-archived)
    if (archived === 'true') {
      query += ' AND is_archived = TRUE';
    } else {
      query += ' AND is_archived = FALSE';
    }

    // Filter by pinned status
    if (pinned === 'true') {
      query += ' AND is_pinned = TRUE';
    }

    // Filter by tag
    if (tag) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(tags)`;
      params.push(tag);
    }

    // Search in title and content
    if (search) {
      paramCount++;
      query += ` AND search_vector @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
    }

    // Order by pinned first, then by creation date
    query += ' ORDER BY is_pinned DESC, created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  const { title, content, file_url, tags = [], is_pinned = false } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO notes (user_id, title, content, file_url, tags, is_pinned) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, title, content, file_url, tags, is_pinned]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unique tags for the user
router.get('/tags/all', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT unnest(tags) as tag FROM notes WHERE user_id = $1 AND is_archived = FALSE ORDER BY tag',
      [req.user.userId]
    );
    const tags = result.rows.map(row => row.tag);
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single note by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, is_pinned } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    // Build dynamic update query based on provided fields
    const updates = [];
    const params = [title];
    let paramCount = 1;

    if (content !== undefined) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      params.push(content);
    }

    if (tags !== undefined) {
      paramCount++;
      updates.push(`tags = $${paramCount}`);
      params.push(tags);
    }

    if (is_pinned !== undefined) {
      paramCount++;
      updates.push(`is_pinned = $${paramCount}`);
      params.push(is_pinned);
    }

    paramCount++;
    params.push(id);
    const idParam = paramCount;

    paramCount++;
    params.push(req.user.userId);
    const userParam = paramCount;

    const query = `UPDATE notes SET title = $1, ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idParam} AND user_id = $${userParam} RETURNING *`;
    
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle pin status on a note
router.patch('/:id/pin', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE notes SET is_pinned = NOT is_pinned WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive a note (soft delete)
router.patch('/:id/archive', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE notes SET is_archived = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unarchive a note
router.patch('/:id/unarchive', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE notes SET is_archived = FALSE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;