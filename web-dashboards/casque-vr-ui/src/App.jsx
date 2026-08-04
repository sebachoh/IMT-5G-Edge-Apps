import React, { useState, useEffect } from 'react';
import './index.css';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3010';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [connected, setConnected] = useState(false);
  const [tracking, setTracking] = useState({ pitch: 0, yaw: 0, roll: 0, latency: 0 });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('live_tracking', (data) => {
      setTracking(data);
    });

    // Mock telemetry for the mockup if backend isn't sending data yet
    const interval = setInterval(() => {
      if (connected) {
         setTracking(prev => ({
           pitch: (Math.random() * 20 - 10).toFixed(1),
           yaw: (Math.random() * 45 - 22.5).toFixed(1),
           roll: (Math.random() * 10 - 5).toFixed(1),
           latency: Math.floor(Math.random() * 4 + 2) // 2-5ms URLLC
         }));
      }
    }, 100);

    return () => {
      socket.close();
      clearInterval(interval);
    };
  }, [connected]);

  return (
    <>
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      {/* Header */}
      <header className="header">
        <div className="logo-section">
          {/* We will use placeholder text since the logo might not exist in this folder yet, but we'll try the same path as navette */}
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--imt-cyan)' }}>IMT</div>
          <div className="divider"></div>
          <span className="font-bold uppercase tracking-wide text-cyan">5G Edge Lab</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="status-badge">
            <div className={`status-dot ${connected ? 'active' : 'inactive'}`}></div>
            <span>{connected ? 'URLLC Tracking: LIVE' : 'Connecting to Headset...'}</span>
          </div>

          <button className="btn-theme" onClick={() => setIsDark(!isDark)}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem' }}>
          CasqueVR <span className="text-cyan">Dashboard</span>
        </h1>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Left Panel: Telemetry */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header text-blue">
            <span style={{ fontSize: '1.5rem' }}>🎯</span> Motion Tracking
          </div>
          
          <div className="data-card">
            <span className="data-label">Yaw (Rotación Z)</span>
            <span className="data-value text-cyan">{tracking.yaw}°</span>
          </div>
          
          <div className="data-card">
            <span className="data-label">Pitch (Inclinación Y)</span>
            <span className="data-value text-cyan">{tracking.pitch}°</span>
          </div>
          
          <div className="data-card">
            <span className="data-label">Roll (Inclinación X)</span>
            <span className="data-value text-cyan">{tracking.roll}°</span>
          </div>
        </div>

        {/* Center Panel: Video Feed */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header text-blue" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>👁️</span> Live Video Feed (eMBB)
            </div>
            <div className="status-badge" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
              <div className="status-dot active animate-pulse-glow"></div>
              <span>STREAMING</span>
            </div>
          </div>
          
          <div className="video-container" style={{ flexGrow: 1, border: '1px solid var(--border-light)' }}>
            <div className="video-overlay">eMBB | 4K 60FPS</div>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <p>Esperando conexión RTMP desde Media-Server...</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Network Status */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header text-blue">
            <span style={{ fontSize: '1.5rem' }}>📶</span> Network Status
          </div>
          
          <div className="data-card">
            <span className="data-label">URLLC Latency</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="data-value" style={{ color: tracking.latency < 5 ? '#10b981' : '#f59e0b' }}>
                {tracking.latency}
              </span>
              <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold' }}>ms</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', marginTop: '1rem', borderRadius: '2px' }}>
              <div style={{ width: `${Math.min((tracking.latency / 20) * 100, 100)}%`, height: '100%', background: tracking.latency < 5 ? '#10b981' : '#f59e0b', transition: 'width 0.2s', borderRadius: '2px' }}></div>
            </div>
          </div>

          <div className="data-card">
            <span className="data-label">Slice Activos</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold' }}>
                <span>eMBB (Video)</span>
                <span style={{ color: '#10b981' }}>OK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold' }}>
                <span>URLLC (Control)</span>
                <span style={{ color: '#10b981' }}>OK</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </>
  );
}

export default App;
