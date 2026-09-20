{/* Modal แสดงรายละเอียดคำร้องเชิงลึก */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedRequest.id}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">รายละเอียดคำร้องเชิงลึก</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              
              {/* ข้อมูลผู้ยื่นคำร้อง */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-700 text-sm">👤 ข้อมูลผู้ยื่นคำร้อง</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <p><span className="text-slate-400">ชื่อ-นามสกุล:</span> <br/><strong className="text-slate-800">{selectedRequest.studentName}</strong></p>
                  <p><span className="text-slate-400">รหัสนักศึกษา:</span> <br/><strong className="text-slate-800">{selectedRequest.studentId}</strong></p>
                  <p><span className="text-slate-400">ชั้นปี:</span> <br/><strong className="text-slate-800">{selectedRequest.yearLevel || '-'}</strong></p>
                  <p><span className="text-slate-400">คณะ:</span> <br/><strong className="text-slate-800">{selectedRequest.faculty || '-'}</strong></p>
                  <p><span className="text-slate-400">GPAX:</span> <br/><strong className="text-slate-800">{selectedRequest.gpax || '-'}</strong></p>
                  <p><span className="text-slate-400">เบอร์โทร:</span> <br/><strong className="text-slate-800">{selectedRequest.phone || '-'}</strong></p>
                  <p className="col-span-2 sm:col-span-3"><span className="text-slate-400">อีเมล:</span> <strong className="text-slate-800">{selectedRequest.email || '-'}</strong></p>
                </div>
              </div>

              {/* รายละเอียดคำร้อง */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-700 text-sm">📝 รายละเอียดสิ่งที่ร้องขอ</p>
                <p><span className="text-slate-400">รายการ:</span> <strong className="text-slate-900 font-bold">{selectedRequest.docType}</strong></p>
                {selectedRequest.copies && <p><span className="text-slate-400">จำนวน:</span> {selectedRequest.copies} ฉบับ</p>}
                
                {selectedRequest.repairCategory && <p><span className="text-slate-400">ประเภทงานซ่อม:</span> {selectedRequest.repairCategory}</p>}
                {selectedRequest.urgency && (
                  <p><span className="text-slate-400">ความเร่งด่วน:</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded font-bold text-[10px] ${
                      selectedRequest.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                      selectedRequest.urgency === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedRequest.urgency === 'critical' ? '🔴 ด่วนที่สุด (อันตราย)' : selectedRequest.urgency === 'urgent' ? '🟡 ด่วน' : '🟢 ปกติ'}
                    </span>
                  </p>
                )}

                {selectedRequest.buildingName && <p><span className="text-slate-400">สถานที่:</span> {selectedRequest.buildingName} (ห้อง {selectedRequest.roomNumber})</p>}
                {selectedRequest.issueDetail && <p><span className="text-slate-400">รายละเอียดอาการชำรุด:</span> {selectedRequest.issueDetail}</p>}
                <p><span className="text-slate-400">วัตถุประสงค์:</span> {selectedRequest.purpose || '-'}</p>
              </div>

              {/* การจัดส่งเอกสาร / E-Doc */}
              {selectedRequest.deliveryMethod && selectedRequest.deliveryMethod !== 'N/A' && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 space-y-1">
                  <p className="font-bold text-amber-800 text-xs">📬 วิธีการรับเอกสาร</p>
                  <p className="text-slate-700">
                    {selectedRequest.deliveryMethod === 'self' && '🏢 รับด้วยตนเองที่สำนักทะเบียน'}
                    {selectedRequest.deliveryMethod === 'postal' && `📮 จัดส่ง EMS: ${selectedRequest.address}`}
                    {selectedRequest.deliveryMethod === 'edoc' && `💻 รับไฟล์ E-Document ทางอีเมล: ${selectedRequest.email}`}
                  </p>
                </div>
              )}

              {/* รูปภาพแนบ (รูปสลิป / รูปความเสียหาย) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedRequest.slipImage && (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">🧾 หลักฐานการชำระเงิน (สลิป)</p>
                    <img src={selectedRequest.slipImage} alt="สลิปโอนเงิน" className="w-full max-h-52 object-contain rounded-2xl border border-slate-200 bg-slate-50" />
                  </div>
                )}
                {selectedRequest.imageUrl && (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">📸 รูปภาพความเสียหายชำรุด</p>
                    <img src={selectedRequest.imageUrl} alt="รูปความเสียหาย" className="w-full max-h-52 object-contain rounded-2xl border border-slate-200 bg-slate-50" />
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer">✕ ปฏิเสธคำร้อง</button>
                  <button onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">✓ อนุมัติคำร้อง</button>
                </>
              ) : (
                <button onClick={() => setSelectedRequest(null)} className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer">ปิดหน้าต่าง</button>
              )}
            </div>

          </div>
        </div>
      )}