import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your Smart Life AI companion. Ask me how to improve your focus, manage screen time, or optimize your daily habits!" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const generateAIResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('tired') || lower.includes('sleep') || lower.includes('energy')) {
      return "If you're feeling drained, try aiming for a consistent sleep-wake schedule. Limiting heavy blue light 1 hour before bed enhances melatonin production by up to 30%. Taking a quick 20-minute power nap before 3 PM also helps!";
    }
    if (lower.includes('distract') || lower.includes('focus') || lower.includes('phone') || lower.includes('social media')) {
      return "Distraction thrives on access. Place your phone out of arm's reach and apply the 25-minute Pomodoro protocol. Remember, the 'Study' tab can track your flow state and restrict digital friction automatically.";
    }
    if (lower.includes('eye') || lower.includes('screen') || lower.includes('headache')) {
      return "Screen fatigue is real. Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds. If a headache persists, consider activating the 'Dark Mode' or 'Night Mode' from the Settings Tab.";
    }
    if (lower.includes('lazy') || lower.includes('motivation') || lower.includes('procrastinat')) {
      return "Motivation follows action. Don't wait for the desire to work—start a tiny 5-minute task on your list. Often, just starting reduces the psychological friction by half.";
    }
    if (lower.includes('water') || lower.includes('hydration')) {
      return "Even mild dehydration (1-2%) severely impairs cognitive function and reaction time. Use our Health Tracker to aim for 8 glasses—you might notice a difference immediately!";
    }
    return "That's an excellent point to reflect on. I recommend optimizing one clear digital habit today. Would you like to review your Screen Time stats in the Wellbeing module, or start a Deep Work session right now?";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      
      const data = await response.json();
      const replyText = data.aiMsg?.text || data.text || generateAIResponse(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: replyText }]);
    } catch (err) {
      console.error("AI Assistant API Error:", err);
      // Graceful fallback to local response engine
      const fallback = generateAIResponse(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        className="btn-primary shadow-pulse ai-assistant-bubble"
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '65px', height: '65px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)', transition: 'transform 0.3s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={28} />
      </button>

      {isOpen && (
        <div className="glass-card" style={{ position: 'fixed', bottom: '6.5rem', right: '2rem', width: '380px', height: '520px', zIndex: 1000, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.2)' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                <Bot size={22} color="var(--accent-blue)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', letterSpacing: '0.5px' }}>Smart Life AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}><X size={24} /></button>
          </div>

          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: '1rem', borderRadius: '1.25rem', borderBottomRightRadius: msg.role === 'user' ? '4px' : '1.25rem', borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '1.25rem', background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'rgba(255,255,255,0.06)', color: msg.role === 'user' ? '#fff' : 'var(--text-primary)', border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none', fontSize: '0.95rem', lineHeight: '1.6', boxShadow: msg.role === 'user' ? '0 5px 15px rgba(59, 130, 246, 0.3)' : 'none' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.875rem 1.25rem', borderRadius: '1.25rem', borderBottomLeftRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulseDot 1.2s infinite ease-in-out', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for lifestyle advice..." 
              style={{ flex: 1, padding: '0.875rem 1.25rem', borderRadius: '2rem', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.3s' }} 
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
            />
            <button type="submit" className="btn-primary" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
