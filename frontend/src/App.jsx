import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Moon, BookOpen, Activity, Heart, Zap, ShieldAlert, Settings, Menu, X } from 'lucide-react';
import './index.css';

// Lazy load modules for better performance
const SleepModule = lazy(() => import('./components/SleepModule'));
const StudyModule = lazy(() => import('./components/StudyModule'));
const HealthModule = lazy(() => import('./components/HealthModule'));
const SettingsModule = lazy(() => import('./components/SettingsModule'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

import TerminalLog from './components/TerminalLog';
import { playSoothingAlarmTone, playInterfaceClick } from './utils/audioEngine';

// Loading Fallback Component
const LoadingHUD = () => (
  <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="spin" style={{ marginBottom: '1rem' }}><Zap size={40} color="var(--accent-blue)" /></div>
      <h2 style={{ color: 'white', letterSpacing: '2px' }}>CALIBRATING HUD...</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>SYNCING NEURAL NODES</p>
    </div>
  </div>
);

// Separate component to allow useNavigate hooks
const MainApp = ({ activeTab, setActiveTab, theme, setTheme, accentColor, setAccentColor, mobileMenuOpen, setMobileMenuOpen, distractionAlert, alarmRinging, setAlarmRinging, hudSettings, setHudSettings, trail }) => {
  const navigate = useNavigate();

  return (
    <div className={`app-container ${theme}-theme`}>
      <div className="mesh-bg"></div>
      {hudSettings.scanlines && <div className="hud-scanlines"></div>}
      
      {/* Neural Mouse Trail */}
      {trail.map((pos, i) => (
        <div key={i} className="mouse-trail" style={{ 
          left: `${pos.x}px`, 
          top: `${pos.y}px`, 
          opacity: (trail.length - i) / trail.length * 0.5,
          transform: `scale(${(trail.length - i) / trail.length})`,
          transition: `all ${i * 0.05}s ease-out`
        }}></div>
      ))}

      <div className="particles-container">
        {hudSettings.particles && [...Array(hudSettings.particleDensity)].map((_, i) => (
          <div key={i} className="particle" style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 5}s`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`
          }}></div>
        ))}
      </div>
      
      {/* Interface Mode Switcher (Top Right) */}
      <button 
         onClick={() => {
           setActiveTab('settings');
           navigate('/settings');
         }} 
         className={`settings-mode-btn ${activeTab === 'settings' ? 'active' : ''}`}
      >
        <Settings size={18} className={activeTab === 'settings' ? 'spin' : ''} strokeWidth={2.5} />
        <span>{activeTab === 'settings' ? 'Settings Active' : 'Settings Mode'}</span>
      </button>

      {/* Mobile Hamburger Toggle */}
      <button 
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Smart Life Optimizer Logo" />
          <span>Smart Life<br/><span className="brand-subtext">Optimizer</span></span>
        </div>

        <div className="creator-signature">
           <p className="mono">// creator</p>
           <p className="name">Sanidhya Sharma</p>
           <a href="mailto:sanidhyas015@gmail.com" className="email-tag">sanidhyas015@gmail.com</a>
        </div>

        <div className="nav-links">
          <Link to="/" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/sleep" className={`nav-item ${activeTab === 'sleep' ? 'active' : ''}`} onClick={() => { setActiveTab('sleep'); setMobileMenuOpen(false); }}>
            <Moon size={20} /> Sleep
          </Link>
          <Link to="/study" className={`nav-item ${activeTab === 'study' ? 'active' : ''}`} onClick={() => { setActiveTab('study'); setMobileMenuOpen(false); }}>
            <BookOpen size={20} /> Study
          </Link>
          <Link to="/health" className={`nav-item ${activeTab === 'health' ? 'active' : ''}`} onClick={() => { setActiveTab('health'); setMobileMenuOpen(false); }}>
            <Heart size={20} /> Health Add-on
          </Link>
          <div className="accent-chooser">
              {['#0ea5e9', '#a855f7', '#ec4899', '#10b981', '#f59e0b'].map(color => (
                <div 
                  key={color} 
                  onClick={() => setAccentColor(color)} 
                  className={`accent-dot ${accentColor === color ? 'accent-dot-active' : ''}`}
                  style={{ background: color }} 
                />
              ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <Link to="/settings" className={`nav-link-card settings-tile ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}>
            <div className="icon-container">
              <Settings size={22} className={activeTab === 'settings' ? 'spin' : ''} />
            </div>
            <div className="text-container">
              <span className="title">System Settings</span>
              <span className="subtitle">Interface Core</span>
            </div>
          </Link>
        </div>
        <TerminalLog />
      </nav>

      {/* Smart Alarm Full Screen Overlay */}
      {alarmRinging && (
        <div className="alarm-overlay">
          <div className="alarm-card floating">
            <div className="alarm-icon">⏰</div>
            <h1>Wake Up Sequence</h1>
            <p>It's time to execute your daily optimizations.</p>
            <button className="btn-primary" onClick={() => setAlarmRinging(false)}>Dismiss Notification</button>
          </div>
        </div>
      )}

      {/* Mind Distraction Overlay Notification */}
      {distractionAlert && (
          <div className="distraction-alert">
            <span>⚠️</span>
            <span>Mind Wandering Detected! You switched contexts. Stay focused.</span>
          </div>
      )}

      <Suspense fallback={<LoadingHUD />}>
        <Routes>
          <Route path="/" element={<Dashboard hudSettings={hudSettings} />} />
          <Route path="/sleep" element={<SleepModule />} />
          <Route path="/study" element={<StudyModule />} />
          <Route path="/health" element={<HealthModule />} />
          <Route path="/settings" element={<SettingsModule theme={theme} setTheme={setTheme} hudSettings={hudSettings} setHudSettings={setHudSettings} />} />
        </Routes>
      </Suspense>
      
      <Suspense fallback={null}>
        <AIAssistant />
      </Suspense>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [distractionAlert, setDistractionAlert] = useState(false);
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [accentColor, setAccentColor] = useState('#0ea5e9'); // Default blue
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [theme, setTheme] = useState('dark');
  const [hudSettings, setHudSettings] = useState({
    scanlines: true,
    particles: true,
    particleDensity: 40,
    audioFeedback: true,
    holographicStats: true
  });

  useEffect(() => {
    // Load persisted settings
    fetch('http://localhost:5001/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.theme) setTheme(data.theme);
        if (data.hud) setHudSettings(data.hud);
      })
      .catch(err => console.error("Failed to load settings", err));
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    fetch('http://localhost:5001/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme })
    }).catch(err => console.error("Failed to save theme", err));
  };

  const updateHudSettings = (newSettings) => {
    const updated = typeof newSettings === 'function' ? newSettings(hudSettings) : newSettings;
    setHudSettings(updated);
    fetch('http://localhost:5001/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hud: updated })
    }).catch(err => console.error("Failed to save HUD settings", err));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-blue', accentColor);
  }, [accentColor]);

  // Mouse Tracking for dynamic glow and cyber trail
  const [trail, setTrail] = useState(Array(8).fill({ x: 0, y: 0 }));

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
      
      setTrail(prev => {
        const newTrail = [...prev];
        newTrail.unshift({ x: e.clientX, y: e.clientY });
        newTrail.pop();
        return newTrail;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global Smart Alarm Interval Checker
  useEffect(() => {
    const timer = setInterval(() => {
      const alarmStr = localStorage.getItem('smartAlarm');
      if (alarmStr && !alarmRinging) {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMins = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMins}`;
        
        if (currentTime === alarmStr) {
           setAlarmRinging(true);
           playSoothingAlarmTone();
           localStorage.removeItem('smartAlarm'); // one-time execution
        }
      }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, [alarmRinging]);

  // Global Mind Distraction Monitor
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        setDistractionAlert(true);
        setTimeout(() => setDistractionAlert(false), 6000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <Router>
      <MainApp 
        activeTab={activeTab} setActiveTab={setActiveTab}
        theme={theme} setTheme={updateTheme}
        accentColor={accentColor} setAccentColor={setAccentColor}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        distractionAlert={distractionAlert}
        alarmRinging={alarmRinging} setAlarmRinging={setAlarmRinging}
        hudSettings={hudSettings} setHudSettings={updateHudSettings}
        trail={trail}
      />
    </Router>
  );
}

export default App;
