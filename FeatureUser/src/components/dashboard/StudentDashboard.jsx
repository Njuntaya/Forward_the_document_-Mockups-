import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'; // 📌 เพิ่ม Navigate
import { io } from 'socket.io-client';

// 📌 Import Components 
import StudentHome from './StudentHome';
import RequestForm from './RequestForm';
import StatusTracking from './StatusTracking';
import RequestHistory from './RequestHistory';
import NotFound from '../auth/NotFound';

const socket = io('http://localhost:5000');

export default function StudentDashboard({ user, onLogout, onBackToHome }) {
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  
  const navigate = useNavigate();

  // 🔄 ดึงข้อมูลจาก API และ Socket.io
  useEffect(() => {
    fetch('http://localhost:5000/api/requests')
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.success) setRequests(resData.data || []);
      })
      .catch(err => console.error('Error fetching requests:', err));

    fetch('http://localhost:5000/api/announcements')
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.success) setAnnouncements(resData.data || []);
      })
      .catch(err => console.error('Error fetching announcements:', err));

    socket.on('initial_requests', (data) => setRequests(data || []));
    socket.on('request_updated', (data) => setRequests(data || []));
    socket.on('initial_announcements', (data) => setAnnouncements(data || []));
    socket.on('announcements_updated', (data) => setAnnouncements(data || []));

    return () => {
      socket.off('initial_requests');
      socket.off('request_updated');
      socket.off('initial_announcements');
      socket.off('announcements_updated');
    };
  }, []);

  // 🛑 กรณีไม่มีข้อมูล User ให้แสดงหน้าแจ้งเตือนให้เข้าสู่ระบบใหม่
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm space-y-4">
          <div className="text-4xl">🎓</div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลการเข้าสู่ระบบ</h3>
          <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อเข้าใช้งาน</p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-[#6b3a1f] text-white font-bold text-xs hover:bg-[#522b16] transition-all cursor-pointer"
          >
            กลับสู่หน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  // 🔍 กรองข้อมูลคำร้องให้แสดงเฉพาะของนักศึกษาที่ล็อกอิน
  const currentStudentId = String(user?.username || '').trim().toLowerCase();
  const currentStudentName = String(user?.name || '').trim().toLowerCase();
  
  const myRequests = (requests || []).filter(r => {
    const reqSid = String(r.studentId || '').trim().toLowerCase();
    const reqSname = String(r.studentName || '').trim().toLowerCase();
    return reqSid === currentStudentId || (currentStudentName && reqSname.includes(currentStudentName));
  });
  
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const completedRequests = myRequests.filter(r => r.status !== 'pending');

  // 🎨 ฟังก์ชันกำหนดสไตล์ให้ NavLink เปลี่ยนสีเมื่อ URL ตรงกับเมนู
  const navLinkStyle = ({ isActive }) => 
    `px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 ${
      isActive ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      
      {/* 🟢 Header & Navbar */}
      <header className="bg-gradient-to-r from-[#3b1f0e] to-[#6b3a1f] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 🎓 โลโก้ */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-sm border border-white/20">
                🎓
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">ระบบยื่นคำร้องขอเอกสาร</h1>
                <p className="text-[10px] text-amber-200/80">RMUTT Academic Document Request</p>
              </div>
            </div>

            {/* 🧭 เมนูนำทาง (ใช้ NavLink เพื่อจัดการ Route) */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavLink to="/home" className={navLinkStyle} onClick={() => setEditingRequest(null)}>
                <span>🏠</span> หน้าแรก
              </NavLink>

              <NavLink to="/new-request" className={navLinkStyle} onClick={() => setEditingRequest(null)}>
                <span>📝</span> ยื่นคำร้องใหม่
              </NavLink>

              <NavLink to="/tracking" className={navLinkStyle} onClick={() => setEditingRequest(null)}>
                <span>📬</span> ติดตามสถานะ
                {pendingRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                    {pendingRequests.length}
                  </span>
                )}
              </NavLink>

              <NavLink to="/history" className={navLinkStyle} onClick={() => setEditingRequest(null)}>
                <span>📜</span> ประวัติคำร้อง
              </NavLink>
            </nav>

            {/* 👤 ข้อมูลผู้ใช้และปุ่มออก */}
            <div className="flex items-center gap-2 border-l border-white/15 pl-3">
              <div className="text-right hidden xl:block mr-1">
                <p className="text-xs font-bold text-amber-100">{user?.name}</p>
                <p className="text-[11px] text-white/60">รหัส: {user?.username}</p>
              </div>

              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer border border-white/10 flex items-center gap-1"
                >
                  <span>🏠</span> <span className="hidden sm:inline">หน้าหลักระบบ</span>
                </button>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white/90 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/10 flex items-center gap-1"
              >
                <span>🚪</span> <span className="hidden sm:inline">ออก</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 🟡 พื้นที่แสดงเนื้อหาหลัก โดยจะเปลี่ยนเนื้อหาตาม URL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          {/* 📌 เมื่อเข้า URL ว่างๆ (/) ให้เด้งไปที่ /home อัตโนมัติ */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={
            <StudentHome 
              user={user} 
              announcements={announcements} 
              onNavigate={(path) => navigate(path)} 
            />
          } />
          
          <Route path="/new-request" element={
            <RequestForm 
              user={user} 
              socket={socket} 
              editData={editingRequest}
              onSuccess={() => {
                setEditingRequest(null);
                navigate('/tracking'); // ยื่นเสร็จแล้วพาไปหน้าติดตามสถานะ
              }} 
            />
          } />

          <Route path="/tracking" element={
            <StatusTracking requests={pendingRequests} socket={socket} />
          } />
          
          <Route path="/history" element={
            <RequestHistory 
              requests={completedRequests} 
              onEditAndResubmit={(reqToEdit) => {
                setEditingRequest(reqToEdit);
                navigate('/new-request'); // ส่งข้อมูลกลับไปแก้ไขที่หน้าฟอร์ม
              }} 
            />
          } />

          {/* 📌 หน้า 404 สำหรับจัดการ URL ย่อยที่ไม่มีในระบบ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* 🔵 Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © 2567 สำนักส่งเสริมวิชาการและงานทะเบียน · มหาวิทยาลัยเทคโนโลยีราชมงคล
      </footer>
    </div>
  );
}