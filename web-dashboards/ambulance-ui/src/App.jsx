import React, { useState, useEffect } from 'react';
import { Activity, Heart, Droplet, RadioTower, Server, ShieldCheck, Sun, Moon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import VideoPlayer from './components/VideoPlayer';
import { io } from 'socket.io-client';

export default function App() {
  const [vitals, setVitals] = useState({ hr: '--', spo2: '--', sys: '--', dia: '--' });
  const [history, setHistory] = useState(Array(30).fill({ hr: 80 }));
  const [connected, setConnected] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Theme Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Socket Connection
  useEffect(() => {
    const socket = io('http://100.77.155.100:3001');
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('vitals_update', (data) => {
      setVitals(data);
      setHistory(prev => [...prev.slice(1), { hr: data.hr }]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8 flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex justify-between items-center glass-panel px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="transition-colors duration-500 flex items-center justify-center">
            <img 
              src={isDarkMode ? "/imt-logo-dark.png" : "/imt-logo-light.png"} 
              alt="IMT Nord Europe Logo" 
              className="h-10 w-auto object-contain transition-all duration-500" 
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-textMain transition-colors duration-500">Télémédecine IMT 5G</h1>
            <p className="text-sm text-textMuted transition-colors duration-500">Tableau de Bord du Nœud Edge</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Theme Toggle Slider */}
          <div className="flex items-center gap-3">
            <Sun size={18} className={`transition-colors ${!isDarkMode ? 'text-amber-500' : 'text-textMuted'}`} />
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative w-12 h-6 bg-[var(--color-border)] rounded-full outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
            >
              <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 shadow-md ${isDarkMode ? 'left-7 bg-gray-300' : 'left-1'}`} />
            </button>
            <Moon size={18} className={`transition-colors ${isDarkMode ? 'text-blue-400' : 'text-textMuted'}`} />
          </div>

          <div className="h-8 w-px bg-[var(--color-border)] mx-2 transition-colors duration-500"></div>

          <div className="flex gap-4 hidden sm:flex">
            <div className="flex items-center gap-2 glass-panel px-4 py-2 !rounded-full">
              <RadioTower size={16} className={connected ? "text-success" : "text-textMuted"} />
              <span className="text-sm font-medium text-textMain transition-colors duration-500">Cœur 5G {connected ? 'En ligne' : 'Hors ligne'}</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 !rounded-full">
              <Server size={16} className="text-primary" />
              <span className="text-sm font-medium text-textMain transition-colors duration-500">Serveur Edge</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Cameras Section */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="glass-panel p-4 flex-1 flex flex-col sm:flex-row gap-4 min-h-[400px]">
             <VideoPlayer streamUrl="http://100.77.155.100:8000/live/camera.flv" title="Caméra Principale" />
             <VideoPlayer streamUrl="http://100.77.155.100:8000/live/camera2.flv" title="Caméra Secondaire" />
          </div>
        </section>

        {/* Vitals Section */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart size={48} className="text-accent" />
              </div>
              <h3 className="text-textMuted text-sm font-medium mb-1 transition-colors duration-500">Fréquence Cardiaque</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-accent tracking-tighter">{vitals.hr}</span>
                <span className="text-textMuted font-medium transition-colors duration-500">bpm</span>
              </div>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Droplet size={48} className="text-primary" />
              </div>
              <h3 className="text-textMuted text-sm font-medium mb-1 transition-colors duration-500">Saturation O2</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary tracking-tighter">{vitals.spo2}</span>
                <span className="text-textMuted font-medium transition-colors duration-500">%</span>
              </div>
            </div>
            
            <div className="glass-panel p-6 col-span-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={48} className="text-textMain transition-colors duration-500" />
              </div>
              <h3 className="text-textMuted text-sm font-medium mb-1 transition-colors duration-500">Pression Artérielle</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-textMain tracking-tighter transition-colors duration-500">{vitals.sys}/{vitals.dia}</span>
                <span className="text-textMuted font-medium transition-colors duration-500">mmHg</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 flex-1 flex flex-col min-h-[250px]">
            <h3 className="text-textMuted text-sm font-medium mb-4 flex items-center gap-2 transition-colors duration-500">
               <ShieldCheck size={16} /> Tendance en Direct
            </h3>
            <div className="flex-1 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <YAxis domain={[60, 120]} hide />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="hr" 
                    stroke="#f43f5e" 
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-4 pb-2">
        <div className="flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity duration-500">
          <a href="https://imt-nord-europe.fr/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <img 
              src={isDarkMode ? "/footer-logo-dark.webp" : "/footer-logo-light.png"} 
              alt="Institut Mines-Télécom Nord Europe" 
              className="h-16 w-auto object-contain transition-transform hover:scale-105 duration-500"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
