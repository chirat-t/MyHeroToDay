process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('./mocks/prisma')),
}));

const request = require('supertest');
const app = require('../app');
const prismaMock = require('./mocks/prisma');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /member/signup', () => {
  it('rejects a missing name', async () => {
    const res = await request(app)
      .post('/member/signup')
      .send({ username: 'nine', password: 'secret123' });

    expect(res.status).toBe(422);
    expect(prismaMock.member.create).not.toHaveBeenCalled();
  });

  it('rejects a missing username', async () => {
    const res = await request(app)
      .post('/member/signup')
      .send({ name: 'Nine', password: 'secret123' });

    expect(res.status).toBe(422);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/member/signup')
      .send({ name: 'Nine', username: 'nine', password: '123' });

    expect(res.status).toBe(422);
    expect(prismaMock.member.create).not.toHaveBeenCalled();
  });

  it('creates a member when input is valid', async () => {
    prismaMock.member.create.mockResolvedValue({
      id: 1,
      name: 'Nine',
      username: 'nine',
      password: 'hashed',
    });

    const res = await request(app)
      .post('/member/signup')
      .send({ name: 'Nine', username: 'nine', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when the username is already taken', async () => {
    prismaMock.member.create.mockRejectedValue({ code: 'P2002' });

    const res = await request(app)
      .post('/member/signup')
      .send({ name: 'Nine', username: 'nine', password: 'secret123' });

    expect(res.status).toBe(409);
  });
});

describe('POST /member/signin', () => {
  it('returns 401 when the username does not exist', async () => {
    prismaMock.member.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/member/signin')
      .send({ username: 'ghost', password: 'whatever' });

    expect(res.status).toBe(401);
  });

  it('returns 401 when the password is wrong', async () => {
    const bcrypt = require('bcryptjs');
    prismaMock.member.findUnique.mockResolvedValue({
      id: 1,
      username: 'nine',
      password: await bcrypt.hash('correct-password', 10),
    });

    const res = await request(app)
      .post('/member/signin')
      .send({ username: 'nine', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('returns a token on valid credentials', async () => {
    const bcrypt = require('bcryptjs');
    prismaMock.member.findUnique.mockResolvedValue({
      id: 1,
      username: 'nine',
      password: await bcrypt.hash('correct-password', 10),
    });

    const res = await request(app)
      .post('/member/signin')
      .send({ username: 'nine', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.id).toBe(1);
  });
});

describe('GET /member/info', () => {
  it('rejects a request without a token', async () => {
    const res = await request(app).get('/member/info');
    expect(res.status).toBe(401);
  });

  it('rejects a request with an invalid token', async () => {
    const res = await request(app)
      .get('/member/info')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('returns member info for a valid token', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1d' });
    prismaMock.member.findFirst.mockResolvedValue({
      name: 'Nine',
      username: 'nine',
      avatar: null,
    });

    const res = await request(app)
      .get('/member/info')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('nine');
  });
});

describe('POST /member/avatar', () => {
  it('rejects a request without a token', async () => {
    const res = await request(app).post('/member/avatar');
    expect(res.status).toBe(401);
  });

  it('rejects a request with no file attached', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .post('/member/avatar')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
  });
});
