function generateNormalData() {
    return {
        // Slice 1: eMBB
        slice1_eMBB: { throughput: Math.floor(Math.random() * 500) + 500, latency: Math.floor(Math.random() * 15) + 10, jitter: Math.floor(Math.random() * 5) + 1, packet_loss: (Math.random() * 0.1).toFixed(2), reliability: 99.9, connected_ues: 120 },
        // Slice 2: URLLC
        slice2_URLLC: { throughput: Math.floor(Math.random() * 50) + 100, latency: Math.floor(Math.random() * 2) + 1, jitter: Math.floor(Math.random() * 2), packet_loss: 0.00, reliability: 99.999, connected_ues: 20 },
        // Slice 3: mMTC
        slice3_mMTC: { throughput: Math.floor(Math.random() * 20) + 10, latency: Math.floor(Math.random() * 50) + 40, jitter: Math.floor(Math.random() * 20) + 5, packet_loss: (Math.random() * 2).toFixed(2), reliability: 98.5, connected_ues: 5000 },
        // Slice 4: V2X
        slice4_V2X: { throughput: Math.floor(Math.random() * 30) + 15, latency: Math.floor(Math.random() * 10) + 5, jitter: Math.floor(Math.random() * 3) + 1, packet_loss: (Math.random() * 0.01).toFixed(3), reliability: 99.99, connected_ues: 2500 }
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
