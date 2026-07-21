const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://100.77.155.100:1883');

client.on('connect', () => {
  console.log('Simulador MQTT conectado a 100.77.155.100:1883');
  setInterval(() => {
    const vitals = {
      hr: Math.floor(Math.random() * 20) + 70,
      spo2: Math.floor(Math.random() * 5) + 95,
      sys: Math.floor(Math.random() * 20) + 110,
      dia: Math.floor(Math.random() * 10) + 70
    };
    client.publish('sensor/vitals', JSON.stringify(vitals));
  }, 1000);
});
