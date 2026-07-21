const NodeMediaServer = require('node-media-server');

// NMS Configuration
// We expose RTMP on port 1935 (for the 5G cameras/ffmpeg)
// We expose HTTP-FLV on port 8000 (for the React Frontend)
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*', // Extremely important for React CORS
    mediaroot: './media' // Temporary folder for chunks
  }
};

const nms = new NodeMediaServer(config);

nms.on('preConnect', (id, args) => {
  console.log(`[MediaServer] New RTMP Connection: ID ${id}`);
});

nms.on('doneConnect', (id, args) => {
  console.log(`[MediaServer] RTMP Connection Closed: ID ${id}`);
});

nms.run();
console.log('[MediaServer] eMBB Slice Media Server is starting on RTMP:1935 and HTTP:8000');
