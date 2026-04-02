import React, { useState, useEffect } from 'react';
import { Heart, Droplet, Eye, Activity, Monitor, Smartphone, Battery, BatteryCharging, Lock } from 'lucide-react';

const HealthModule = () => {
  const [healthData, setHealthData] = useState({ water: 0 });
  const [screenTimeData, setScreenTimeData] = useState({ totalMinutes: 0, appUsage: [], historyExists: false });
  const [batteryInfo, setBatteryInfo] = useState({ level: 100, charging: false, supported: false });
  const [eyeRestTimer, setEyeRestTimer] = useState(null); // null | number (countdown)
  const [eyeRestActive, setEyeRestActive]   = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/dashboard')
      .then(res => res.json())
      .then(data => setHealthData(data.data?.health || { water: 0 }))
      .catch(err => console.error(err));

    fetch('http://localhost:5001/api/screentime')
      .then(res => res.json())
      .then(data => setScreenTimeData(data))
      .catch(err => console.error(err));

    // Mobile Device Battery Tracker
    if ('getBattery' in navigator) {
      navigator.getBattery().then(batt => {
        setBatteryInfo({ level: Math.floor(batt.level * 100), charging: batt.charging, supported: true });
        batt.addEventListener('levelchange', () => setBatteryInfo(b => ({...b, level: Math.floor(batt.level * 100)})));
        batt.addEventListener('chargingchange', () => setBatteryInfo(b => ({...b, charging: batt.charging})));
      });
    }
  }, []);

  const formatTime = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

  const logWater = () => {
    fetch('http://localhost:5001/api/log-water', { method: 'POST' })
      .then(r => r.json())
      .then(d => setHealthData(prev => ({ ...prev, water: d.water })))
      .catch(() => setHealthData(prev => ({ ...prev, water: prev.water + 1 })));
  };

  const startEyeRest = () => {
    if (eyeRestActive) return;
    setEyeRestActive(true);
    setEyeRestTimer(20);
    const interval = setInterval(() => {
      setEyeRestTimer(t => {
        if (t <= 1) { clearInterval(interval); setEyeRestActive(false); return null; }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>Digital Wellbeing <img src="/icons/leaf.png" className="ai-emoji" alt="holographic leaf" /></h1>
          <p>Screen Time Analyser & Physical Health Tracker</p>
        </div>
        {screenTimeData.historyExists && (
          <div className="insight-item" style={{ margin: 0, padding: '0.75rem 1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <span style={{ color: 'var(--accent-green)', fontSize: '0.875rem', fontWeight: 'bold' }}>✓ Database History Saving Active</span>
          </div>
        )}
      </div>

      <div className="bento-grid">
        {/* App Usage Breakdown - Now Square */}
        <div className="glass-card bento-square">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)' }}><Monitor size={20} color="var(--accent-purple)" /></div>
            <h3>App Usage</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', height: 'calc(100% - 3.5rem)' }}>
              {screenTimeData.appUsage.map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{app.name}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>{formatTime(app.time)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Screen Time Logic - Square */}
        <div className="glass-card bento-square">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)' }}><Activity size={20} color="var(--accent-purple)" /></div>
            <h3>Screen Metrics</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 3.5rem)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {Math.floor(screenTimeData.totalMinutes / 60)}h {screenTimeData.totalMinutes % 60}m
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>Total Active Today</span>
          </div>
        </div>

        {/* Screen Time & Eyes - Square */}
        <div className="glass-card bento-square">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><Eye size={20} color="var(--accent-green)" /></div>
            <h3>Eye Rest Analyser</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'space-between' }}>
            <div className="insight-item" style={{ margin: 0, background: eyeRestActive ? 'rgba(16,185,129,0.1)' : 'transparent', border: '1px solid var(--glass-border)' }}>
              <div className="icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}><Activity size={20} /></div>
              <div className="insight-text">
                <h4>20-20-20 Rule</h4>
                <p style={{ fontSize: '0.85rem' }}>
                  {eyeRestActive
                    ? <>Look at something <strong style={{color:'var(--accent-green)'}}>20 feet away</strong> — {eyeRestTimer}s remaining</>
                    : 'Staring at screens strains your eyes. Every 20 min, look 20 feet away for 20 seconds.'}
                </p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={startEyeRest}
              disabled={eyeRestActive}
              style={{ background: eyeRestActive ? 'rgba(16,185,129,0.2)' : 'transparent', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', opacity: eyeRestActive ? 1 : undefined }}
            >
              {eyeRestActive ? `👁 Rest Active — ${eyeRestTimer}s` : 'Start 20s Eye Rest'}
            </button>
          </div>
        </div>

        {/* Water Tracker - Half Width for Alignment */}
        <div className="glass-card bento-half">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)' }}><Droplet size={20} color="var(--accent-blue)" /></div>
            <h3>Hydration Log</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {healthData.water} <span style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>/ 8</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>glasses today</p>
            {/* Hydration bar */}
            <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (healthData.water / 8) * 100)}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))', borderRadius: '4px', transition: 'width 0.6s ease' }} />
            </div>
            <button className="btn-primary" onClick={logWater} style={{ width: '100%' }}>+ Log Water</button>
          </div>
        </div>

        {/* Device Battery Status - Half Width for Alignment */}
        <div className="glass-card bento-half">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)' }}><Smartphone size={20} color="var(--accent-pink)" /></div>
            <h3>Device Health Manager</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'center', alignItems: 'center' }}>
            {batteryInfo.supported ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {batteryInfo.charging ? <BatteryCharging size={60} color="var(--accent-green)" /> : <Battery size={60} color={batteryInfo.level > 20 ? "var(--accent-blue)" : "var(--accent-pink)"} />}
                  <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '-2px' }}>
                    {batteryInfo.level}<span style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>%</span>
                  </div>
                </div>
                <div className="insight-item" style={{ margin: 0, padding: '0.75rem 1rem', background: 'transparent', border: '1px solid var(--glass-border)', width: '100%' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {batteryInfo.charging ? "Device is actively charging. Try detaching yourself too!" : "Running on battery. Limit heavy app usage to preserve power."}
                  </p>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Battery API not supported on this browser context.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthModule;
