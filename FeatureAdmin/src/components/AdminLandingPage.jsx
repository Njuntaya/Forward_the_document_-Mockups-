import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import AdminHome from './dashboard/AdminHome';
import AdminAnnouncements from './dashboard/AdminAnnouncements';
import NotFound from './auth/NotFound';

const socket = io('http://localhost:5000');

export default function AdminLandingPage({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [fieldFeedbacks, setFieldFeedbacks] = useState({});
  const [rejectGeneralReason, setRejectGeneralReason] = useState('');
  
  const [deliverySchedule, setDeliverySchedule] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: 'user' });

  const navigate = useNavigate();
  const location = useLocation(); // 📌 ใช้เช็ก path ปัจจุบันแทน activeTab

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchAnnouncements();

    socket.on('initial_requests', (data) => {
      console.log('🛡️ [Admin] โหลดข้อมูลคำร้องเริ่มต้น:', data);
      setRequests(data || []);
    });

    socket.on('request_updated', (data) => {
      console.log('🔄 [Admin] มีการอัปเดตคำร้องใหม่เข้ามาผ่าน Socket:', data);
      setRequests(data || []);
    });

    socket.on('initial_announcements', (data) => setAnnouncements(data || []));
    socket.on('announcements_updated', (data) => setAnnouncements(data || []));

    return () => {
      socket.off('initial_requests');
      socket.off('request_updated');
      socket.off('initial_announcements');
      socket.off('announcements_updated');
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests');
      if (res.data && res.data.success) setRequests(res.data.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      if (res.data && res.data.success) setUsersList(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements');
      if (res.data && res.data.success) setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const handleUpdateStatus = (requestId, newStatus) => {
    if (newStatus === 'approved') {
      if (!deliverySchedule.trim()) {
        alert('กรุณาระบุวันเวลานัดหมายส่งมอบเอกสารก่อนอนุมัติ');
        return;
      }
      if (window.confirm(`คุณต้องการอนุมัติพร้อมกำหนดเวลานัดหมายใช่หรือไม่?`)) {
        socket.emit('update_status', { 
          requestId, 
          status: 'approved', 
          feedback: '', 
          fieldFeedbacks: {},
          deliverySchedule: deliverySchedule.trim(),
          adminFeedback: adminFeedback.trim()
        });
        setSelectedRequest(null);
        setFieldFeedbacks({});
        setDeliverySchedule('');
        setAdminFeedback('');
      }
    } else if (newStatus === 'rejected') {
      if (window.confirm(`ยืนยันการปฏิเสธคำร้องพร้อมส่งรายการแก้ไขให้ผู้ใช้?`)) {
        socket.emit('update_status', { 
          requestId, 
          status: 'rejected', 
          feedback: rejectGeneralReason.trim() || 'กรุณาแก้ไขข้อมูลตามจุดที่ระบุสีแดง', 
          fieldFeedbacks,
          deliverySchedule: '',
          adminFeedback: ''
        });
        setSelectedRequest(null);
        setFieldFeedbacks({});
        setRejectGeneralReason('');
      }
    }
  };

  const handleFieldFeedbackChange = (fieldKey, text) => {
    setFieldFeedbacks(prev => {
      const updated = { ...prev };
      if (!text || !text.trim()) {
        delete updated[fieldKey];
      } else {
        updated[fieldKey] = text.trim();
      }
      return updated;
    });
  };

  const handleResetAllRequests = async () => {
    if (window.confirm('⚠️ คำเตือน: คุณต้องการรีเซ็ตประวัติคำร้องทั้งหมดในระบบใช่หรือไม่?')) {
      try {
        const res = await axios.post('http://localhost:5000/api/admin/reset-requests');
        if (res.data && res.data.success) {
          alert('รีเซ็ตประวัติคำร้องทั้งหมดเรียบร้อยแล้ว');
          setRequests([]);
        }
      } catch (err) {
        alert('ไม่สามารถรีเซ็ตคำร้องได้');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/users', newUser);
      if (res.data && res.data.success) {
        alert('เพิ่มบัญชีผู้ใช้ใหม่สำเร็จ!');
        setShowAddUserModal(false);
        setNewUser({ username: '', name: '', password: '', role: 'user' });
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ไม่สามารถเพิ่มบัญชีผู้ใช้ได้');
    }
  };

  const handleEditName = async (userId, currentName) => {
    const newName = prompt(`กรอกชื่อ - นามสกุลใหม่:`, currentName);
    if (!newName || !newName.trim() || newName === currentName) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}`, { name: newName.trim() });
      if (res.data && res.data.success) {
        alert('อัปเดตชื่อผู้ใช้เรียบร้อยแล้ว');
        fetchUsers();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการแก้ไขชื่อ');
    }
  };

  const handleDeleteUser = async (userId, targetUsername) => {
    if (user && (String(userId) === String(user.id) || targetUsername === user.username)) {
      alert('ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้');
      return;
    }
    if (window.confirm(`คุณต้องการลบบัญชี ${targetUsername} ใช่หรือไม่?`)) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        if (res.data && res.data.success) {
          alert('ลบบัญชีเรียบร้อยแล้ว');
          fetchUsers();
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบบัญชี');
      }
    }
  };

  const handleResetPassword = async (targetUsername) => {
    const newPassword = prompt(`กรอกรหัสผ่านใหม่สำหรับ ${targetUsername}:`);
    if (!newPassword || !newPassword.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        studentId: targetUsername,
        newPassword: newPassword.trim()
      });
      if (res.data && res.data.success) {
        alert(`เปลี่ยนรหัสผ่านสำเร็จ`);
        fetchUsers();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm space-y-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลผู้ใช้งาน</h3>
          <button type="button" onClick={onLogout} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">กลับสู่หน้าเข้าสู่ระบบ</button>
        </div>
      </div>
    );
  }

  // 📌 ปรับการกรองข้อมูลโดยเช็กจาก Path ปัจจุบัน
  const filteredRequests = (requests || []).filter(req => {
    if (location.pathname.includes('/delivery')) {
      return req.status === 'approved';
    }
    const matchStatus = filterStatus === 'all' ? true : req.status === filterStatus;
    const matchCategory = filterCategory === 'all'
      ? true
      : filterCategory === 'building'
        ? req.category === 'building' || req.docType?.includes('ปรับปรุงอาคาร')
        : req.category !== 'building' && !req.docType?.includes('ปรับปรุงอาคาร');
    return matchStatus && matchCategory;
  });

  const filteredUsers = (usersList || []).filter(u =>
    (u.username || '').toLowerCase().includes((userSearch || '').toLowerCase()) ||
    (u.name || '').toLowerCase().includes((userSearch || '').toLowerCase())
  );

  const pendingCount = (requests || []).filter(r => r.status === 'pending').length;
  const deliveryCount = (requests || []).filter(r => r.status === 'approved').length;

  // ฟังก์ชันกำหนดสีปุ่ม
  const getNavClass = (isActive) => 
    `w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
      isActive ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-xl border border-amber-400/30">
              🛡️
            </div>
            <div>
              <h1 className="text-sm font-extrabold leading-tight text-white">ADMIN PORTAL</h1>
              <p className="text-[10px] text-amber-300/80">ระบบจัดการสำหรับเจ้าหน้าที่</p>
            </div>
          </div>

          <nav className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">เมนูหลัก</p>

            {/* 📌 เปลี่ยน Button เป็น NavLink */}
            <NavLink to="/home" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">🏠</span> หน้าหลัก (Overview)
              </div>
            </NavLink>

            <NavLink to="/requests" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">📋</span> จัดการคำร้อง
              </div>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </NavLink>

            <NavLink to="/delivery" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">📅</span> ตารางนัดหมายส่งมอบ
              </div>
              {deliveryCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{deliveryCount}</span>
              )}
            </NavLink>

            <NavLink to="/announcements" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">📢</span> จัดการประชาสัมพันธ์
              </div>
            </NavLink>

            <NavLink to="/users" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">👥</span> จัดการบัญชีผู้ใช้
              </div>
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">👤</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'เจ้าหน้าที่'}</p>
              <p className="text-[10px] text-amber-400 font-bold">ADMIN ROLE</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer">🚪 ออกจากระบบ</button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          <Route path="/home" element={
            <AdminHome user={user} requests={requests} usersList={usersList} onNavigate={(path) => navigate(path)} />
          } />

          <Route path="/announcements" element={
            <AdminAnnouncements announcements={announcements} socket={socket} user={user} />
          } />

          <Route path="/delivery" element={
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">📅 ตารางนัดหมายและกำหนดการส่งมอบเอกสาร</h2>
                <p className="text-xs text-slate-400 mt-0.5">รายการคำร้องที่ได้รับการอนุมัติและนัดหมายวันเวลาส่งมอบแล้ว</p>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-base font-bold text-slate-700">ไม่มีรายการนัดหมายส่งมอบในขณะนี้</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((req) => (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">{req.id}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">🟢 อนุมัติแล้ว / รอนำส่ง</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{req.docType}</h3>
                        <p className="text-xs text-slate-600"><strong>ผู้ยื่น:</strong> {req.studentName} (รหัส: {req.studentId})</p>
                        
                        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold space-y-1">
                          <p>📅 <strong>กำหนดนัดหมาย:</strong> {req.deliverySchedule || 'ยังไม่ได้ระบุ'}</p>
                          {req.adminFeedback && <p>💬 <strong>หมายเหตุ:</strong> {req.adminFeedback}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />

          <Route path="/requests" element={
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">📋 รายการคำร้องทั้งหมด</h2>
                  <p className="text-xs text-slate-400 mt-0.5">ตรวจสอบและอนุมัติคำร้องจากนักศึกษา</p>
                </div>
                <button type="button" onClick={handleResetAllRequests} className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer border border-red-200">🗑️ Reset คำร้องทั้งหมด</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div onClick={() => setFilterStatus('all')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'all' ? 'bg-white border-slate-800 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-slate-500 font-medium">คำร้องทั้งหมด</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{requests.length}</p>
                </div>
                <div onClick={() => setFilterStatus('pending')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'pending' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-amber-700 font-medium">🟡 รอการตรวจสอบ</p>
                  <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
                </div>
                <div onClick={() => setFilterStatus('approved')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'approved' ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-emerald-700 font-medium">🟢 อนุมัติแล้ว</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">{deliveryCount}</p>
                </div>
                <div onClick={() => setFilterStatus('rejected')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'rejected' ? 'bg-red-50 border-red-400 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-red-700 font-medium">🔴 ปฏิเสธแล้ว</p>
                  <p className="text-2xl font-extrabold text-red-600 mt-1">{requests.filter(r => r.status === 'rejected').length}</p>
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-2xl mx-auto shadow-sm">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-base font-bold text-slate-700">ไม่พบรายการคำร้อง</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((req) => (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">{req.id}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {req.status === 'pending' ? '🟡 รอตรวจสอบ' : req.status === 'approved' ? '🟢 อนุมัติแล้ว' : '🔴 ปฏิเสธ'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{req.docType}</h3>
                        <p className="text-xs text-slate-600"><strong>ผู้ยื่น:</strong> {req.studentName} (รหัส: {req.studentId})</p>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button type="button" onClick={() => { setSelectedRequest(req); setFieldFeedbacks({}); setRejectGeneralReason(''); setDeliverySchedule(''); setAdminFeedback(''); }} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">🔍 ตรวจสอบ</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />

          <Route path="/users" element={
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">👥 จัดการบัญชีผู้ใช้งานระบบ</h2>
                  <p className="text-xs text-slate-400 mt-0.5">เพิ่ม ลบ หรือแก้ไขข้อมูลบัญชีผู้ใช้งานในระบบ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                >
                  + เพิ่มบัญชีผู้ใช้ใหม่
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาด้วยรหัสนักศึกษา หรือ ชื่อ-นามสกุล..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-4">รหัสนักศึกษา / Username</th>
                        <th className="p-4">ชื่อ - นามสกุล</th>
                        <th className="p-4">สถานะ (Role)</th>
                        <th className="p-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-400">ไม่พบข้อมูลผู้ใช้งานในระบบ</td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-700">{u.username}</td>
                            <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
                                {u.role === 'admin' ? '🛡️ Admin' : '🎓 User'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditName(u.id, u.name)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                              >
                                ✏️ แก้ไขชื่อ
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResetPassword(u.username)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer"
                              >
                                🔑 เปลี่ยนรหัส
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold cursor-pointer border border-red-100"
                              >
                                🗑️ ลบ
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Modal ตรวจสอบคำร้อง (ดีไซน์ใหม่เรียบหรูและใช้งานง่าย) */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedRequest.id}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">ตรวจสอบและดำเนินการคำร้อง</h3>
              </div>
              <button type="button" onClick={() => setSelectedRequest(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-700 text-sm">👤 ข้อมูลผู้ยื่นและรายละเอียดคำร้อง</p>
                <p><strong>ชื่อ-นามสกุล:</strong> {selectedRequest.studentName} (รหัส: {selectedRequest.studentId})</p>
                <p><strong>ประเภทเอกสาร:</strong> {selectedRequest.docType}</p>
                {selectedRequest.yearLevel && <p><strong>ชั้นปี:</strong> {selectedRequest.yearLevel}</p>}
                {selectedRequest.gpax && <p><strong>GPAX:</strong> {selectedRequest.gpax}</p>}
                <p><strong>วัตถุประสงค์ / รายละเอียด:</strong> {selectedRequest.purpose || selectedRequest.issueDetail || '-'}</p>
                {selectedRequest.phone && <p><strong>เบอร์โทรศัพท์:</strong> {selectedRequest.phone}</p>}
                {selectedRequest.address && <p><strong>ที่อยู่จัดส่ง:</strong> {selectedRequest.address}</p>}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-emerald-800">📅 กำหนดวันเวลานัดหมายส่งมอบ (สำหรับการอนุมัติ)</h4>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">วันและเวลานัดหมายรับเอกสาร <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="เช่น วันที่ 15 ก.ย. 2569 เวลา 10:00 น. ณ สำนักทะเบียน"
                        value={deliverySchedule}
                        onChange={(e) => setDeliverySchedule(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ข้อความเพิ่มเติมถึงนักศึกษา (ถ้ามี)</label>
                      <input
                        type="text"
                        placeholder="เช่น กรุณานำบัตรนักศึกษามาแสดงด้วยครับ"
                        value={adminFeedback}
                        onChange={(e) => setAdminFeedback(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-red-700">⚠️ ระบุจุดที่ต้องให้ผู้ใช้แก้ไข (กรณีปฏิเสธคำร้อง)</h4>
                    <p className="text-[11px] text-slate-500">พิมพ์คำแนะนำเฉพาะช่องที่ต้องการให้ฝั่งนักศึกษาแก้ไข (ช่องไหนไม่กรอก ปล่อยว่างไว้ได้เลย)</p>
                    
                    <div className="space-y-2.5 pt-1">
                      {[
                        { key: 'yearLevel', label: 'ชั้นปี (Year Level)' },
                        { key: 'gpax', label: 'GPAX' },
                        { key: 'purpose', label: 'วัตถุประสงค์ / รายละเอียด' },
                        { key: 'phone', label: 'เบอร์โทรศัพท์' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-red-100 shadow-xs">
                          <span className="w-32 font-bold text-slate-700 shrink-0">{item.label}</span>
                          <input
                            type="text"
                            placeholder={`ระบุสิ่งที่ต้องแก้ไขในส่วน ${item.label}...`}
                            value={fieldFeedbacks[item.key] || ''}
                            onChange={(e) => handleFieldFeedbackChange(item.key, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs outline-none focus:border-red-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button type="button" onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-all">✕ ปฏิเสธคำร้อง</button>
                  <button type="button" onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all">✓ อนุมัติและบันทึกเวลานัดหมาย</button>
                </>
              ) : (
                <button type="button" onClick={() => setSelectedRequest(null)} className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">ปิดหน้าต่าง</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">➕ เพิ่มบัญชีผู้ใช้งานใหม่</h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">รหัสนักศึกษา / Username</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 660610002"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  placeholder="รหัสผ่านสำหรับเข้าสู่ระบบ"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">สถานะผู้ใช้งาน (Role)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="user">🎓 นักศึกษา (User)</option>
                  <option value="admin">🛡️ เจ้าหน้าที่ (Admin)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer">ยกเลิก</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer">บันทึกบัญชี</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}