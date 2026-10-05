import { useState } from 'react';
import axios from 'axios';

export default function StatusTracking({ requests = [], socket }) {
  const [selectedDetailReq, setSelectedDetailReq] = useState(null);
  const [uploadingReqId, setUploadingReqId] = useState(null);
  const [uploadFileBase64, setUploadFileBase64] = useState('');

  const handleDelete = async (requestId) => {
    if (window.confirm(`⚠️ คุณต้องการยกเลิกคำร้องหมายเลข ${requestId} นี้ใช่หรือไม่?`)) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/requests/${requestId}`);
        if (res.data.success && selectedDetailReq?.id === requestId) setSelectedDetailReq(null);
      } catch { alert('เกิดข้อผิดพลาดในการยกเลิกคำร้อง'); }
    }
  };

  const handleFileSelect = (e, reqId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setUploadFileBase64(reader.result); setUploadingReqId(reqId); };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadComplete = async () => {
    if (!uploadFileBase64 || !uploadingReqId) { alert('ไม่สามารถส่งได้: ข้อมูลไม่ครบ'); return; }
    try {
      const res = await axios.put(`http://localhost:5000/api/requests/${uploadingReqId}`, {
        completedDoc: uploadFileBase64,
        status: 'user_submitted'
      });
      if (res.data.success) {
        alert('✅ ส่งเอกสารเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและแจ้งผลให้ทราบ');
        setUploadFileBase64('');
        setUploadingReqId(null);
      }
    } catch (err) { alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดเอกสาร'); }
  };

  // ── ตัวช่วยสถานะ ──
  const statusLabels = {
    pending: '🟡 รอเจ้าหน้าที่ตรวจสอบ',
    doc_sent: '🔵 กรอกแบบฟอร์มและส่งกลับ',
    user_submitted: '🟣 ส่งเอกสารแล้ว รอตรวจสอบ',
    revision_needed: '🟠 ต้องแก้ไขเอกสาร',
    scheduled: '🟢 อนุมัติแล้ว — รอรับเอกสาร',
    rejected: '🔴 ปฏิเสธคำร้อง',
    completed: '✅ เสร็จสิ้น'
  };
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    doc_sent: 'bg-blue-100 text-blue-800',
    user_submitted: 'bg-purple-100 text-purple-800',
    revision_needed: 'bg-orange-100 text-orange-800',
    scheduled: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-slate-100 text-slate-700'
  };
  const cardBorders = {
    pending: 'border-slate-200',
    doc_sent: 'border-blue-300',
    user_submitted: 'border-purple-300',
    revision_needed: 'border-orange-400',
    scheduled: 'border-emerald-300',
    rejected: 'border-red-200',
    completed: 'border-slate-200'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-[#6b3a1f] flex items-center gap-2">📬 ติดตามสถานะคำร้อง</h2>
        <p className="text-xs text-slate-400 mt-1">ติดตามคำร้องทั้งหมดของคุณ และดำเนินการตามที่เจ้าหน้าที่แจ้ง</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">📭</div>
          <h3 className="text-base font-bold text-slate-700">ไม่มีคำร้องที่กำลังดำเนินการ</h3>
          <p className="text-xs text-slate-400">คำร้องที่คุณยื่นจะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 ${cardBorders[req.status] || 'border-slate-200'}`}>

              {/* ── Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">{req.id}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-700'}`}>
                    {statusLabels[req.status] || req.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{req.createdAt ? new Date(req.createdAt).toLocaleString('th-TH') : ''}</span>
              </div>

              {/* ── Body ── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-slate-800">{req.docType}</h3>
                  <p className="text-xs text-slate-500">วัตถุประสงค์: {req.purpose || req.issueDetail || '-'}</p>

                  {/* ── DOC_SENT: ดาวน์โหลดแบบฟอร์ม + อัปโหลดกลับ ── */}
                  {req.status === 'doc_sent' && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2.5">
                      <p className="text-[11px] font-extrabold text-blue-800">📋 เจ้าหน้าที่ส่งแบบฟอร์มให้คุณแล้ว — กรุณาดำเนินการ</p>
                      <a href={`http://localhost:5000/api/requests/${req.id}/template-doc`} target="_blank" rel="noreferrer"
                        className="block w-full text-center px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-[11px] transition-all">
                        📄 1. ดาวน์โหลดแบบฟอร์ม (กดเพื่อเปิด)
                      </a>
                      <div className="relative w-full">
                        <input type="file" accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, req.id)} />
                        <button className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[11px] transition-all">
                          📤 2. อัปโหลดแบบฟอร์มที่กรอกแล้ว
                        </button>
                      </div>
                      <p className="text-[10px] text-blue-600">* กรอกข้อมูลในแบบฟอร์มให้ครบถ้วน แล้วถ่ายรูปหรือสแกนส่งกลับมา</p>
                    </div>
                  )}

                  {/* ── USER_SUBMITTED: รอตรวจสอบ ── */}
                  {req.status === 'user_submitted' && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-2xl">
                      <p className="text-[11px] font-bold text-purple-800">🟣 ส่งเอกสารแล้ว — เจ้าหน้าที่กำลังตรวจสอบ</p>
                      <p className="text-[10px] text-purple-600 mt-1">กรุณารอการแจ้งผลจากเจ้าหน้าที่</p>
                    </div>
                  )}

                  {/* ── REVISION_NEEDED: ต้องแก้ไข + อัปโหลดใหม่ ── */}
                  {req.status === 'revision_needed' && (
                    <div className="mt-3 p-4 bg-orange-50 border border-orange-300 rounded-2xl space-y-2.5">
                      <p className="text-[11px] font-extrabold text-orange-800">⚠️ เจ้าหน้าที่แจ้งให้แก้ไขเอกสาร</p>
                      {req.revisionFeedback && (
                        <div className="p-2.5 bg-orange-100 border border-orange-200 rounded-xl">
                          <p className="text-[11px] font-semibold text-orange-900">📝 {req.revisionFeedback}</p>
                        </div>
                      )}
                      <a href={`http://localhost:5000/api/requests/${req.id}/template-doc`} target="_blank" rel="noreferrer"
                        className="block w-full text-center px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold text-[11px] transition-all">
                        📄 ดาวน์โหลดแบบฟอร์มอีกครั้ง
                      </a>
                      <div className="relative w-full">
                        <input type="file" accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileSelect(e, req.id)} />
                        <button className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[11px] transition-all">
                          📤 ส่งเอกสารที่แก้ไขแล้ว
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── SCHEDULED: นัดหมายแล้ว ── */}
                  {req.status === 'scheduled' && req.deliverySchedule && (
                    <div className="mt-3 p-3 bg-emerald-100 border border-emerald-200 rounded-2xl space-y-1">
                      <p className="text-xs font-bold text-emerald-900">🎉 เอกสารอนุมัติแล้ว!</p>
                      <p className="text-xs font-semibold text-emerald-800">📅 <strong>กำหนดนัดหมาย:</strong> {req.deliverySchedule}</p>
                      {req.adminFeedback && <p className="text-xs text-emerald-800">💬 {req.adminFeedback}</p>}
                    </div>
                  )}

                  {/* ── REJECTED: ปฏิเสธ ── */}
                  {req.status === 'rejected' && req.feedback && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-[11px] font-bold text-red-700">เหตุผล: {req.feedback}</p>
                    </div>
                  )}

                  {/* ── COMPLETED ── */}
                  {req.status === 'completed' && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="text-[11px] font-bold text-slate-700">✅ คำร้องนี้ดำเนินการเสร็จสิ้นแล้ว</p>
                    </div>
                  )}
                </div>

                {/* ── ขวา: ยืนยัน Upload + ปุ่ม ── */}
                <div className="flex flex-col items-end gap-3 min-w-[160px]">
                  {/* Upload confirm */}
                  {uploadingReqId === req.id && uploadFileBase64 && (
                    <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold text-blue-800 text-center">อัปโหลดไฟล์สำเร็จ ยืนยันการส่ง?</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setUploadFileBase64(''); setUploadingReqId(null); }} className="flex-1 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold">ยกเลิก</button>
                        <button onClick={handleUploadComplete} className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold">ยืนยัน</button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full justify-end">
                    <button type="button" onClick={() => setSelectedDetailReq(req)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer">
                      🔍 รายละเอียด
                    </button>
                    {(req.status === 'pending' || req.status === 'rejected') && (
                      <button type="button" onClick={() => handleDelete(req.id)}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-[11px] cursor-pointer border border-red-100">
                        🗑️ ยกเลิก
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal รายละเอียด ── */}
      {selectedDetailReq && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedDetailReq.id}</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">รายละเอียดคำร้องและกำหนดการ</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColors[selectedDetailReq.status] || 'bg-slate-100 text-slate-600'}`}>
                  {statusLabels[selectedDetailReq.status] || selectedDetailReq.status}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedDetailReq(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
                <p><span className="text-slate-400">ประเภท:</span> <strong className="text-slate-800">{selectedDetailReq.docType}</strong></p>
                {selectedDetailReq.purpose && <p><span className="text-slate-400">วัตถุประสงค์:</span> {selectedDetailReq.purpose}</p>}
                {selectedDetailReq.yearLevel && <p><span className="text-slate-400">ชั้นปี:</span> {selectedDetailReq.yearLevel}</p>}
                {selectedDetailReq.gpax && <p><span className="text-slate-400">GPAX:</span> {selectedDetailReq.gpax}</p>}
                {selectedDetailReq.phone && <p><span className="text-slate-400">เบอร์โทรศัพท์:</span> {selectedDetailReq.phone}</p>}

                {selectedDetailReq.revisionFeedback && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="font-bold text-orange-800 mb-1">⚠️ ข้อความแจ้งแก้ไขจากเจ้าหน้าที่</p>
                    <p className="text-orange-700">{selectedDetailReq.revisionFeedback}</p>
                  </div>
                )}

                {selectedDetailReq.deliverySchedule && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold space-y-1">
                    <p>📅 <strong>วันเวลานัดหมาย:</strong> {selectedDetailReq.deliverySchedule}</p>
                    {selectedDetailReq.adminFeedback && <p>💬 <strong>ข้อความจากเจ้าหน้าที่:</strong> {selectedDetailReq.adminFeedback}</p>}
                  </div>
                )}

                {selectedDetailReq.feedback && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="font-bold text-red-800 mb-1">📝 เหตุผลการปฏิเสธ</p>
                    <p className="text-red-700">{selectedDetailReq.feedback}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setSelectedDetailReq(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}