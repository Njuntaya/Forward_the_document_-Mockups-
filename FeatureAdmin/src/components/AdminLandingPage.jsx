import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import AdminHome from './dashboard/AdminHome';
import AdminAnnouncements from './dashboard/AdminAnnouncements';

const socket = io('http://localhost:5000');

export default function AdminLandingPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'requests' | 'users' | 'announcements'

  // States
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: 'user' });

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchAnnouncements();

    socket.on('initial_requests', (data) => setRequests(data || []));
    socket.on('request_updated', (data) => setRequests(data || []));
    socket.on('initial_announcements', (data) => setAnnouncements(data || []));
    socket.on('announcement_updated', (data) => setAnnouncements(data || []));

    return () => {
      socket.off('initial_requests');
      socket.off('request_updated');
      socket.off('initial_announcements');
      socket.off('announcement_updated');
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

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
    const actionText = newStatus === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
    if (window.confirm(`คุณต้องการ ${actionText} คำร้องหมายเลข ${requestId} ใช่หรือไม่?`)) {
      socket.emit('update_status', { requestId, status: newStatus });
      setSelectedRequest(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name || !newUser.password) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

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
      alert('เกิดข้อผิดพลาดในการแก้ไขชื่อผู้ใช้');
    }
  };

  const handleDeleteUser = async (userId, targetUsername) => {
    if (user && (String(userId) === String(user.id) || targetUsername === user.username)) {
      alert('ไม่สามารถลบบัญชีผู้ใช้ที่กำลังเข้าใช้งานอยู่ได้');
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
    const newPassword = prompt(`กรอกรหัสผ่านใหม่สำหรับบัญชี ${targetUsername}:`);
    if (!newPassword || !newPassword.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        studentId: targetUsername,
        newPassword: newPassword.trim()
      });
      if (res.data && res.data.success) {
        alert(`เปลี่ยนรหัสผ่านสำหรับ ${targetUsername} สำเร็จแล้ว`);
        fetchUsers();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    }
  };

  // 🛡️ ป้องกันจอขาวกรณี user เป็น null ตอน F5
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm space-y-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลผู้ใช้งาน</h3>
          <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อเริ่มใช้งาน</p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            กลับสู่หน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  const filteredRequests = (requests || []).filter(req => {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation ด้านซ้าย */}
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

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">🏠</span>
              <span>หน้าหลัก (Overview)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📋</span>
                <span>จัดการคำร้อง</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">📢</span>
              <span>จัดการประชาสัมพันธ์</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">👥</span>
              <span>จัดการบัญชีผู้ใช้</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
              👤
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'เจ้าหน้าที่'}</p>
              <p className="text-[10px] text-amber-400 font-bold">ADMIN ROLE</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold border border-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {activeTab === 'home' && (
          <AdminHome
            user={user}
            requests={requests}
            usersList={usersList}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'announcements' && (
          <AdminAnnouncements announcements={announcements} socket={socket} user={user} />
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">📋 รายการคำร้องทั้งหมด</h2>
              <p className="text-xs text-slate-400 mt-0.5">ตรวจสอบและอนุมัติคำร้องจากนักศึกษาแบบเรียลไทม์</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div onClick={() => setFilterStatus('all')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'all' ? 'bg-white border-slate-800 shadow-md ring-2 ring-slate-400/20' : 'bg-white/60 border-slate-200 hover:bg-white'}`}>
                <p className="text-xs text-slate-500 font-medium">คำร้องทั้งหมด</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{requests.length}</p>
              </div>
              <div onClick={() => setFilterStatus('pending')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'pending' ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/20' : 'bg-white/60 border-slate-200 hover:bg-white'}`}>
                <p className="text-xs text-amber-700 font-medium">🟡 รอการตรวจสอบ</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
              </div>
              <div onClick={() => setFilterStatus('approved')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'approved' ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-400/20' : 'bg-white/60 border-slate-200 hover:bg-white'}`}>
                <p className="text-xs text-emerald-700 font-medium">🟢 อนุมัติแล้ว</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{requests.filter(r => r.status === 'approved').length}</p>
              </div>
              <div onClick={() => setFilterStatus('rejected')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'rejected' ? 'bg-red-50 border-red-400 shadow-md ring-2 ring-red-400/20' : 'bg-white/60 border-slate-200 hover:bg-white'}`}>
                <p className="text-xs text-red-700 font-medium">🔴 ปฏิเสธแล้ว</p>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{requests.filter(r => r.status === 'rejected').length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 flex-shrink-0">หมวดหมู่:</span>
                <button type="button" onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${filterCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>ทั้งหมด</button>
                <button type="button" onClick={() => setFilterCategory('doc')} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${filterCategory === 'doc' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📄 เอกสารการศึกษา</button>
                <button type="button" onClick={() => setFilterCategory('building')} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${filterCategory === 'building' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🛠️ ปรับปรุงอาคาร</button>
              </div>
              <p className="text-xs text-slate-400 font-medium">แสดง {filteredRequests.length} รายการ</p>
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
                        <span className="text-xs text-slate-400">{req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">{req.docType}</h3>
                      <div className="text-xs text-slate-600">
                        <p><span className="font-semibold text-slate-500">ผู้ยื่น:</span> {req.studentName} (รหัส: {req.studentId})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button type="button" onClick={() => setSelectedRequest(req)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">🔍 ดูรายละเอียด</button>
                      {req.status === 'pending' && (
                        <>
                          <button type="button" onClick={() => handleUpdateStatus(req.id, 'approved')} className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">✓ อนุมัติ</button>
                          <button type="button" onClick={() => handleUpdateStatus(req.id, 'rejected')} className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer">✕ ปฏิเสธ</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">👥 จัดการบัญชีผู้ใช้งานระบบ</h2>
              <p className="text-xs text-slate-400 mt-0.5">เพิ่มบัญชีผู้ใช้ใหม่, เปลี่ยนชื่อ-นามสกุล, รีเซ็ตรหัสผ่าน หรือลบบัญชีผู้ใช้</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="🔍 ค้นหารหัสนักศึกษา หรือชื่อ-นามสกุล..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-slate-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  🔄 รีเฟรช
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>➕</span> เพิ่มบัญชีผู้ใช้ใหม่
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">ชื่อผู้ใช้ / รหัสนักศึกษา</th>
                      <th className="px-6 py-3.5">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3.5">สิทธิ์ผู้ใช้งาน (Role)</th>
                      <th className="px-6 py-3.5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-semibold">
                          ไม่พบข้อมูลผู้ใช้ในระบบ
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">#{u.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700 flex items-center gap-2">
                            <span>{u.name}</span>
                            <button
                              type="button"
                              onClick={() => handleEditName(u.id, u.name)}
                              className="text-slate-400 hover:text-amber-600 transition-colors p-1 cursor-pointer"
                              title="แก้ไขชื่อ-นามสกุล"
                            >
                              ✏️
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role === 'admin' ? '🛡️ เจ้าหน้าที่ (Admin)' : '🎓 นักศึกษา (User)'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleResetPassword(u.username)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                              title="รีเซ็ตรหัสผ่าน"
                            >
                              🔑 รหัสผ่าน
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold transition-all cursor-pointer"
                              title="ลบบัญชี"
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
        )}

      </main>

      {/* Modal เพิ่มผู้ใช้ */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">➕ เพิ่มบัญชีผู้ใช้ใหม่</h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อผู้ใช้ / รหัสนักศึกษา</label>
                <input
                  type="text"
                  placeholder="เช่น 660610999 หรือ admin02"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  placeholder="เช่น นายสมศักดิ์ ขยันเรียน"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  placeholder="กำหนดรหัสผ่าน"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">สิทธิ์ผู้ใช้งาน (Role)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="user">🎓 นักศึกษา (User)</option>
                  <option value="admin">🛡️ เจ้าหน้าที่ (Admin)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs cursor-pointer shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดคำร้อง */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedRequest.id}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">รายละเอียดคำร้อง</h3>
              </div>
              <button type="button" onClick={() => setSelectedRequest(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>
            <div className="space-y-4 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-700 text-sm">👤 ข้อมูลผู้ยื่นคำร้อง</p>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-slate-400">ชื่อ-นามสกุล:</span> <br/><strong className="text-slate-700">{selectedRequest.studentName}</strong></p>
                  <p><span className="text-slate-400">รหัสนักศึกษา:</span> <br/><strong className="text-slate-700">{selectedRequest.studentId}</strong></p>
                  <p><span className="text-slate-400">คณะ/หน่วยงาน:</span> <br/><strong className="text-slate-700">{selectedRequest.faculty || '-'}</strong></p>
                  <p><span className="text-slate-400">เบอร์โทรติดต่อ:</span> <br/><strong className="text-slate-700">{selectedRequest.phone || '-'}</strong></p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-700 text-sm">📝 รายละเอียดสิ่งที่ร้องขอ</p>
                <p><span className="text-slate-400">รายการ:</span> <strong className="text-slate-800">{selectedRequest.docType}</strong></p>
                {selectedRequest.copies && <p><span className="text-slate-400">จำนวน:</span> {selectedRequest.copies} ฉบับ</p>}
                {selectedRequest.buildingName && <p><span className="text-slate-400">สถานที่:</span> {selectedRequest.buildingName} (ห้อง {selectedRequest.roomNumber})</p>}
                {selectedRequest.issueDetail && <p><span className="text-slate-400">งานที่ซ่อมแซม:</span> {selectedRequest.issueDetail}</p>}
                <p><span className="text-slate-400">วัตถุประสงค์:</span> {selectedRequest.purpose || '-'}</p>
                <p><span className="text-slate-400">หมายเหตุ:</span> {selectedRequest.note || '-'}</p>
              </div>
              {selectedRequest.deliveryMethod === 'postal' && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 space-y-1">
                  <p className="font-bold text-amber-800 text-xs">📮 ที่อยู่สำหรับจัดส่งไปรษณีย์ (EMS)</p>
                  <p className="text-slate-700">{selectedRequest.address}</p>
                </div>
              )}
              {selectedRequest.imageUrl && (
                <div className="space-y-2">
                  <p className="font-bold text-slate-700">📸 รูปภาพประกอบ</p>
                  <img src={selectedRequest.imageUrl} alt="รูปแนบ" className="w-full max-h-60 object-contain rounded-2xl border border-slate-200 bg-slate-50" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button type="button" onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer">✕ ปฏิเสธคำร้อง</button>
                  <button type="button" onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">✓ อนุมัติคำร้อง</button>
                </>
              ) : (
                <button type="button" onClick={() => setSelectedRequest(null)} className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer">ปิดหน้าต่าง</button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}