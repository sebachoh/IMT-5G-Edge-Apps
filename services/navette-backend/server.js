const net = require('net');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 3005;
const ROBOT_IP = process.env.ROBOT_IP || '192.168.1.100'; // Replace with actual
const ROBOT_PORT = process.env.ROBOT_PORT || 2000;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let robotSocket = null;
let isRobotConnected = false;

function connectToRobot() {
  if (robotSocket) {
    robotSocket.destroy();
  }

  console.log(`Attempting to connect to robot at ${ROBOT_IP}:${ROBOT_PORT}`);
  robotSocket = new net.Socket();

  robotSocket.connect(ROBOT_PORT, ROBOT_IP, () => {
    console.log('Connected to RP6 Robot WiFi Module');
    isRobotConnected = true;
    
    // Wake up sequence
    robotSocket.write('');
    setTimeout(() => {
        robotSocket.write('cmd\n');
    }, 100);
    
    io.emit('robot_status', { connected: true });
  });

  robotSocket.on('data', (data) => {
    const text = data.toString('ascii');
    // Parse the telemetry here. Assuming some simple format for now.
    // Example: "B: 80%, S: 50, D: 120"
    io.emit('telemetry', { raw: text });
  });

  robotSocket.on('close', () => {
    console.log('Connection to robot closed');
    isRobotConnected = false;
    io.emit('robot_status', { connected: false });
    // Auto-reconnect
    setTimeout(connectToRobot, 5000);
  });

  robotSocket.on('error', (err) => {
    console.error('Robot TCP Socket Error:', err.message);
    // Auto-reconnect will be handled by 'close' event which usually follows an error
  });
}

io.on('connection', (socket) => {
  console.log('Frontend connected via Socket.io');
  socket.emit('robot_status', { connected: isRobotConnected });

  socket.on('drive', (cmd) => {
    if (!isRobotConnected || !robotSocket) {
        console.warn('Cannot send command, robot not connected');
        return;
    }
    
    let robotCmd = '';
    const speed = cmd.speed || 100;

    switch (cmd.action) {
        case 'forward':
            robotCmd = `f\n${speed}`;
            break;
        case 'backward':
            robotCmd = `b\n${speed}`;
            break;
        case 'left':
            robotCmd = `l\n${speed}`;
            break;
        case 'right':
            robotCmd = `r\n${speed}`;
            break;
        case 'stop':
            robotCmd = `s\n`;
            break;
        default:
            console.log('Unknown command', cmd.action);
            return;
    }

    if (robotCmd) {
        robotSocket.write(robotCmd);
        console.log(`Sent to robot: ${robotCmd.replace('\n', '\\n')}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Frontend disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Navette Backend listening on port ${PORT}`);
  connectToRobot();
});
