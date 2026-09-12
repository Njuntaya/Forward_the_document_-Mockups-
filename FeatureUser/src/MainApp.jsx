import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginUI from './components/auth/LoginUi'; // ปรับตาม path ของคอมโพเนนต์ Login ของคุณ
import StudentDashboard from './components/dashboard/StudentDashboard';

export default function MainApp() {
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🛡️ Safe LocalStorage การันตีไม่ให้เกิดจอขาวเวลาเรนเดอร์ครั้งแรก
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // ถ้ามีข้อมูล User อยู่แล้ว ให้พาเข้า Dashboard ทันที
  if (currentUser) {
    return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // ถ้ายังไม่ล็อกอิน ให้แสดงหน้า Login ปกติ
  return (
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
  );
}