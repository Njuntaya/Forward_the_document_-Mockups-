import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
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
  const [templateDoc, setTemplateDoc] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [deliverySchedule, setDeliverySchedule] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: 'user' });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchAnnouncements();

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

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests');
      if (res.data && res.data.success) setRequests(res.data.data || []);
    } catch (err) { console.error('Error fetching requests:', err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      if (res.data && res.data.success) setUsersList(res.data.data || []);
    } catch (err) { console.error('Error fetching users:', err); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements');
      if (res.data && res.data.success) setAnnouncements(res.data.data || []);
    } catch (err) { console.error('Error fetching announcements:', err); }
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setTemplateDoc('');
    setRevisionFeedback('');
    setDeliverySchedule('');
    setScheduleDate('');
    setScheduleTime('');
    setAdminFeedback('');
    setFieldFeedbacks({});
    setRejectGeneralReason('');
  };

  // ── Admin อนุมัติคำร้องเริ่มต้น + แนบแบบฟอร์มให้ User กรอก ──
  const handleApproveWithDoc = async (requestId) => {
    if (!templateDoc) { alert('กรุณาแนบไฟล์แบบฟอร์มก่อนอนุมัติ'); return; }
    if (!window.confirm('ยืนยันการอนุมัติและส่งแบบฟอร์มให้นักศึกษา?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/requests/${requestId}`, {
        status: 'doc_sent', templateDoc, feedback: '', fieldFeedbacks: {}, deliverySchedule: '', adminFeedback: ''
      });
      if (res.data.success) { alert('✅ อนุมัติและส่งแบบฟอร์มให้นักศึกษาแล้ว'); closeModal(); }
    } catch { alert('เกิดข้อผิดพลาด'); }
  };

  // ── Admin ปฏิเสธคำร้องเริ่มต้น ──
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('ยืนยันการปฏิเสธคำร้องนี้?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/requests/${requestId}`, {
        status: 'rejected',
        feedback: rejectGeneralReason.trim() || 'กรุณาตรวจสอบข้อมูลที่กรอก',
        fieldFeedbacks,
        deliverySchedule: '', adminFeedback: ''
      });
      if (res.data.success) { alert('ส่งคำร้องกลับเรียบร้อยแล้ว'); closeModal(); }
    } catch { alert('เกิดข้อผิดพลาด'); }
  };

  // ── Admin อนุมัติเอกสารที่ User ส่งกลับมา + กำหนดวันนัดหมาย ──
  const handleApproveSchedule = async (requestId) => {
    if (!scheduleDate) { alert('กรุณาเลือกวันที่นัดหมาย'); return; }
    if (!scheduleTime) { alert('กรุณาระบุเวลานัดหมาย'); return; }
    // validate เวลา HH:MM
    if (!/^\d{2}:\d{2}$/.test(scheduleTime)) { alert('รูปแบบเวลาไม่ถูกต้อง (HH:MM)'); return; }
    const [hh, mm] = scheduleTime.split(':').map(Number);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) { alert('เวลาไม่ถูกต้อง'); return; }

    // แปลงวันที่เป็น Thai format
    const dateObj = new Date(scheduleDate + 'T' + scheduleTime);
    const thaiDate = dateObj.toLocaleDateString('th-TH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok'
    });
    const thaiTime = dateObj.toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok'
    });
    const formattedSchedule = `${thaiDate} เวลา ${thaiTime} น.`;

    if (!window.confirm(`ยืนยันการอนุมัติและนัดหมาย?\n📅 ${formattedSchedule}`)) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/requests/${requestId}`, {
        status: 'scheduled', deliverySchedule: formattedSchedule, adminFeedback: adminFeedback.trim()
      });
      if (res.data.success) { alert('📅 อนุมัติและบันทึกวันนัดหมายเรียบร้อยแล้ว'); closeModal(); }
    } catch { alert('เกิดข้อผิดพลาด'); }
  };

  // ── Admin ส่งกลับให้แก้ไขเอกสาร ──
  const handleRejectDoc = async (requestId) => {
    if (!revisionFeedback.trim()) { alert('กรุณาระบุสิ่งที่ต้องการให้แก้ไข'); return; }
    if (!window.confirm('ยืนยันการส่งกลับให้นักศึกษาแก้ไขเอกสาร?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/requests/${requestId}`, {
        status: 'revision_needed', revisionFeedback: revisionFeedback.trim()
      });
      if (res.data.success) { alert('ส่งกลับให้แก้ไขเรียบร้อยแล้ว'); closeModal(); }
    } catch { alert('เกิดข้อผิดพลาด'); }
  };

  const handleTemplateDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTemplateDoc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFieldFeedbackChange = (fieldKey, text) => {
    setFieldFeedbacks(prev => {
      const updated = { ...prev };
      if (!text || !text.trim()) { delete updated[fieldKey]; } else { updated[fieldKey] = text.trim(); }
      return updated;
    });
  };

  const handleResetAllRequests = async () => {
    if (window.confirm('⚠️ คุณต้องการรีเซ็ตประวัติคำร้องทั้งหมดในระบบใช่หรือไม่?')) {
      try {
        const res = await axios.post('http://localhost:5000/api/admin/reset-requests');
        if (res.data && res.data.success) { alert('รีเซ็ตประวัติคำร้องทั้งหมดเรียบร้อยแล้ว'); setRequests([]); }
      } catch { alert('ไม่สามารถรีเซ็ตคำร้องได้'); }
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
    } catch (err) { alert(err.response?.data?.message || 'ไม่สามารถเพิ่มบัญชีผู้ใช้ได้'); }
  };

  const handleEditName = async (userId, currentName) => {
    const newName = prompt('กรอกชื่อ - นามสกุลใหม่:', currentName);
    if (!newName || !newName.trim() || newName === currentName) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}`, { name: newName.trim() });
      if (res.data && res.data.success) { alert('อัปเดตชื่อผู้ใช้เรียบร้อยแล้ว'); fetchUsers(); }
    } catch { alert('เกิดข้อผิดพลาดในการแก้ไขชื่อ'); }
  };

  const handleDeleteUser = async (userId, targetUsername) => {
    if (user && (String(userId) === String(user.id) || targetUsername === user.username)) {
      alert('ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้'); return;
    }
    if (window.confirm(`คุณต้องการลบบัญชี ${targetUsername} ใช่หรือไม่?`)) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        if (res.data && res.data.success) { alert('ลบบัญชีเรียบร้อยแล้ว'); fetchUsers(); }
      } catch { alert('เกิดข้อผิดพลาดในการลบบัญชี'); }
    }
  };

  const handleResetPassword = async (targetUsername) => {
    const newPassword = prompt(`กรอกรหัสผ่านใหม่สำหรับ ${targetUsername}:`);
    if (!newPassword || !newPassword.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', { studentId: targetUsername, newPassword: newPassword.trim() });
      if (res.data && res.data.success) { alert('เปลี่ยนรหัสผ่านสำเร็จ'); fetchUsers(); }
    } catch { alert('เกิดข้อผิดพลาด'); }
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

  // ── ตัวช่วยสถานะ ──
  const statusLabels = {
    pending: '🟡 รอตรวจสอบ', doc_sent: '🔵 ส่งแบบฟอร์มแล้ว',
    user_submitted: '🟣 รอตรวจเอกสาร', revision_needed: '🟠 ต้องแก้ไข',
    scheduled: '🟢 นัดหมายแล้ว', rejected: '🔴 ปฏิเสธ', completed: '✅ เสร็จสิ้น'
  };
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700', doc_sent: 'bg-blue-100 text-blue-700',
    user_submitted: 'bg-purple-100 text-purple-700', revision_needed: 'bg-orange-100 text-orange-700',
    scheduled: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', completed: 'bg-slate-100 text-slate-700'
  };

  const pendingCount = (requests || []).filter(r => r.status === 'pending').length;
  const inProgressCount = (requests || []).filter(r => ['doc_sent','user_submitted','revision_needed'].includes(r.status)).length;
  const scheduledCount = (requests || []).filter(r => r.status === 'scheduled').length;

  const filteredRequests = (requests || []).filter(req => {
    if (location.pathname.includes('/delivery')) return req.status === 'scheduled';
    const matchStatus = filterStatus === 'all' ? true
      : filterStatus === 'in_progress' ? ['doc_sent','user_submitted','revision_needed'].includes(req.status)
      : req.status === filterStatus;
    const matchCategory = filterCategory === 'all' ? true
      : filterCategory === 'building'
        ? req.category === 'building' || req.docType?.includes('ปรับปรุงอาคาร')
        : req.category !== 'building' && !req.docType?.includes('ปรับปรุงอาคาร');
    return matchStatus && matchCategory;
  });

  const filteredUsers = (usersList || []).filter(u =>
    (u.username || '').toLowerCase().includes((userSearch || '').toLowerCase()) ||
    (u.name || '').toLowerCase().includes((userSearch || '').toLowerCase())
  );

  const getNavClass = (isActive) =>
    `w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
      isActive ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">

      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-xl border border-amber-400/30">🛡️</div>
            <div>
              <h1 className="text-sm font-extrabold leading-tight text-white">ADMIN PORTAL</h1>
              <p className="text-[10px] text-amber-300/80">ระบบจัดการสำหรับเจ้าหน้าที่</p>
            </div>
          </div>

          <nav className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">เมนูหลัก</p>

            <NavLink to="/home" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5"><span className="text-base">🏠</span> หน้าหลัก (Overview)</div>
            </NavLink>

            <NavLink to="/requests" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5"><span className="text-base">📋</span> จัดการคำร้อง</div>
              {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
            </NavLink>

            <NavLink to="/delivery" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5"><span className="text-base">📅</span> ตารางนัดหมายส่งมอบ</div>
              {scheduledCount > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{scheduledCount}</span>}
            </NavLink>

            <NavLink to="/announcements" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5"><span className="text-base">📢</span> จัดการประชาสัมพันธ์</div>
            </NavLink>

            <NavLink to="/users" className={({ isActive }) => getNavClass(isActive)}>
              <div className="flex items-center gap-2.5"><span className="text-base">👥</span> จัดการบัญชีผู้ใช้</div>
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

          <Route path="/home/requests" element={<Navigate to="/requests" replace />} />

          <Route path="/announcements" element={
            <AdminAnnouncements announcements={announcements} socket={socket} user={user} />
          } />

          {/* ── ตารางนัดหมายส่งมอบ ── */}
          <Route path="/delivery" element={
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">📅 ตารางนัดหมายและกำหนดการส่งมอบเอกสาร</h2>
                <p className="text-xs text-slate-400 mt-0.5">รายการที่อนุมัติและกำหนดวันนัดหมายแล้ว</p>
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
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">🟢 นัดหมายส่งมอบแล้ว</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{req.docType}</h3>
                        <p className="text-xs text-slate-600"><strong>ผู้ยื่น:</strong> {req.studentName} (รหัส: {req.studentId})</p>
                        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold space-y-1">
                          <p>📅 <strong>กำหนดนัดหมาย:</strong> {req.deliverySchedule}</p>
                          {req.adminFeedback && <p>💬 <strong>หมายเหตุ:</strong> {req.adminFeedback}</p>}
                        </div>
                      </div>
                      <button type="button" onClick={() => { setSelectedRequest(req); setDeliverySchedule(''); setAdminFeedback(''); }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">🔍 ดูรายละเอียด</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />

          {/* ── จัดการคำร้อง ── */}
          <Route path="/requests" element={
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">📋 รายการคำร้องทั้งหมด</h2>
                  <p className="text-xs text-slate-400 mt-0.5">ตรวจสอบ อนุมัติ และสแกน QR Code เพื่อเปิดดูเอกสารคำร้อง</p>
                </div>
                <button type="button" onClick={handleResetAllRequests} className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer border border-red-200">🗑️ Reset ทั้งหมด</button>
              </div>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div onClick={() => setFilterStatus('pending')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'pending' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-amber-700 font-medium">🟡 รอตรวจสอบ</p>
                  <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
                </div>
                <div onClick={() => setFilterStatus('in_progress')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'in_progress' ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-blue-700 font-medium">🔵 กำลังดำเนินการ</p>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1">{inProgressCount}</p>
                </div>
                <div onClick={() => setFilterStatus('scheduled')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'scheduled' ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-emerald-700 font-medium">🟢 นัดหมายแล้ว</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">{scheduledCount}</p>
                </div>
                <div onClick={() => setFilterStatus('all')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'all' ? 'bg-white border-slate-800 shadow-md' : 'bg-white/60 border-slate-200'}`}>
                  <p className="text-xs text-slate-500 font-medium">📁 ทั้งหมด</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{requests.length}</p>
                </div>
              </div>

              {/* ── Request List ── */}
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-2xl mx-auto shadow-sm">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-base font-bold text-slate-700">ไม่พบรายการคำร้อง</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((req) => {
                    const qrUrl = `http://localhost:5000/api/requests/${req.id}/view`;
                    return (
                      <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">{req.id}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                              {statusLabels[req.status] || req.status}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-800">{req.docType}</h3>
                          <p className="text-xs text-slate-600"><strong>ผู้ยื่น:</strong> {req.studentName} (รหัส: {req.studentId})</p>
                          <p className="text-[11px] text-slate-400">{req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0">
                          <QRCodeSVG value={qrUrl} size={80} bgColor="#ffffff" fgColor="#1e293b" level="M" />
                          <span className="text-[9px] font-bold text-slate-500 text-center">📷 สแกนเพื่อดู</span>
                          <a href={qrUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-blue-600 underline hover:text-blue-800">เปิดลิงก์</a>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          <button type="button" onClick={() => { setSelectedRequest(req); setFieldFeedbacks({}); setRejectGeneralReason(''); setTemplateDoc(''); setRevisionFeedback(''); setDeliverySchedule(''); setAdminFeedback(''); }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">🔍 ตรวจสอบ</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          } />

          {/* ── จัดการบัญชีผู้ใช้ ── */}
          <Route path="/users" element={
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">👥 จัดการบัญชีผู้ใช้งานระบบ</h2>
                  <p className="text-xs text-slate-400 mt-0.5">เพิ่ม ลบ หรือแก้ไขข้อมูลบัญชีผู้ใช้งานในระบบ</p>
                </div>
                <button type="button" onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-sm transition-all cursor-pointer">
                  + เพิ่มบัญชีผู้ใช้ใหม่
                </button>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <input type="text" placeholder="🔍 ค้นหาด้วยรหัสนักศึกษา หรือ ชื่อ-นามสกุล..."
                  value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500" />
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
                        <tr><td colSpan="4" className="p-8 text-center text-slate-400">ไม่พบข้อมูลผู้ใช้งานในระบบ</td></tr>
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
                              <button type="button" onClick={() => handleEditName(u.id, u.name)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer">✏️ แก้ไขชื่อ</button>
                              <button type="button" onClick={() => handleResetPassword(u.username)} className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer">🔑 เปลี่ยนรหัส</button>
                              <button type="button" onClick={() => handleDeleteUser(u.id, u.username)} className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold cursor-pointer border border-red-100">🗑️ ลบ</button>
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

      {/* ── Modal ตรวจสอบคำร้อง ── */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedRequest.id}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">ตรวจสอบและดำเนินการคำร้อง</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColors[selectedRequest.status] || 'bg-slate-100 text-slate-600'}`}>
                  {statusLabels[selectedRequest.status] || selectedRequest.status}
                </span>
              </div>
              <button type="button" onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              {/* ข้อมูลพื้นฐาน */}
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

              {/* ── PENDING: อนุมัติ + แนบฟอร์ม หรือ ปฏิเสธ ── */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-amber-800">📋 อนุมัติ + ส่งแบบฟอร์มให้นักศึกษากรอก</h4>
                    <p className="text-[11px] text-amber-700">แนบไฟล์แบบฟอร์มเอกสาร (PDF หรือรูปภาพ) ที่ต้องการให้นักศึกษาดาวน์โหลดไปกรอกและส่งกลับมา</p>
                    <input type="file" accept=".pdf,image/*" onChange={handleTemplateDocChange}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer bg-white border border-amber-200 rounded-xl px-3 py-2" />
                    {templateDoc && <p className="text-[11px] text-emerald-700 font-bold">✅ ไฟล์พร้อมส่งแล้ว</p>}
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-red-700">⚠️ หรือระบุจุดที่ต้องให้ผู้ใช้แก้ไข (กรณีตีกลับ)</h4>
                    <div className="space-y-2">
                      {[{key:'yearLevel',label:'ชั้นปี'},{key:'gpax',label:'GPAX'},{key:'purpose',label:'วัตถุประสงค์'},{key:'phone',label:'เบอร์โทรศัพท์'}].map(item => (
                        <div key={item.key} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-red-100">
                          <span className="w-28 font-bold text-slate-700 shrink-0">{item.label}</span>
                          <input type="text" placeholder="ระบุสิ่งที่ต้องแก้ไข..."
                            value={fieldFeedbacks[item.key] || ''} onChange={e => handleFieldFeedbackChange(item.key, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs outline-none focus:border-red-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DOC_SENT: รอ User ─── */}
              {selectedRequest.status === 'doc_sent' && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <h4 className="text-xs font-extrabold text-blue-800 mb-1">🔵 ส่งแบบฟอร์มให้นักศึกษาแล้ว</h4>
                  <p className="text-[11px] text-blue-700">กำลังรอนักศึกษาดาวน์โหลด กรอกข้อมูล และส่งเอกสารกลับมา</p>
                  <a href={`http://localhost:5000/api/requests/${selectedRequest.id}/template-doc`} target="_blank" rel="noreferrer"
                    className="inline-block mt-2 px-3 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded-lg">📄 ดูแบบฟอร์มที่ส่งไป</a>
                </div>
              )}

              {/* ── USER_SUBMITTED: ตรวจเอกสาร ── */}
              {selectedRequest.status === 'user_submitted' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-purple-800">🟣 นักศึกษาส่งเอกสารกลับมาแล้ว — กรุณาตรวจสอบ</h4>
                    {selectedRequest.completedDoc && (
                      <div className="space-y-2">
                        {(selectedRequest.completedDoc.startsWith('data:application/'))
                          ? <iframe src={`http://localhost:5000/api/requests/${selectedRequest.id}/completed-doc`} className="w-full h-64 rounded-xl border border-purple-200" title="เอกสาร" />
                          : <img src={`http://localhost:5000/api/requests/${selectedRequest.id}/completed-doc`} alt="เอกสาร" className="w-full max-h-64 object-contain rounded-xl border border-purple-200" />
                        }
                        <a href={`http://localhost:5000/api/requests/${selectedRequest.id}/completed-doc`} target="_blank" rel="noreferrer"
                          className="inline-block px-3 py-1.5 bg-purple-700 text-white text-[11px] font-bold rounded-lg">📄 เปิดเต็มหน้า</a>
                      </div>
                    )}
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                    <h4 className="text-xs font-extrabold text-emerald-800">📅 กำหนดวันนัดหมาย (กรณีอนุมัติ)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 mb-1">วันที่ *</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={scheduleDate}
                          onChange={e => setScheduleDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 mb-1">เวลา (HH:MM) *</label>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                        />
                      </div>
                    </div>
                    {scheduleDate && scheduleTime && (
                      <p className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-xl">
                        📅 {new Date(scheduleDate + 'T' + scheduleTime).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} เวลา {scheduleTime} น.
                      </p>
                    )}
                    <input
                      type="text"
                      placeholder="ข้อความเพิ่มเติมถึงนักศึกษา เช่น สถานที่รับเอกสาร (ถ้ามี)"
                      value={adminFeedback}
                      onChange={e => setAdminFeedback(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-2">
                    <h4 className="text-xs font-extrabold text-red-700">⚠️ ส่งกลับแก้ไข (กรณีปฏิเสธ)</h4>
                    <textarea rows="3" placeholder="ระบุสิ่งที่ต้องการให้แก้ไขในเอกสาร..."
                      value={revisionFeedback} onChange={e => setRevisionFeedback(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-xs font-semibold outline-none resize-none" />
                  </div>
                </div>
              )}

              {/* ── REVISION_NEEDED: รอ User แก้ ── */}
              {selectedRequest.status === 'revision_needed' && (
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-orange-800">🟠 ส่งกลับให้แก้ไขแล้ว</h4>
                  <p className="text-[11px] text-orange-700">กำลังรอนักศึกษาแก้ไขเอกสารและส่งกลับมาใหม่</p>
                  {selectedRequest.revisionFeedback && (
                    <p className="text-xs font-semibold text-orange-900 bg-orange-100 p-2 rounded-lg">📝 ข้อความที่ส่งไป: {selectedRequest.revisionFeedback}</p>
                  )}
                </div>
              )}

              {/* ── SCHEDULED: นัดหมายแล้ว ── */}
              {selectedRequest.status === 'scheduled' && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <h4 className="text-xs font-extrabold text-emerald-800">🟢 นัดหมายส่งมอบเอกสารแล้ว</h4>
                  <p className="text-xs text-emerald-700"><strong>วันเวลา:</strong> {selectedRequest.deliverySchedule}</p>
                  {selectedRequest.adminFeedback && <p className="text-xs text-emerald-700"><strong>หมายเหตุ:</strong> {selectedRequest.adminFeedback}</p>}
                </div>
              )}
            </div>

            {/* ── ปุ่มด้านล่าง Modal ── */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 flex-wrap">
              <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">ปิด</button>

              {selectedRequest.status === 'pending' && (
                <>
                  <button type="button" onClick={() => handleRejectRequest(selectedRequest.id)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer">✕ ปฏิเสธคำร้อง</button>
                  <button type="button" onClick={() => handleApproveWithDoc(selectedRequest.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">✓ อนุมัติ + ส่งแบบฟอร์ม</button>
                </>
              )}

              {selectedRequest.status === 'user_submitted' && (
                <>
                  <button type="button" onClick={() => handleRejectDoc(selectedRequest.id)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer">↩ ส่งกลับแก้ไข</button>
                  <button type="button" onClick={() => handleApproveSchedule(selectedRequest.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">📅 อนุมัติ + นัดหมาย</button>
                </>
              )}

              {selectedRequest.status === 'scheduled' && (
                <button type="button" onClick={async () => {
                  if (window.confirm('ยืนยันการส่งมอบเอกสารตัวจริงและปิดคำร้องนี้?')) {
                    try {
                      const res = await axios.put(`http://localhost:5000/api/requests/${selectedRequest.id}`, { status: 'completed' });
                      if (res.data.success) { alert('🎉 ส่งมอบเอกสารเสร็จสมบูรณ์!'); closeModal(); }
                    } catch { alert('เกิดข้อผิดพลาด'); }
                  }
                }} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs cursor-pointer flex items-center gap-2">
                  🎉 ยืนยันการส่งมอบเอกสาร (Completed)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal เพิ่มผู้ใช้ ── */}
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
                <input type="text" required placeholder="เช่น 660610002" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ชื่อ - นามสกุล</label>
                <input type="text" required placeholder="เช่น นายสมชาย ใจดี" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">รหัสผ่าน</label>
                <input type="password" required placeholder="รหัสผ่านสำหรับเข้าสู่ระบบ" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">สิทธิ์การใช้งาน</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="user">🎓 นักศึกษา (User)</option>
                  <option value="admin">🛡️ เจ้าหน้าที่ (Admin)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">ยกเลิก</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer">+ เพิ่มบัญชี</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}