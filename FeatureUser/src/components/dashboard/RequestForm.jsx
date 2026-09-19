import { useState, useEffect } from 'react';

export default function RequestForm({ user, socket, onSuccess, editData }) {
  const [requestCategory, setRequestCategory] = useState('doc'); // 'doc' = เอกสารการศึกษา, 'building' = ปรับปรุงอาคาร
  
  // States สำหรับเอกสารการศึกษา
  const [docType, setDocType] = useState('หนังสือรับรองการเป็นนักศึกษา (ภาษาไทย)');
  const [copies, setCopies] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [note, setNote] = useState('');
  const [faculty, setFaculty] = useState('วิศวกรรมศาสตร์');
  const [yearLevel, setYearLevel] = useState('ปี 1');
  const [gpax, setGpax] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('self');
  const [address, setAddress] = useState('');
  const [slipImage, setSlipImage] = useState('');

  // States สำหรับแจ้งซ่อมปรับปรุงอาคาร
  const [repairCategory, setRepairCategory] = useState('ไฟฟ้า');
  const [buildingName, setBuildingName] = useState('อาคาร 1 (วิศวกรรมศาสตร์)');
  const [roomNumber, setRoomNumber] = useState('');
  const [issueDetail, setIssueDetail] = useState('');

  const [fieldFeedbacks, setFieldFeedbacks] = useState({});

  useEffect(() => {
    if (editData) {
      if (editData.category === 'building' || editData.docType?.includes('ปรับปรุงอาคาร')) {
        setRequestCategory('building');
        setRepairCategory(editData.repairCategory || 'ไฟฟ้า');
        setBuildingName(editData.buildingName || 'อาคาร 1');
        setRoomNumber(editData.roomNumber || '');
        setIssueDetail(editData.issueDetail || '');
      } else {
        setRequestCategory('doc');
        setDocType(editData.docType || 'หนังสือรับรองการเป็นนักศึกษา (ภาษาไทย)');
        setCopies(editData.copies || 1);
        setPurpose(editData.purpose || '');
        setNote(editData.note || '');
        setFaculty(editData.faculty || 'วิศวกรรมศาสตร์');
        setYearLevel(editData.yearLevel || 'ปี 1');
        setGpax(editData.gpax || '');
      }
      setPhone(editData.phone || '');
      setEmail(editData.email || '');
      setDeliveryMethod(editData.deliveryMethod || 'self');
      setAddress(editData.address || '');
      setSlipImage(editData.slipImage || editData.imageUrl || '');
      setFieldFeedbacks(editData.fieldFeedbacks || {});
    }
  }, [editData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🌟 ดึงข้อมูล User ให้ชัวร์ที่สุด (ป้องกันกรณี user เป็น null หรือไม่มี username)
    const currentStudentId = String(user?.username || '5555555555').trim();
    const currentStudentName = String(user?.name || 'นักศึกษา').trim();

    const payload = {
      studentId: currentStudentId,
      studentName: currentStudentName,
      category: requestCategory,
      phone,
      email,
      slipImage,
      fieldFeedbacks: {}
    };

    if (requestCategory === 'doc') {
      if (!purpose.trim()) {
        alert('กรุณากรอกวัตถุประสงค์ในการยื่นคำร้อง');
        return;
      }
      payload.docType = docType;
      payload.copies = copies;
      payload.purpose = purpose;
      payload.note = note;
      payload.faculty = faculty;
      payload.yearLevel = yearLevel;
      payload.gpax = gpax;
      payload.deliveryMethod = deliveryMethod;
      payload.address = address;
    } else {
      if (!issueDetail.trim()) {
        alert('กรุณากรอกรายละเอียดอาการชำรุด');
        return;
      }
      payload.docType = `แจ้งซ่อมปรับปรุงอาคาร (${repairCategory})`;
      payload.repairCategory = repairCategory;
      payload.buildingName = buildingName;
      payload.roomNumber = roomNumber;
      payload.issueDetail = issueDetail;
      payload.imageUrl = slipImage;
    }

    console.log("📤 Submitting request payload via Socket:", payload);

    if (socket) {
      socket.emit('submit_request', payload);
      alert('ส่งคำร้องสำเร็จเรียบร้อยแล้ว!');
      if (onSuccess) onSuccess();
    } else {
      alert('เกิดข้อผิดพลาด: ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  const getFieldStyle = (fieldKey) => {
    const hasError = fieldFeedbacks && fieldFeedbacks[fieldKey];
    if (hasError) {
      return {
        inputClass: 'w-full px-4 py-2.5 rounded-xl bg-red-50 border-2 border-red-400 text-xs font-semibold outline-none focus:ring-2 focus:ring-red-500 shadow-sm text-red-900',
        message: fieldFeedbacks[fieldKey]
      };
    }
    return {
      inputClass: 'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500',
      message: null
    };
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>📝</span> ยื่นคำร้องออนไลน์
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">เลือกหมวดหมู่และกรอกรายละเอียดคำร้องของคุณ</p>
        
        {editData && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold flex items-center gap-2">
            <span>⚠️</span> กำลังแก้ไขคำร้องเดิมที่ถูกตีกลับ (โปรดตรวจสอบจุดที่มีป้ายเตือนสีแดง)
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setRequestCategory('doc')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            requestCategory === 'doc' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📄 ขอเอกสารทางการศึกษา
        </button>
        <button
          type="button"
          onClick={() => setRequestCategory('building')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            requestCategory === 'building' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛠️ แจ้งซ่อมปรับปรุงอาคาร
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {requestCategory === 'doc' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทเอกสารที่ต้องการร้องขอ</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="หนังสือรับรองการเป็นนักศึกษา (ภาษาไทย)">หนังสือรับรองการเป็นนักศึกษา (ภาษาไทย)</option>
                <option value="หนังสือรับรองการเป็นนักศึกษา (ภาษาอังกฤษ)">หนังสือรับรองการเป็นนักศึกษา (ภาษาอังกฤษ)</option>
                <option value="ใบผลการศึกษา (Transcript ฉบับชั่วคราว)">ใบผลการศึกษา (Transcript ฉบับชั่วคราว)</option>
                <option value="ใบรับรองความประพฤติ">ใบรับรองความประพฤติ</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชั้นปี</label>
                {(() => {
                  const st = getFieldStyle('yearLevel');
                  return (
                    <div>
                      <input
                        type="text"
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                        className={st.inputClass}
                        placeholder="เช่น ปี 1"
                      />
                      {st.message && <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded">🚨 {st.message}</p>}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">GPAX (เกรดเฉลี่ยสะสม)</label>
                {(() => {
                  const st = getFieldStyle('gpax');
                  return (
                    <div>
                      <input
                        type="text"
                        value={gpax}
                        onChange={(e) => setGpax(e.target.value)}
                        className={st.inputClass}
                        placeholder="เช่น 3.50"
                      />
                      {st.message && <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded">🚨 {st.message}</p>}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">จำนวนฉบับ</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">วัตถุประสงค์ในการยื่นคำร้อง <span className="text-red-500">*</span></label>
              {(() => {
                const st = getFieldStyle('purpose');
                return (
                  <div>
                    <textarea
                      rows="2"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className={st.inputClass}
                      placeholder="เช่น เพื่อสมัครทุนการศึกษา / สมัครงาน"
                      required
                    />
                    {st.message && <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded">🚨 {st.message}</p>}
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">หมายเหตุเพิ่มเติม</label>
              {(() => {
                const st = getFieldStyle('note');
                return (
                  <div>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={st.inputClass}
                      placeholder="ระบุเพิ่มเติม (ถ้ามี)"
                    />
                    {st.message && <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded">🚨 {st.message}</p>}
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ช่องทางรับเอกสาร</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="self">🏢 รับด้วยตนเองที่สำนักทะเบียน</option>
                <option value="postal">📮 จัดส่งไปรษณีย์ EMS</option>
                <option value="edoc">💻 E-Document (รับทางอีเมล)</option>
              </select>
            </div>

            {deliveryMethod === 'postal' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ที่อยู่สำหรับจัดส่งไปรษณีย์ EMS</label>
                {(() => {
                  const st = getFieldStyle('address');
                  return (
                    <div>
                      <textarea
                        rows="2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={st.inputClass}
                        placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                      />
                      {st.message && <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded">🚨 {st.message}</p>}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทงานซ่อม</label>
                <select
                  value={repairCategory}
                  onChange={(e) => setRepairCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ไฟฟ้า">💡 ระบบไฟฟ้า / แสงสว่าง</option>
                  <option value="ประปา">🚰 ระบบประปา / ห้องน้ำ</option>
                  <option value="แอร์">❄️ เครื่องปรับอากาศ</option>
                  <option value="โครงสร้าง">🚪 อาคาร / ประตู / หน้าต่าง</option>
                  <option value="อื่นๆ">📌 อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">สถานที่ / อาคาร</label>
                <input
                  type="text"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="เช่น อาคาร 1, โรงอาหาร"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เลขที่ห้อง / บริเวณ</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="เช่น ห้อง 302 หรือโถงทางเดินชั้น 2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียดอาการชำรุด <span className="text-red-500">*</span></label>
              <textarea
                rows="3"
                value={issueDetail}
                onChange={(e) => setIssueDetail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ระบุปัญหาที่พบ เช่น หลอดไฟกระพริบ, ก๊อกน้ำรั่ว..."
                required
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
            {(() => {
              const st = getFieldStyle('phone');
              return (
                <div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={st.inputClass}
                    placeholder="0812345678"
                  />
                  {st.message && <p className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded">🚨 {st.message}</p>}
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="user@gmail.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">แนบรูปภาพประกอบ / หลักฐาน</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            />
            {slipImage && (
              <img src={slipImage} alt="พรีวิวรูปแนบ" className="w-full max-h-40 object-contain rounded-2xl border border-slate-200 bg-slate-50 p-2" />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
        >
          🚀 ส่งคำร้องขอเอกสาร
        </button>

      </form>
    </div>
  );
}