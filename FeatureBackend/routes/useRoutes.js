import express from 'express';
const router = express.Router();

// ตัวอย่าง Endpoint Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // โค้ดตรวจสอบข้อมูลผู้ใช้
  res.json({ success: true, user: { username, role: 'user' } });
});

// ดึงรายชื่อผู้ใช้ทั้งหมด (Admin)
router.get('/users', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;