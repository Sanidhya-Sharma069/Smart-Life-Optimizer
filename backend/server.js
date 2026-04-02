const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'userData.json');

// In-memory data store for the MVP
let userData = {
  sleep: { hours: 6.5, quality: 'Good' },
  study: { sessions: 3, totalMinutes: 180, distractions: 2 },
  health: { water: 4 },
  settings: {
    theme: 'dark',
    hud: { scanlines: true, particles: true, particleDensity: 40, audioFeedback: true, holographicStats: true }
  },
  messages: [
    { role: 'ai', text: "Hello! I'm your Smart Life AI companion. Ask me how to improve your focus, manage screen time, or optimize your daily habits!" }
  ],
  usageCycle: [
    { hour: 9, minutes: 45, distractions: 0 },
    { hour: 10, minutes: 60, distractions: 1 },
    { hour: 14, minutes: 30, distractions: 5 },
    { hour: 15, minutes: 20, distractions: 7 },
    { hour: 19, minutes: 60, distractions: 1 },
  ]
};

// Async data loader
const loadHistory = async () => {
  try {
    const rawData = await fs.readFile(DATA_FILE, 'utf8');
    const loadedData = JSON.parse(rawData);
    // Deep merge or at least ensure top-level keys exist
    userData = { ...userData, ...loadedData };
    console.log("✅ User data loaded and merged successfully.");
  } catch(e) {
    if (e.code !== 'ENOENT') {
      console.error("❌ Failed to parse history data", e);
    } else {
      console.log("ℹ️ No existing data file found, starting fresh.");
    }
  }
};

loadHistory();

// Async history save method
const saveHistory = async () => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(userData, null, 2));
  } catch (e) {
    console.error("❌ Failed to save history data", e);
  }
};

// --- Smart AI Logic & Analytics API ---
app.get('/api/dashboard', (req, res) => {
  let score = 100;
  let insights = [];
  let lifestyleChanges = [];

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

  // ==== Usage Cycle & Time Utilization Logic ====
  // Find Peak Productivity vs Peak Distraction hours
  let maxDistractions = 0;
  let worstHour = 14; 
  let bestHour = 9;
  let maxFocusTime = 0;

  userData.usageCycle.forEach(cycle => {
     if (cycle.distractions > maxDistractions) {
       maxDistractions = cycle.distractions;
       worstHour = cycle.hour;
     }
     if (cycle.minutes > maxFocusTime && cycle.distractions <= 1) {
       maxFocusTime = cycle.minutes;
       bestHour = cycle.hour;
     }
  });

  const formatHour = (h) => h > 12 ? `${h-12} PM` : (h === 12 ? '12 PM' : `${h} AM`);

  lifestyleChanges.push({
    id: 101,
    title: 'Time Utilization Shift',
    text: `Your distraction rates spike significantly around ${formatHour(worstHour)}. To optimize your daily cycle, stop forcing deep work during this trough. Shift your hardest tasks to your Golden Hour at ${formatHour(bestHour)}.`,
    icon: 'clock'
  });

  if (maxDistractions > 4) {
    lifestyleChanges.push({
      id: 102,
      title: 'Digital Fasting Recommendation',
      text: `Your focus drops mid-day. We recommend scheduling a 30-minute "No-Screen Break" right before ${formatHour(worstHour)} to reset your dopamine and cognitive load.`,
      icon: 'shield'
    });
  }

  // Ensure score stays in bounds
  score = Math.min(100, Math.max(0, score));

  res.json({
    score,
    data: userData,
    insights,
    lifestyleChanges
  });
});

app.post('/api/log-sleep', async (req, res) => {
  userData.sleep = req.body;
  await saveHistory();
  res.json({ message: 'Sleep logged', data: userData.sleep });
});

app.post('/api/log-study', async (req, res) => {
  userData.study.sessions++;
  userData.study.totalMinutes += req.body.minutes || 25;
  userData.study.distractions += req.body.distractions || 0;
  
  // Log real usage cycle
  const currentHour = new Date().getHours();
  userData.usageCycle.push({ hour: currentHour, minutes: req.body.minutes || 25, distractions: req.body.distractions || 0 });

  await saveHistory();
  res.json({ message: 'Study log saved', data: userData.study });
});

// App Usage / Screen Time API Analyzer
app.get('/api/screentime', (req, res) => {
  const appUsage = [
    { id: 1, name: 'VS Code', time: 135, color: 'var(--accent-blue)' },
    { id: 2, name: 'Chrome', time: 90, color: 'var(--accent-purple)' },
    { id: 3, name: 'YouTube', time: 45, color: 'var(--accent-pink)' },
    { id: 4, name: 'Instagram', time: 30, color: 'var(--accent-orange)' }
  ];
  let totalMinutes = appUsage.reduce((acc, app) => acc + app.time, 0);
  if (userData.health.screenTime) { totalMinutes = userData.health.screenTime; }
  res.json({ totalMinutes, appUsage, historyExists: fsSync.existsSync(DATA_FILE) });
});

app.post('/api/screentime', async (req, res) => {
  userData.health.screenTime = req.body.screenTime;
  await saveHistory();
  res.json({ message: 'Screen time history saved' });
});

app.post('/api/log-water', async (req, res) => {
  userData.health.water++;
  await saveHistory();
  res.json({ message: 'Hydration logged', water: userData.health.water });
});

// AI Chat API
app.post('/api/chat', async (req, res) => {
  const text = req.body.text || req.body.message; // Support both field names
  if (!text) return res.status(400).json({ error: 'No message provided' });
  
  const userMsg = { role: 'user', text };
  
  // Rule-based AI Brain (Expansion point for real LLM API)
  const lower = text.toLowerCase();
  let response = "That's an excellent point. I recommend optimizing one clear digital habit today. Would you like to review your Screen Time stats?";
  
  if (lower.includes('tired') || lower.includes('sleep') || lower.includes('energy')) {
    response = "If you're feeling drained, try aiming for a consistent sleep-wake schedule. Limiting heavy blue light 1 hour before bed enhances melatonin production by up to 30%. A 20-minute nap before 3 PM also resets your cognitive load.";
  } else if (lower.includes('distract') || lower.includes('focus') || lower.includes('phone')) {
    response = "Distraction thrives on access. Place your phone out of arm's reach and apply the 25-minute Pomodoro protocol. Your Study tab tracks focus streaks automatically.";
  } else if (lower.includes('water') || lower.includes('hydration')) {
    response = "Even mild dehydration impairs cognitive function by up to 20%. Aim for 8 glasses daily—use the Health module to track your hydration in real time.";
  } else if (lower.includes('eye') || lower.includes('screen') || lower.includes('headache')) {
    response = "Screen fatigue is real. Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. The Health module has an Eye Rest tracker for this.";
  } else if (lower.includes('motivat') || lower.includes('lazy') || lower.includes('procrastinat')) {
    response = "Motivation follows action—don't wait for inspiration to begin. Start a 2-minute version of your task. The resistance usually dissolves once you start.";
  } else if (lower.includes('score') || lower.includes('productivity')) {
    response = `Your current productivity score is ${userData.study.totalMinutes >= 120 ? 'excellent' : 'building'}. You've logged ${(userData.study.totalMinutes / 60).toFixed(1)}h of study time. Keep your streak going!`;
  }

  const aiMsg = { role: 'ai', text: response };
  userData.messages.push(userMsg, aiMsg);
  await saveHistory();
  res.json({ userMsg, aiMsg, text: response }); // Return 'text' for direct consumption
});

// Settings Persistence API
app.get('/api/settings', (req, res) => {
  res.json(userData.settings);
});

app.post('/api/settings', async (req, res) => {
  userData.settings = { ...userData.settings, ...req.body };
  await saveHistory();
  res.json({ message: 'Settings persisted', settings: userData.settings });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', msg: 'System online' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Smart Life Optimizer Backend online - Port ${PORT}`);
  console.log(`🤖 Smart Logic Analyzer ready for requests...`);
});
