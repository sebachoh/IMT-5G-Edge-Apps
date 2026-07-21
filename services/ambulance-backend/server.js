require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.IO for real-time frontend connection (URLLC visualizer)
const io = new Server(server, {
  cors: {
    origin: "*", // Allow React to connect
    methods: ["GET", "POST"]
  }
});

// MQTT Configuration
// In local dev it connects to localhost. In Docker it will connect to 'mqtt://mqtt-broker:1883'
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://100.77.155.100:1883';
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log(`[TelemetryServer] Connected to MQTT Broker at ${MQTT_BROKER_URL}`);
  mqttClient.subscribe('sensor/vitals', (err) => {
    if (!err) console.log('[TelemetryServer] Subscribed to topic: sensor/vitals');
    else console.error('[TelemetryServer] MQTT Subscription Error:', err);
  });
});

// Listen for incoming MQTT messages and route them to Socket.IO clients
mqttClient.on('message', (topic, message) => {
  if (topic === 'sensor/vitals') {
    try {
      const data = JSON.parse(message.toString());
      // console.log(`[TelemetryServer] Received Vitals -> HR: ${data.hr}`);
      
      // Broadcast to all connected React Dashboards
      io.emit('vitals_update', data);
    } catch (e) {
      console.error('[TelemetryServer] Failed to parse MQTT message:', e);
    }
  }
});

io.on('connection', (socket) => {
  console.log(`[TelemetryServer] Dashboard UI Connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[TelemetryServer] Dashboard UI Disconnected: ${socket.id}`);
  });
});

// Start the Telemetry Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[TelemetryServer] URLLC Slice Telemetry Server running on port ${PORT}`);
});
