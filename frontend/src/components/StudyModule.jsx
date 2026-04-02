import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Play, Square, RotateCcw, AlertCircle, BarChart2, Target, Zap } from 'lucide-react';
import { playTimerCompleteTone, playInterfaceClick } from '../utils/audioEngine';

const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'Literature', 'Chemistry', 'History'];

const StudyModule = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('Mathematics');
  const [distractions, setDistractions] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // minutes this session
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // 'focus' | 'short-break' | 'long-break'

  const MODES = {
    'focus':       { label: 'Deep Focus',   duration: 25 * 60, color: 'var(--accent-blue)'   },
    'short-break': { label: 'Short Break',  duration: 5  * 60, color: 'var(--accent-green)'  },
    'long-break':  { label: 'Long Break',   duration: 15 * 60, color: 'var(--accent-purple)' },
  };

  // Distraction Detection (tab visibility)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setDistractions(prev => prev + 1);
        if (Notification.permission === 'granted') {
          new Notification('Get back to work! 🧠', {
            body: `Tab switch detected while studying ${subject}. Stay focused!`
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, subject]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playTimerCompleteTone();

      if (pomodoroMode === 'focus') {
        const minutes = MODES['focus'].duration / 60;
        setSessionCount(s => s + 1);
        setTotalFocusTime(t => t + minutes);

        // Log to backend
        fetch('http://localhost:5001/api/log-study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes, distractions, subject })
        }).catch(err => console.error('Failed to log study session', err));
      }

      if (Notification.permission === 'granted') {
        new Notification(pomodoroMode === 'focus' ? 'Session Complete! 🎉' : 'Break Over! ⚡', {
          body: pomodoroMode === 'focus'
            ? `Great work on ${subject}! Take a well-earned break.`
            : 'Ready to get back into the zone?'
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, pomodoroMode]);

  const switchMode = (mode) => {
    setIsActive(false);
    setPomodoroMode(mode);
    setTimeLeft(MODES[mode].duration);
    playInterfaceClick();
  };

  const toggleTimer = () => { setIsActive(a => !a); playInterfaceClick(); };
  const resetTimer  = () => { setIsActive(false); setTimeLeft(MODES[pomodoroMode].duration); playInterfaceClick(); };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalDuration     = MODES[pomodoroMode].duration;
  const progressPercent   = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference     = 2 * Math.PI * 80;
  const strokeDashoffset  = circumference * (1 - progressPercent / 100);
  const activeColor       = MODES[pomodoroMode].color;

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>Study Assistant <img src="/icons/book.png" className="ai-emoji" alt="book" /></h1>
          <p>Pomodoro-based deep focus tracker with distraction detection.</p>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* Pomodoro Timer — left column */}
        <div className="glass-card widget-sleep" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="widget-header">
            <div className="icon-box" style={{ background: `rgba(14,165,233,0.1)` }}><BookOpen size={20} color={activeColor} /></div>
            <h3>{MODES[pomodoroMode].label}</h3>
          </div>

          {/* Mode Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.5rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  border: `1px solid ${pomodoroMode === key ? val.color : 'var(--glass-border)'}`,
                  background: pomodoroMode === key ? `rgba(${key === 'focus' ? '14,165,233' : key === 'short-break' ? '16,185,129' : '168,85,247'},0.15)` : 'transparent',
                  color: pomodoroMode === key ? val.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit'
                }}
              >{val.label}</button>
            ))}
          </div>

          {/* Circular Progress Timer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="80" fill="none"
                stroke={activeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 10px ${activeColor})` }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '-3px', lineHeight: 1 }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
                {isActive ? 'RUNNING' : 'PAUSED'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={toggleTimer} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: isActive ? 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3))' : undefined, border: isActive ? '1px solid var(--accent-pink)' : undefined }}>
              {isActive ? <><Square size={16} /> Pause</> : <><Play size={16} /> Start</>}
            </button>
            <button className="btn-primary" onClick={resetTimer} style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Subject Selector */}
          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem' }}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Stats — right column */}
        <div className="glass-card widget-study" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Session Stats */}
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(139,92,246,0.1)' }}><BarChart2 size={20} color="var(--accent-purple)" /></div>
            <h3>Session Stats</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Sessions', value: sessionCount, color: 'var(--accent-blue)',   icon: <Target size={18} /> },
              { label: 'Focus Time', value: `${totalFocusTime}m`, color: 'var(--accent-green)',  icon: <Zap size={18} /> },
              { label: 'Distractions', value: distractions, color: distractions > 3 ? 'var(--accent-pink)' : 'var(--text-secondary)', icon: <AlertCircle size={18} /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <div style={{ color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color, letterSpacing: '-1px', fontFamily: 'monospace' }}>{value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Distraction Alert */}
          {distractions > 0 && (
            <div className="insight-item" style={{ background: 'rgba(236,72,153,0.05)', borderColor: 'rgba(236,72,153,0.15)', margin: 0 }}>
              <div className="icon" style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--accent-pink)', minWidth: '40px' }}><AlertCircle size={20} /></div>
              <div className="insight-text">
                <h4>Focus Drift Detected</h4>
                <p>You switched context {distractions} time{distractions !== 1 ? 's' : ''} during this session. Try placing your phone face-down and closing social media tabs.</p>
              </div>
            </div>
          )}

          {/* Subject Performance */}
          <div>
            <div className="widget-header" style={{ marginBottom: '1rem' }}>
              <div className="icon-box" style={{ background: 'rgba(16,185,129,0.1)' }}><BarChart2 size={18} color="var(--accent-green)" /></div>
              <h3>Subject Allocation</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { name: 'Physics',     hours: 12, strong: true  },
                { name: 'Mathematics', hours: 8,  strong: true  },
                { name: 'Literature',  hours: 2,  strong: false },
                { name: 'Chemistry',   hours: 4,  strong: false },
              ].map(subj => (
                <div key={subj.name} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0.75rem', padding: '0.875rem', border: `1px solid ${subj.strong ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600' }}>{subj.name}</span>
                    <span style={{ fontSize: '0.75rem', color: subj.strong ? 'var(--accent-green)' : 'var(--accent-pink)', fontWeight: '700' }}>{subj.hours}h</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (subj.hours / 12) * 100)}%`, background: subj.strong ? 'var(--accent-green)' : 'var(--accent-pink)', borderRadius: '2px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudyModule;
