const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Notes Features', () => {
  let token;
  let userId;
  let noteId;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      ['test@example.com', hashedPassword]
    );
    userId = userResult.rows[0].id;
    
    // Generate a token for the test user
    token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM notes WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    await db.end();
  });

  describe('POST /api/notes - Create note with tags and pin', () => {
    it('should create a note with tags and pinned status', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Note',
          content: 'Test content',
          tags: ['work', 'important'],
          is_pinned: true,
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('Test Note');
      expect(res.body.tags).toEqual(['work', 'important']);
      expect(res.body.is_pinned).toEqual(true);
      expect(res.body.is_archived).toEqual(false);
      
      noteId = res.body.id;
    });

    it('should create a note without tags (defaults to empty array)', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Simple Note',
          content: 'Simple content',
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.tags).toEqual([]);
      expect(res.body.is_pinned).toEqual(false);
    });
  });

  describe('GET /api/notes - Filter and search notes', () => {
    beforeAll(async () => {
      // Create some test notes
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Personal Note',
          content: 'Personal tasks',
          tags: ['personal'],
          is_pinned: false,
        });

      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Work Meeting',
          content: 'Discuss project updates',
          tags: ['work', 'meeting'],
          is_pinned: true,
        });
    });

    it('should get all non-archived notes', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter notes by tag', async () => {
      const res = await request(app)
        .get('/api/notes?tag=work')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(note => {
        expect(note.tags).toContain('work');
      });
    });

    it('should filter pinned notes', async () => {
      const res = await request(app)
        .get('/api/notes?pinned=true')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(note => {
        expect(note.is_pinned).toBe(true);
      });
    });

    it('should search notes by content', async () => {
      const res = await request(app)
        .get('/api/notes?search=meeting')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/notes/:id/pin - Toggle pin status', () => {
    it('should toggle pin status on a note', async () => {
      const res = await request(app)
        .patch(`/api/notes/${noteId}/pin`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('is_pinned');
      // It should toggle from true to false since we created it as pinned
      expect(res.body.is_pinned).toEqual(false);
    });

    it('should return 404 for non-existent note', async () => {
      const res = await request(app)
        .patch('/api/notes/99999/pin')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PATCH /api/notes/:id/archive - Archive and unarchive', () => {
    it('should archive a note', async () => {
      const res = await request(app)
        .patch(`/api/notes/${noteId}/archive`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.is_archived).toEqual(true);
    });

    it('should not show archived notes in default list', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      const archivedNote = res.body.find(note => note.id === noteId);
      expect(archivedNote).toBeUndefined();
    });

    it('should show archived notes when requested', async () => {
      const res = await request(app)
        .get('/api/notes?archived=true')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      const archivedNote = res.body.find(note => note.id === noteId);
      expect(archivedNote).toBeDefined();
      expect(archivedNote.is_archived).toBe(true);
    });

    it('should unarchive a note', async () => {
      const res = await request(app)
        .patch(`/api/notes/${noteId}/unarchive`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.is_archived).toEqual(false);
    });
  });

  describe('GET /api/notes/tags/all - Get all tags', () => {
    it('should return all unique tags for user', async () => {
      const res = await request(app)
        .get('/api/notes/tags/all')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body).toContain('work');
      expect(res.body).toContain('personal');
    });
  });

  describe('PUT /api/notes/:id - Update note with tags', () => {
    it('should update note with new tags', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Test Note',
          content: 'Updated content',
          tags: ['updated', 'test'],
          is_pinned: true,
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Updated Test Note');
      expect(res.body.tags).toEqual(['updated', 'test']);
      expect(res.body.is_pinned).toEqual(true);
    });
  });
});
