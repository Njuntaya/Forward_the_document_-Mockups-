import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// นำเข้าไฟล์ Route ที่แยกไว้
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// 📌 ใช้งาน Route ที่แยกออกมา
app.use('/api', userRoutes);        // รองรับ /api/login, /api/users ฯลฯ
app.use('/api/requests', requestRoutes); // รองรับ /api/requests/...

// Socket.io connection ตามปกติ
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('submit_request', (payload) => {
    console.log('📥 [Backend] ได้รับข้อมูลคำร้องผ่าน Socket:', payload);
  });
});

server.listen(5000, () => {
  console.log('Backend Server running on http://localhost:5000');
});