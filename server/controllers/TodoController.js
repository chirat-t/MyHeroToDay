const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();

function extractBearerToken(req) {
  const raw = req.headers?.authorization || '';
  if (!raw.startsWith('Bearer ')) return null;
  return raw.slice(7).trim();
}
function verifyTokenOrThrow(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Server misconfigured: missing JWT_SECRET');
  return jwt.verify(token, secret);
}

const ALLOWED_STATUS = ['todo', 'doing', 'done'];

const TodoController = {
  // GET /todo/list
  list: async (req, res) => {
    try {
      const token = extractBearerToken(req);
      if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

      const payload = verifyTokenOrThrow(token);
      const member_id = payload.id;

      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10), 1), 200);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.todo.findMany({
          where: { member_id },
          orderBy: { id: 'desc' },
          skip,
          take: limit,
          select: { id: true, name: true, remark: true, status: true },
        }),
        prisma.todo.count({ where: { member_id } }),
      ]);

      res.json({ data: items, page, limit, total, pages: Math.ceil(total / limit) });
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // POST /todo
  create: async (req, res) => {
    try {
      const { name = '', remark = '' } = req.body || {};
      if (!name.trim()) return res.status(422).json({ error: 'name จำเป็นต้องกรอก' });

      const token = extractBearerToken(req);
      if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

      const payload = verifyTokenOrThrow(token);
      const member_id = payload.id;

      const todo = await prisma.todo.create({
        data: {
          name: name.trim(),
          remark: remark?.trim() || '',
          status: 'todo',              // ค่าเริ่มต้น
          member_id,
        },
        select: { id: true, name: true, remark: true, status: true },
      });

      res.status(201).json({ message: 'success', todo });
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // PUT /todo/:id
  update: async (req, res) => {
    try {
      const token = extractBearerToken(req);
      if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

      const payload = verifyTokenOrThrow(token);
      const member_id = payload.id;

      const id = parseInt(req.params.id, 10);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

      const exists = await prisma.todo.findFirst({ where: { id, member_id }, select: { id: true } });
      if (!exists) return res.status(404).json({ error: 'todo not found' });

      const { name, remark, status } = req.body || {};
      const data = {};
      if (typeof name === 'string') data.name = name.trim();
      if (typeof remark === 'string') data.remark = remark.trim();
      if (typeof status === 'string') {
        if (!ALLOWED_STATUS.includes(status)) return res.status(422).json({ error: 'invalid status' });
        data.status = status;
      }
      if (Object.keys(data).length === 0) return res.status(422).json({ error: 'no fields to update' });

      await prisma.todo.update({ where: { id }, data });
      res.json({ message: 'success' });
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /todo/:id
  delete: async (req, res) => {
    try {
      const token = extractBearerToken(req);
      if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

      const payload = verifyTokenOrThrow(token);
      const member_id = payload.id;

      const id = parseInt(req.params.id, 10);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });

      const item = await prisma.todo.findFirst({ where: { id, member_id }, select: { id: true } });
      if (!item) return res.status(404).json({ error: 'todo not found' });

      await prisma.todo.delete({ where: { id } });
      res.json({ message: 'success' });
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // NEW: GET /todo/summary
  summary: async (req, res) => {
    try {
      const token = extractBearerToken(req);
      if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

      const payload = verifyTokenOrThrow(token);
      const member_id = payload.id;

      const [todo, doing, done] = await Promise.all([
        prisma.todo.count({ where: { member_id, status: 'todo' } }),
        prisma.todo.count({ where: { member_id, status: 'doing' } }),
        prisma.todo.count({ where: { member_id, status: 'done' } }),
      ]);

      res.json({ todo, doing, done });
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = TodoController;
