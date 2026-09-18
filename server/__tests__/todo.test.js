process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('./mocks/prisma')),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const prismaMock = require('./mocks/prisma');

const authToken = () => jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1d' });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('todo routes require authentication', () => {
  it('GET /todo/list without a token returns 401', async () => {
    const res = await request(app).get('/todo/list');
    expect(res.status).toBe(401);
  });

  it('POST /todo without a token returns 401', async () => {
    const res = await request(app).post('/todo').send({ name: 'test' });
    expect(res.status).toBe(401);
  });

  it('GET /todo/list with an invalid token returns 401', async () => {
    const res = await request(app)
      .get('/todo/list')
      .set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });
});

describe('GET /todo/list', () => {
  it('returns the caller member id-scoped list for a valid token', async () => {
    prismaMock.todo.findMany.mockResolvedValue([
      { id: 1, name: 'ทำการบ้าน', remark: '', status: 'todo' },
    ]);
    prismaMock.todo.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/todo/list')
      .set('Authorization', `Bearer ${authToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.todo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { member_id: 1 } })
    );
  });
});

describe('POST /todo', () => {
  it('rejects an empty name', async () => {
    const res = await request(app)
      .post('/todo')
      .set('Authorization', `Bearer ${authToken()}`)
      .send({ name: '  ' });

    expect(res.status).toBe(422);
    expect(prismaMock.todo.create).not.toHaveBeenCalled();
  });

  it('creates a todo scoped to the authenticated member', async () => {
    prismaMock.todo.create.mockResolvedValue({
      id: 5, name: 'อ่านหนังสือ', remark: '', status: 'todo',
    });

    const res = await request(app)
      .post('/todo')
      .set('Authorization', `Bearer ${authToken()}`)
      .send({ name: 'อ่านหนังสือ' });

    expect(res.status).toBe(201);
    expect(prismaMock.todo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ member_id: 1 }) })
    );
  });
});

describe('GET /todo/summary', () => {
  it('returns counts per status', async () => {
    prismaMock.todo.count
      .mockResolvedValueOnce(2) // todo
      .mockResolvedValueOnce(1) // doing
      .mockResolvedValueOnce(3); // done

    const res = await request(app)
      .get('/todo/summary')
      .set('Authorization', `Bearer ${authToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ todo: 2, doing: 1, done: 3 });
  });
});
