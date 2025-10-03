const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Notes API (Database + Features Tests)', () => {
  let token;
  let userId;
  let noteId;

  beforeAll(async () => {
    // Create test user manually (to avoid relying on /signup endpoint in case it's unstable)
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      ['test@example.com', hashedPassword]
    );
    userId = userResult.rows[0].id;

    // Generate token
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

  describe('Basic CRUD operations', () => {
    it('should create a new note (POST)', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: 'Test content' })
        .expect(201);

      expect(res.body.title).toBe('Test Note');
      expect(res.body.content).toBe('Test content');
      expect(res.body.user_id).toBe(userId);
      noteId = res.body.id;
    });

    it('should get all notes (GET)', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get a single note (GET /:id)', async () => {
      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(noteId);
    });

    it('should update a note (PUT /:id)', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', content: 'New content' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
      expect(res.body.content).toBe('New content');
    });

    it('should delete a note (DELETE /:id)', async () => {
      await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should handle invalid requests (missing title)', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'No title' })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('Advanced Features (tags, pinning, archiving, search)', () => {
    beforeAll(async () => {
      // Create test notes
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Work Note',
          content: 'Important meeting',
          tags: ['work', 'meeting'],
          is_pinned: true,
        });

      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Personal Note',
          content: 'Groceries',
          tags: ['personal'],
        });
    });

    it('should filter notes by tag', async () => {
      const res = await request(app)
        .get('/api/notes?tag=work')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      res.body.forEach(note => {
        expect(note.tags).toContain('work');
      });
    });

    it('should filter pinned notes', async () => {
      const res = await request(app)
        .get('/api/notes?pinned=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      res.body.forEach(note => {
        expect(note.is_pinned).toBe(true);
      });
    });

    it('should search notes by content', async () => {
      const res = await request(app)
        .get('/api/notes?search=meeting')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should archive and unarchive a note', async () => {
      // Archive
      const archiveRes = await request(app)
        .patch(`/api/notes/${noteId}/archive`)
        .set('Authorization', `Bearer ${token}`);
      expect(archiveRes.body.is_archived).toBe(true);

      // Unarchive
      const unarchiveRes = await request(app)
        .patch(`/api/notes/${noteId}/unarchive`)
        .set('Authorization', `Bearer ${token}`);
      expect(unarchiveRes.body.is_archived).toBe(false);
    });

    it('should return all unique tags', async () => {
      const res = await request(app)
        .get('/api/notes/tags/all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain('work');
      expect(res.body).toContain('personal');
    });
  });
});
