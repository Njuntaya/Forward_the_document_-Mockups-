import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './MainApp'; // 📌 เรียกใช้ MainApp ที่คุณเขียนระบบอ่าน JSON ไว้
import './style.css'; // ถ้ามีการเรียกใช้ CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);