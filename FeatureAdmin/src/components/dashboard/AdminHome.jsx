export default function AdminHome({ user, requests = [], usersList = [], onNavigate }) {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');
  const studentUsers = usersList.filter(u => u.role === 'user');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/20">
            <span>🛡️</span> ศูนย์ควบคุมผู้ดูแลระบบ
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            สวัสดีคุณ {user?.name || 'เจ้าหน้าที่'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            ยินดีต้อนรับสู่ระบบบริหารจัดการคำร้องขอเอกสารทางการศึกษาและแจ้งปรับปรุงอาคารเรียน ดูสรุปสถิติและงานที่ต้องดำเนินการเร่งด่วนได้จากที่นี่
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('requests')}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>⚡</span> ตรวจสอบคำร้องด่วน ({pendingRequests.length})
          </button>
        </div>
      </div>

      {/* Grid Cards สถิติหลัก */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>คำร้องรอการตรวจสอบ</span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">⏳</span>
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingRequests.length}</p>
          <p className="text-[11px] text-slate-400">ต้องการการอนุมัติ/ตรวจสอบ</p>
        </div>

        <div 
          onClick={() => onNavigate('requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>อนุมัติเรียบร้อยแล้ว</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">✅</span>
          </div>
          <p className="text-3xl font-black text-emerald-600">{approvedRequests.length}</p>
          <p className="text-[11px] text-slate-400">ดำเนินการเสร็จสมบูรณ์</p>
        </div>

        <div 
          onClick={() => onNavigate('requests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>คำร้องทั้งหมด</span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">📁</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{requests.length}</p>
          <p className="text-[11px] text-slate-400">รวมคำร้องทุกหมวดหมู่</p>
        </div>

        <div 
          onClick={() => onNavigate('users')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>นักศึกษาในระบบ</span>
            <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">🎓</span>
          </div>
          <p className="text-3xl font-black text-purple-600">{studentUsers.length}</p>
          <p className="text-[11px] text-slate-400">บัญชีผู้ใช้งานนักศึกษา</p>
        </div>
      </div>

      {/* Main Info Section (คำร้องล่าสุด + Quick Links) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): คำร้องล่าสุด */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">⏱️ คำร้องยื่นเข้ามาล่าสุด</h3>
              <p className="text-xs text-slate-400">รายการคำร้อง 5 รายการแรกที่ส่งเข้ามาในระบบ</p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              ดูคำร้องทั้งหมด →
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              ยังไม่มีคำร้องยื่นเข้ามาในระบบ
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-100/80 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200">{req.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status === 'pending' ? '🟡 รอตรวจสอบ' : req.status === 'approved' ? '🟢 อนุมัติแล้ว' : '🔴 ปฏิเสธ'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{req.docType}</p>
                    <p className="text-[11px] text-slate-500">ผู้ยื่น: {req.studentName} ({req.studentId})</p>
                  </div>

                  <button
                    onClick={() => onNavigate('requests')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    ตรวจสอบ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1/3): ทางลัดและการแจ้งเตือนระบบ */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              🚀 ทางลัดการจัดการ
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('requests')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all border border-slate-100 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">อนุมัติคำร้องขอเอกสาร</p>
                    <p className="text-[10px] text-slate-400">ตรวจสอบและอัปเดตสถานะ</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>

              <button
                onClick={() => onNavigate('users')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all border border-slate-100 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">➕</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">เพิ่มบัญชีผู้ใช้งานใหม่</p>
                    <p className="text-[10px] text-slate-400">สร้างบัญชีนักศึกษา/เจ้าหน้าที่</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/60 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <span>💡</span> ข้อควรรู้สำหรับเจ้าหน้าที่
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อมีการอัปเดตสถานะคำร้องเป็น "อนุมัติ" หรือ "ปฏิเสธ" ข้อมูลจะถูกส่ง Real-time ไปแสดงผลที่หน้าจอของนักศึกษาทันทีโดยไม่ต้องทำการรีเฟรชหน้าจอ
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}