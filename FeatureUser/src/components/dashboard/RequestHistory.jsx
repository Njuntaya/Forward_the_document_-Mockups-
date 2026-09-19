import { useState } from 'react';

export default function RequestHistory({ requests = [], onEditAndResubmit }) {
  const [selectedDetail, setSelectedDetail] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#6b3a1f] flex items-center gap-2">
            📜 ประวัติคำร้องทั้งหมด
          </h2>
          <p className="text-xs text-slate-400 mt-1">รายการคำร้องที่เสร็จสิ้นกระบวนการ หรือคำร้องที่ถูกตีกลับเพื่อรอการแก้ไข</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">📭</div>
          <h3 className="text-base font-bold text-slate-700">ไม่มีประวัติคำร้อง</h3>
          <p className="text-xs text-slate-400">ประวัติคำร้องที่อนุมัติหรือถูกปฏิเสธจะแสดงรายการที่นี่</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div 
                key={req.id} 
                className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isApproved ? 'border-emerald-200' : isRejected ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">{req.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isApproved ? '🟢 อนุมัติและนัดหมายแล้ว' : '🔴 ถูกปฏิเสธ (รอแก้ไข)'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">{req.docType}</h3>
                    <p className="text-xs text-slate-500">วัตถุประสงค์: {req.purpose || req.issueDetail || '-'}</p>

                    {/* แสดงวันเวลานัดหมายถ้าอนุมัติแล้ว */}
                    {isApproved && req.deliverySchedule && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold space-y-0.5">
                        <p>📅 <strong>นัดหมายส่งมอบ:</strong> {req.deliverySchedule}</p>
                        {req.adminFeedback && <p>💬 <strong>หมายเหตุ:</strong> {req.adminFeedback}</p>}
                      </div>
                    )}

                    {/* แสดง Feedback ถ้าถูกปฏิเสธ */}
                    {isRejected && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-0.5">
                        <p>⚠️ <strong>เหตุผลที่ตีกลับ:</strong> {req.feedback || 'กรุณาแก้ไขข้อมูลตามจุดสีแดง'}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDetail(req)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      🔍 รายละเอียด
                    </button>

                    {/* ปุ่มสำหรับแก้ไขและส่งคำร้องใหม่ (กรณีถูกปฏิเสธ) */}
                    {isRejected && onEditAndResubmit && (
                      <button
                        type="button"
                        onClick={() => onEditAndResubmit(req)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        ✏️ แก้ไขและส่งใหม่
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ดูรายละเอียดประวัติ */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{selectedDetail.id}</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">รายละเอียดประวัติคำร้อง</h3>
              </div>
              <button type="button" onClick={() => setSelectedDetail(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p><span className="text-slate-400">รายการ:</span> <strong className="text-slate-800">{selectedDetail.docType}</strong></p>
                <p><span className="text-slate-400">วัตถุประสงค์:</span> {selectedDetail.purpose || selectedDetail.issueDetail || '-'}</p>
                
                {selectedDetail.status === 'approved' && selectedDetail.deliverySchedule && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold space-y-1">
                    <p>📅 <strong>วันเวลานัดหมายส่งมอบ:</strong> {selectedDetail.deliverySchedule}</p>
                    {selectedDetail.adminFeedback && <p>💬 <strong>หมายเหตุจากเจ้าหน้าที่:</strong> {selectedDetail.adminFeedback}</p>}
                  </div>
                )}

                {selectedDetail.status === 'rejected' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                    <p>⚠️ <strong>ข้อความตีกลับ:</strong> {selectedDetail.feedback}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
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