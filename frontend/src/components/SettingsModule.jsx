import React, { useState, useEffect } from 'react';
import { AlertCircle, Palette, Zap, Power, Monitor, Wind, Volume2, Shield } from 'lucide-react';

const SettingsModule = ({ theme, setTheme, hudSettings, setHudSettings }) => {
  // ECE Features State migrated from Study Module
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [wpm, setWpm] = useState(0);
  const [lastTypedTime, setLastTypedTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState([]);

  // ECE: Audio Noise Detection
  const startNoiseDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      setIsMicActive(true);

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setNoiseLevel(average);

        if (average > 80 && Notification.permission === 'granted') {
           new Notification('Noisy Environment!', { body: 'Background noise detected. Find a quieter place to study.'});
        }
        requestAnimationFrame(checkAudio);
      };
      checkAudio();
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  // ECE: Typing analysis & Response Time
  const handleTyping = (e) => {
    const val = e.target.value;
    const now = Date.now();
    const diff = now - lastTypedTime;
    
    if (diff > 50 && diff < 2000) { 
       setResponseTimes(prev => [...prev.slice(-49), diff]);
    }
    
    setLastTypedTime(now);
    setTypingText(val);

    const words = val.length / 5;
    const minutes = Math.max(0.1, (responseTimes.reduce((a, b) => a + b, 0) / 1000) / 60);
    setWpm(Math.round(words / minutes) || 0);
  };

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>System Configuration ⚙️</h1>
          <p>Personalize your experience and calibrate advanced environmental sensors.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Theme Settings */}
        <div className="glass-card widget-study">
          <div className="widget-header">
            <Palette size={20} color="var(--accent-pink)" />
            <h3>Aesthetic Interface Theme</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => setTheme('dark')} className={`btn-primary ${theme === 'dark' ? 'active-theme' : ''}`} style={{ background: theme === 'dark' ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--glass-border)', color: 'var(--text-primary)' }}>Midnight Deep</button>
            <button onClick={() => setTheme('light')} className={`btn-primary ${theme === 'light' ? 'active-theme' : ''}`} style={{ background: theme === 'light' ? 'linear-gradient(135deg, #f8fafc, #e2e8f0)' : 'var(--glass-border)', color: theme === 'light' ? '#0f172a' : 'var(--text-primary)' }}>Frost Light</button>
            <button onClick={() => setTheme('neon')} className={`btn-primary ${theme === 'neon' ? 'active-theme' : ''}`} style={{ background: theme === 'neon' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'var(--glass-border)', color: theme === 'neon' ? '#ffffff' : 'var(--text-primary)' }}>Smart Neon</button>
          </div>
        </div>

        {/* ECE Features: Noise & Typing Analysis */}
        <div className="glass-card widget-insights">
          <div className="widget-header">
            <Zap size={20} color="var(--accent-green)" />
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Environmental & Cognitive Sensors</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Calibrate your microphone for background noise detection and practice typing to set baseline cognitive response times.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>🎙️ Background Noise Monitor</h4>
              {!isMicActive ? (
                 <button className="btn-primary" onClick={startNoiseDetection} style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Power size={16} /> Enable Mic Sensor</button>
              ) : (
                <div style={{ marginTop: '1rem', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Current Noise Level</span>
                    <span style={{ fontWeight: '700', color: noiseLevel > 80 ? 'var(--accent-pink)' : 'var(--accent-green)' }}>{Math.round(noiseLevel)} dB</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (noiseLevel / 120) * 100)}%`, height: '100%', background: noiseLevel > 80 ? 'var(--accent-pink)' : 'var(--accent-blue)', transition: 'width 0.1s' }}></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>⌨️ Focus Baseline Configuration</h4>
              <textarea 
                 value={typingText}
                 onChange={handleTyping}
                 placeholder="Type here to calibrate your baseline cognitive processing execution..."
                 style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'monospace', resize: 'vertical', minHeight: '90px', fontSize: '0.9rem' }}
              />
              <div className="stat-row" style={{ marginTop: '0.5rem', padding: '0.5rem 0', border: 'none' }}>
                 <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Cognitive Registration</span>
                 <span className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--accent-blue)' }}>{wpm} WPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD & Technical Core */}
        <div className="glass-card" style={{ gridColumn: 'span 12', marginTop: '1.5rem' }}>
          <div className="widget-header">
            <Monitor size={20} color="var(--accent-blue)" />
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Holographic HUD Core Diagnostics</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div className="setting-control-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={18} color="var(--accent-blue)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>HUD Scanlines</span>
                </div>
                <button 
                  onClick={() => setHudSettings(prev => ({ ...prev, scanlines: !prev.scanlines }))}
                  className={`btn-primary ${hudSettings.scanlines ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: hudSettings.scanlines ? 'var(--accent-blue)' : 'var(--glass-border)' }}
                >
                  {hudSettings.scanlines ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--accent-blue)' }}>Holographic Geometry:</strong> Activates custom horizontal scanlayers that simulate a high-end CRT terminal. This creates a focused, tactical workspace feel.
              </p>
            </div>

            <div className="setting-control-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Wind size={18} color="var(--accent-green)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Particle Physics</span>
                </div>
                <button 
                  onClick={() => setHudSettings(prev => ({ ...prev, particles: !prev.particles }))}
                  className={`btn-primary ${hudSettings.particles ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: hudSettings.particles ? 'var(--accent-green)' : 'var(--glass-border)' }}
                >
                  {hudSettings.particles ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--accent-green)' }}>Bio-Dynamic Flow:</strong> Controls the density of ambient neural particles. High density creates a more active environment, while low density promotes deep focus.
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Particle Density: {hudSettings.particleDensity}</span>
                <input 
                  type="range" min="0" max="100" step="10"
                  value={hudSettings.particleDensity}
                  onChange={(e) => setHudSettings(prev => ({ ...prev, particleDensity: parseInt(e.target.value) }))}
                  style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--accent-green)' }}
                />
              </div>
            </div>

            <div className="setting-control-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Volume2 size={18} color="var(--accent-pink)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Audio Feedback</span>
                </div>
                <button 
                  onClick={() => setHudSettings(prev => ({ ...prev, audioFeedback: !prev.audioFeedback }))}
                  className={`btn-primary ${hudSettings.audioFeedback ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: hudSettings.audioFeedback ? 'var(--accent-pink)' : 'var(--glass-border)' }}
                >
                  {hudSettings.audioFeedback ? 'ACTIVE' : 'MUTED'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--accent-pink)' }}>Tactical Response:</strong> Enables mechanical "blip" and "chirp" soundscapes for interface actions. Designed to provide instant cognitive confirmation for every neural link click.
              </p>
            </div>

            <div className="setting-control-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Zap size={18} color="var(--accent-purple)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Holographic Stats</span>
                </div>
                <button 
                  onClick={() => setHudSettings(prev => ({ ...prev, holographicStats: !prev.holographicStats }))}
                  className={`btn-primary ${hudSettings.holographicStats ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: hudSettings.holographicStats ? 'var(--accent-purple)' : 'var(--glass-border)' }}
                >
                  {hudSettings.holographicStats ? 'HYPER' : 'STANDARD'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--accent-purple)' }}>Hyper-Data Overlay:</strong> Overloads the dashboard with additional holographic data layers and pulsing effect for a more immersive data-driven experience.
              </p>
            </div>

          </div>
        </div>

        {/* Custom Neural Color Picker */}
        <div className="glass-card" style={{ gridColumn: 'span 12', marginTop: '1.5rem', border: '1px solid var(--accent-blue)', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), transparent)' }}>
           <div className="widget-header">
             <Palette size={20} color="var(--accent-blue)" />
             <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Neural Interface Calibration</h3>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <input 
                type="color" 
                value={document.documentElement.style.getPropertyValue('--accent-blue') || '#0ea5e9'}
                onChange={(e) => {
                  document.documentElement.style.setProperty('--accent-blue', e.target.value);
                }}
                style={{ width: '60px', height: '60px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Custom Accent Frequency</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manually calibrate the electromagnetic spectrum of your workspace. Changes apply instantly to all HUD elements.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
