import { useState } from 'react';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';

// 1. โลโก้มหาวิทยาลัย (SVG)
function UniversityLogo() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="University logo">
      <path d="M40 4L8 16v22c0 20 13.5 36.5 32 42 18.5-5.5 32-22 32-42V16L40 4z" fill="url(#shield-grad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <path d="M40 12L16 22v16c0 15 9.5 27.5 24 32 14.5-4.5 24-17 24-32V22L40 12z" fill="rgba(255,255,255,0.08)" />
      <rect x="24" y="30" width="14" height="18" rx="2" fill="white" opacity="0.9" />
      <rect x="39" y="30" width="14" height="18" rx="2" fill="white" opacity="0.7" />
      <line x1="40" y1="30" x2="40" y2="48" stroke="#6b3a1f" strokeWidth="1.5" />
      <rect x="38" y="20" width="4" height="10" rx="1" fill="white" opacity="0.85" />
      <ellipse cx="40" cy="19" rx="4" ry="5" fill="url(#flame-grad)" />
      <circle cx="22" cy="24" r="2" fill="white" opacity="0.6" />
      <circle cx="58" cy="24" r="2" fill="white" opacity="0.6" />
      <defs>
        <linearGradient id="shield-grad" x1="40" y1="4" x2="40" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6b3a1f" />
          <stop offset="100%" stopColor="#3b1f0e" />
        </linearGradient>
        <linearGradient id="flame-grad" x1="40" y1="14" x2="40" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 2. ไอคอนเปิด/ปิด ตา สำหรับรหัสผ่าน
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// 3. ช่องกรอกข้อมูล Input Field (รองรับ Copy-Paste และ Auto Focus)
function InputField({ label, labelTh, type = "text", placeholder, value, onChange, icon, autoComplete }) {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className="input-group">
      <label className="flex items-baseline gap-2">
        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#6b3a1f" }}>{label}</span>
        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>{labelTh}</span>
      </label>
      <div
        className={`input-box ${focused ? 'focused' : ''}`}
        onClick={(e) => {
          const inputEl = e.currentTarget.querySelector('input');
          if (inputEl) inputEl.focus();
        }}
      >
        <span style={{ color: focused ? "#6b3a1f" : "#94a3b8", flexShrink: 0, pointerEvents: "none" }}>
          {icon}
        </span>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => e.stopPropagation()}
          className="input-field"
        />
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPass((v) => !v);
            }}
            style={{ color: "#94a3b8", cursor: "pointer", background: "none", border: "none", padding: 0 }}
            tabIndex={-1}
          >
            <EyeIcon open={showPass} />
          </button>
        )}
      </div>
    </div>
  );
}

// 4. Component หลัก LoginUI
export default function LoginUI({ role, setRole, username, setUsername, password, setPassword, loading, error, handleSubmit }) {
  // ควบคุมการเปิด/ปิด Pop-up Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  return (
    <div className="login-container">
      {/* ===== Left Panel ===== */}
      <div className="left-panel">
        <div className="left-panel-circle-1" />
        <div className="left-panel-circle-2" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0">
              <UniversityLogo />
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em" }}>มหาวิทยาลัย</p>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>เทคโนโลยีราชมงคล</h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>Rajamangala University of Technology</p>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>
              ระบบยื่นคำร้อง<br />
              <span style={{ color: "#fbbf24" }}>ขอเอกสาร</span>นักศึกษา
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", marginTop: "0.5rem" }}>Student Document Request System</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          {[
            { icon: "📄", th: "ขอเอกสารสำคัญทางการศึกษา", en: "Academic document requests" },
            { icon: "📬", th: "ติดตามสถานะคำร้องแบบเรียลไทม์", en: "Real-time request tracking" },
            { icon: "🔒", th: "ระบบปลอดภัยด้วยการยืนยันตัวตน", en: "Secure identity verification" },
          ].map((f) => (
            <div key={f.en} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: "rgba(255,255,255,0.1)" }}>
                {f.icon}
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>{f.th}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{f.en}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>© 2567 สำนักส่งเสริมวิชาการและงานทะเบียน · Academic Affairs Division</p>
        </div>
      </div>

      {/* ===== Right Panel ===== */}
      <div className="right-panel">
        <div className="flex lg:hidden flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14"><UniversityLogo /></div>
          <div className="text-center">
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#6b3a1f" }}>มหาวิทยาลัยเทคโนโลยีราชมงคล</h1>
            <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Student Document Request System</p>
          </div>
        </div>

        <div className="login-card">
          <div className="card-header">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.12)" }}>🎓</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>เข้าสู่ระบบ</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>Sign in to your account</p>
            </div>
          </div>

          {/* ปุ่มสลับสถานะ บทบาท (Role Selector) */}
          <div className="role-selector-wrapper">
            <div className="role-selector-bg">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`role-btn ${role === "user" ? "active" : ""}`}
              >
                🎓 นักศึกษา
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`role-btn ${role === "admin" ? "active" : ""}`}
              >
                🛡️ เจ้าหน้าที่
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-6 sm:px-8">
            <InputField
              label={role === "user" ? "รหัสนักศึกษา" : "ชื่อบัญชีเจ้าหน้าที่"}
              labelTh={role === "user" ? "Student ID" : "Staff Username"}
              placeholder={role === "user" ? "กรอกรหัสนักศึกษา (เช่น 660610001)" : "กรอกชื่อบัญชีเจ้าหน้าที่ (admin01)"}
              value={username}
              onChange={setUsername}
              autoComplete="username"
              icon={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <InputField
              label="รหัสผ่าน"
              labelTh="Password"
              type="password"
              placeholder="กรอกรหัสผ่าน (password123)"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              icon={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              }
            />

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="rounded" style={{ accentColor: "#8b4a24", width: 15, height: 15 }} />
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>จดจำการเข้าสู่ระบบ</span>
              </label>

              {/* ปุ่มเปิด Pop-up ลืมรหัสผ่าน */}
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ fontSize: "0.8rem", color: "#6b3a1f", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : `เข้าสู่ระบบ (${role === "user" ? "นักศึกษา" : "เจ้าหน้าที่"})`}
            </button>

            {/* ปุ่มเปิด Pop-up สมัครสมาชิกใหม่ (แสดงเฉพาะแท็บนักศึกษา) */}
            {role === "user" && (
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  ยังไม่มีบัญชีนักศึกษา?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    className="font-bold text-[#6b3a1f] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    สมัครสมาชิกใหม่ที่นี่
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ===== 5. โมดอลสมัครสมาชิก และ โมดอลลืมรหัสผ่าน ===== */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}