import { useState } from "react";
import axios from "axios";
import LoginUI from "./components/auth/LoginUi";

export default function MainApp() {
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("กรุณากรอกรหัสนักศึกษาและรหัสผ่าน");
      return;
    }

    setLoading(true);

    try {
      // สำหรับฝั่งนักศึกษา บังคับ role เป็น 'user' และ allowedRole เป็น 'user'
      const res = await axios.post("http://localhost:5000/api/login", {
        username: username.trim(),
        password: password.trim(),
        role: "user",
        allowedRole: "user",
      });

      setLoading(false);
      if (res.data.success) {
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  if (currentUser) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#6b3a1f]">✅ เข้าสู่ระบบสำเร็จ</h2>
          <p className="mt-2 text-slate-600">ยินดีต้อนรับ: <b>{currentUser.name}</b></p>
          <p className="text-sm text-slate-500">รหัสนักศึกษา: {currentUser.username}</p>
          <button
            onClick={() => setCurrentUser(null)}
            className="mt-6 w-full py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-md transition-colors cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoginUI
      role={role}
      setRole={setRole}
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      loading={loading}
      error={error}
      handleSubmit={handleSubmit}
    />
  );
}