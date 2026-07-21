const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateMockSliceData } = require('./services/dataGenerator');

const app = express();

// Seguridad: Restringir CORS exclusivamente al Dashboard de React y entorno local
const ALLOWED_ORIGINS = ['http://100.77.155.100', 'http://localhost', 'http://100.77.155.100:8080', 'http://localhost:8080', 'http://localhost:5173'];
app.use(cors({ origin: ALLOWED_ORIGINS }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"]
    }
});

// Estado global de simulación
let simulationMode = 'normal';
let customConfig = null;
let intervalId = null;
const historyCache = []; // Cache to store the last 24h of data points

// Lógica de Sockets separada
io.on('connection', (socket) => {
    console.log('🟢 Nuevo Network Dashboard conectado:', socket.id);
    
    // Send history to new clients immediately
    socket.emit('history_sync', historyCache);

    socket.on('set_simulation_mode', (config) => {
        console.log(`⚡ Cambio de modo de simulación a: ${config.mode}`);
        simulationMode = config.mode;
        if (config.mode === 'test') {
            customConfig = config.params;
        }
    });

    socket.on('set_interval', (ms) => {
        if(ms < 100) ms = 100; // Seguridad: prevenir DDoS interno
        console.log(`⏱️ Cambio de intervalo de emisión a: ${ms} ms`);
        clearInterval(intervalId);
        startTelemetry(ms);
    });

    socket.on('disconnect', () => console.log('🔴 Dashboard desconectado:', socket.id));
});

function startTelemetry(intervalMs = 1000) {
    if(intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        const data = generateMockSliceData(simulationMode, customConfig);
        data.timestamp = Date.now();
        
        historyCache.push(data);
        if (historyCache.length > 86400) historyCache.shift(); // Max 24h of 1s ticks

        io.emit('slices_metrics', data);
    }, intervalMs);
}

// Iniciar latido inicial
startTelemetry(1000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Network Telemetry Backend corriendo en puerto ${PORT}`);
});
