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

const DEFAULT_REQUESTS = [];

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
      if (filePath.includes('users.json')) { writeJson(filePath, DEFAULT_USERS); return DEFAULT_USERS; }
      if (filePath.includes('requests.json')) { writeJson(filePath, DEFAULT_REQUESTS); return DEFAULT_REQUESTS; }
      if (filePath.includes('announcements.json')) { writeJson(filePath, DEFAULT_ANNOUNCEMENTS); return DEFAULT_ANNOUNCEMENTS; }
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data || '[]');

    if (filePath.includes('users.json') && parsed.length === 0) { writeJson(filePath, DEFAULT_USERS); return DEFAULT_USERS; }
    if (filePath.includes('announcements.json') && parsed.length === 0) { writeJson(filePath, DEFAULT_ANNOUNCEMENTS); return DEFAULT_ANNOUNCEMENTS; }
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

const writeJson = (filePath, data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');

    // Sync ไฟล์ users.json
    if (filePath.includes('users.json')) {
      const targetPaths = [
        path.join(__dirname, '../FeatureUser/src/users.json'),
        path.join(__dirname, '../FeatureUser/users.json'),
        path.join(__dirname, '../FeatureAdmin/src/users.json'),
        path.join(__dirname, '../FeatureAdmin/users.json')
      ];
      targetPaths.forEach((tPath) => { try { if (fs.existsSync(path.dirname(tPath))) fs.writeFileSync(tPath, jsonString, 'utf8'); } catch (e) {} });
    }

    // 📌 เพิ่มระบบ Sync ไฟล์ requests.json ไปที่โฟลเดอร์ฝั่ง User และ Admin
    if (filePath.includes('requests.json')) {
      const targetPaths = [
        path.join(__dirname, '../FeatureUser/src/requests.json'),
        path.join(__dirname, '../FeatureAdmin/src/requests.json')
      ];
      targetPaths.forEach((tPath) => { try { if (fs.existsSync(path.dirname(tPath))) fs.writeFileSync(tPath, jsonString, 'utf8'); } catch (e) {} });
    }

    // Sync ไฟล์ announcements.json
    if (filePath.includes('announcements.json')) {
      const targetPaths = [
        path.join(__dirname, '../FeatureUser/src/announcements.json'),
        path.join(__dirname, '../FeatureAdmin/src/announcements.json')
      ];
      targetPaths.forEach((tPath) => { try { if (fs.existsSync(path.dirname(tPath))) fs.writeFileSync(tPath, jsonString, 'utf8'); } catch (e) {} });
    }
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'] } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- API ROUTES ---
app.post('/api/register', (req, res) => { /* โค้ดเดิมคงไว้ */ });
app.post('/api/reset-password', (req, res) => { /* โค้ดเดิมคงไว้ */ });
app.post('/api/login', (req, res) => { /* โค้ดเดิมคงไว้ */
  const { username, password, role, allowedRole } = req.body;
  const users = readJson(USERS_FILE);
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();
  const foundUser = users.find(u => String(u.username).trim().toLowerCase() === cleanUsername && String(u.password).trim() === cleanPassword);

  if (!foundUser) return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  if (role && foundUser.role !== role) return res.status(401).json({ success: false, message: `ไม่มีสิทธิ์เข้าใช้งานในสถานะนี้` });
  res.json({ success: true, user: foundUser });
});

app.get('/api/users', (req, res) => { res.json({ success: true, data: readJson(USERS_FILE) }); });
app.post('/api/admin/users', (req, res) => { /* โค้ดเดิมคงไว้ */ });
app.put('/api/admin/users/:id', (req, res) => { /* โค้ดเดิมคงไว้ */ });
app.delete('/api/admin/users/:id', (req, res) => { /* โค้ดเดิมคงไว้ */ });

app.get('/api/requests', (req, res) => {
  const requests = readJson(REQUESTS_FILE);
  res.json({ success: true, data: requests });
});

app.delete('/api/requests/:id', (req, res) => {
  try {
    const requestId = req.params.id;
    let requests = readJson(REQUESTS_FILE);
    requests = requests.filter(r => String(r.id) !== String(requestId));
    writeJson(REQUESTS_FILE, requests);
    io.emit('request_updated', requests);
    res.json({ success: true, message: 'ลบคำร้องเรียบร้อยแล้ว', data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบคำร้อง' });
  }
});

app.post('/api/admin/reset-requests', (req, res) => {
  writeJson(REQUESTS_FILE, []);
  io.emit('request_updated', []);
  res.json({ success: true, message: 'รีเซ็ตประวัติคำร้องทั้งหมดเรียบร้อยแล้ว' });
});

app.get('/api/announcements', (req, res) => {
  res.json({ success: true, data: readJson(ANNOUNCEMENTS_FILE) });
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);

  // ส่งข้อมูลเริ่มต้นเมื่อเชื่อมต่อ
  socket.emit('initial_requests', readJson(REQUESTS_FILE));
  socket.emit('initial_announcements', readJson(ANNOUNCEMENTS_FILE));

  // 📌 รวมโค้ดรับข้อมูลคำร้องไว้ที่เดียวและดักจับ Error
  socket.on('submit_request', (newReqData) => {
    try {
      console.log('📥 [Backend] ได้รับข้อมูลคำร้องใหม่:', newReqData);
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
      
      // ส่งข้อมูลที่อัปเดตกลับไปหาทุกคน (Admin จะได้รับตรงนี้)
      io.emit('request_updated', requests);
      console.log(`✅ [Backend] บันทึกและส่งแจ้งเตือน REQ-${String(requests.length).padStart(3, '0')} สำเร็จ!`);
    } catch (err) {
      console.error('❌ Error in submit_request:', err);
    }
  });

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
            if (target[fieldKey] !== undefined) target[fieldKey] = '';
          });
        }
        writeJson(REQUESTS_FILE, requests);
        io.emit('request_updated', requests);
      }
    } catch (err) {
      console.error('Error in update_status:', err);
    }
  });

  socket.on('create_announcement', (newAnnData) => {
    const anns = readJson(ANNOUNCEMENTS_FILE);
    const newAnn = { id: `ANN-${String(anns.length + 1).padStart(3, '0')}`, ...newAnnData, createdAt: new Date().toISOString() };
    anns.unshift(newAnn);
    writeJson(ANNOUNCEMENTS_FILE, anns);
    io.emit('announcements_updated', anns);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});