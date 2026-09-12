export default function StudentHome({ user, announcements = [], onNavigate }) {
  return (
    <div className="space-y-8">
      
      {/* Banner ต้อนรับ */}
      <div className="bg-gradient-to-r from-[#3b1f0e] to-[#6b3a1f] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/20">
            🎓 ระบบบริการการศึกษาออนไลน์
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ยินดีต้อนรับ, {user?.name || 'นักศึกษา'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed max-w-xl">
            ยื่นคำร้องขอเอกสารทางการศึกษาและแจ้งซ่อมแซมอาคารสถานที่ภายในมหาวิทยาลัยได้อย่างรวดเร็ว สะดวก และติดตามสถานะได้แบบเรียลไทม์
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-request')}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <span>📝</span> เริ่มยื่นคำร้องใหม่
        </button>
      </div>

      {/* Grid 2 Columns: ประกาศประชาสัมพันธ์ (ซ้าย) + คู่มือการใช้งาน (ขวา) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* คอลัมน์ซ้าย: ประกาศประชาสัมพันธ์จาก Admin */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>📢</span> ประกาศประชาสัมพันธ์ล่าสุด
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Official</span>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                ยังไม่มีประกาศประชาสัมพันธ์ในขณะนี้
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-amber-800">{ann.author}</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* คอลัมน์ขวา: คำชี้แจง / คู่มือการใช้งานระบบ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>📖</span> คู่มือและคำชี้แจงการใช้งานระบบ
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-base">1️⃣</span>
              <div>
                <p className="font-bold text-slate-800">การยื่นคำร้องขอเอกสาร</p>
                <p className="text-[11px] text-slate-500">เลือกเมนู "ยื่นคำร้องใหม่" กรอกข้อมูลและวัตถุประสงค์ พร้อมเลือกรับเอกสารด้วยตนเอง จัดส่ง EMS หรือรับไฟล์ E-Document (PDF)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-base">2️⃣</span>
              <div>
                <p className="font-bold text-slate-800">การแจ้งซ่อมแซมอาคารสถานที่</p>
                <p className="text-[11px] text-slate-500">ระบุอาคาร ห้องเรียน และแนบรูปถ่ายความเสียหาย พร้อมเลือกระดับความเร่งด่วนเพื่อให้เจ้าหน้าที่เข้าดำเนินการ</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-base">3️⃣</span>
              <div>
                <p className="font-bold text-slate-800">การติดตามสถานะ</p>
                <p className="text-[11px] text-slate-500">สามารถตรวจสอบสถานะคำร้องแบบเรียลไทม์ได้ที่แท็บ "ติดตามสถานะ" และดูประวัติย้อนหลังได้ที่แท็บ "ประวัติคำร้อง"</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}