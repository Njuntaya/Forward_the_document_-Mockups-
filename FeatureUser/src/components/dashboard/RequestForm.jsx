import { useState } from 'react';

export default function RequestForm({ user, socket, onSuccess }) {
  const [category, setCategory] = useState('doc');

  // ข้อมูลพื้นฐาน
  const [faculty, setFaculty] = useState('วิศวกรรมศาสตร์');
  const [yearLevel, setYearLevel] = useState('ปี 1');
  const [gpax, setGpax] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // หมวดเอกสาร
  const [docType, setDocType] = useState('หนังสือรับรองการเป็นนักศึกษา');
  const [language, setLanguage] = useState('th');
  const [copies, setCopies] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [note, setNote] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('self'); // 'self' | 'postal' | 'edoc'
  const [address, setAddress] = useState('');
  const [slipImage, setSlipImage] = useState(null); // รูปสลิปโอนเงิน

  // หมวดซ่อมแซมอาคาร
  const [buildingName, setBuildingName] = useState('อาคารเรียนรวม CB');
  const [roomNumber, setRoomNumber] = useState('');
  const [repairCategory, setRepairCategory] = useState('งานระบบไฟฟ้า/ปลั๊กไฟ');
  const [urgency, setUrgency] = useState('normal'); // 'low' | 'normal' | 'urgent' | 'critical'
  const [issueDetail, setIssueDetail] = useState('');
  const [imagePreview, setImagePreview] = useState(null); // รูปความเสียหาย

  const [submitting, setSubmitting] = useState(false);

  // ฟังก์ชันแปลงรูปภาพเป็น Base64
  const handleFileChange = (e, setPreviewState) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreviewState(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!phone.trim()) return alert('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อ');

    if (category === 'doc') {
      if (deliveryMethod === 'postal' && !address.trim()) return alert('กรุณากรอกที่อยู่สำหรับจัดส่ง EMS');
      if (deliveryMethod === 'edoc' && !email.trim()) return alert('กรุณากรอกอีเมลสำหรับรับไฟล์ E-Document');
    }

    if (category === 'building' && (!roomNumber.trim() || !issueDetail.trim())) {
      return alert('กรุณากรอกเลขห้องและรายละเอียดความเสียหาย');
    }

    setSubmitting(true);

    const requestData = {
      studentId: String(user?.username || '').trim(),
      studentName: user?.name || 'นักศึกษา',
      faculty,
      yearLevel,
      gpax: gpax.trim() || '-',
      phone: phone.trim(),
      email: email.trim() || '-',
      category,

      // ข้อมูลเอกสาร
      docType: category === 'doc' ? `${docType} (${language === 'th' ? 'ภาษาไทย' : 'ภาษาอังกฤษ'})` : 'คำร้องแจ้งปรับปรุง/ซ่อมแซมอาคารเรียน',
      copies: category === 'doc' ? Number(copies) : 1,
      purpose: category === 'doc' ? purpose.trim() : `ซ่อมแซม: ${buildingName}`,
      note: note.trim() || '-',
      deliveryMethod: category === 'doc' ? deliveryMethod : 'N/A',
      address: category === 'doc' && deliveryMethod === 'postal' ? address.trim() : '-',
      slipImage: category === 'doc' ? slipImage : null,

      // ข้อมูลซ่อมอาคาร
      buildingName: category === 'building' ? buildingName : '',
      roomNumber: category === 'building' ? roomNumber.trim() : '',
      repairCategory: category === 'building' ? repairCategory : '',
      urgency: category === 'building' ? urgency : 'normal',
      issueDetail: category === 'building' ? issueDetail.trim() : '',
      imageUrl: category === 'building' ? imagePreview : null,
    };

    if (socket && socket.emit) {
      socket.emit('submit_request', requestData);
      alert('ยื่นคำร้องสำเร็จเรียบร้อยแล้ว!');
      setSubmitting(false);
      if (onSuccess) onSuccess();
    } else {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#6b3a1f] flex items-center gap-2">
            📝 แบบฟอร์มยื่นคำร้องแบบละเอียด
          </h2>
          <p className="text-xs text-slate-400 mt-1">ระบุรายละเอียดและแนบหลักฐานเพื่อความรวดเร็วในการดำเนินการ</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
          📑
        </div>
      </div>

      {/* เลือกหมวดหมู่คำร้อง */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setCategory('doc')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            category === 'doc' ? 'bg-[#6b3a1f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📄</span> ขอเอกสารการศึกษา
        </button>
        <button
          type="button"
          onClick={() => setCategory('building')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            category === 'building' ? 'bg-[#6b3a1f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🛠️</span> แจ้งซ่อมแซมอาคารสถานที่
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ส่วนที่ 1: ข้อมูลนักศึกษา */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            👤 ข้อมูลผู้ยื่นคำร้อง
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสนักศึกษา</label>
              <input type="text" value={user?.username || ''} disabled className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อ - นามสกุล</label>
              <input type="text" value={user?.name || ''} disabled className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">คณะ / หน่วยงาน</label>
              <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                <option value="วิศวกรรมศาสตร์">วิศวกรรมศาสตร์</option>
                <option value="บริหารธุรกิจ">บริหารธุรกิจ</option>
                <option value="เทคโนโลยีการเกษตร">เทคโนโลยีการเกษตร</option>
                <option value="ศิลปศาสตร์">ศิลปศาสตร์</option>
                <option value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ชั้นปีการศึกษา</label>
              <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                <option value="ปี 1">ชั้นปีที่ 1</option>
                <option value="ปี 2">ชั้นปีที่ 2</option>
                <option value="ปี 3">ชั้นปีที่ 3</option>
                <option value="ปี 4">ชั้นปีที่ 4</option>
                <option value="บัณฑิตศึกษา">สูงกว่าปริญญาตรี</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เกรดเฉลี่ยสะสม (GPAX)</label>
              <input type="number" step="0.01" min="0" max="4.00" placeholder="เช่น 3.25" value={gpax} onChange={(e) => setGpax(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span></label>
              <input type="tel" placeholder="081-234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมลติดต่อ / รับไฟล์ E-Doc</label>
              <input type="email" placeholder="student@mail.rmutt.ac.th" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: รายละเอียดกรณี "ขอเอกสารการศึกษา" */}
        {category === 'doc' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              📄 รายละเอียดเอกสารการศึกษา
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทเอกสาร</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                  <option value="หนังสือรับรองการเป็นนักศึกษา">หนังสือรับรองการเป็นนักศึกษา</option>
                  <option value="ใบแสดงผลการเรียน (Transcript)">ใบแสดงผลการเรียน (Transcript)</option>
                  <option value="หนังสือรับรองคาดว่าจะสำเร็จการศึกษา">หนังสือรับรองคาดว่าจะสำเร็จการศึกษา</option>
                  <option value="หนังสือรับรองสถานภาพนักศึกษา">หนังสือรับรองสถานภาพนักศึกษา</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ภาษาเอกสาร</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setLanguage('th')} className={`py-2 rounded-xl text-xs font-bold ${language === 'th' ? 'bg-[#6b3a1f] text-white' : 'bg-slate-100 text-slate-600'}`}>TH ไทย</button>
                  <button type="button" onClick={() => setLanguage('en')} className={`py-2 rounded-xl text-xs font-bold ${language === 'en' ? 'bg-[#6b3a1f] text-white' : 'bg-slate-100 text-slate-600'}`}>EN อังกฤษ</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">จำนวน (ฉบับ)</label>
                <input type="number" min="1" max="10" value={copies} onChange={(e) => setCopies(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">วัตถุประสงค์นำไปใช้ <span className="text-red-500">*</span></label>
                <input type="text" placeholder="เช่น สมัครงาน, ยื่นขอทุนการศึกษา, ทำวีซ่า" value={purpose} onChange={(e) => setPurpose(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
              </div>
            </div>

            {/* ช่องทางรับเอกสาร */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-600">ช่องทางรับเอกสาร</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${deliveryMethod === 'self' ? 'bg-amber-50 border-amber-400 text-[#6b3a1f]' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="delivery" checked={deliveryMethod === 'self'} onChange={() => setDeliveryMethod('self')} className="accent-[#6b3a1f]" />
                  🏢 รับด้วยตนเอง
                </label>
                <label className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${deliveryMethod === 'postal' ? 'bg-amber-50 border-amber-400 text-[#6b3a1f]' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="delivery" checked={deliveryMethod === 'postal'} onChange={() => setDeliveryMethod('postal')} className="accent-[#6b3a1f]" />
                  📮 จัดส่งไปรษณีย์ EMS
                </label>
                <label className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${deliveryMethod === 'edoc' ? 'bg-amber-50 border-amber-400 text-[#6b3a1f]' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="delivery" checked={deliveryMethod === 'edoc'} onChange={() => setDeliveryMethod('edoc')} className="accent-[#6b3a1f]" />
                  💻 E-Document (PDF)
                </label>
              </div>

              {deliveryMethod === 'postal' && (
                <div className="pt-2">
                  <textarea rows="2" placeholder="กรอกที่อยู่จัดส่งโดยละเอียด พร้อมรหัสไปรษณีย์..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
                </div>
              )}
            </div>

            {/* แนบสลิปชำระเงิน */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-600">🧾 แนบหลักฐานการชำระเงิน / สลิปโอนเงิน (ถ้ามี)</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setSlipImage)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#6b3a1f] hover:file:bg-amber-100 cursor-pointer" />
              {slipImage && (
                <div className="mt-2">
                  <img src={slipImage} alt="ตัวอย่างสลิป" className="w-28 h-36 object-cover rounded-xl border border-slate-200 shadow-sm" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ส่วนที่ 3: รายละเอียดกรณี "แจ้งซ่อมแซมอาคาร" */}
        {category === 'building' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              🛠️ รายละเอียดการแจ้งซ่อมแซมอาคารเรียน
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">อาคาร / สถานที่</label>
                <select value={buildingName} onChange={(e) => setBuildingName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                  <option value="อาคารเรียนรวม CB">อาคารเรียนรวม CB</option>
                  <option value="อาคารวิศวกรรมศาสตร์ 1">อาคารวิศวกรรมศาสตร์ 1</option>
                  <option value="อาคารวิศวกรรมศาสตร์ 2">อาคารวิศวกรรมศาสตร์ 2</option>
                  <option value="อาคารปฏิบัติการเทคโนโลยี">อาคารปฏิบัติการเทคโนโลยี</option>
                  <option value="หอประชุมใหญ่">หอประชุมใหญ่</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เลขห้อง / จุดเกิดเหตุ <span className="text-red-500">*</span></label>
                <input type="text" placeholder="เช่น ห้อง CB-304 หรือ โถงชั้น 1" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทงานซ่อมแซม</label>
                <select value={repairCategory} onChange={(e) => setRepairCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                  <option value="งานระบบไฟฟ้า/ปลั๊กไฟ">🔌 งานระบบไฟฟ้า / ปลั๊กไฟ / สวิตช์</option>
                  <option value="งานระบบปรับอากาศ">ระบบปรับอากาศ (แอร์)</option>
                  <option value="งานอุปกรณ์ไอที/โปรเจกเตอร์">🖥️ อุปกรณ์ไอที / โปรเจกเตอร์ / ลำโพง</option>
                  <option value="งานครุภัณฑ์/โต๊ะเก้าอี้">🪑 ครุภัณฑ์ / โต๊ะ / เก้าอี้ / ประตู</option>
                  <option value="งานระบบประปา/สุขภัณฑ์">🚰 ระบบประปา / ห้องน้ำ / สุขภัณฑ์</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ระดับความเร่งด่วน</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                  <option value="normal">🟢 ปกติ (ดำเนินการตามคิว)</option>
                  <option value="urgent">🟡 ด่วน (กระทบการเรียนการสอน)</option>
                  <option value="critical">🔴 ด่วนที่สุด (เกิดอันตราย/ไฟฟ้าช็อต)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียดอาการชำรุด <span className="text-red-500">*</span></label>
                <textarea rows="3" placeholder="ระบุอาการชำรุดโดยละเอียด..." value={issueDetail} onChange={(e) => setIssueDetail(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
              </div>

              {/* แนบรูปภาพความเสียหาย */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-600">📸 แนบรูปภาพความเสียหายชำรุด</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImagePreview)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#6b3a1f] hover:file:bg-amber-100 cursor-pointer" />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="รูปแนบ" className="w-32 h-32 object-cover rounded-2xl border border-slate-200" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-[#6b3a1f] hover:bg-[#522b16] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
            🚀 {submitting ? 'กำลังส่งข้อมูล...' : 'ยื่นคำร้อง'}
          </button>
        </div>

      </form>
    </div>
  );
}