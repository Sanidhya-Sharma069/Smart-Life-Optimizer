const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store for the MVP
let userData = {
  sleep: { hours: 6.5, quality: 'Good' },
  study: { sessions: 3, totalMinutes: 180, distractions: 2 },
  health: { water: 4 }
};

// --- Smart AI Logic & Analytics API ---
app.get('/api/dashboard', (req, res) => {
  let score = 100;
  let insights = [];

  // Sleep logic
  if (userData.sleep.hours < 6) {
    score -= 20;
    insights.push({ id: 1, text: 'You slept only ' + userData.sleep.hours + 'h → low productivity expected', type: 'warning' });
  } else {
    insights.push({ id: 2, text: 'You achieved solid rest (' + userData.sleep.hours + 'h) → peak performance expected', type: 'success' });
  }

  // Distraction logic
  if (userData.study.distractions > 5) {
    score -= 15;
    insights.push({ id: 3, text: 'You were distracted ' + userData.study.distractions + ' times today → Get back to work!', type: 'warning' });
  } else if (userData.study.distractions === 0) {
    score += 5;
    insights.push({ id: 4, text: 'Zero distractions detected! Excellent focus today.', type: 'success' });
  }

  // Study logic
  if (userData.study.totalMinutes >= 120) {
    score += 10;
    insights.push({ id: 5, text: 'Consistent study detected (' + (userData.study.totalMinutes / 60).toFixed(1) + 'h) → showing improvement', type: 'success' });
  }

  // Ensure score stays in bounds
  score = Math.min(100, Math.max(0, score));

  res.json({
    score,
    data: userData,
    insights
  });
});

app.post('/api/log-sleep', (req, res) => {
  userData.sleep = req.body;
  res.json({ message: 'Sleep logged', data: userData.sleep });
});

app.post('/api/log-study', (req, res) => {
  userData.study.sessions++;
  userData.study.totalMinutes += req.body.minutes || 25;
  userData.study.distractions += req.body.distractions || 0;
  res.json({ message: 'Study log saved', data: userData.study });
});

app.post('/api/log-water', (req, res) => {
  userData.health.water++;
  res.json({ message: 'Hydration logged', water: userData.health.water });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', msg: 'System online' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Smart Life Optimizer Backend online - Port ${PORT}`);
  console.log(`🤖 Smart Logic Analyzer ready for requests...`);
});
