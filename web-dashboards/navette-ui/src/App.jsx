import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

// Use environment variable for backend URL in production, fallback for local dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005';

function App() {
  const [socket, setSocket] = useState(null);
  const [robotConnected, setRobotConnected] = useState(false);
  const [telemetry, setTelemetry] = useState({ battery: 0, speed: 0, distance: 0 });
  const [activeCommand, setActiveCommand] = useState(null);
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend');
    });

    newSocket.on('robot_status', (data) => {
      setRobotConnected(data.connected);
    });

    newSocket.on('telemetry', (data) => {
      if (data.raw) {
        try {
          const bMatch = data.raw.match(/B:\s*(\d+)/i);
          const sMatch = data.raw.match(/S:\s*(\d+)/i);
          const dMatch = data.raw.match(/D:\s*(\d+)/i);
          
          setTelemetry(prev => ({
            battery: bMatch ? parseInt(bMatch[1]) : prev.battery,
            speed: sMatch ? parseInt(sMatch[1]) : prev.speed,
            distance: dMatch ? parseInt(dMatch[1]) : prev.distance
          }));
        } catch (e) {
          console.error("Failed to parse telemetry:", e);
        }
      }
    });

    return () => newSocket.close();
  }, []);

  const sendCommand = useCallback((action, speed = 100) => {
    if (socket && robotConnected) {
      socket.emit('drive', { action, speed });
      setActiveCommand(action);
    }
  }, [socket, robotConnected]);

  const handleStop = useCallback(() => {
    if (socket && robotConnected) {
      socket.emit('drive', { action: 'stop' });
      setActiveCommand(null);
    }
  }, [socket, robotConnected]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      
      switch(e.key.toLowerCase()) {
        case 'w': sendCommand('forward'); break;
        case 's': sendCommand('backward'); break;
        case 'a': sendCommand('left'); break;
        case 'd': sendCommand('right'); break;
        case ' ': handleStop(); break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      const keys = ['w', 's', 'a', 'd', ' '];
      if (keys.includes(e.key.toLowerCase())) {
         handleStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sendCommand, handleStop]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 sm:p-10 relative overflow-hidden font-sans w-full transition-colors duration-500">
      
      {/* Dynamic Background glowing effects */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-imtBlue dark:bg-imtBlue rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[200px] opacity-20 dark:opacity-10 transition-all duration-1000"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-imtCyan dark:bg-imtCyan rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[200px] opacity-20 dark:opacity-10 transition-all duration-1000" style={{animationDelay: '1s'}}></div>

      {/* Top Navigation Bar */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-8 z-20">
        <div className="flex items-center gap-4">
          <img 
            src={isDark ? '/imt-logo-dark.png' : '/imt-logo-light.png'} 
            alt="IMT Logo" 
            className="h-12 w-auto object-contain transition-all duration-300" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          <span className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium tracking-wide">5G Edge Lab</span>
        </div>
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all duration-300 group"
          title="Toggle Theme"
        >
          {isDark ? (
            <svg className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <header className="mb-12 text-center z-10 animate-float">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-white transition-all duration-500">
          Navette <span className="text-imtCyan">Dashboard</span>
        </h1>
        <div className="mt-4 inline-flex items-center justify-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className={`w-3 h-3 rounded-full ${robotConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'}`}></div>
          <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase">
            {robotConnected ? 'URLLC Link Active' : 'Awaiting Connection...'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl z-10">
        
        {/* Panel 1: Telemetry Dashboard */}
        <div className="glass-panel p-8 flex flex-col justify-center">
          <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
            <svg className="w-5 h-5 text-imtCyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Telemetry
          </h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Battery Level</span>
                <span className="font-mono text-lg font-bold text-slate-800 dark:text-white">{telemetry.battery}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-1000 ease-out" style={{width: `${telemetry.battery}%`}}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Speed</span>
                <div className="flex items-baseline gap-1 mt-auto">
                  <span className="font-mono text-3xl font-extrabold text-imtBlue dark:text-imtCyan">{telemetry.speed}</span>
                  <span className="text-xs font-semibold text-slate-400">cm/s</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Distance</span>
                <div className="flex items-baseline gap-1 mt-auto">
                  <span className="font-mono text-3xl font-extrabold text-imtCyan dark:text-imtBlue">{telemetry.distance}</span>
                  <span className="text-xs font-semibold text-slate-400">cm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Robot Visualizer */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3 w-full">
            <svg className="w-5 h-5 text-imtCyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Visualizer
          </h2>
          <RobotVisualizer activeCommand={activeCommand} />
        </div>

        {/* Panel 3: Remote Control Panel */}
        <div className="glass-panel p-8 flex flex-col items-center justify-between">
           <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-3 w-full">
              <svg className="w-5 h-5 text-imtCyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Drive Controls
           </h2>
           
           <div className="grid grid-cols-3 gap-3 w-full aspect-square max-w-[240px]">
              <div></div>
              <ControlButton 
                label="W" icon="▲" 
                active={activeCommand === 'forward'} 
                onPress={() => sendCommand('forward')} 
                onRelease={handleStop}
              />
              <div></div>
              
              <ControlButton 
                label="A" icon="◀" 
                active={activeCommand === 'left'} 
                onPress={() => sendCommand('left')} 
                onRelease={handleStop}
              />
              <ControlButton 
                label="S" icon="▼" 
                active={activeCommand === 'backward'} 
                onPress={() => sendCommand('backward')} 
                onRelease={handleStop}
              />
              <ControlButton 
                label="D" icon="▶" 
                active={activeCommand === 'right'} 
                onPress={() => sendCommand('right')} 
                onRelease={handleStop}
              />
           </div>
           
           <div className="mt-6 w-full">
             <button 
               onMouseDown={handleStop}
               onTouchStart={(e) => { e.preventDefault(); handleStop(); }}
               className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
               </svg>
               STOP (SPACE)
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function RobotVisualizer({ activeCommand }) {
  const getMoveStyle = () => {
    switch (activeCommand) {
      case 'forward': return { transform: 'translateY(-15px)' };
      case 'backward': return { transform: 'translateY(15px)' };
      case 'left': return { transform: 'translateX(-15px) rotate(-15deg)' };
      case 'right': return { transform: 'translateX(15px) rotate(15deg)' };
      default: return { transform: 'translate(0, 0)' };
    }
  };

  const getActiveColor = () => document.documentElement.classList.contains('dark') ? '#00a3e0' : '#004c8f';
  const getInactiveColor = () => document.documentElement.classList.contains('dark') ? '#334155' : '#cbd5e1';

  return (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUwLCAxNTAsIDE1MCwgMC4yKSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20"></div>
      
      <div className={`absolute top-3 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${activeCommand === 'forward' ? 'text-imtCyan animate-pulse' : 'text-slate-300 dark:text-slate-600'}`}>Front</div>
      <div className={`absolute bottom-3 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${activeCommand === 'backward' ? 'text-imtCyan animate-pulse' : 'text-slate-300 dark:text-slate-600'}`}>Rear</div>
      
      <div className="transition-all duration-500 ease-out z-10" style={getMoveStyle()}>
        <svg width="80" height="120" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wheels */}
          <rect x="5" y="25" width="20" height="35" rx="6" fill={activeCommand === 'left' || activeCommand === 'forward' ? getActiveColor() : getInactiveColor()} className="transition-colors duration-300"/>
          <rect x="95" y="25" width="20" height="35" rx="6" fill={activeCommand === 'right' || activeCommand === 'forward' ? getActiveColor() : getInactiveColor()} className="transition-colors duration-300"/>
          <rect x="5" y="120" width="20" height="35" rx="6" fill={activeCommand === 'left' || activeCommand === 'backward' ? getActiveColor() : getInactiveColor()} className="transition-colors duration-300"/>
          <rect x="95" y="120" width="20" height="35" rx="6" fill={activeCommand === 'right' || activeCommand === 'backward' ? getActiveColor() : getInactiveColor()} className="transition-colors duration-300"/>
          
          {/* Chassis Base */}
          <rect x="20" y="15" width="80" height="150" rx="16" fill="currentColor" className="text-slate-300 dark:text-slate-700 transition-colors duration-300"/>
          {/* Chassis Top Detail */}
          <rect x="30" y="30" width="60" height="120" rx="8" fill="currentColor" className="text-slate-200 dark:text-slate-600 transition-colors duration-300"/>
          
          {/* Active Indicators */}
          <path d="M60 40 L45 55 L75 55 Z" fill={activeCommand === 'forward' ? getActiveColor() : 'transparent'} className="transition-colors duration-300"/>
          <path d="M60 140 L45 125 L75 125 Z" fill={activeCommand === 'backward' ? getActiveColor() : 'transparent'} className="transition-colors duration-300"/>
        </svg>
      </div>
    </div>
  );
}

function ControlButton({ label, icon, active, onPress, onRelease }) {
  return (
    <button
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(); }}
      className={`
        w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-150 select-none shadow-sm
        ${active 
          ? 'bg-imtBlue/10 dark:bg-imtCyan/20 border-imtBlue dark:border-imtCyan text-imtBlue dark:text-imtCyan scale-95' 
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-imtBlue/50 dark:hover:border-imtCyan/50 hover:bg-slate-50 dark:hover:bg-slate-750 hover:shadow-md hover:-translate-y-1'
        }
      `}
    >
      <span className="text-2xl mb-1 font-black">{icon}</span>
      <span className="text-xs font-bold tracking-widest">{label}</span>
    </button>
  );
}

export default App;
