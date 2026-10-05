import { useState } from 'react';

export default function RequestHistory({ requests = [], onEditAndResubmit }) {
  const [selectedDetail, setSelectedDetail] = useState(null);

  const statusLabels = {
    scheduled: '🟢 อนุมัติแล้ว — รอรับเอกสาร',
    completed: '✅ เสร็จสิ้น — รับเอกสารแล้ว',
    rejected: '🔴 ถูกปฏิเสธ'
  };
  const statusColors = {
    scheduled: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-700',
    rejected: 'bg-red-100 text-red-800'
  };
  const cardBorders = {
    scheduled: 'border-emerald-200',
    completed: 'border-slate-200',
    rejected: 'border-red-200'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-[#6b3a1f] flex items-center gap-2">📜 ประวัติคำร้องทั้งหมด</h2>
        <p className="text-xs text-slate-400 mt-1">รายการที่อนุมัติแล้ว (รอรับเอกสาร), เสร็จสิ้น หรือถูกปฏิเสธ</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">📭</div>
          <h3 className="text-base font-bold text-slate-700">ไม่มีประวัติคำร้อง</h3>
          <p className="text-xs text-slate-400">คำร้องที่นัดหมายแล้ว เสร็จสิ้น หรือถูกปฏิเสธจะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isScheduled = req.status === 'scheduled';
            const isCompleted = req.status === 'completed';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 ${cardBorders[req.status] || 'border-slate-200'}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">{req.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                      {statusLabels[req.status] || req.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-sm font-bold text-slate-800">{req.docType}</h3>
                    <p className="text-xs text-slate-500">วัตถุประสงค์: {req.purpose || req.issueDetail || '-'}</p>

                    {/* scheduled/completed: แสดงนัดหมาย */}
                    {(isScheduled || isCompleted) && req.deliverySchedule && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold space-y-1">
                        <p>📅 <strong>กำหนดรับเอกสาร:</strong> {req.deliverySchedule}</p>
                        {req.adminFeedback && <p>💬 <strong>หมายเหตุ:</strong> {req.adminFeedback}</p>}
                        {isCompleted && (
                          <p className="text-emerald-700 font-bold">✅ รับเอกสารเรียบร้อยแล้ว</p>
                        )}
                      </div>
                    )}

                    {/* rejected: แสดงเหตุผล */}
                    {isRejected && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-0.5">
                        <p>⚠️ <strong>เหตุผลที่ตีกลับ:</strong> {req.feedback || 'กรุณาแก้ไขข้อมูลตามที่เจ้าหน้าที่แจ้ง'}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedDetail(req)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      🔍 รายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal รายละเอียด */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{selectedDetail.id}</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">รายละเอียดประวัติคำร้อง</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColors[selectedDetail.status] || 'bg-slate-100 text-slate-600'}`}>
                  {statusLabels[selectedDetail.status] || selectedDetail.status}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedDetail(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p><span className="text-slate-400">รายการ:</span> <strong className="text-slate-800">{selectedDetail.docType}</strong></p>
                <p><span className="text-slate-400">วัตถุประสงค์:</span> {selectedDetail.purpose || selectedDetail.issueDetail || '-'}</p>
                {selectedDetail.yearLevel && <p><span className="text-slate-400">ชั้นปี:</span> {selectedDetail.yearLevel}</p>}
                {selectedDetail.gpax && <p><span className="text-slate-400">GPAX:</span> {selectedDetail.gpax}</p>}
                {selectedDetail.phone && <p><span className="text-slate-400">เบอร์โทรศัพท์:</span> {selectedDetail.phone}</p>}

                {(selectedDetail.status === 'scheduled' || selectedDetail.status === 'completed') && selectedDetail.deliverySchedule && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold space-y-1">
                    <p>📅 <strong>วันเวลานัดหมายส่งมอบ:</strong> {selectedDetail.deliverySchedule}</p>
                    {selectedDetail.adminFeedback && <p>💬 <strong>หมายเหตุจากเจ้าหน้าที่:</strong> {selectedDetail.adminFeedback}</p>}
                  </div>
                )}

                {selectedDetail.status === 'rejected' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                    <p>⚠️ <strong>ข้อความตีกลับ:</strong> {selectedDetail.feedback || '-'}</p>
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