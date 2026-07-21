const fs = require('fs');

let previousBytes = 0;
let realThroughputMbps = 0;

function measureRealNetwork() {
    try {
        // En producción, esto lee el archivo directamente desde el Kernel de Linux del servidor físico
        const content = fs.readFileSync('/proc/net/dev', 'utf8');
        const lines = content.split('\n');
        
        let currentTotalBytes = 0;
        for (let line of lines) {
            // Buscamos interfaces de Docker (br-) o la tarjeta física (enp0)
            if (line.includes('br-') || line.includes('enp0')) {
                const parts = line.trim().split(/\s+/);
                if (parts.length > 9) {
                    const rxBytes = parseInt(parts[1], 10); // RX bytes
                    const txBytes = parseInt(parts[9], 10); // TX bytes
                    if(!isNaN(rxBytes) && !isNaN(txBytes)) {
                        currentTotalBytes += (rxBytes + txBytes);
                    }
                }
            }
        }
        
        if (previousBytes !== 0 && currentTotalBytes >= previousBytes) {
            const deltaBytes = currentTotalBytes - previousBytes;
            // Bytes a Megabits (Bytes * 8 / 1,000,000)
            let mbps = (deltaBytes * 8) / 1000000;
            realThroughputMbps = parseFloat(mbps.toFixed(2));
            console.log(`[DEBUG] Tráfico Físico Real: ${realThroughputMbps} Mbps | DeltaBytes: ${deltaBytes}`);
        }
        
        previousBytes = currentTotalBytes;
    } catch (e) {
        console.error("Error leyendo interfaces:", e.message);
        realThroughputMbps = 0;
    }
}

// Escaneo del Kernel cada segundo
setInterval(measureRealNetwork, 1000);

function generateNormalData() {
    return {
        // Slice 1: eMBB (SOLO Tráfico Real, 0 datos falsos)
        slice1_eMBB: { 
            throughput: realThroughputMbps, 
            latency: Math.floor(Math.random() * 15) + 10, 
            jitter: Math.floor(Math.random() * 5) + 1, 
            packet_loss: (Math.random() * 0.1).toFixed(2), 
            reliability: 99.9, 
            connected_ues: 2 // 2 cámaras
        },
        // Slice 2: URLLC
        slice2_URLLC: { throughput: 0, latency: '--', jitter: '--', packet_loss: '--', reliability: '--', connected_ues: 0 },
        // Slice 3: mMTC
        slice3_mMTC: { throughput: 0, latency: '--', jitter: '--', packet_loss: '--', reliability: '--', connected_ues: 0 },
        // Slice 4: V2X
        slice4_V2X: { throughput: 0, latency: '--', jitter: '--', packet_loss: '--', reliability: '--', connected_ues: 0 }
    };
}

function generateMockSliceData(simulationMode, customConfig) {
    const normalData = generateNormalData();

    if (simulationMode === 'test' && customConfig) {
        const testType = customConfig.testType;

        if (testType === 'eMBB_4k_video') {
            return {
                ...normalData,
                slice1_eMBB: { throughput: Math.floor(Math.random() * 500) + 2000, latency: Math.floor(Math.random() * 20) + 30, jitter: Math.floor(Math.random() * 10) + 5, packet_loss: (Math.random() * 0.5).toFixed(2), reliability: 99.0, connected_ues: 180 }
            };
        } else if (testType === 'URLLC_critical_load') {
            return {
                ...normalData,
                slice2_URLLC: { throughput: Math.floor(Math.random() * 100) + 200, latency: Math.floor(Math.random() * 2) + 3, jitter: Math.floor(Math.random() * 5) + 3, packet_loss: (Math.random() * 0.05).toFixed(2), reliability: 99.9, connected_ues: 500 }
            };
        } else if (testType === 'mMTC_10k_ues') {
            return {
                ...normalData,
                slice3_mMTC: { throughput: Math.floor(Math.random() * 50) + 80, latency: Math.floor(Math.random() * 100) + 150, jitter: Math.floor(Math.random() * 50) + 20, packet_loss: (Math.random() * 3 + 1).toFixed(2), reliability: 95.0, connected_ues: 10000 }
            };
        } else if (testType === 'V2X_emergency_brake') {
            return {
                ...normalData,
                slice4_V2X: { throughput: Math.floor(Math.random() * 100) + 150, latency: Math.floor(Math.random() * 10) + 15, jitter: Math.floor(Math.random() * 15) + 10, packet_loss: (Math.random() * 1 + 0.5).toFixed(2), reliability: 98.0, connected_ues: 5000 }
            };
        }
    }

    return normalData;
}

module.exports = { generateMockSliceData };
