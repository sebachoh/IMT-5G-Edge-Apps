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
      // Basic parser for demonstration
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
      if (e.repeat) return; // Prevent multiple triggers while holding
      
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
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-imtBlue dark:bg-neonBlue rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-30 dark:opacity-20 animate-pulse-fast transition-all duration-1000"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-imtCyan dark:bg-neonPurple rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-30 dark:opacity-20 animate-pulse-fast transition-all duration-1000" style={{animationDelay: '1s'}}></div>

      {/* Top Navigation Bar */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-8 z-20">
        <div className="flex items-center gap-4">
          <img 
            src={isDark ? '/imt-logo-dark.png' : '/imt-logo-light.png'} 
            alt="IMT Logo" 
            className="h-12 w-auto object-contain transition-all duration-300" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
          <span className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium tracking-wide">5G Edge Lab</span>
        </div>
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-full bg-white dark:bg-[#1a1a24] shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-700 hover:scale-110 transition-all duration-300 group"
          title="Toggle Theme"
        >
          {isDark ? (
            <svg className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <header className="mb-14 text-center z-10 animate-float">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-neonBlue dark:to-neonPurple dark:drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-500">
          NAVETTE DASHBOARD
        </h1>
        <div className="mt-6 inline-flex items-center justify-center gap-3 bg-white/60 dark:bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className={`w-3.5 h-3.5 rounded-full ${robotConnected ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse'}`}></div>
          <span className="text-sm sm:text-base font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase">
            {robotConnected ? 'URLLC Link Active' : 'Awaiting Connection...'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl z-10">
        
        {/* Telemetry Dashboard */}
        <div className="glass-panel p-8 sm:p-10 flex flex-col justify-center relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-8 text-slate-800 dark:text-neonBlue flex items-center gap-3">
            <svg className="w-6 h-6 text-imtBlue dark:text-neonBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Live Telemetry
          </h2>
          
          <div className="space-y-8">
            <div className="bg-slate-100/50 dark:bg-black/20 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold uppercase tracking-widest">Battery Level</span>
                <span className="font-mono text-xl font-bold text-slate-800 dark:text-white">{telemetry.battery}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-1000 ease-out relative" style={{width: `${telemetry.battery}%`}}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-100/50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Speed</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-imtBlue dark:text-neonBlue">{telemetry.speed}</span>
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">cm/s</span>
                </div>
              </div>

              <div className="bg-slate-100/50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Distance</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-imtCyan dark:text-neonPurple">{telemetry.distance}</span>
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">cm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remote Control Panel */}
        <div className="glass-panel p-8 sm:p-10 flex flex-col items-center justify-center relative">
           <div className="absolute inset-0 bg-gradient-to-tl from-transparent to-black/5 dark:to-white/5 rounded-3xl pointer-events-none"></div>
           
           <h2 className="text-xl sm:text-2xl font-bold mb-10 text-slate-800 dark:text-neonPurple flex items-center gap-3 w-full justify-center">
              <svg className="w-6 h-6 text-imtCyan dark:text-neonPurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Drive Controls
           </h2>
           
           <div className="grid grid-cols-3 gap-3 sm:gap-5 w-64 h-64 sm:w-72 sm:h-72">
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
           
           <div className="mt-10 text-center">
             <button 
               onMouseDown={handleStop}
               onTouchStart={(e) => { e.preventDefault(); handleStop(); }}
               className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-full shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center gap-2"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
               </svg>
               EMERGENCY STOP (SPACE)
             </button>
           </div>
        </div>

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
          ? 'bg-imtBlue/10 dark:bg-neonBlue/20 border-imtBlue dark:border-neonBlue text-imtBlue dark:text-neonBlue shadow-[0_0_20px_rgba(0,163,224,0.3)] dark:shadow-[0_0_20px_rgba(0,243,255,0.4)] scale-[0.92]' 
          : 'bg-white dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:border-imtBlue/50 dark:hover:border-neonBlue/50 hover:bg-slate-50 dark:hover:bg-gray-750 hover:shadow-md hover:-translate-y-1'
        }
      `}
    >
      <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 font-black">{icon}</span>
      <span className="text-xs sm:text-sm font-bold tracking-widest">{label}</span>
    </button>
  );
}

export default App;
