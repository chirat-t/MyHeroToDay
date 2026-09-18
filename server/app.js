const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Controllers
const memberController = require('./controllers/MemberController');
const todoController = require('./controllers/TodoController');

const app = express();

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error('Missing JWT_SECRET environment variable. Set it in server/.env before starting the server.');
}

// -------- Middlewares --------
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware - ย้ายขึ้นมาด้านบนเพื่อให้เรียกใช้ง่าย
function authenticationToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(400).json({ error: 'Use header: Authorization: Bearer <token>' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(401).json({ error: err.name || 'Invalid token' });
        req.user = user;
        next();
    });
}

// -------- Routes --------

// Root & Health Check
app.get('/', (req, res) => res.json({ status: "API is running", project: "My Hero Day" }));

// Members & Auth
app.post('/member/signup', memberController.signup);
app.post('/member/signin', memberController.signin);
app.get('/member/info', authenticationToken, memberController.info); // ใส่ Protection
app.post('/member/update', authenticationToken, memberController.update);
app.post('/member/avatar', authenticationToken, memberController.uploadAvatarMiddleware, memberController.uploadAvatar);

// --- Todo routes (Main Features) ---
app.get('/todo/list',      authenticationToken, todoController.list);
app.post('/todo',          authenticationToken, todoController.create);
app.put('/todo/:id',       authenticationToken, todoController.update);
app.delete('/todo/:id',    authenticationToken, todoController.delete);
app.get('/todo/summary',   authenticationToken, todoController.summary);

module.exports = app;
