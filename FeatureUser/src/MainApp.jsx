import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import LoginUI from './components/auth/LoginUi'; 
import StudentDashboard from './components/dashboard/StudentDashboard';
import NotFound from './components/auth/NotFound'; // 📌 เพิ่มหน้า NotFound

export default function MainApp() {
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🛡️ ดึงข้อมูล User จาก LocalStorage ตอนโหลดหน้าเว็บ
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Error reading user from localStorage', e);
    }
    return null;
  });

  // ฟังก์ชันจัดการ Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('กรุณากรอกรหัสนักศึกษาและรหัสผ่าน');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username: username.trim(),
        password: password.trim(),
        role: 'user',
        allowedRole: 'user'
      });

      setLoading(false);
      if (res.data && res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  // ฟังก์ชันจัดการ Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* 📌 1. Route: หน้า Login */}
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/" replace /> 
            ) : (
              <LoginUI
                role={role}
                setRole={setRole}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                loading={loading}
                error={error}
                handleSubmit={handleSubmit}
              />
            )
          } 
        />

        {/* 📌 2. Route: หน้าหลัก (Dashboard) และเมนูย่อยทั้งหมด */}
        {/* ใช้ /* เพื่อให้รับ URL ย่อยอย่าง /new-request หรือ /tracking ได้ */}
        <Route 
          path="/*" 
          element={
            currentUser ? (
              <StudentDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* 📌 3. Route: หน้าต่าง 404 แจ้งเตือนเมื่อไม่พบหน้าเว็บ */}
        {/* วางไว้ล่างสุดเสมอ เพื่อดักจับ URL ที่ไม่มีในระบบ */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}