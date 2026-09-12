import { useState } from 'react';

export default function RequestHistory({ requests = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'approved' | 'rejected'

  const filteredRequests = requests.filter(req => {
    if (filter === 'approved') return req.status === 'approved';
    if (filter === 'rejected') return req.status === 'rejected';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header และ Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#6b3a1f] flex items-center gap-2">
            📜 ประวัติคำร้องที่ดำเนินการเสร็จสิ้น
          </h2>
          <p className="text-xs text-slate-400 mt-1">รายการคำร้องทั้งหมดที่ได้รับการอนุมัติ หรือปฏิเสธแล้ว</p>
        </div>

        {/* ปุ่ม Filter สลับดูสถานะ */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#6b3a1f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({requests.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟢 อนุมัติแล้ว
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'rejected' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔴 ไม่อนุมัติ
          </button>
        </div>
      </div>

      {/* List รายการประวัติคำร้อง */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="text-5xl">📜</div>
          <h3 className="text-base font-bold text-slate-700">ยังไม่มีประวัติคำร้องในระบบ</h3>
          <p className="text-xs text-slate-400">เมื่อคำร้องของคุณได้รับการตรวจสอบจากเจ้าหน้าที่แล้ว รายการจะมาแสดงที่นี่</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">{req.id}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {req.status === 'approved' ? '🟢 อนุมัติแล้ว' : '🔴 ไม่อนุมัติ / ปฏิเสธ'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString('th-TH') : ''}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">{req.docType}</h3>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">วัตถุประสงค์:</span> {req.purpose || '-'}
                </p>
                {req.buildingName && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">สถานที่:</span> {req.buildingName} (ห้อง {req.roomNumber})
                  </p>
                )}
                {req.deliveryMethod === 'postal' && (
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">📮 จัดส่งทาง EMS ไปที่:</span> {req.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}