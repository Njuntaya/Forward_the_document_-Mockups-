import React from 'react'
import ReactDOM from 'react-dom/client'
import MainApp from './MainApp.jsx'
import './style.css' // หรือ index.css ตามที่มีในโปรเจกต์

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
)