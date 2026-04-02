// A modular procedural audio engine using the native Web Audio API
// Handles high-quality synthetic chimes and alarms without requiring external MP3 dependencies

const getAudioContext = () => {
  if (!window.audioCtx) {
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.audioCtx;
};

// Meditative double-chime for the Pomodoro Timer completion
export const playTimerCompleteTone = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Play a relaxing major third interval chime
    playNote(659.25, 0, 2); // E5
    playNote(830.61, 0.3, 3); // G#5
  } catch (e) {
    console.error("Audio API not supported or blocked", e);
  }
};

// Deeply soothing, swelling chord for the Wake Up Alarm
export const playSoothingAlarmTone = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const playSwellingNote = (freq, startTime, duration, maxGain) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle'; // Warmer, ambient tone for waking up
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      // Swell in slowly, fade out slowly
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + startTime + (duration * 0.4));
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Ambient E Major 7 chord swell
    playSwellingNote(329.63, 0, 8, 0.25); // E4
    playSwellingNote(415.30, 0.5, 7.5, 0.2); // G#4
    playSwellingNote(493.88, 1, 7, 0.2); // B4
    playSwellingNote(622.25, 1.5, 6.5, 0.15); // D#5
  } catch (e) {
    console.error("Audio API not supported or blocked", e);
  }
};

// Procedural Ambient White/Brownian Noise for deep focus
export const playAmbientFocusSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const bufferSize = 4096;
    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0.0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise filter
        const out = (lastOut + (0.02 * white)) / 1.02;
        output[i] = out * 3.5; // Gain
        lastOut = out;
      }
    };

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(400, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2); // Fade in

    noiseNode.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    window.ambientNode = { noiseNode, gainNode, ctx };
    return window.ambientNode;
  } catch (e) {
    console.error("Failed to start ambient sound", e);
  }
};

export const stopAmbientFocusSound = () => {
  if (window.ambientNode) {
    const { gainNode, ctx } = window.ambientNode;
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    setTimeout(() => {
       if (window.ambientNode) {
         window.ambientNode.noiseNode.disconnect();
         window.ambientNode = null;
       }
    }, 1600);
  }
};

// --- [NEW] High-End Smart-Ambient Music Engine ---
// Generates an evolving, meditative electronic soundscape
export const playSmartAmbientMusic = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 4);

    // Filter for the "Space" feel
    const mainFilter = ctx.createBiquadFilter();
    mainFilter.type = 'lowpass';
    mainFilter.frequency.setValueAtTime(800, ctx.currentTime);
    mainFilter.Q.setValueAtTime(1, ctx.currentTime);

    // LFO to modulate filter for "movement"
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.05, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(mainFilter.frequency);
    lfo.start();

    // Create 3 atmospheric oscillator pads
    const notes = [110, 164.81, 220]; // A2, E3, A3
    const oscillators = notes.map((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slight detune for chorus effect
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);
      
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2 + i);
      
      osc.connect(g);
      g.connect(mainFilter);
      osc.start();
      return { osc, g };
    });

    // Simple Feedback Delay Loop
    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.5, ctx.currentTime);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.4, ctx.currentTime);
    
    mainFilter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(delay);
    delay.connect(masterGain);
    mainFilter.connect(masterGain);

    masterGain.connect(ctx.destination);

    window.musicNode = { oscillators, masterGain, lfo, ctx };
    return window.musicNode;
  } catch (e) {
    console.error("Failed to start smart music", e);
  }
};

export const stopSmartAmbientMusic = () => {
  if (window.musicNode) {
    const { masterGain, oscillators, lfo, ctx } = window.musicNode;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
    setTimeout(() => {
      oscillators.forEach(o => o.osc.stop());
      lfo.stop();
      window.musicNode = null;
    }, 3500);
  }
};

// UI Sound Effects
export const playInterfaceClick = () => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};
