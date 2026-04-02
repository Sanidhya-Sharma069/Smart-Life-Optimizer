import React, { useState } from 'react';
import { Heart, Droplet, Eye, Activity } from 'lucide-react';

const HealthModule = () => {
  const [waterGlasses, setWaterGlasses] = useState(2);
  const [screenTime] = useState('4h 15m'); // Mock data

  return (
    <div className="main-content">
      <div className="header">
        <div className="greeting">
          <h1>Health Tracker 💧</h1>
          <p>Maintain your physical well-being to maximize mental focus.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Water Tracker */}
        <div className="glass-card widget-sleep">
          <div className="widget-header">
            <Droplet size={20} color="var(--accent-blue)" />
            <h3>Hydration Log</h3>
          </div>
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {waterGlasses} / 8
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Glasses today</p>
            <button className="btn-primary" onClick={() => setWaterGlasses(w => w + 1)}>
              + Log Water
            </button>
          </div>
        </div>

        {/* Screen Time & Eyes */}
        <div className="glass-card widget-study">
          <div className="widget-header">
            <Eye size={20} color="var(--accent-green)" />
            <h3>Screen Time & Eye Rest</h3>
          </div>
          <div className="stat-row" style={{ padding: '1rem 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Today's Screen Time</span>
            <span className="stat-value highlight">{screenTime}</span>
          </div>
          <div className="insight-item" style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}><Activity size={20} /></div>
            <div className="insight-text">
              <h4>20-20-20 Rule Reminder</h4>
              <p>You've been looking at the screen for over an hour. Take 20 seconds to look at something 20 feet away right now!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthModule;
