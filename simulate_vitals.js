const mqtt = require('mqtt');
// Connect to the local edge broker (or update to remote Edge IP when deploying)
const client = mqtt.connect('mqtt://172.27.163.24:1883');

// Medical Patient Baseline (Healthy Adult)
let patientState = {
  hr: 75,       // Heart Rate (BPM)
  spo2: 98,     // Blood Oxygen (%)
  sys: 120,     // Systolic BP (mmHg)
  dia: 80,      // Diastolic BP (mmHg)
  resp: 16,     // Respiratory Rate (breaths/min)
  temp: 36.6,   // Temperature (Celsius)
  ecgPhase: 0   // For generating ECG wave
};

// Smooth Random Walk Generator
function smoothRandomWalk(current, min, max, maxStep) {
  let step = (Math.random() - 0.5) * 2 * maxStep;
  let next = current + step;
  if (next > max) return max;
  if (next < min) return min;
  return next;
}

// Generate an ECG-like wave (PQRST complex approximation)
function generateEcgWave(phase) {
  // A simple mathematical approximation for an ECG signal
  let ecg = Math.sin(phase) * 0.1;
  // QRS Complex
  if (phase % (2 * Math.PI) > 0 && phase % (2 * Math.PI) < 0.5) {
      ecg += Math.sin((phase % (2 * Math.PI)) * 12) * 1.5; 
  }
  return parseFloat(ecg.toFixed(3));
}

client.on('connect', () => {
  console.log('🚑 [Ambulance IoT Simulator] Connected to MQTT Broker.');
  console.log('📡 Transmitting advanced telemetry on Slice 3 (mMTC)...');

  // Transmit high-frequency data (e.g. ECG) and vital signs
  setInterval(() => {
    // 1. Update Vitals with natural smooth physiological drifts
    patientState.hr = smoothRandomWalk(patientState.hr, 60, 100, 1.5);
    patientState.spo2 = smoothRandomWalk(patientState.spo2, 92, 100, 0.5);
    patientState.sys = smoothRandomWalk(patientState.sys, 110, 140, 2);
    patientState.dia = smoothRandomWalk(patientState.dia, 70, 90, 1);
    patientState.resp = smoothRandomWalk(patientState.resp, 12, 20, 0.5);
    patientState.temp = smoothRandomWalk(patientState.temp, 36.5, 37.5, 0.05);

    // 2. Generate Continuous ECG Signal Array (10 samples per packet to simulate high frequency)
    let ecgBatch = [];
    let frequency = (patientState.hr / 60) * 2 * Math.PI; // Adjust ECG speed to Heart Rate
    for (let i = 0; i < 10; i++) {
        patientState.ecgPhase += frequency * 0.01; // 10ms step
        ecgBatch.push(generateEcgWave(patientState.ecgPhase));
    }

    // 3. Construct HL7-like JSON Payload
    const payload = {
      timestamp: new Date().toISOString(),
      patient_id: "AMB-01-PATIENT",
      vitals: {
        heart_rate: Math.round(patientState.hr),
        blood_oxygen_spo2: Math.round(patientState.spo2),
        blood_pressure: {
          systolic: Math.round(patientState.sys),
          diastolic: Math.round(patientState.dia)
        },
        respiratory_rate: Math.round(patientState.resp),
        temperature_c: parseFloat(patientState.temp.toFixed(1))
      },
      ecg_wave: ecgBatch,
      device_status: {
        battery_level: 85,
        network_slice: "SST:3 (mMTC)",
        signal_strength: "Excellent"
      }
    };

    // 4. Publish to Edge Server
    client.publish('sensor/vitals', JSON.stringify(payload));
  }, 100); // 100ms transmission rate (High telemetry rate for 5G testing)
});

client.on('error', (err) => {
  console.error('MQTT Connection Error:', err);
});
