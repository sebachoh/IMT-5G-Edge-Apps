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
            <span>{connected ? 'URLLC Tracking: LIVE' : 'Awaiting Link...'}</span>
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          CasqueVR <span className="text-cyan">Dashboard</span>
        </h1>
        <p style={{ color: '#64748b', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.875rem' }}>eMBB Video & URLLC Tracking Interface</p>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Left Panel: Telemetry */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header text-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
            </svg>
            Motion Tracking
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              Live Video Feed (eMBB)
            </div>
            <div className="status-badge" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
              <div className="status-dot active animate-pulse-glow"></div>
              <span>STREAMING</span>
            </div>
          </div>
          
          <div className="video-container" style={{ flexGrow: 1, border: '1px solid var(--border-light)' }}>
            <div className="video-overlay">eMBB | 4K 60FPS</div>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.3 }}>
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Esperando conexión RTMP desde Media-Server...</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Network Status */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header text-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
            Network Status
          </div>
          
          <div className="data-card">
            <span className="data-label">URLLC Latency</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="data-value" style={{ color: tracking.latency < 5 ? '#10b981' : '#f59e0b' }}>
                {tracking.latency}
              </span>
              <span style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 'bold' }}>ms</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border-dark)', marginTop: '1.25rem', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((tracking.latency / 20) * 100, 100)}%`, height: '100%', background: tracking.latency < 5 ? '#10b981' : '#f59e0b', transition: 'width 0.2s' }}></div>
            </div>
          </div>

          <div className="data-card">
            <span className="data-label" style={{ marginBottom: '1rem' }}>Active Slices</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: '600' }}>
                <span>eMBB (Video)</span>
                <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>OK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: '600' }}>
                <span>URLLC (Control)</span>
                <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>OK</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </>
  );
}

export default App;
