import React, { useState } from 'react';
import { Moon, Clock, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { playInterfaceClick } from '../utils/audioEngine';

const SLEEP_TIPS = [
  "Avoid caffeine at least 6 hours before bed.",
  "Keep your bedroom cool — 65–68°F is optimal for sleep.",
  "Limit screen blue-light 1 hour before sleeping.",
  "Consistent sleep/wake times regulate your circadian rhythm.",
  "20 minutes of exercise daily can improve sleep quality by 65%.",
];

const SleepScoreArc = ({ score, color = 'var(--accent-blue)' }) => {
  const r = 70;
  const circ = 2 * Math.PI * r * 0.75; // 3/4 arc
  const offset = circ * (1 - score / 100);

  return (
    <svg width="180" height="150" viewBox="0 0 180 150">
      {/* Track (grey 3/4 arc) */}
      <circle cx="90" cy="100" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="10"
        strokeDasharray={`${circ} ${2 * Math.PI * r}`} strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: '90px 100px' }}
      />
      {/* Value arc */}
      <circle cx="90" cy="100" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${circ - offset} ${2 * Math.PI * r}`} strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: '90px 100px', filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1.5s ease-out' }}
      />
      <text x="90" y="95" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="monospace">{score}</text>
      <text x="90" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" letterSpacing="2">SLEEP SCORE</text>
    </svg>
  );
};

const SleepModule = () => {
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [logs, setLogs] = useState([]);
  const [alarmInput, setAlarmInput] = useState('07:30');
  const [activeAlarm, setActiveAlarm] = useState(localStorage.getItem('smartAlarm') || '');
  const [tip] = useState(SLEEP_TIPS[Math.floor(Math.random() * SLEEP_TIPS.length)]);

  const handleLogSleep = () => {
    let [sHours, sMins] = sleepTime.split(':').map(Number);
    let [wHours, wMins] = wakeTime.split(':').map(Number);
    let durationMins = (wHours * 60 + wMins) - (sHours * 60 + sMins);
    if (durationMins < 0) durationMins += 24 * 60;

    const hours = Math.floor(durationMins / 60);
    const mins  = durationMins % 60;

    let quality, score;
    if (hours < 5)       { quality = 'Poor';      score = 30; }
    else if (hours < 6)  { quality = 'Low';        score = 50; }
    else if (hours < 7)  { quality = 'Fair';       score = 65; }
    else if (hours <= 9) { quality = 'Good';       score = 85; }
    else                 { quality = 'Overslept';  score = 60; }

    const logData = { hours, mins, quality, score, date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };

    fetch('http://localhost:5001/api/log-sleep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours, quality })
    })
    .then(res => res.json())
    .then(() => { setLogs([logData, ...logs]); playInterfaceClick(); })
    .catch(err => console.error('Failed to log sleep', err));
  };

  const handleSetAlarm = () => { localStorage.setItem('smartAlarm', alarmInput); setActiveAlarm(alarmInput); playInterfaceClick(); };
  const handleClearAlarm = () => { localStorage.removeItem('smartAlarm'); setActiveAlarm(''); playInterfaceClick(); };

  const latestLog = logs[0];

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>Sleep Management <img src="/icons/moon.png" className="ai-emoji" alt="moon" /></h1>
          <p>Track your rest to optimize daily productivity and recovery.</p>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* Log + Score */}
        <div className="glass-card widget-sleep" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(59,130,246,0.1)' }}><Clock size={20} color="var(--accent-blue)" /></div>
            <h3>Log Sleep Session</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Bedtime</label>
              <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Wake Time</label>
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem' }} />
            </div>
          </div>
          <button className="btn-primary" onClick={handleLogSleep} style={{ width: '100%', marginBottom: '1.5rem' }}>
            <Moon size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Log Sleep
          </button>

          {/* Sleep Score Display */}
          {latestLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <SleepScoreArc
                score={latestLog.score}
                color={latestLog.quality === 'Good' ? 'var(--accent-green)' : latestLog.quality === 'Poor' ? 'var(--accent-pink)' : 'var(--accent-blue)'}
              />
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: latestLog.quality === 'Good' ? 'var(--accent-green)' : latestLog.quality === 'Poor' ? 'var(--accent-pink)' : 'var(--accent-blue)' }}>
                  {latestLog.hours}h {latestLog.mins}m — {latestLog.quality}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', opacity: 0.4 }}>
              <Moon size={48} color="var(--accent-purple)" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Log tonight's sleep to see your score.</p>
            </div>
          )}
        </div>

        {/* Right column — history + alarm */}
        <div className="glass-card widget-study" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Sleep Tip */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(139,92,246,0.05)', borderRadius: '1rem', padding: '1rem', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Zap size={20} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent-purple)', fontWeight: '700', marginBottom: '0.35rem' }}>Sleep Protocol</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>{tip}</p>
            </div>
          </div>

          {/* History */}
          <div style={{ flex: 1 }}>
            <div className="widget-header" style={{ marginBottom: '1rem' }}>
              <div className="icon-box" style={{ background: 'rgba(139,92,246,0.1)' }}><TrendingUp size={18} color="var(--accent-purple)" /></div>
              <h3>History</h3>
            </div>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No sleep logged yet. Log tonight's session.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {logs.map((log, idx) => (
                  <div key={idx} className="stat-row" style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{log.date}</span>
                      <span style={{ fontSize: '0.8rem', color: log.quality === 'Poor' || log.quality === 'Low' ? 'var(--accent-pink)' : 'var(--accent-green)' }}>{log.quality}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="stat-value highlight" style={{ fontSize: '1.25rem' }}>{log.hours}h {log.mins}m</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '2rem', background: log.score >= 80 ? 'rgba(16,185,129,0.1)' : 'rgba(236,72,153,0.1)', color: log.score >= 80 ? 'var(--accent-green)' : 'var(--accent-pink)' }}>{log.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Alarm */}
          <div>
            <div className="widget-header" style={{ marginBottom: '1rem' }}>
              <div className="icon-box" style={{ background: 'rgba(16,185,129,0.1)' }}><CheckCircle size={18} color="var(--accent-green)" /></div>
              <h3>Smart Alarm</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Set a global wake-up notification. It triggers a full-screen visual alert at the exact time.</p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="time" value={alarmInput} onChange={e => setAlarmInput(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', width: '140px' }} />
              {activeAlarm ? (
                <button className="btn-primary" onClick={handleClearAlarm} style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--accent-pink)', border: '1px solid var(--accent-pink)', flex: 1 }}>
                  Clear Alarm ({activeAlarm})
                </button>
              ) : (
                <button className="btn-primary" onClick={handleSetAlarm} style={{ flex: 1 }}>Set Alarm</button>
              )}
            </div>
            {activeAlarm && (
              <div style={{ marginTop: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="status-dot" style={{ flexShrink: 0 }}></div>
                <span style={{ color: 'var(--accent-green)', fontSize: '0.875rem', fontWeight: '600' }}>Wake sequence armed for {activeAlarm}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SleepModule;
