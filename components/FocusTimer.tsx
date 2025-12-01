
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Timer, X, CheckCircle2, Coffee } from 'lucide-react';
import { Subject, StudySession } from '../types';

interface FocusTimerProps {
  subjects: Subject[];
  onFinishSession: (session: StudySession) => void;
}

type TimerMode = "idle" | "focusing" | "break";

const PRESETS = [15, 25, 45, 60];

const FocusTimer: React.FC<FocusTimerProps> = ({ subjects, onFinishSession }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>("idle");
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [includeBreaks, setIncludeBreaks] = useState(true);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    if (mode === "idle") {
      setMode("focusing");
      setTimeLeft(duration * 60);
      startTimeRef.current = Date.now();
    }
    setIsActive(true);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopTimer = () => {
    pauseTimer();
    setMode("idle");
    setTimeLeft(duration * 60);
  };

  const handleComplete = () => {
    pauseTimer();
    const now = new Date();
    
    // Only log session if we were focusing
    if (mode === "focusing") {
      const session: StudySession = {
        id: crypto.randomUUID(),
        subjectId: selectedSubjectId || undefined,
        durationMinutes: duration,
        startedAt: new Date(Date.now() - duration * 60000).toISOString(),
        endedAt: now.toISOString(),
      };
      onFinishSession(session);
      
      // Play sound (optional, browser policy dependent)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) { /* ignore */ }

      if (includeBreaks) {
        setMode("break");
        setTimeLeft(5 * 60); // 5 min break
        startTimer(); // Auto start break? Or wait for user. Let's wait.
        setIsActive(false); // Let user start break manually
      } else {
        setMode("idle");
      }
    } else {
      // Break finished
      setMode("idle");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === "idle" ? 0 : 100 - (timeLeft / (mode === "break" ? 5 * 60 : duration * 60)) * 100;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-primary/50 group ${
          isActive ? 'bg-slate-900 border-2 border-accent animate-pulse' : 'bg-gradient-to-br from-primary to-secondary'
        }`}
      >
        {isActive ? (
          <span className="font-mono text-xs font-bold text-accent">{Math.ceil(timeLeft/60)}m</span>
        ) : (
          <Timer size={24} className="text-white group-hover:rotate-12 transition-transform" />
        )}
      </button>

      {/* Timer Modal Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={() => !isActive && setIsOpen(false)} />
          <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-surface border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
            
            {/* Header */}
            <div className="bg-slate-900/50 p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                {mode === "break" ? <Coffee size={18} className="text-accent" /> : <Timer size={18} className="text-primary" />}
                <span className="font-display font-bold text-slate-200">
                  {mode === "idle" ? "Focus Session" : mode === "break" ? "Break Time" : "Focusing..."}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              
              {/* Timer Display */}
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke={mode === "break" ? "#FACC15" : "#4F46E5"} 
                    strokeWidth="4" 
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="text-center z-10">
                  <div className="text-5xl font-mono font-bold text-slate-100 tabular-nums tracking-tighter">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">
                    {mode === "idle" ? "Ready" : isActive ? "Running" : "Paused"}
                  </div>
                </div>
              </div>

              {/* Controls - Idle Mode */}
              {mode === "idle" && (
                <div className="w-full space-y-4 animate-fade-in-up">
                  {/* Duration Presets */}
                  <div className="flex justify-between gap-2">
                    {PRESETS.map(m => (
                      <button
                        key={m}
                        onClick={() => setDuration(m)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          duration === m 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>

                  {/* Subject Selector */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase font-bold">Track Subject (Optional)</label>
                    <select 
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg p-2.5 focus:border-primary focus:outline-none"
                    >
                      <option value="">General Study</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Toggle Break */}
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900/30 cursor-pointer hover:border-slate-700 transition-colors">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeBreaks ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                      {includeBreaks && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={includeBreaks} onChange={e => setIncludeBreaks(e.target.checked)} />
                    <span className="text-sm text-slate-400">Auto-start 5m break after focus</span>
                  </label>

                  <button 
                    onClick={startTimer}
                    className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Play size={18} fill="currentColor" /> Start Focus
                  </button>
                </div>
              )}

              {/* Controls - Active Mode */}
              {mode !== "idle" && (
                <div className="flex gap-4 w-full animate-fade-in-up">
                  {!isActive ? (
                    <button 
                      onClick={startTimer}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={18} fill="currentColor" /> Resume
                    </button>
                  ) : (
                    <button 
                      onClick={pauseTimer}
                      className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Pause size={18} fill="currentColor" /> Pause
                    </button>
                  )}
                  
                  <button 
                    onClick={stopTimer}
                    className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center"
                  >
                    <Square size={18} fill="currentColor" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FocusTimer;
