import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'users.json');
const REQUESTS_FILE = path.join(__dirname, 'requests.json');

// ข้อมูลตั้งต้นสำหรับระบบ
const DEFAULT_USERS = [
  { id: 1, username: '660610001', password: 'password123', name: 'นายกิตติศักดิ์ ใจดี', role: 'user' },
  { id: 2, username: 'admin01', password: 'password123', name: 'สมชาย เจ้าหน้าที่', role: 'admin' }
];

const DEFAULT_REQUESTS = [
  {
    id: 'REQ-001',
    studentId: '660610001',
    studentName: 'นายกิตติศักดิ์ ใจดี',
    docType: 'หนังสือรับรองการเป็นนักศึกษา (ภาษาไทย)',
    copies: 1,
    purpose: 'สมัครทุนการศึกษา',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// ฟังก์ชันสำหรับอ่านข้อมูลจากไฟล์ JSON (พร้อม Auto-Create หากไม่มีไฟล์)
const readJson = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      if (filePath.includes('users.json')) {
        writeJson(filePath, DEFAULT_USERS);
        return DEFAULT_USERS;
      }
      if (filePath.includes('requests.json')) {
        writeJson(filePath, DEFAULT_REQUESTS);
        return DEFAULT_REQUESTS;
      }
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data || '[]');

    if (filePath.includes('users.json') && parsed.length === 0) {
      writeJson(filePath, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return filePath.includes('users.json') ? DEFAULT_USERS : [];
  }
};

// ฟังก์ชันสำหรับเขียนและซิงค์ข้อมูลลงไฟล์ JSON ทั้ง 3 โฟลเดอร์ (Backend, User, Admin)
const writeJson = (filePath, data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);

    // 1. เขียนลง FeatureBackend
    fs.writeFileSync(filePath, jsonString, 'utf8');

    // 2. ถ้าเป็นไฟล์ users.json ให้ซิงค์ไปยัง FeatureUser และ FeatureAdmin ด้วย
    if (filePath.includes('users.json')) {
      const userPathSrc = path.join(__dirname, '../FeatureUser/src/users.json');
      const userPathRoot = path.join(__dirname, '../FeatureUser/users.json');
      const adminPathSrc = path.join(__dirname, '../FeatureAdmin/src/users.json');
      const adminPathRoot = path.join(__dirname, '../FeatureAdmin/users.json');

      const targetPaths = [userPathSrc, userPathRoot, adminPathSrc, adminPathRoot];

      targetPaths.forEach((tPath) => {
        try {
          const dir = path.dirname(tPath);
          if (fs.existsSync(dir)) {
            fs.writeFileSync(tPath, jsonString, 'utf8');
          }
        } catch (e) {
          // ข้ามหากไม่พบไดเรกทอรี
        }
      });
    }
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.use(cors());
app.use(express.json());

// API: สมัครสมาชิกนักศึกษา
app.post('/api/register', (req, res) => {
  const { studentId, name, password } = req.body;

  if (!studentId || !name || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const users = readJson(USERS_FILE);
  const cleanStudentId = String(studentId).trim();
  const existingUser = users.find(u => u.username === cleanStudentId);

  if (existingUser) {
    return res.status(400).json({ success: false, message: 'รหัสนักศึกษานี้มีในระบบแล้ว' });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    username: cleanStudentId,
    password: String(password).trim(),
    name: String(name).trim(),
    role: 'user'
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);

  res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' });
});

// API: รีเซ็ตรหัสผ่านนักศึกษา
app.post('/api/reset-password', (req, res) => {
  const { studentId, newPassword } = req.body;

  if (!studentId || !newPassword) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const users = readJson(USERS_FILE);
  const cleanStudentId = String(studentId).trim();
  const userIndex = users.findIndex(u => u.username === cleanStudentId && u.role === 'user');

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบรหัสนักศึกษานี้ในระบบ' });
  }

  users[userIndex].password = String(newPassword).trim();
  writeJson(USERS_FILE, users);

  res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' });
});

// API: เข้าสู่ระบบ (Login Endpoint)
app.post('/api/login', (req, res) => {
  const { username, password, role, allowedRole } = req.body;
  const users = readJson(USERS_FILE);

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password).trim();

  const foundUser = users.find(
    u => u.username === cleanUsername && u.password === cleanPassword
  );

  if (!foundUser) {
    return res.status(401).json({
      success: false,
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
    });
  }

  if (foundUser.role !== role) {
    return res.status(401).json({
      success: false,
      message: `บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในสถานะ ${role === 'admin' ? 'เจ้าหน้าที่' : 'นักศึกษา'}`
    });
  }

  if (allowedRole && foundUser.role !== allowedRole) {
    return res.status(403).json({
      success: false,
      message: `บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วนของ ${allowedRole === 'admin' ? 'เจ้าหน้าที่' : 'นักศึกษา'}`
    });
  }

  res.json({ success: true, user: foundUser });
});

// API: ดึงคำร้องทั้งหมด
app.get('/api/requests', (req, res) => {
  const requests = readJson(REQUESTS_FILE);
  res.json({ success: true, data: requests });
});

// Socket.io Real-time Events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const currentRequests = readJson(REQUESTS_FILE);
  socket.emit('initial_requests', currentRequests);

  socket.on('submit_request', (newReqData) => {
    const requests = readJson(REQUESTS_FILE);
    const newRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      ...newReqData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    writeJson(REQUESTS_FILE, requests);
    io.emit('request_updated', requests);
  });

  socket.on('update_status', ({ requestId, status }) => {
    const requests = readJson(REQUESTS_FILE);
    const target = requests.find(r => r.id === requestId);

    if (target) {
      target.status = status;
      writeJson(REQUESTS_FILE, requests);
      io.emit('request_updated', requests);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});