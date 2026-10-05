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

    if (filePath.includes('users.json')) {
      const targetPaths = [
        path.join(__dirname, '../FeatureUser/src/users.json'),
        path.join(__dirname, '../FeatureUser/users.json'),
        path.join(__dirname, '../FeatureAdmin/src/users.json'),
        path.join(__dirname, '../FeatureAdmin/users.json')
      ];
      targetPaths.forEach((tPath) => { try { if (fs.existsSync(path.dirname(tPath))) fs.writeFileSync(tPath, jsonString, 'utf8'); } catch (e) {} });
    }

    if (filePath.includes('requests.json')) {
      const targetPaths = [
        path.join(__dirname, '../FeatureUser/src/requests.json'),
        path.join(__dirname, '../FeatureAdmin/src/requests.json')
      ];
      targetPaths.forEach((tPath) => { try { if (fs.existsSync(path.dirname(tPath))) fs.writeFileSync(tPath, jsonString, 'utf8'); } catch (e) {} });
    }

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
app.use(express.json({ limit: '50mb' })); // ✅ แก้เป็น 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true })); // ✅ เพิ่มบรรทัดนี้เข้ามา
// --- API ROUTES สำหรับ User ---
app.post('/api/register', (req, res) => {
  const { studentId, name, password } = req.body;
  if (!studentId || !name || !password) return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });

  const users = readJson(USERS_FILE);
  const cleanStudentId = String(studentId).trim();
  const existingUser = users.find(u => String(u.username).trim().toLowerCase() === cleanStudentId.toLowerCase());

  if (existingUser) return res.status(400).json({ success: false, message: 'รหัสนักศึกษานี้มีในระบบแล้ว' });

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
  if (!studentId || !newPassword) return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });

  const users = readJson(USERS_FILE);
  const cleanStudentId = String(studentId).trim().toLowerCase();
  const userIndex = users.findIndex(u => String(u.username).trim().toLowerCase() === cleanStudentId);

  if (userIndex === -1) return res.status(404).json({ success: false, message: 'ไม่พบรหัสนักศึกษานี้ในระบบ' });

  users[userIndex].password = String(newPassword).trim();
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
});

app.post('/api/login', (req, res) => {
  const { username, password, role, allowedRole } = req.body;
  const users = readJson(USERS_FILE);
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  const foundUser = users.find(u => String(u.username).trim().toLowerCase() === cleanUsername && String(u.password).trim() === cleanPassword);

  if (!foundUser) return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  if (role && foundUser.role !== role) return res.status(401).json({ success: false, message: `ไม่มีสิทธิ์เข้าใช้งานในสถานะ ${role === 'admin' ? 'เจ้าหน้าที่' : 'นักศึกษา'}` });
  if (allowedRole && foundUser.role !== allowedRole) return res.status(403).json({ success: false, message: `ไม่มีสิทธิ์เข้าใช้งานในส่วนของ ${allowedRole === 'admin' ? 'เจ้าหน้าที่' : 'นักศึกษา'}` });

  res.json({ success: true, user: foundUser });
});

// --- API ROUTES สำหรับจัดการคำร้อง (Requests) ---
app.get('/api/requests', (req, res) => {
  const requests = readJson(REQUESTS_FILE);
  res.json({ success: true, data: requests });
});

// 📌 API สำหรับยื่นคำร้องใหม่ (รับจากฝั่ง User)
app.post('/api/requests', (req, res) => {
  try {
    const requests = readJson(REQUESTS_FILE);
    const newRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'pending',
      feedback: '',
      fieldFeedbacks: {},
      deliverySchedule: '',
      adminFeedback: '',
      createdAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    writeJson(REQUESTS_FILE, requests);
    
    // แจ้งเตือนผ่าน Socket
    io.emit('request_updated', requests);
    
    res.json({ success: true, message: 'ส่งคำร้องสำเร็จเรียบร้อยแล้ว', data: newRequest });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งคำร้อง' });
  }
});

// 📌 API สำหรับอัปเดตสถานะคำร้อง (รับจากฝั่ง Admin)
app.put('/api/requests/:id', (req, res) => {
  try {
    const requestId = req.params.id;
    // รับข้อมูลทั้งหมดจาก body
    const { status, feedback, fieldFeedbacks, deliverySchedule, adminFeedback, completedDoc, templateDoc, revisionFeedback } = req.body;
    
    const requests = readJson(REQUESTS_FILE);
    const target = requests.find(r => String(r.id) === String(requestId));

    if (!target) return res.status(404).json({ success: false, message: 'ไม่พบคำร้องที่ต้องการอัปเดต' });

    // อัปเดตข้อมูล
    if (status) target.status = status;
    if (feedback !== undefined) target.feedback = feedback;
    if (fieldFeedbacks) target.fieldFeedbacks = fieldFeedbacks;
    if (deliverySchedule !== undefined) target.deliverySchedule = deliverySchedule;
    if (adminFeedback !== undefined) target.adminFeedback = adminFeedback;
    if (completedDoc !== undefined) target.completedDoc = completedDoc;
    // 🌟 Admin ส่งแบบฟอร์มเปล่าให้ User กรอก
    if (templateDoc !== undefined) target.templateDoc = templateDoc;
    // 🌟 Admin แจ้งให้ User แก้ไขเอกสาร
    if (revisionFeedback !== undefined) target.revisionFeedback = revisionFeedback;

    writeJson(REQUESTS_FILE, requests);
    io.emit('request_updated', requests);

    res.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
});

// 📌 API สำหรับเปิดดูรายละเอียดคำร้องผ่าน QR Code (เปิด Tab ใหม่)
app.get('/api/requests/:id/view', (req, res) => {
  try {
    const requestId = req.params.id;
    const requests = readJson(REQUESTS_FILE);
    const target = requests.find(r => String(r.id) === String(requestId));

    if (!target) {
      return res.status(404).send(`
        <!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>ไม่พบคำร้อง</title>
        <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;}</style></head>
        <body><div style="text-align:center"><div style="font-size:3rem">❌</div><h2>ไม่พบคำร้องรหัส ${requestId}</h2></div></body></html>
      `);
    }

    const statusMap = {
      pending: '🟡 รอการตรวจสอบ',
      doc_sent: '🔵 ส่งแบบฟอร์มให้กรอกแล้ว',
      user_submitted: '🟣 รอเจ้าหน้าที่ตรวจสอบเอกสาร',
      revision_needed: '🟠 ต้องแก้ไขเอกสาร',
      scheduled: '🟢 นัดหมายส่งมอบแล้ว',
      rejected: '🔴 ปฏิเสธคำร้อง',
      completed: '✅ เสร็จสิ้น'
    };
    const statusLabel = statusMap[target.status] || target.status;
    const badgeColorMap = {
      pending: 'badge-pending', doc_sent: 'badge-doc-sent', user_submitted: 'badge-submitted',
      revision_needed: 'badge-revision', scheduled: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed'
    };
    const badgeClass = badgeColorMap[target.status] || 'badge-pending';
    const createdAtStr = target.createdAt ? new Date(target.createdAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-';

    const slipHtml = target.slipImage
      ? `<div style="margin-top:16px"><p style="font-weight:700;color:#475569;margin-bottom:8px">📎 รูปภาพแนบ / หลักฐาน</p>
         <img src="${target.slipImage}" alt="รูปแนบ" style="max-width:100%;max-height:320px;object-fit:contain;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;padding:8px"/></div>`
      : '';

    const revisionHtml = target.revisionFeedback
      ? `<div style="margin-top:16px;padding:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px">
         <p style="font-weight:700;color:#9a3412;margin-bottom:8px">⚠️ ข้อความแจ้งแก้ไขจากเจ้าหน้าที่</p>
         <p style="color:#7c2d12;font-size:14px">${target.revisionFeedback}</p></div>`
      : '';

    const isPdfTemplate = target.templateDoc && target.templateDoc.startsWith('data:application/pdf');
    const templateDocHtml = target.templateDoc
      ? `<div style="margin-top:16px;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px">
         <p style="font-weight:700;color:#1e40af;margin-bottom:12px">📋 แบบฟอร์มจากเจ้าหน้าที่</p>
         ${isPdfTemplate
           ? `<iframe src="/api/requests/${target.id}/template-doc" style="width:100%;height:500px;border-radius:10px;border:1px solid #bfdbfe;"></iframe>
              <a href="/api/requests/${target.id}/template-doc" target="_blank" style="display:inline-block;margin-top:10px;padding:8px 20px;background:#1e40af;color:white;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">📄 เปิด PDF เต็มหน้า</a>`
           : `<img src="/api/requests/${target.id}/template-doc" style="max-width:100%;border-radius:12px;border:1px solid #bfdbfe;"/>`
         }
         </div>`
      : '';

    const isPdf = target.completedDoc && target.completedDoc.startsWith('data:application/pdf');
    const completedDocHtml = target.completedDoc
      ? `<div style="margin-top:16px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px">
         <p style="font-weight:700;color:#166534;margin-bottom:12px">✅ เอกสารที่ลงนามแล้ว (อัปโหลดโดยนักศึกษา)</p>
         ${isPdf
           ? `<iframe src="/api/requests/${target.id}/completed-doc" style="width:100%;height:600px;border-radius:10px;border:1px solid #bbf7d0;" title="เอกสาร PDF"></iframe>
              <a href="/api/requests/${target.id}/completed-doc" target="_blank" style="display:inline-block;margin-top:10px;padding:8px 20px;background:#065f46;color:white;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">📄 เปิด PDF เต็มหน้า</a>`
           : `<img src="/api/requests/${target.id}/completed-doc" alt="เอกสารที่เซ็นแล้ว" style="max-width:100%;max-height:500px;object-fit:contain;border-radius:12px;border:1px solid #bbf7d0;display:block;margin:0 auto"/>`
         }
         </div>`
      : '';

    const scheduleHtml = target.deliverySchedule
      ? `<div style="margin-top:16px;padding:16px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px">
         <p style="font-weight:700;color:#065f46">📅 กำหนดนัดหมาย: ${target.deliverySchedule}</p>
         ${target.adminFeedback ? `<p style="margin-top:4px;color:#065f46">💬 หมายเหตุ: ${target.adminFeedback}</p>` : ''}</div>`
      : '';

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>คำร้อง ${target.id} — ${target.studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; min-height: 100vh; padding: 24px 16px; }
    .card { background: #fff; border-radius: 20px; max-width: 680px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-approved { background: #d1fae5; color: #065f46; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .badge-doc-sent { background: #dbeafe; color: #1e40af; }
    .badge-submitted { background: #ede9fe; color: #5b21b6; }
    .badge-revision { background: #fed7aa; color: #9a3412; }
    .badge-completed { background: #f0fdf4; color: #166534; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
    .req-id { font-family: monospace; font-size: 13px; font-weight: 700; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 8px; }
    .section { background: #f8fafc; border-radius: 14px; padding: 20px; margin-top: 20px; }
    .section h3 { font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
    .row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .label { color: #94a3b8; font-weight: 600; min-width: 140px; shrink: 0; }
    .value { color: #1e293b; font-weight: 600; }
    .title { font-size: 20px; font-weight: 800; color: #1e293b; margin: 6px 0 4px; }
    .print-btn { display: block; margin: 24px auto 0; padding: 10px 28px; background: #1e293b; color: white; border: none; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; text-align: center; }
    .print-btn:hover { background: #334155; }
    @media print { .print-btn { display: none; } body { background: white; padding: 0; } .card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <span class="req-id">${target.id}</span>
        <div class="title">${target.docType || '-'}</div>
        <span class="badge ${badgeClass}">${statusLabel}</span>
      </div>
      <div style="text-align:right;font-size:11px;color:#94a3b8">
        <div>📅 ยื่นเมื่อ</div>
        <div style="font-weight:700;color:#475569">${createdAtStr}</div>
      </div>
    </div>

    <div class="section">
      <h3>👤 ข้อมูลผู้ยื่นคำร้อง</h3>
      <div class="row"><span class="label">ชื่อ-นามสกุล</span><span class="value">${target.studentName || '-'}</span></div>
      <div class="row"><span class="label">รหัสนักศึกษา</span><span class="value">${target.studentId || '-'}</span></div>
      ${target.phone ? `<div class="row"><span class="label">เบอร์โทรศัพท์</span><span class="value">${target.phone}</span></div>` : ''}
      ${target.email ? `<div class="row"><span class="label">อีเมล</span><span class="value">${target.email}</span></div>` : ''}
    </div>

    <div class="section">
      <h3>📄 รายละเอียดคำร้อง</h3>
      ${target.yearLevel ? `<div class="row"><span class="label">ชั้นปี</span><span class="value">${target.yearLevel}</span></div>` : ''}
      ${target.gpax ? `<div class="row"><span class="label">GPAX</span><span class="value">${target.gpax}</span></div>` : ''}
      ${target.copies ? `<div class="row"><span class="label">จำนวนฉบับ</span><span class="value">${target.copies} ฉบับ</span></div>` : ''}
      ${target.purpose ? `<div class="row"><span class="label">วัตถุประสงค์</span><span class="value">${target.purpose}</span></div>` : ''}
      ${target.issueDetail ? `<div class="row"><span class="label">รายละเอียด</span><span class="value">${target.issueDetail}</span></div>` : ''}
      ${target.deliveryMethod ? `<div class="row"><span class="label">ช่องทางรับเอกสาร</span><span class="value">${target.deliveryMethod === 'self' ? '🏢 รับด้วยตนเอง' : target.deliveryMethod === 'postal' ? '📮 ไปรษณีย์ EMS' : '💻 E-Document'}</span></div>` : ''}
      ${target.address ? `<div class="row"><span class="label">ที่อยู่จัดส่ง</span><span class="value">${target.address}</span></div>` : ''}
      ${target.note ? `<div class="row"><span class="label">หมายเหตุ</span><span class="value">${target.note}</span></div>` : ''}
    </div>

    ${scheduleHtml}
    ${revisionHtml}
    ${templateDocHtml}
    ${slipHtml}
    ${completedDocHtml}

    <button class="print-btn" onclick="window.print()">🖨️ พิมพ์ / บันทึก PDF</button>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Error rendering request view:', err);
    res.status(500).send('<h2>เกิดข้อผิดพลาด</h2>');
  }
});

// 📌 API แสดงแบบฟอร์มเปล่าที่ Admin ส่งให้ User (template-doc)
app.get('/api/requests/:id/template-doc', (req, res) => {
  try {
    const requests = readJson(REQUESTS_FILE);
    const target = requests.find(r => String(r.id) === String(req.params.id));
    if (!target || !target.templateDoc) return res.status(404).send('ไม่พบแบบฟอร์ม');
    const dataUrl = target.templateDoc;
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return res.status(400).send('รูปแบบไฟล์ไม่ถูกต้อง');
    const prefix = dataUrl.substring(0, commaIdx);
    const base64Data = dataUrl.substring(commaIdx + 1);
    const mimeMatch = prefix.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const buffer = Buffer.from(base64Data, 'base64');
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('Error serving template doc:', err);
    res.status(500).send('เกิดข้อผิดพลาด');
  }
});

// 📌 API แยกสำหรับแสดงรูปเอกสารที่เซ็นแล้ว (ใช้ใน QR View Page)
app.get('/api/requests/:id/completed-doc', (req, res) => {
  try {
    const requests = readJson(REQUESTS_FILE);
    const target = requests.find(r => String(r.id) === String(req.params.id));

    if (!target || !target.completedDoc) {
      return res.status(404).send('ไม่พบเอกสาร');
    }

    const dataUrl = target.completedDoc;
    // dataUrl รูปแบบ: "data:image/jpeg;base64,/9j/4AAQ..."
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).send('รูปแบบไฟล์ไม่ถูกต้อง');
    }

    const mimeType = matches[1]; // เช่น image/jpeg, image/png, application/pdf
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('Error serving completed doc:', err);
    res.status(500).send('เกิดข้อผิดพลาด');
  }
});

app.delete('/api/requests/:id', (req, res) => {
  try {
    const requestId = req.params.id;
    let requests = readJson(REQUESTS_FILE);
    const initialLength = requests.length;
    
    requests = requests.filter(r => String(r.id) !== String(requestId));
    if (requests.length === initialLength) return res.status(404).json({ success: false, message: 'ไม่พบคำร้องที่ต้องการลบ' });

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

// --- API ROUTES สำหรับ Admin (จัดการ User & ประกาศ) ---
app.get('/api/users', (req, res) => { res.json({ success: true, data: readJson(USERS_FILE) }); });

app.post('/api/admin/users', (req, res) => {
  const { username, name, password, role } = req.body;
  if (!username || !name || !password || !role) return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });

  const users = readJson(USERS_FILE);
  if (users.find(u => String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้มีอยู่ในระบบแล้ว' });
  }

  const newUser = {
    id: users.length > 0 ? Number(users[users.length - 1].id) + 1 : 1,
    username: String(username).trim(),
    password: String(password).trim(),
    name: String(name).trim(),
    role: role === 'admin' ? 'admin' : 'user'
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'เพิ่มบัญชีผู้ใช้สำเร็จ', data: newUser });
});

app.put('/api/admin/users/:id', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อ-นามสกุลใหม่' });

  const users = readJson(USERS_FILE);
  const targetUser = users.find(u => String(u.id) === String(req.params.id));
  if (!targetUser) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้ในระบบ' });

  targetUser.name = name.trim();
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'อัปเดตชื่อเรียบร้อยแล้ว' });
});

app.delete('/api/admin/users/:id', (req, res) => {
  let users = readJson(USERS_FILE);
  const initialLength = users.length;
  users = users.filter(u => String(u.id) !== String(req.params.id));

  if (users.length === initialLength) return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' });
  writeJson(USERS_FILE, users);
  res.json({ success: true, message: 'ลบบัญชีผู้ใช้เรียบร้อยแล้ว' });
});

app.get('/api/announcements', (req, res) => {
  res.json({ success: true, data: readJson(ANNOUNCEMENTS_FILE) });
});

// --- SOCKET.IO สำหรับการแจ้งเตือนและการทำงานเบ็ดเตล็ด ---
io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);

  socket.emit('initial_requests', readJson(REQUESTS_FILE));
  socket.emit('initial_announcements', readJson(ANNOUNCEMENTS_FILE));

  // คงเหลือไว้สำหรับการทำงานที่ยังไม่ผ่าน API
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
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});