import React, { useState } from 'react';
import { Moon, Clock, CheckCircle } from 'lucide-react';

const SleepModule = () => {
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [logs, setLogs] = useState([]);

  const handleLogSleep = () => {
    // Basic duration calculation logic
    let [sHours, sMins] = sleepTime.split(':').map(Number);
    let [wHours, wMins] = wakeTime.split(':').map(Number);
    
    let durationMins = (wHours * 60 + wMins) - (sHours * 60 + sMins);
    if (durationMins < 0) durationMins += 24 * 60; // Cross midnight
    
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    
    let quality = 'Good';
    let score = 85;
    if (hours < 6) { quality = 'Poor'; score = 40; }
    else if (hours > 9) { quality = 'Overslept'; score = 70; }

    setLogs([{ hours, mins, quality, score, date: new Date().toLocaleDateString() }, ...logs]);
  };

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>Sleep Management System 😴</h1>
          <p>Track your rest to optimize daily productivity.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card widget-study">
          <div className="widget-header">
            <Clock size={20} color="var(--accent-blue)" />
            <h3>Log New Sleep Session</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bedtime</label>
              <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Wake Time</label>
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'inherit' }} />
            </div>
          </div>
          <button className="btn-primary" onClick={handleLogSleep}>Log Sleep</button>
        </div>

        <div className="glass-card widget-sleep">
          <div className="widget-header">
            <Moon size={20} color="var(--accent-purple)" />
            <h3>Recent History</h3>
          </div>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No sleep logged yet.</p>
          ) : (
            logs.map((log, idx) => (
               <div key={idx} className="stat-row" style={{ padding: '1rem 0' }}>
                 <div>
                   <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: '600' }}>{log.date}</span>
                   <span style={{ fontSize: '0.875rem', color: log.quality === 'Poor' ? 'var(--accent-pink)' : 'var(--accent-green)' }}>Quality: {log.quality}</span>
                 </div>
                 <div className="stat-value highlight">{log.hours}h {log.mins}m</div>
               </div>
            ))
          )}
        </div>
        
        <div className="glass-card widget-insights">
           <div className="widget-header">
             <CheckCircle size={20} color="var(--accent-green)" />
             <h3>Smart Upgrade</h3>
           </div>
           <p style={{ color: 'var(--text-secondary)' }}>Based on your patterns, setting your alarm between 6:30 AM and 7:00 AM avoids deep-sleep wakeups. Enable Smart Alarm in Settings.</p>
        </div>
      </div>
    </div>
  );
};

export default SleepModule;
