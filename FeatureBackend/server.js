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
const ANNOUNCEMENTS_FILE = path.join(__dirname, 'announcements.json');

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
    feedback: '',
    fieldFeedbacks: {},
    deliverySchedule: '',
    adminFeedback: '',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ANN-001',
    title: '📢 ประกาศกำหนดการยื่นคำร้องขอเอกสารประจำภาคการศึกษา',
    content: 'นักศึกษาสามารถยื่นคำร้องขอเอกสารทางการศึกษาออนไลน์ได้ตลอด 24 ชั่วโมง โดยสำนักทะเบียนจะดำเนินการตรวจสอบและอนุมัติภายใน 1-2 วันทำการ',
    author: 'สำนักส่งเสริมวิชาการและงานทะเบียน',
    createdAt: new Date().toISOString()
  }
];

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
      if (filePath.includes('announcements.json')) {
        writeJson(filePath, DEFAULT_ANNOUNCEMENTS);
        return DEFAULT_ANNOUNCEMENTS;
      }
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data || '[]');

    if (filePath.includes('users.json') && parsed.length === 0) {
      writeJson(filePath, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    if (filePath.includes('announcements.json') && parsed.length === 0) {
      writeJson(filePath, DEFAULT_ANNOUNCEMENTS);
      return DEFAULT_ANNOUNCEMENTS;
    }
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    if (filePath.includes('users.json')) return DEFAULT_USERS;
    if (filePath.includes('announcements.json')) return DEFAULT_ANNOUNCEMENTS;
    return [];
  }
};

const writeJson = (filePath, data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');

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
        } catch (e) {}
      });
    }

    if (filePath.includes('announcements.json')) {
      const annUserSrc = path.join(__dirname, '../FeatureUser/src/announcements.json');
      const annAdminSrc = path.join(__dirname, '../FeatureAdmin/src/announcements.json');

      const targetAnnPaths = [annUserSrc, annAdminSrc];
      targetAnnPaths.forEach((tPath) => {
        try {
          const dir = path.dirname(tPath);
          if (fs.existsSync(dir)) {
            fs.writeFileSync(tPath, jsonString, 'utf8');
          }
        } catch (e) {}
      });
    }
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'] }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/register', (req, res) => {
  const { studentId, name, password } = req.body;
  if (!studentId || !name || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const users = readJson(USERS_FILE);
  const cleanStudentId = String(studentId).trim();
  const existingUser = users.find(u => String(u.username).trim().toLowerCase() === cleanStudentId.toLowerCase());

  if (existingUser) {
    return res.status(400).json({ success: false, message: 'รหัสนักศึกษานี้มีในระบบแล้ว' });
  }

  const newUser = {
    id: users.length > 0 ? Number(users[users.length - 1].id) + 1 : 1,
    username: cleanStudentId,
    password: String(password).trim(),
    name: String(name).trim(),
    role: 'user'
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' });
});

app.post('/api/reset-password', (req, res) => {
  const { studentId, newPassword } = req.body;
  if (!studentId || !newPassword) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const users = readJson(USERS_FILE);
  const cleanStudentId = String(studentId).trim().toLowerCase();
  const userIndex = users.findIndex(u => String(u.username).trim().toLowerCase() === cleanStudentId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบรหัสนักศึกษานี้ในระบบ' });
  }

  users[userIndex].password = String(newPassword).trim();
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
});

app.post('/api/login', (req, res) => {
  const { username, password, role, allowedRole } = req.body;
  const users = readJson(USERS_FILE);

  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  const foundUser = users.find(
    u => String(u.username).trim().toLowerCase() === cleanUsername && String(u.password).trim() === cleanPassword
  );

  if (!foundUser) {
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  if (role && foundUser.role !== role) {
    return res.status(401).json({ success: false, message: `บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในสถานะ ${role === 'admin' ? 'เจ้าหน้าที่' : 'นักศึกษา'}` });
  }

  if (allowedRole && foundUser.role !== allowedRole) {
    return res.status(403).json({ success: false, message: `บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วนของ ${allowedRole === 'admin' ? 'เจ้าหน้าที่' : 'นักศึกษา'}` });
  }

  res.json({ success: true, user: foundUser });
});

app.get('/api/users', (req, res) => {
  const users = readJson(USERS_FILE);
  res.json({ success: true, data: users });
});

app.post('/api/admin/users', (req, res) => {
  const { username, name, password, role } = req.body;
  if (!username || !name || !password || !role) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const users = readJson(USERS_FILE);
  const cleanUsername = String(username).trim();

  const existingUser = users.find(u => String(u.username).trim().toLowerCase() === cleanUsername.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้ / รหัสนักศึกษานี้มีอยู่ในระบบแล้ว' });
  }

  const newUser = {
    id: users.length > 0 ? Number(users[users.length - 1].id) + 1 : 1,
    username: cleanUsername,
    password: String(password).trim(),
    name: String(name).trim(),
    role: role === 'admin' ? 'admin' : 'user'
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'เพิ่มบัญชีผู้ใช้สำเร็จ', data: newUser });
});

app.put('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อ-นามสกุลใหม่' });
  }

  const users = readJson(USERS_FILE);
  const targetUser = users.find(u => String(u.id) === String(userId));

  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });
  }

  targetUser.name = name.trim();
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'อัปเดตชื่อเรียบร้อยแล้ว' });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  let users = readJson(USERS_FILE);

  const initialLength = users.length;
  users = users.filter(u => String(u.id) !== String(userId));

  if (users.length === initialLength) {
    return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้ที่ต้องการลบ' });
  }

  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'ลบบัญชีผู้ใช้เรียบร้อยแล้ว' });
});

app.get('/api/requests', (req, res) => {
  const requests = readJson(REQUESTS_FILE);
  res.json({ success: true, data: requests });
});

app.delete('/api/requests/:id', (req, res) => {
  try {
    const requestId = req.params.id;
    let requests = readJson(REQUESTS_FILE);
    const initialLength = requests.length;
    
    requests = requests.filter(r => String(r.id) !== String(requestId));

    if (requests.length === initialLength) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำร้องที่ต้องการลบ' });
    }

    writeJson(REQUESTS_FILE, requests);
    io.emit('request_updated', requests);
    res.json({ success: true, message: 'ลบคำร้องเรียบร้อยแล้ว', data: requests });
  } catch (err) {
    console.error('Error deleting request via API:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบคำร้อง' });
  }
});

app.post('/api/admin/reset-requests', (req, res) => {
  try {
    const emptyRequests = [];
    writeJson(REQUESTS_FILE, emptyRequests);
    io.emit('request_updated', emptyRequests);
    res.json({ success: true, message: 'รีเซ็ตประวัติคำร้องทั้งหมดเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการรีเซ็ตคำร้อง' });
  }
});

app.get('/api/announcements', (req, res) => {
  const announcements = readJson(ANNOUNCEMENTS_FILE);
  res.json({ success: true, data: announcements });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const currentRequests = readJson(REQUESTS_FILE);
  socket.emit('initial_requests', currentRequests);

  const currentAnnouncements = readJson(ANNOUNCEMENTS_FILE);
  socket.emit('initial_announcements', currentAnnouncements);

  socket.on('submit_request', (newReqData) => {
    try {
      const requests = readJson(REQUESTS_FILE);
      const newRequest = {
        id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
        ...newReqData,
        status: 'pending',
        feedback: '',
        fieldFeedbacks: {},
        deliverySchedule: '',
        adminFeedback: '',
        createdAt: new Date().toISOString()
      };

      requests.unshift(newRequest);
      writeJson(REQUESTS_FILE, requests);
      io.emit('request_updated', requests);
    } catch (err) {
      console.error('Error in submit_request:', err);
    }
  });

  // 🌟 อัปเดตสถานะ พร้อมรับค่านัดหมายส่งมอบ (deliverySchedule) และ Feedback
  socket.on('update_status', ({ requestId, status, feedback, fieldFeedbacks, deliverySchedule, adminFeedback }) => {
    try {
      const requests = readJson(REQUESTS_FILE);
      const target = requests.find(r => String(r.id) === String(requestId));

      if (target) {
        target.status = status;
        target.feedback = feedback || '';
        target.fieldFeedbacks = fieldFeedbacks || {};
        target.deliverySchedule = deliverySchedule || '';
        target.adminFeedback = adminFeedback || '';

        if (status === 'rejected' && fieldFeedbacks) {
          Object.keys(fieldFeedbacks).forEach(fieldKey => {
            if (target[fieldKey] !== undefined) {
              target[fieldKey] = '';
            }
          });
        }

        writeJson(REQUESTS_FILE, requests);
        io.emit('request_updated', requests);
      }
    } catch (err) {
      console.error('Error in update_status:', err);
    }
  });

  socket.on('delete_request', (requestId) => {
    let requests = readJson(REQUESTS_FILE);
    requests = requests.filter(r => String(r.id) !== String(requestId));
    writeJson(REQUESTS_FILE, requests);
    io.emit('request_updated', requests);
  });

  socket.on('create_announcement', (newAnnData) => {
    const anns = readJson(ANNOUNCEMENTS_FILE);
    const newAnn = {
      id: `ANN-${String(anns.length + 1).padStart(3, '0')}`,
      ...newAnnData,
      createdAt: new Date().toISOString()
    };
    anns.unshift(newAnn);
    writeJson(ANNOUNCEMENTS_FILE, anns);
    io.emit('announcements_updated', anns);
  });

  socket.on('delete_announcement', (annId) => {
    let anns = readJson(ANNOUNCEMENTS_FILE);
    anns = anns.filter(a => String(a.id) !== String(annId));
    writeJson(ANNOUNCEMENTS_FILE, anns);
    io.emit('announcements_updated', anns);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});