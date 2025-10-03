const request = require('supertest');
const app = require('../src/index');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Helper to get a token - assuming auth is needed, but for simplicity, we'll mock or skip auth for DB tests
// Full integration tests for notes API (testing DB indirectly)

describe('Notes API (Database Tests)', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Assume setup: Create test user if needed, get token
    // For this, we'll use API to register/login to get token
    // But since auth routes not detailed, placeholder
    // In practice, register a test user
    // Signup (note: route is /signup, not /register)
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'testpass' });
    expect(signupRes.status).toBe(201);
    userId = signupRes.body.id;

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'testpass' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  beforeEach(async () => {
    // Clean up: Delete test notes
    await pool.query('DELETE FROM notes WHERE user_id = $1', [userId]);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should create a new note (POST)', async () => {
    const newNote = {
      title: 'Test Note',
      content: 'Test content',
    };

    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(201);

    expect(res.body.title).toBe(newNote.title);
    expect(res.body.content).toBe(newNote.content);
    expect(res.body.user_id).toBe(userId);
  });

  it('should get all notes (GET)', async () => {
    // First create a note
    await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Note 1', content: 'Content 1' });

    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toBe('Note 1');
  });

  it('should get a single note (GET /:id)', async () => {
    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Single Note', content: 'Single content' })
      .expect(201);

    const noteId = createRes.body.id;

    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(noteId);
    expect(res.body.title).toBe('Single Note');
  });

  it('should update a note (PUT /:id)', async () => {
    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Update Note', content: 'Old content' })
      .expect(201);

    const noteId = createRes.body.id;

    const updateData = { title: 'Updated Title', content: 'New content' };

    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)
      .expect(200);

    expect(res.body.title).toBe(updateData.title);
    expect(res.body.content).toBe(updateData.content);
    // Check updated_at is set
    expect(res.body.updated_at).toBeDefined();
  });

  it('should delete a note (DELETE /:id)', async () => {
    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Delete Note', content: 'To delete' })
      .expect(201);

    const noteId = createRes.body.id;

    await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    // Verify deleted
    const getRes = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });

  it('should handle invalid requests (e.g., no title on POST)', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'No title' })
      .expect(400);

    expect(res.body.error).toBe('Title is required');
  });
