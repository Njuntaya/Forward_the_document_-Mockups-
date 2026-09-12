import { useState } from 'react';

export default function AdminAnnouncements({ announcements = [], socket, user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('กรุณากรอกหัวข้อและเนื้อหาประกาศให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    socket.emit('create_announcement', {
      title: title.trim(),
      content: content.trim(),
      author: user?.name || 'เจ้าหน้าที่ผู้ดูแลระบบ'
    });

    setTitle('');
    setContent('');
    setSubmitting(false);
    alert('เผยแพร่ประกาศประชาสัมพันธ์สำเร็จ!');
  };

  const handleDelete = (id) => {
    if (window.confirm('คุณต้องการลบประกาศนี้ใช่หรือไม่?')) {
      socket.emit('delete_announcement', id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">📢 จัดการประกาศประชาสัมพันธ์</h2>
        <p className="text-xs text-slate-400 mt-0.5">เพิ่มประกาศ ข่าวสาร หรือแจ้งเตือนให้นักศึกษาเห็นที่หน้าแรก</p>
      </div>

      {/* ฟอร์มเขียนประกาศ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>✍️</span> เขียนประกาศใหม่
        </h3>

        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">หัวข้อประกาศ <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="เช่น แจ้งกำหนดการยื่นคำร้อง หรือปิดปรับปรุงระบบ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">เนื้อหาประกาศ <span className="text-red-500">*</span></label>
            <textarea
              rows="4"
              placeholder="รายละเอียดประกาศประชาสัมพันธ์..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            🚀 เผยแพร่ประกาศทันที
          </button>
        </form>
      </div>

      {/* รายการประกาศทั้งหมดที่มีอยู่ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">📜 ประกาศที่มีอยู่ในระบบ ({announcements.length})</h3>

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีประกาศประชาสัมพันธ์ในระบบ</p>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">{ann.id}</span>
                    <span className="text-xs text-slate-400">{new Date(ann.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{ann.title}</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{ann.content}</p>
                  <p className="text-[10px] text-slate-400 pt-1">โดย: {ann.author}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(ann.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  🗑️ ลบ
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}