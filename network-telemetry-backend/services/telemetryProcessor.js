const fs = require('fs');
const axios = require('axios');

const FIRECELL_API_URL = 'http://172.27.163.2:5001';
let previousBytes = 0;
let edgeThroughputMbps = 0;
let coreThroughputDlMbps = 0;
let coreThroughputUlMbps = 0;

// ESTRATEGIA 1: Medición de Tráfico Físico Local en el Edge (MEC)
function measureEdgeNetwork() {
    try {
        const content = fs.readFileSync('/proc/net/dev', 'utf8');
        const lines = content.split('\n');
        
        let currentTotalBytes = 0;
        for (let line of lines) {
            // Analizar la interfaz física del Edge (enp0s25 o docker bridges)
            if (line.includes('enp0s25') || line.includes('br-')) {
                const parts = line.trim().split(/\s+/);
                if (parts.length > 9) {
                    const rxBytes = parseInt(parts[1], 10);
                    const txBytes = parseInt(parts[9], 10);
                    if (!isNaN(rxBytes) && !isNaN(txBytes)) {
                        currentTotalBytes += (rxBytes + txBytes);
                    }
                }
            }
        }
        
        if (previousBytes !== 0 && currentTotalBytes >= previousBytes) {
            const deltaBytes = currentTotalBytes - previousBytes;
            // Bits por segundo (Bytes * 8 / 1,000,000)
            let mbps = (deltaBytes * 8) / 1000000;
            edgeThroughputMbps = parseFloat(mbps.toFixed(2));
        }
        
        previousBytes = currentTotalBytes;
    } catch (e) {
        console.error("Error leyendo interfaces del Edge (/proc/net/dev):", e.message);
        edgeThroughputMbps = 0;
    }
}

// ESTRATEGIA 2: Consulta de Telemetría Real de la UPF en el Core 5G de Firecell
async function fetchCoreNetworkMetrics() {
    try {
        // Consultar el endpoint oficial de NMS para extraer el bitrate que pasa por el N3 (GTP-U)
        const response = await axios.get(`${FIRECELL_API_URL}/core/1/bitrates`, { timeout: 800 });
        if (response.data) {
            // El API de Firecell devuelve downlink y uplink en Kbps, los dividimos por 1000 para convertirlos a Mbps
            coreThroughputDlMbps = parseFloat(((response.data.downlink || 0) / 1000).toFixed(2));
            coreThroughputUlMbps = parseFloat(((response.data.uplink || 0) / 1000).toFixed(2));
        }
    } catch (e) {
        console.error("Error al consultar API del Core 5G (Firecell NMS):", e.message);
        // Si el Core está inaccesible o no devuelve datos, caemos a 0
        coreThroughputDlMbps = 0;
        coreThroughputUlMbps = 0;
    }
}

// Escaneo periódico de ambas fuentes
setInterval(measureEdgeNetwork, 1000);
setInterval(fetchCoreNetworkMetrics, 1000);

function generateNormalData() {
    const totalCoreThroughput = parseFloat((coreThroughputDlMbps + coreThroughputUlMbps).toFixed(2));
    
    return {
        // Slice 1: eMBB - Sincronizado directamente con las métricas del Core 5G (N3 GTP-U)
        slice1_eMBB: { 
            throughput: totalCoreThroughput, // Tráfico procesado en el túnel del Core 5G
            latency: Math.floor(Math.random() * 10) + 12, // Simulación realista de latencia eMBB
            jitter: Math.floor(Math.random() * 4) + 1,
            packet_loss: 0.00,
            reliability: 99.99,
            connected_ues: 2 
        },
        // Slices de control y telemetría secundaria
        slice2_URLLC: { throughput: 0, latency: '--', jitter: '--', packet_loss: '--', reliability: '--', connected_ues: 0 },
        slice3_mMTC: { throughput: 0, latency: '--', jitter: '--', packet_loss: '--', reliability: '--', connected_ues: 0 },
        slice4_V2X: { throughput: 0, latency: '--', jitter: '--', packet_loss: '--', reliability: '--', connected_ues: 0 },
        
        // Datos de validación cruzada: Tráfico medido en la interfaz del Edge Server
        validation_metrics: {
            edge_physical_throughput: edgeThroughputMbps,
            core_downlink: coreThroughputDlMbps,
            core_uplink: coreThroughputUlMbps
        }
    };
}

function processTelemetryData(simulationMode, customConfig) {
    const realData = generateNormalData();

    // Mantener la simulación de pruebas (test mode) para debugging del dashboard
    if (simulationMode === 'test' && customConfig) {
        const testType = customConfig.testType;

        if (testType === 'eMBB_4k_video') {
            return {
                ...realData,
                slice1_eMBB: { throughput: Math.floor(Math.random() * 50) + 80, latency: Math.floor(Math.random() * 5) + 8, jitter: Math.floor(Math.random() * 2) + 1, packet_loss: 0.00, reliability: 99.99, connected_ues: 2 }
            };
        } else if (testType === 'URLLC_critical_load') {
            return {
                ...realData,
                slice2_URLLC: { throughput: Math.floor(Math.random() * 5) + 10, latency: Math.floor(Math.random() * 2) + 3, jitter: Math.floor(Math.random() * 1) + 1, packet_loss: 0.00, reliability: 99.999, connected_ues: 1 }
            };
        }
    }

    return realData;
}

module.exports = { processTelemetryData };
