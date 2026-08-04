const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS for the UI
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3010;

app.get('/health', (req, res) => {
  res.send({ status: 'ok', service: 'casque-vr-backend' });
});

io.on('connection', (socket) => {
  console.log(`[CasqueVR] New connection: ${socket.id}`);

  // Emulate or receive VR headset tracking
  socket.on('vr_telemetry', (data) => {
    // Expected data: { pitch, yaw, roll, x, y, z, latency }
    // Broadcast to UI dashboards
    io.emit('live_tracking', data);
  });

  socket.on('disconnect', () => {
    console.log(`[CasqueVR] Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[CasqueVR] Backend listening on port ${PORT}`);
});
