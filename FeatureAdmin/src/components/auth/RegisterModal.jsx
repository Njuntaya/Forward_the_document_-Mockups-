import { useState } from 'react';
import axios from 'axios';

export default function RegisterModal({ isOpen, onClose }) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!studentId || !name || !password || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        studentId,
        name,
        password
      });

      setLoading(false);
      if (res.data.success) {
        setSuccess(res.data.message || 'สมัครสมาชิกสำเร็จ! กำลังปิดหน้าต่าง...');
        setTimeout(() => {
          onClose();
          setStudentId('');
          setName('');
          setPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#6b3a1f]">📝 สมัครสมาชิกนักศึกษา</h3>
            <p className="text-xs text-slate-500">ลงทะเบียนบัญชีใหม่สำหรับเข้าใช้งานระบบ</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#6b3a1f] mb-1">รหัสนักศึกษา (Student ID)</label>
            <input
              type="text"
              placeholder="เช่น 660610002"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6b3a1f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6b3a1f] mb-1">ชื่อ - นามสกุล (Full Name)</label>
            <input
              type="text"
              placeholder="เช่น นายกิตติศักดิ์ ใจดี"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6b3a1f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6b3a1f] mb-1">กำหนดรหัสผ่าน (Password)</label>
            <input
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6b3a1f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6b3a1f] mb-1">ยืนยันรหัสผ่าน (Confirm Password)</label>
            <input
              type="password"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#6b3a1f]"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl font-medium border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 text-xs rounded-xl font-medium border border-emerald-200">
              ✅ {success}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#6b3a1f] text-white text-sm font-bold hover:bg-[#8b4a24] transition-colors disabled:bg-slate-300 cursor-pointer"
            >
              {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}