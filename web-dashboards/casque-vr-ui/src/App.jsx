import React, { useState, useEffect } from 'react';
import './index.css';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3010';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [connected, setConnected] = useState(false);
  const [tracking, setTracking] = useState({ pitch: 0, yaw: 0, roll: 0, latency: 0 });
  const [health, setHealth] = useState({ battery: 85, temp: 42, signal: -65 });
  const [network, setNetwork] = useState({ bandwidth: 45.2, jitter: 1.2, packetLoss: 0.01 });
  const [controllers, setControllers] = useState({ L_trigger: 0, R_trigger: 0 });
  
  const [videoConfig, setVideoConfig] = useState({ res: '4K', fps: 60 });
  const [calibrating, setCalibrating] = useState(false);

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

    // Mock complex telemetry
    const interval = setInterval(() => {
      if (connected) {
         setTracking(prev => ({
           pitch: (Math.random() * 20 - 10).toFixed(1),
           yaw: (Math.random() * 45 - 22.5).toFixed(1),
           roll: (Math.random() * 10 - 5).toFixed(1),
           latency: Math.floor(Math.random() * 4 + 2) // 2-5ms URLLC
         }));
         setHealth(prev => ({
           battery: prev.battery > 10 ? prev.battery - 0.01 : 100,
           temp: (42 + Math.random() * 2 - 1).toFixed(1),
           signal: Math.floor(-65 + Math.random() * 10 - 5)
         }));
         setNetwork({
           bandwidth: (45 + Math.random() * 10 - 5).toFixed(1),
           jitter: (1.2 + Math.random() * 0.5 - 0.25).toFixed(2),
           packetLoss: (0.01 + Math.random() * 0.02).toFixed(3)
         });
         setControllers({
           L_trigger: Math.random() > 0.8 ? 100 : 0,
           R_trigger: Math.random() > 0.7 ? 100 : 0
         });
      }
    }, 150);

    return () => {
      socket.close();
      clearInterval(interval);
    };
  }, [connected]);

  const handleCalibration = () => {
    setCalibrating(true);
    setTimeout(() => setCalibrating(false), 1500);
  };

  return (
    <>
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      {/* Header */}
      <header className="header" style={{ paddingBottom: '1rem' }}>
        <div className="logo-section">
          <img 
            src={isDark ? '/imt-logo-dark.png' : '/imt-logo-light.png'} 
            alt="IMT Logo" 
            className="logo-img" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="divider"></div>
          <span className="font-bold uppercase tracking-wide text-cyan" style={{ fontSize: '0.875rem' }}>5G Edge Lab</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="status-badge">
            <div className={`status-dot ${connected ? 'active' : 'inactive'}`}></div>
            <span>{connected ? 'LINK ACTIVE' : 'AWAITING LINK'}</span>
          </div>

          <button className="btn-theme" onClick={() => setIsDark(!isDark)}>
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
          CasqueVR <span className="text-cyan">Dashboard</span>
        </h1>
        <p style={{ color: '#64748b', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.875rem' }}>Remote Reality Control Center</p>
      </div>

      {/* Dashboard Grid - Extended Layout */}
      <div className="dashboard-grid">
        
        {/* === LEFT COLUMN === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Headset Health */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header text-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" /></svg>
              Hardware Health
            </div>
            <div className="data-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="data-label">Battery</span>
                <span className="data-value" style={{ fontSize: '1.25rem', color: health.battery > 20 ? '#10b981' : '#f43f5e' }}>{Math.floor(health.battery)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="data-label">Core Temp</span>
                <span className="data-value" style={{ fontSize: '1.25rem', color: health.temp < 50 ? '#10b981' : '#f59e0b' }}>{health.temp}°C</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="data-label">5G Signal (RSRP)</span>
                <span className="data-value" style={{ fontSize: '1.25rem' }}>{health.signal} dBm</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="glass-panel" style={{ padding: '1.5rem', flexGrow: 1 }}>
            <div className="panel-header text-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>
              IMU Telemetry
            </div>
            <div className="data-card" style={{ padding: '1rem' }}>
              <span className="data-label">Yaw (Z)</span>
              <span className="data-value text-cyan" style={{ fontSize: '1.75rem' }}>{tracking.yaw}°</span>
            </div>
            <div className="data-card" style={{ padding: '1rem' }}>
              <span className="data-label">Pitch (Y)</span>
              <span className="data-value text-cyan" style={{ fontSize: '1.75rem' }}>{tracking.pitch}°</span>
            </div>
            <div className="data-card" style={{ padding: '1rem' }}>
              <span className="data-label">Roll (X)</span>
              <span className="data-value text-cyan" style={{ fontSize: '1.75rem' }}>{tracking.roll}°</span>
            </div>
          </div>
        </div>

        {/* === CENTER COLUMN === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Video Feed */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header text-blue" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                Live View (eMBB)
              </div>
              <div className="status-badge" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                <div className="status-dot active animate-pulse-glow"></div>
                <span>STREAMING</span>
              </div>
            </div>
            
            <div className="video-container" style={{ flexGrow: 1, border: '1px solid var(--border-light)' }}>
              <div className="video-overlay">eMBB | {videoConfig.res} {videoConfig.fps}FPS</div>
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.3 }}>
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Esperando stream RTMP...</p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header text-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
              Media & URLLC Actions
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="data-card" style={{ padding: '1rem', margin: 0 }}>
                <span className="data-label">Video Quality (eMBB)</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className={`control-btn ${videoConfig.res === '1080p' ? 'active' : ''}`} onClick={() => setVideoConfig({...videoConfig, res: '1080p'})}>1080p</button>
                  <button className={`control-btn ${videoConfig.res === '4K' ? 'active' : ''}`} onClick={() => setVideoConfig({...videoConfig, res: '4K'})}>4K</button>
                  <button className={`control-btn ${videoConfig.fps === 90 ? 'active' : ''}`} onClick={() => setVideoConfig({...videoConfig, fps: 90})}>90FPS</button>
                </div>
              </div>
              
              <div className="data-card" style={{ padding: '1rem', margin: 0, justifyContent: 'center' }}>
                 <button 
                  onClick={handleCalibration}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none',
                    background: calibrating ? '#10b981' : 'var(--imt-blue)', color: '#fff',
                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}
                 >
                   {calibrating ? 'Calibrating...' : 'Recenter VR Tracking'}
                 </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* === RIGHT COLUMN === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Network Diagnostics */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header text-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>
              5G Diagnostics
            </div>
            
            <div className="data-card" style={{ padding: '1rem' }}>
              <span className="data-label">URLLC Latency</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span className="data-value" style={{ color: tracking.latency < 5 ? '#10b981' : '#f59e0b', fontSize: '2rem' }}>
                  {tracking.latency}
                </span>
                <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold' }}>ms</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--border-dark)', marginTop: '0.75rem', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((tracking.latency / 20) * 100, 100)}%`, height: '100%', background: tracking.latency < 5 ? '#10b981' : '#f59e0b', transition: 'width 0.2s' }}></div>
              </div>
            </div>

            <div className="data-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="data-label">Bandwidth (eMBB)</span>
                <span className="data-value" style={{ fontSize: '1.25rem' }}>{network.bandwidth} Mbps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="data-label">Jitter</span>
                <span className="data-value" style={{ fontSize: '1.25rem' }}>{network.jitter} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="data-label">Packet Loss</span>
                <span className="data-value" style={{ fontSize: '1.25rem', color: network.packetLoss < 0.05 ? '#10b981' : '#f43f5e' }}>{network.packetLoss}%</span>
              </div>
            </div>
          </div>

          {/* Controllers */}
          <div className="glass-panel" style={{ padding: '1.5rem', flexGrow: 1 }}>
            <div className="panel-header text-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a1.5 1.5 0 01-1.5 1.5H10.5m-3-12h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0" /></svg>
              Controllers (URLLC)
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
              <div className="data-card" style={{ flexGrow: 1, padding: '1rem', margin: 0, alignItems: 'center' }}>
                 <span className="data-label">L Trigger</span>
                 <div style={{ width: '40px', height: '100px', background: 'var(--border-light)', borderRadius: '20px', overflow: 'hidden', marginTop: '1rem', position: 'relative' }}>
                   <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${controllers.L_trigger}%`, background: 'var(--imt-cyan)', transition: 'height 0.1s' }}></div>
                 </div>
              </div>
              <div className="data-card" style={{ flexGrow: 1, padding: '1rem', margin: 0, alignItems: 'center' }}>
                 <span className="data-label">R Trigger</span>
                 <div style={{ width: '40px', height: '100px', background: 'var(--border-light)', borderRadius: '20px', overflow: 'hidden', marginTop: '1rem', position: 'relative' }}>
                   <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${controllers.R_trigger}%`, background: 'var(--imt-blue)', transition: 'height 0.1s' }}></div>
                 </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default App;
