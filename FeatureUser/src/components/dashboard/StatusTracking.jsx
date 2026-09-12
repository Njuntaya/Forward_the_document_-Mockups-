import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StatusTracking({ requests = [], socket }) {
  const [items, setItems] = useState(requests);

  useEffect(() => {
    setItems(requests);
  }, [requests]);

  // ฟังก์ชันลบคำร้องถาวรทั้งฝั่ง UI, Socket และ HTTP API
  const handleDelete = async (requestId) => {
    if (!requestId) return;

    const confirmDelete = window.confirm(`คุณต้องการยกเลิกคำร้องหมายเลข ${requestId} ใช่หรือไม่?`);
    if (!confirmDelete) return;

    // 1. ลบออกจากหน้าจอ UI ทันที
    setItems(prev => prev.filter(item => String(item.id) !== String(requestId)));

    // 2. ส่ง Socket Event ไปลบฝั่ง Backend Real-time
    if (socket && socket.emit) {
      socket.emit('delete_request', requestId);
    }

    // 3. ยิง HTTP DELETE API สำรอง เพื่อรับประกันการเขียนลงไฟล์ requests.json ถาวร
    try {
      await axios.delete(`http://localhost:5000/api/requests/${requestId}`);
    } catch (err) {
      console.error('Error deleting request via API:', err);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-2xl mx-auto shadow-sm">
        <div className="text-4xl mb-3">📬</div>
        <h3 className="text-base font-bold text-slate-700">ไม่มีคำร้องที่กำลังดำเนินการ</h3>
        <p className="text-xs text-slate-400 mt-1">คำร้องที่คุณยื่นจะแสดงสถานะอัปเดตแบบเรียลไทม์ที่นี่</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 mb-8">
      <h2 className="text-lg font-bold text-[#6b3a1f] flex items-center gap-2 mb-4">
        🟡 รายการคำร้องที่กำลังดำเนินการ ({items.length})
      </h2>

      {items.map((req, index) => {
        if (!req) return null;

        const reqId = req.id || `REQ-TEMP-${index}`;

        return (
          <div key={reqId} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-300 transition-all">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-100 text-[#6b3a1f] rounded-md">{reqId}</span>
                <span className="text-xs text-slate-400">
                  {req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-800">{req.docType || 'รายการคำร้อง'}</h4>

              <div className="text-xs text-slate-600 space-y-0.5">
                <p>
                  <span className="font-semibold text-slate-500">ผู้ยื่น:</span> {req.studentName || '-'} ({req.studentId || '-'}) 
                  {req.phone ? ` | เบอร์โทร: ${req.phone}` : ''}
                </p>

                {req.buildingName && (
                  <p><span className="font-semibold text-slate-500">สถานที่:</span> {req.buildingName} {req.roomNumber ? `(ห้อง ${req.roomNumber})` : ''}</p>
                )}

                {req.issueDetail && (
                  <p><span className="font-semibold text-slate-500">รายละเอียดงาน:</span> {req.issueDetail}</p>
                )}

                {req.purpose && (
                  <p><span className="font-semibold text-slate-500">วัตถุประสงค์/หมายเหตุ:</span> {req.purpose}</p>
                )}
              </div>

              {req.imageUrl && (
                <div className="mt-2">
                  <img src={req.imageUrl} alt="รูปประกอบคำร้อง" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                กำลังรอเจ้าหน้าที่ตรวจสอบ
              </div>

              <button
                type="button"
                onClick={() => handleDelete(req.id)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>🗑️</span> ยกเลิกคำร้อง
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}