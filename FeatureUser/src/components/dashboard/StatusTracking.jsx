import { useState } from 'react';

export default function StatusTracking({ requests = [], socket }) {
  const [selectedDetailReq, setSelectedDetailReq] = useState(null);

  const handleDelete = (requestId) => {
    if (window.confirm(`⚠️ คุณต้องการยกเลิกคำร้องหมายเลข ${requestId} นี้ใช่หรือไม่?`)) {
      if (socket) {
        socket.emit('delete_request', requestId);
        if (selectedDetailReq && selectedDetailReq.id === requestId) {
          setSelectedDetailReq(null);
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#6b3a1f] flex items-center gap-2">
            📬 ติดตามสถานะและกำหนดการนัดหมาย
          </h2>
          <p className="text-xs text-slate-400 mt-1">ติดตามคำร้องที่กำลังดำเนินการ หรือตรวจสอบวันเวลานัดหมายรับเอกสาร</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">📭</div>
          <h3 className="text-base font-bold text-slate-700">ไม่มีคำร้องที่กำลังดำเนินการ</h3>
          <p className="text-xs text-slate-400">คำร้องที่คุณยื่นหรือรายการที่รอนัดหมายรับมอบจะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isApproved = req.status === 'approved';
            return (
              <div key={req.id} className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 ${isApproved ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">{req.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {isApproved ? '🟢 อนุมัติแล้ว (รอนัดหมาย/ส่งมอบ)' : '🟡 กำลังดำเนินการ / รอตรวจสอบ'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">{req.docType}</h3>
                    <p className="text-xs text-slate-500">วัตถุประสงค์: {req.purpose || req.issueDetail || '-'}</p>
                    
                    {/* 🌟 แสดงเวลานัดหมายส่งมอบ ถ้าแอดมินระบุมา */}
                    {isApproved && req.deliverySchedule && (
                      <div className="mt-2 p-3 bg-emerald-100/60 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold space-y-0.5">
                        <p>📅 <strong>กำหนดนัดหมายส่งมอบ:</strong> {req.deliverySchedule}</p>
                        {req.adminFeedback && <p>💬 <strong>หมายเหตุจากเจ้าหน้าที่:</strong> {req.adminFeedback}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailReq(req)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      🔍 ดูรายละเอียด
                    </button>

                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs transition-all cursor-pointer border border-red-100"
                      >
                        🗑️ ยกเลิกคำร้อง
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ดูรายละเอียด */}
      {selectedDetailReq && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedDetailReq.id}</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">รายละเอียดคำร้องและกำหนดการ</h3>
              </div>
              <button type="button" onClick={() => setSelectedDetailReq(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
                <p><span className="text-slate-400">ประเภท:</span> <strong className="text-slate-800">{selectedDetailReq.docType}</strong></p>
                {selectedDetailReq.purpose && <p><span className="text-slate-400">วัตถุประสงค์:</span> {selectedDetailReq.purpose}</p>}
                
                {selectedDetailReq.deliverySchedule && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold space-y-1">
                    <p>📅 <strong>วันเวลานัดหมาย:</strong> {selectedDetailReq.deliverySchedule}</p>
                    {selectedDetailReq.adminFeedback && <p>💬 <strong>ข้อความจากเจ้าหน้าที่:</strong> {selectedDetailReq.adminFeedback}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedDetailReq(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}