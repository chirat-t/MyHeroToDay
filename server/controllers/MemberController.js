const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

dotenv.config();

const prisma = new PrismaClient();

// อ่านค่าจาก env var CLOUDINARY_URL อัตโนมัติ (รูปแบบ cloudinary://key:secret@cloud_name)
cloudinary.config({ secure: true });

const ALLOWED_AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// เก็บไฟล์ไว้ในหน่วยความจำชั่วคราว แล้วค่อยสตรีมขึ้น Cloudinary
// (ไม่เขียนลง disk เพราะ hosting แบบฟรีหลายเจ้า เช่น Render free tier ไม่มี persistent disk)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_AVATAR_MIME.has(file.mimetype)) {
      return cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpeg, png, webp, gif)'));
    }
    cb(null, true);
  },
}).single('avatar');

function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'myherotoday/avatars', public_id: publicId, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// ดึง public_id กลับจาก secure_url ของ Cloudinary เพื่อใช้ลบรูปเก่าตอนอัพโหลดใหม่
function extractCloudinaryPublicId(url) {
  try {
    const afterUpload = url.split('/upload/')[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

const MemberController = {
  // ----------------- SIGN UP -----------------
  signup: async (req, res) => {
    try {
      const { name, username, password } = req.body || {};

      if (typeof name !== 'string' || !name.trim()) {
        return res.status(422).json({ error: 'name จำเป็นต้องกรอก' });
      }
      if (typeof username !== 'string' || !username.trim()) {
        return res.status(422).json({ error: 'username จำเป็นต้องกรอก' });
      }
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(422).json({ error: 'password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newMember = await prisma.member.create({
        data: { name: name.trim(), username: username.trim(), password: hashedPassword },
      });

      res.json(newMember);
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'username นี้ถูกใช้งานแล้ว' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  // ----------------- SIGN IN -----------------
  signin: async (req, res) => {
    try {
      const { username, password } = req.body;

      // ค้นหาผู้ใช้จาก username
      const findUser = await prisma.member.findUnique({
        where: { username },
        select: { id: true, username: true, password: true },
      });

      if (!findUser) {
        return res.status(401).json({ message: 'unauthorized' });
      }

      // ตรวจสอบรหัสผ่าน
      const compare = await bcrypt.compare(password, findUser.password);
      if (!compare) {
        return res.status(401).json({ message: 'unauthorized' });
      }

      // ✅ ใช้ secret key จาก .env
      const secret_key = process.env.JWT_SECRET;

      // ✅ สร้าง payload สำหรับ JWT
      const payload = { id: findUser.id };

      // ✅ สร้าง token มีอายุ 1 วัน
      const token = jwt.sign(payload, secret_key, { expiresIn: '1d' });

      // ✅ ส่ง token กลับไป
      res.json({ id: findUser.id, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ----------------- GET /member/info -----------------
  info: async (req, res) => {
    try {
      // 1) ตรวจสอบ Header Authorization
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Bearer ')) {
        return res
          .status(401)
          .json({ error: 'Missing or invalid Authorization header' });
      }

      // 2) ดึง token ออกมา
      const token = auth.slice(7).trim(); // ลบคำว่า "Bearer "

      // 3) ตรวจสอบ token
      const secret_key = process.env.JWT_SECRET;
      const payload = jwt.verify(token, secret_key); // => { id: ... }
      const member_id = payload.id;

      // 4) ดึงข้อมูลสมาชิก (เพิ่ม username ด้วย ✅)
      const member = await prisma.member.findFirst({
        where: { id: member_id },
        select: {
          name: true,
          username: true, // ✅ เพิ่มบรรทัดนี้
          avatar: true,
        },
      });

      if (!member) {
        return res.status(404).json({ error: 'member not found' });
      }

      // 5) ส่งข้อมูลกลับ
      res.json(member);
    } catch (err) {
      // ตรวจ error จาก JWT
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: err.message });
      }
      // error ทั่วไป
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
  try {
    const { name, username, password } = req.body
    const token = req.headers['authorization']?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const secret_key = process.env.JWT_SECRET
    const payload = jwt.verify(token, secret_key)
    const member_id = payload.id

    const oldMember = await prisma.member.findUnique({
      where: { id: member_id }
    })
    if (!oldMember) return res.status(404).json({ error: 'User not found' })

    let newPassword = oldMember.password
    if (password && password.trim() !== '') {
      newPassword = await bcrypt.hash(password, 10)
    }

    await prisma.member.update({
      where: { id: member_id },
      data: {
        name,
        username,
        password: newPassword
      }
    })

    res.json({ message: 'success' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
},

  // ----------------- UPLOAD AVATAR -----------------
  // multer middleware, runs after authenticationToken so req.user.id is available
  uploadAvatarMiddleware: (req, res, next) => {
    avatarUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'อัพโหลดไฟล์ไม่สำเร็จ' });
      }
      next();
    });
  },

  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(422).json({ error: 'กรุณาเลือกไฟล์รูปภาพ' });
      }

      const member_id = req.user.id;

      const oldMember = await prisma.member.findUnique({ where: { id: member_id } });
      if (!oldMember) {
        return res.status(404).json({ error: 'User not found' });
      }

      const result = await uploadBufferToCloudinary(req.file.buffer, `member-${member_id}-${Date.now()}`);
      const avatarUrl = result.secure_url;

      await prisma.member.update({ where: { id: member_id }, data: { avatar: avatarUrl } });

      if (oldMember.avatar) {
        const oldPublicId = extractCloudinaryPublicId(oldMember.avatar);
        if (oldPublicId) {
          cloudinary.uploader.destroy(oldPublicId, () => {});
        }
      }

      res.json({ message: 'success', avatar: avatarUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = MemberController;
