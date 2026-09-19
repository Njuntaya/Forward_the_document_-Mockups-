import { useState } from 'react';
import axios from 'axios';
import LoginUI from './components/auth/LoginUi'; // หรือตำแหน่ง LoginUI ของคุณ
import AdminLandingPage from './components/AdminLandingPage';

export default function MainApp() {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('admin_user');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username: username.trim(),
        password: password.trim(),
        role: 'admin',
        allowedRole: 'admin'
      });

      setLoading(false);
      if (res.data.success) {
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
        setCurrentAdmin(res.data.user);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านเจ้าหน้าที่ไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setCurrentAdmin(null);
  };

  if (currentAdmin) {
    return <AdminLandingPage user={currentAdmin} onLogout={handleLogout} />;
  }

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