const request = require('supertest');
const app = require('../src/index');

describe('Health Check', () => {
  it('should return 200 OK and status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
  });
});