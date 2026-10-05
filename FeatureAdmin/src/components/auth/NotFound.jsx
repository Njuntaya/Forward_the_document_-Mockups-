import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-4">
        <div className="text-6xl animate-bounce">🔍</div>
        <h1 className="text-2xl font-extrabold text-slate-800">404 - ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          ขออภัยครับ เราไม่พบหน้าที่คุณกำลังค้นหา URL อาจจะไม่ถูกต้อง หรือหน้าเว็บนี้อาจถูกย้าย/ลบไปแล้ว
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md"
        >
          🏠 กลับสู่หน้าหลัก
        </button>
      </div>
    </div>
  );
}