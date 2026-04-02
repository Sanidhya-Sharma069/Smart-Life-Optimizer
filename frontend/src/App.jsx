import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Moon, BookOpen, Activity, Heart, Zap, ShieldAlert, Settings } from 'lucide-react';
import './index.css';
import SleepModule from './components/SleepModule';
import StudyModule from './components/StudyModule';
import HealthModule from './components/HealthModule';

// Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:5001/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.error("Failed to fetch dashboard data", err));
  }, []);

  if (!dashboardData) return <div className="main-content"><h2 style={{color: 'white', marginTop: '2rem'}}>Loading Smart Engine...</h2></div>;

  const { score, data, insights } = dashboardData;

  return (
    <div className="main-content">
      <header className="header">
        <div className="greeting">
          <h1>Welcome back, Sanidhya 👋</h1>
          <p>Here is your daily life optimization summary.</p>
        </div>
        <div className="productivity-score">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Daily Score</p>
          <div className="score-badge">{score} / 100</div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Sleep Module Widget */}
        <div className="glass-card widget-sleep">
          <div className="widget-header">
            <Moon size={20} color="var(--accent-blue)" />
            <h3>Sleep Quality</h3>
          </div>
          <div className="stat-row">
            <span style={{ color: 'var(--text-secondary)' }}>Duration Logged</span>
            <span className="stat-value highlight">{data.sleep.hours}h</span>
          </div>
          <div className="stat-row">
            <span style={{ color: 'var(--text-secondary)' }}>Quality Score</span>
            <span className="stat-value">{data.sleep.quality}</span>
          </div>
          <div className="stat-row" style={{ border: 'none', marginTop: '1rem' }}>
            <Link to="/sleep"><button className="btn-primary" style={{ width: '100%' }}>View Sleep Details</button></Link>
          </div>
        </div>

        {/* Study & Focus Widget */}
        <div className="glass-card widget-study">
          <div className="widget-header">
            <BookOpen size={20} color="var(--accent-pink)" />
            <h3>Study Assistant</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div className="stat-row">
                <span style={{ color: 'var(--text-secondary)' }}>Session Time</span>
                <span className="stat-value">{(data.study.totalMinutes / 60).toFixed(1)}h</span>
              </div>
              <div className="stat-row">
                <span style={{ color: 'var(--text-secondary)' }}>Distractions</span>
                <span className="stat-value" style={{ color: 'var(--accent-pink)' }}>{data.study.distractions}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
               <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--text-primary)' }}>25:00</div>
               <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Pomodoro Ready</p>
               <Link to="/study"><button className="btn-primary">Start Focus</button></Link>
            </div>
          </div>
        </div>

        {/* AI Smart Insights */}
        <div className="glass-card widget-insights">
          <div className="widget-header">
            <Zap size={20} color="var(--accent-purple)" />
            <h3>Smart AI Insights</h3>
          </div>
          {insights.map((insight) => (
             <div key={insight.id} className="insight-item" style={{ background: insight.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(236, 72, 153, 0.05)', borderColor: insight.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)' }}>
               <div className="icon" style={{ background: insight.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)', color: insight.type === 'success' ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
                  {insight.type === 'success' ? <Activity size={20} /> : <ShieldAlert size={20} />}
               </div>
               <div className="insight-text">
                 <h4>{insight.type === 'success' ? 'Positive Pattern Detected' : 'Action Required'}</h4>
                 <p>{insight.text}</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="brand">
            <Activity />
            Optimizer
          </div>
          <div className="nav-links">
            <Link to="/" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <Home size={20} /> Dashboard
            </Link>
            <Link to="/sleep" className={`nav-item ${activeTab === 'sleep' ? 'active' : ''}`} onClick={() => setActiveTab('sleep')}>
              <Moon size={20} /> Sleep
            </Link>
            <Link to="/study" className={`nav-item ${activeTab === 'study' ? 'active' : ''}`} onClick={() => setActiveTab('study')}>
              <BookOpen size={20} /> Study
            </Link>
            <Link to="/health" className={`nav-item ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
              <Heart size={20} /> Health Add-on
            </Link>
            <div style={{ flex: 1 }}></div>
            <Link to="/settings" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={20} /> Settings
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sleep" element={<SleepModule />} />
          <Route path="/study" element={<StudyModule />} />
          <Route path="/health" element={<HealthModule />} />
          <Route path="/settings" element={<div className="main-content"><h1>Settings</h1><p>Under construction.</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
