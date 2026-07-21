import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MetricsProvider } from './context/MetricsContext';
import Dashboard from './pages/Dashboard';
import SliceDetail from './pages/SliceDetail';

import { useState, useEffect } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark mode class to body for scrollbar/background consistency
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('bg-[#0d1117]');
      document.body.classList.remove('bg-slate-50');
    } else {
      document.body.classList.add('bg-slate-50');
      document.body.classList.remove('bg-[#0d1117]');
    }
  }, [isDarkMode]);

  return (
    <MetricsProvider>
      <div className={isDarkMode ? 'dark' : ''}>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
            <Route path="/slice/:sliceId" element={<SliceDetail isDarkMode={isDarkMode} />} />
          </Routes>
        </Router>
      </div>
    </MetricsProvider>
  );
}

export default App;
