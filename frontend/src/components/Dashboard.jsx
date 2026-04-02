import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, Activity, ShieldAlert, Moon, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { playSmartAmbientMusic, stopSmartAmbientMusic, playInterfaceClick } from '../utils/audioEngine';

const Dashboard = ({ hudSettings }) => {
  const [dashboardData, setDashboardData] = React.useState(null);
  const [quote, setQuote] = React.useState({ text: "Loading motivation...", author: "" });
  const [now, setNow] = React.useState(new Date());

  // Live clock — ticks every second
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const greeting_emoji = hours < 12 ? '🌅' : hours < 17 ? '☀️' : '🌙';
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  React.useEffect(() => {
    fetch('http://localhost:5001/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.error("Failed to fetch dashboard data", err));

    const positiveQuotes = [
      { text: "Your physical health is the engine of your mental focus.", author: "Smart Assistant" },
      { text: "Consistency is what transforms average into excellence.", author: "Daily Reminder" },
      { text: "Resting is not a waste of time. It's an investment in future productivity.", author: "Wellness Module" },
      { text: "Small, daily optimizations yield massive long-term results.", author: "Optimization Engine" },
      { text: "Hydration and sleep are the ultimate bio-hacks.", author: "Health Protocol" },
      { text: "Protect your focus as if it is your most valuable asset.", author: "Focus Tracker" },
      { text: "Deep work requires deep rest.", author: "Daily Reminder" }
    ];
    setQuote(positiveQuotes[Math.floor(Math.random() * positiveQuotes.length)]);
  }, []);

  const weeklyFocusData = [
    { day: 'Mon', focus: 120 }, { day: 'Tue', focus: 150 }, { day: 'Wed', focus: 90 },
    { day: 'Thu', focus: 180 }, { day: 'Fri', focus: 140 }, { day: 'Sat', focus: 210 }, { day: 'Sun', focus: 160 }
  ];

  if (!dashboardData) return <div className="main-content"><h2 style={{ color: 'white', marginTop: '2rem' }}>Loading Smart Engine...</h2></div>;

  const { score, data, insights, lifestyleChanges } = dashboardData;

  return (
    <div className="main-content">
      {hudSettings?.holographicStats && (
        <div className="holographic-overlay" style={{ pointerEvents: 'none' }}></div>
      )}
      <header className="header">
        <div className="greeting">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>{greeting}, Sanidhya</span>
            <span style={{ fontSize: '2rem' }}>{greeting_emoji}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{formattedDate} · Your workspace is optimized and ready.</p>
        </div>
        <div className="live-clock">{formattedTime}</div>
      </header>

      {/* Live Quote API Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(90deg, var(--glass-bg), rgba(139, 92, 246, 0.05))', borderLeft: '4px solid var(--accent-purple)' }}>
        <div className="floating"><Zap size={28} color="var(--accent-purple)" /></div>
        <div>
          <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '0.25rem', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>"{quote.text}"</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>— {quote.author}</p>
        </div>
      </div>

      <div className="bento-grid">
        {/* Hero Section with Live Metric Rings */}
        <div className="glass-card bento-hero" style={{ gap: '2rem', gridColumn: 'span 12', position: 'relative', overflow: 'hidden' }}>
          <div style={{ flex: 1, zIndex: 1 }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Ecosystem Optimization State</h2>
            <p style={{ color: 'var(--text-secondary)', letterSpacing: '1px' }}>SYSTEM NOMINAL // PERFORMANCE PEAK</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak</span>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} style={{ width: '20px', height: '20px', borderRadius: '4px', background: [2, 5].includes(i) ? 'var(--glass-border)' : 'var(--accent-blue)', boxShadow: [2, 5].includes(i) ? 'none' : '0 0 10px var(--accent-blue)' }}></div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', zIndex: 1 }}>
            {/* Circular Progress Rings */}
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
                <circle className="ring-pulse-active" cx="50" cy="50" r="40" fill="none" stroke="var(--accent-blue)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - score / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: '800' }}>{score}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="productivity-score">
                <span style={{ fontSize: '0.6rem', color: 'var(--accent-green)', textTransform: 'uppercase', display: 'block' }}>Focus Index</span>
                <div className="score-badge" style={{ fontSize: '1.2rem', padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>92%</div>
              </div>
              <div className="productivity-score">
                <span style={{ fontSize: '0.6rem', color: 'var(--accent-pink)', textTransform: 'uppercase', display: 'block' }}>Bio-Sync</span>
                <div className="score-badge" style={{ fontSize: '1.2rem', padding: '0.25rem 0.75rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)' }}>88%</div>
              </div>
            </div>
          </div>
          {/* HUD Decorative Corners */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--accent-blue)', borderLeft: '2px solid var(--accent-blue)', opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--accent-blue)', borderRight: '2px solid var(--accent-blue)', opacity: 0.5 }}></div>
        </div>

        {/* Row 1: Focus & Insights */}
        <div className="glass-card bento-half">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(236, 72, 113, 0.1)' }}><BookOpen size={20} color="var(--accent-pink)" /></div>
            <h3>Study & Data Visualization</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', height: 'calc(100% - 3rem)' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '180px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyFocusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--accent-blue)' }} />
                  <Line type="monotone" dataKey="focus" stroke="var(--accent-blue)" strokeWidth={4} dot={{ r: 4, fill: 'var(--bg-primary)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent-pink)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
              <div className="stat-row" style={{ width: '100%', borderBottom: 'none', padding: '0.5rem 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Today Logged</span>
                <span className="stat-value" style={{ fontSize: '1.25rem' }}>{(data.study.totalMinutes / 60).toFixed(1)}h</span>
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '-2px', margin: '0.25rem 0' }}>{formattedTime.slice(0, 5)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><div className="status-dot"></div> <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Live System Clock</span></div>
              <Link to="/study" style={{ textDecoration: 'none' }}><button className="btn-primary">Start Focus</button></Link>
            </div>
          </div>
        </div>

        <div className="glass-card bento-half accent-purple" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)' }}><Zap size={20} color="var(--accent-purple)" /></div>
            <h3>Smart AI Insights</h3>
          </div>
          <div style={{ height: 'calc(100% - 3rem)', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
            {insights.map((insight) => (
              <div key={insight.id} className="insight-item" style={{ background: insight.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(236, 72, 153, 0.05)', borderColor: insight.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)' }}>
                <div className="icon" style={{ background: insight.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)', color: insight.type === 'success' ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
                  {insight.type === 'success' ? <Activity size={18} /> : <ShieldAlert size={18} />}
                </div>
                <div className="insight-text">
                  <h4>{insight.type === 'success' ? 'Pattern Detected' : 'Action Required'}</h4>
                  <p style={{ fontSize: '0.875rem' }}>{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Metrics Overload */}
        <div className="glass-card bento-square accent-blue">
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)' }}><Moon size={20} color="var(--accent-blue)" /></div>
            <h3>Sleep Rest</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-row">
                <span style={{ color: 'var(--text-secondary)' }}>Duration Logged</span>
                <span className="stat-value highlight">{data.sleep.hours}h</span>
              </div>
              <div className="stat-row">
                <span style={{ color: 'var(--text-secondary)' }}>Quality Rating</span>
                <span className="stat-value">{data.sleep.quality}</span>
              </div>
            </div>
            <Link to="/sleep" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--glass-highlight)' }}>Log Deep Sleep</button></Link>
          </div>
        </div>

        <div className="glass-card bento-square accent-purple" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)' }}><Zap size={20} color="var(--accent-purple)" /></div>
            <h3>Smart Focus Ambient</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Neural-calibrated smart soundscapes for deep focus.</p>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', margin: 'auto 0' }}>
              {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.3, 0.7].map((h, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--accent-purple)', borderRadius: '2px', height: `${h * 100}%`, opacity: 0.3 + (h * 0.7), animation: 'pulseHeight 1.5s infinite ease-in-out', animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={() => { playSmartAmbientMusic(); playInterfaceClick(); }} style={{ flex: 1, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '0.75rem' }}>Play Music</button>
              <button className="btn-primary" onClick={() => { stopSmartAmbientMusic(); playInterfaceClick(); }} style={{ flex: 1, background: 'rgba(236, 72, 113, 0.1)', border: '1px solid rgba(236, 72, 113, 0.2)', fontSize: '0.75rem' }}>Stop</button>
            </div>
          </div>
        </div>

        <div className="glass-card bento-square accent-green" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
          <div className="widget-header">
            <div className="icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)' }}><Activity size={20} color="var(--accent-blue)" /></div>
            <h3>HUD Atmosphere</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 3rem)', gap: '1rem' }}>
            <div className="animated-3d-icon" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌌</div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>Focus Sky: Active</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sync Nominal</span>
            </div>
          </div>
        </div>

        {/* Row 3: Final Recommendations (Hero) */}
        {lifestyleChanges && lifestyleChanges.length > 0 && (
          <div className="glass-card bento-hero" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(236, 72, 153, 0.05))', border: '1px solid rgba(245, 158, 11, 0.2)', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="widget-header" style={{ width: '100%' }}>
              <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.2)' }}><Activity size={20} color="var(--accent-orange)" /></div>
              <h3>Time Utilization & Lifestyle Blueprint</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', width: '100%' }}>
              {lifestyleChanges.map((change) => (
                <div key={change.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '1.75rem' }}>{change.icon === 'clock' ? '⏱️' : '🛡️'}</div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '1.1rem' }}>{change.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{change.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
