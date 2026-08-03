import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

// Use environment variable for backend URL in production, fallback for local dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005';

function App() {
  const [socket, setSocket] = useState(null);
  const [robotConnected, setRobotConnected] = useState(false);
  const [telemetry, setTelemetry] = useState({ battery: 0, speed: 0, distance: 0 });
  const [activeCommand, setActiveCommand] = useState(null);

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
      // Basic parser for demonstration, assuming format like "B:80,S:50,D:120"
      if (data.raw) {
        try {
          // Fallback simple parsing for "B: 80%, S: 50, D: 120" or similar
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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      
      {/* Background glowing effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neonBlue rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse-fast"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neonPurple rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse-fast" style={{animationDelay: '1s'}}></div>

      <header className="mb-12 text-center z-10">
        <h1 className="text-5xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-neonBlue to-neonPurple drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
          NAVETTE COMMAND CENTER
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${robotConnected ? 'bg-green-400 text-green-400' : 'bg-red-500 text-red-500 animate-pulse'}`}></div>
          <span className="text-xl font-medium tracking-wide text-gray-300">
            {robotConnected ? 'URLLC Link Established' : 'Awaiting Connection...'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl z-10">
        
        {/* Telemetry Dashboard */}
        <div className="glass-panel p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-6 text-neonBlue border-b border-gray-700 pb-2">Live Telemetry</h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-lg uppercase tracking-wider">Battery</span>
              <div className="flex items-center gap-3">
                 <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-500" style={{width: `${telemetry.battery}%`}}></div>
                 </div>
                 <span className="font-mono text-2xl font-bold">{telemetry.battery}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-lg uppercase tracking-wider">Speed</span>
              <span className="font-mono text-4xl font-bold text-neonBlue">{telemetry.speed} <span className="text-lg text-gray-500">cm/s</span></span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-lg uppercase tracking-wider">Distance</span>
              <span className="font-mono text-3xl font-bold text-neonPurple">{telemetry.distance} <span className="text-lg text-gray-500">cm</span></span>
            </div>
          </div>
        </div>

        {/* Remote Control Panel */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center">
           <h2 className="text-2xl font-semibold mb-8 text-neonPurple border-b border-gray-700 pb-2 w-full text-center">Drive Controls (WASD)</h2>
           
           <div className="grid grid-cols-3 gap-4 w-64 h-64">
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
           
           <div className="mt-8 text-center text-gray-500 text-sm">
             Press <kbd className="bg-gray-800 px-2 py-1 rounded text-gray-300">Space</kbd> to Stop instantly
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
        w-full h-full flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-150 select-none
        ${active 
          ? 'bg-neonBlue/20 border-neonBlue text-neonBlue shadow-[0_0_20px_rgba(0,243,255,0.4)] scale-95' 
          : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-neonBlue/50 hover:bg-gray-700'
        }
      `}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

export default App;
