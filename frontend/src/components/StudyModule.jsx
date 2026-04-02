import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Square, AlertCircle, BarChart2 } from 'lucide-react';

const StudyModule = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('Mathematics');
  const [distractions, setDistractions] = useState(0);

  // ECE Features State
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [wpm, setWpm] = useState(0);
  const [lastTypedTime, setLastTypedTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState([]);

  // Distraction Detection System (Page Visibility)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setDistractions(prev => prev + 1);
        // Browser Notification for Focus alerting
        if (Notification.permission === 'granted') {
          new Notification('Get back to work! 🧠', {
            body: 'We detected you switched tabs. Focus up!'
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive]);

  // Request Notification Permission
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // alert session over
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    
    if (diff > 50 && diff < 2000) { // filter out massive delays or instant copies
       setResponseTimes(prev => [...prev.slice(-49), diff]);
    }
    
    setLastTypedTime(now);
    setTypingText(val);

    // Calculate WPM roughly based on 5 chars per word
    const words = val.length / 5;
    const minutes = Math.max(0.1, (responseTimes.reduce((a, b) => a + b, 0) / 1000) / 60);
    setWpm(Math.round(words / minutes) || 0);
  };

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>Study Assistant 📚</h1>
          <p>Track your focus with the Pomodoro technique and detect distractions.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Pomodoro Timer */}
        <div className="glass-card widget-sleep">
          <div className="widget-header">
            <BookOpen size={20} color="var(--accent-pink)" />
            <h3>Pomodoro Timer</h3>
          </div>
          
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ fontSize: '4.5rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {formatTime(timeLeft)}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={toggleTimer} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isActive ? <><Square size={16}/> Pause</> : <><Play size={16}/> Start</>}
              </button>
              <button className="btn-primary" onClick={resetTimer} style={{ background: 'var(--glass-border)', color: 'var(--text-primary)' }}>Reset</button>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
             <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Subject</label>
             <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'inherit' }}>
               <option>Mathematics</option>
               <option>Physics</option>
               <option>Computer Science</option>
               <option>Literature</option>
             </select>
          </div>
        </div>

        {/* Distraction Stats */}
        <div className="glass-card widget-study">
          <div className="widget-header">
            <AlertCircle size={20} color="var(--accent-blue)" />
            <h3>Distraction Detection System</h3>
          </div>
          <div style={{ margin: '1rem 0' }}>
            <div className="stat-row">
              <span style={{ color: 'var(--text-secondary)' }}>Tab Switches (Today)</span>
              <span className="stat-value" style={{ color: distractions > 3 ? 'var(--accent-pink)' : 'var(--text-primary)' }}>{distractions}</span>
            </div>
            {distractions > 0 && (
              <div className="insight-item" style={{ marginTop: '1.5rem', background: 'rgba(236, 72, 153, 0.05)', borderColor: 'rgba(236, 72, 153, 0.1)' }}>
                <div className="icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)' }}><AlertCircle size={20} /></div>
                <div className="insight-text">
                  <h4>Distractions Detected</h4>
                  <p>You got distracted {distractions} times today! Stay on this page while the timer is running to maintain your productivity score.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Subject Stats */}
        <div className="glass-card widget-insights">
           <div className="widget-header">
             <BarChart2 size={20} color="var(--accent-purple)" />
             <h3>Subject Performance</h3>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             <div>
               <h4 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>Strong Subjects</h4>
               <div className="stat-row"><span style={{ color: 'var(--text-secondary)' }}>Physics</span> <span className="stat-value">12h</span></div>
             </div>
             <div>
               <h4 style={{ color: 'var(--accent-pink)', marginBottom: '0.5rem' }}>Weak Subjects</h4>
               <div className="stat-row"><span style={{ color: 'var(--text-secondary)' }}>Literature</span> <span className="stat-value">2h</span></div>
             </div>
           </div>
        </div>

        {/* ECE Features: Noise & Typing Analysis */}
        <div className="glass-card widget-study">
          <div className="widget-header">
            <AlertCircle size={20} color="var(--accent-green)" />
            <h3>ECE Environmental Sensors</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>🎙️ Background Noise Monitor</h4>
              {!isMicActive ? (
                 <button className="btn-primary" onClick={startNoiseDetection} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Enable Mic Sensor</button>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Noise Level: {Math.round(noiseLevel)}</p>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (noiseLevel / 120) * 100)}%`, height: '100%', background: noiseLevel > 80 ? 'var(--accent-pink)' : 'var(--accent-blue)', transition: 'width 0.1s' }}></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>⌨️ Cognitive Focus Tracker</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Type notes to measure cognitive speed/response time:</p>
              <textarea 
                 value={typingText}
                 onChange={handleTyping}
                 placeholder="Start typing your study notes here..."
                 style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'inherit', resize: 'vertical', minHeight: '60px' }}
              />
              <div className="stat-row" style={{ marginTop: '0.5rem' }}>
                 <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Typing Speed</span>
                 <span className="stat-value" style={{ fontSize: '1rem' }}>{wpm} WPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyModule;
