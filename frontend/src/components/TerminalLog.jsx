import React, { useState, useEffect } from 'react';

const TerminalLog = () => {
  const [logs, setLogs] = useState([
    "[SYSTEM] Initiating HUD sequences...",
    "[CORE] Bio-metrics synced successfully.",
    "[DATA] Fetching productivity patterns..."
  ]);

  useEffect(() => {
    const messages = [
      "[NEURAL] Mapping focus nodes...",
      "[SYSTEM] Optimizing glass transparency.",
      "[ALGORITHM] Predicting peak performance.",
      "[SYNC] Local data encrypted.",
      "[OPTIMIZE] Reducing background latency.",
      "[HUD] Holographic overlay stable."
    ];
    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, messages[Math.floor(Math.random() * messages.length)]];
        if (next.length > 5) return next.slice(1);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [inputValue, setInputValue] = useState("");

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim().toLowerCase();
      let response = `[USR] ${cmd}`;
      
      if (cmd === 'help') {
        response = "[SYS] Available: status, optimize, sync, clear";
      } else if (cmd === 'clear') {
        setLogs([]);
        setInputValue("");
        return;
      } else if (cmd === 'status') {
        response = "[SYS] HUD: Nominal | Audio: Active | Bio: Synced";
      } else {
        response = `[SYS] Command "${cmd}" not recognized. Type "help".`;
      }

      setLogs(prev => [...prev, response].slice(-5));
      setInputValue("");
    }
  };

  return (
    <div style={{ padding: '0 1rem', marginTop: '1.5rem', opacity: 0.9 }}>
      <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', opacity: 0.5 }}>// system_terminal</p>
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: '0.65rem', color: log.startsWith('[USR]') ? 'var(--accent-purple)' : 'var(--accent-blue)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
              {log}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', marginTop: '4px' }}>
          <span style={{ color: 'var(--accent-blue)', fontSize: '0.7rem' }}>&gt;</span>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleCommand}
            placeholder="Type command..."
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.7rem', fontFamily: 'monospace', width: '100%', outline: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalLog;
