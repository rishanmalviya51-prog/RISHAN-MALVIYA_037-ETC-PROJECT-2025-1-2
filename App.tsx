
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Hero from './components/ui/Hero';
import { useSyllabusStore } from './store';
import ModuleCard from './components/ModuleCard';
import FocusTimer from './components/FocusTimer';
import { StudyTimeChip } from './components/ui/StudyTimeChip';
import StudyAnalytics from './components/StudyAnalytics';
import Planner from './components/Planner';
import { CycleData, Subject } from './types';
import { BookOpen, ArrowLeft, Layers, CheckCircle, GraduationCap, LogOut, BrainCircuit, CalendarCheck, User, Sparkles, ChevronDown } from 'lucide-react';
import { useUserProfile, PERSONAS, PersonaId } from './context/UserProfileContext';
import { PersonaBackground } from './components/backgrounds/PersonaBackground';
import { ZenifiedLogo } from './components/branding/ZenifiedLogo';

const App: React.FC = () => {
  const { 
    data, 
    sessions,
    hasAccess, 
    loading, 
    grantAccess, 
    revokeAccess,
    toggleSubtopic, 
    addSubtopic, 
    addAttachment, 
    removeAttachment,
    updateAttachmentAnalysis,
    addSession,
    // Planner actions
    planner,
    addTask,
    toggleTask,
    deleteTask
  } = useSyllabusStore();

  const { persona, setPersona } = useUserProfile();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'analytics' | 'planner'>('dashboard');
  
  // Dropdown state
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute minutes studied today
  const minutesToday = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return sessions
      .filter(s => s.startedAt.startsWith(todayStr))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [sessions]);

  // Flatten all subjects for the Timer selector
  const allSubjects = useMemo(() => {
    return data.flatMap(cycle => cycle.subjects);
  }, [data]);

  if (loading) return <div className="h-screen bg-background flex items-center justify-center text-slate-500 font-mono">Loading Neural Data...</div>;

  // 1. Landing Screen (Hero)
  if (!hasAccess) {
    return (
      <>
        {/* Hero Logo Overlay */}
        <div className="absolute top-6 left-6 z-50">
          <ZenifiedLogo size={48} withText variant="ghost" />
        </div>
        <Hero
          trustBadge={{ text: "ACADEMIC YEAR 2025-26", icons: ["✦", "✦", "✦"] }}
          headline={{ line1: "Library Management System", line2: "by ZENIFIED MINDS" }}
          subtitle="Track your modules, manage subtopics, and attach study materials for your 1st-year engineering journey."
          buttons={{
            primary: {
              text: "Access Dashboard",
              onClick: grantAccess
            }
          }}
        />
      </>
    );
  }

  // --- STATS HELPERS ---
  const calculateStats = (subjects: Subject[]) => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalModules = 0;
    let completedModules = 0;
    let totalSubjects = subjects.length;
    let completedSubjects = 0;

    subjects.forEach(sub => {
      let subjectModulesComplete = true;
      sub.modules.forEach(mod => {
        totalModules++;
        const modTotal = mod.subtopics.length;
        const modComplete = mod.subtopics.filter(t => t.completed).length;
        
        totalTopics += modTotal;
        completedTopics += modComplete;

        if (modTotal > 0 && modComplete === modTotal) {
          completedModules++;
        } else {
          subjectModulesComplete = false;
        }
      });
      if (subjectModulesComplete && sub.modules.length > 0) completedSubjects++;
    });

    const percent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    return {
      totalTopics, completedTopics,
      totalModules, completedModules,
      totalSubjects, completedSubjects,
      percent
    };
  };

  // 2. Analytics View
  if (view === 'analytics') {
    return (
      <StudyAnalytics 
        sessions={sessions} 
        subjects={allSubjects} 
        onBack={() => setView('dashboard')} 
      />
    );
  }

  // 3. Planner View
  if (view === 'planner') {
    return (
      <Planner
        plannerState={planner}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onBack={() => setView('dashboard')}
      />
    );
  }

  // --- MAIN DASHBOARD RENDERER ---
  const selectedCycle = data.find(c => c.id === selectedCycleId);
  const selectedSubject = selectedCycle?.subjects.find(s => s.id === selectedSubjectId);

  // Global Stats (Aggregate)
  const globalStats = calculateStats(data.flatMap(c => c.subjects));

  const handleHomeClick = () => {
    setSelectedSubjectId(null);
    setSelectedCycleId(null);
    setView('dashboard');
  };

  const handleExit = () => {
    // Reset local navigation state
    setSelectedCycleId(null);
    setSelectedSubjectId(null);
    setView('dashboard');
    
    // Revoke access (updates global state, renders Hero)
    revokeAccess();
  };

  const renderContent = () => {
    // VIEW: SUBJECT DETAILS
    if (selectedSubject && selectedCycle) {
      const stats = calculateStats([selectedSubject]);

      return (
        <PersonaBackground>
          <div className="relative min-h-screen">
            {/* Watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
              <ZenifiedLogo variant="watermark" size={140} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-24 pt-24 px-4 sm:px-8">
              {/* Nav */}
              <button 
                onClick={() => setSelectedSubjectId(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
              >
                <div className="p-1 rounded-full bg-slate-800 group-hover:bg-primary transition-colors">
                  <ArrowLeft size={16} />
                </div>
                Back to {selectedCycle.name}
              </button>

              {/* Header Card */}
              <div className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-bento border-slate-700/50">
                <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-3 py-1 bg-slate-800/80 border border-slate-600/50 text-slate-300 text-xs font-mono rounded-lg backdrop-blur-md shadow-lg">
                      {selectedSubject.courseCode}
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="text-right">
                          <span className="block text-xs text-slate-400 uppercase tracking-wider font-bold">Progress</span>
                          <span className="block text-xl font-mono text-white leading-none">{stats.percent}%</span>
                       </div>
                       <div className="relative w-12 h-12">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-primary drop-shadow-[0_0_4px_rgba(79,70,229,0.5)]" strokeDasharray={`${stats.percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                          </svg>
                       </div>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4 tracking-tight">{selectedSubject.name}</h1>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1"><Layers size={14} className="text-secondary" /> Modules</div>
                      <div className="text-lg font-mono text-white">{stats.completedModules}<span className="text-slate-500">/{stats.totalModules}</span></div>
                    </div>
                    <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1"><CheckCircle size={14} className="text-accent" /> Topics</div>
                      <div className="text-lg font-mono text-white">{stats.completedTopics}<span className="text-slate-500">/{stats.totalTopics}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="space-y-6">
                {selectedSubject.modules.map(module => (
                  <ModuleCard 
                    key={module.id}
                    module={module}
                    onToggleTopic={(subId) => toggleSubtopic(selectedCycle.id, selectedSubject.id, module.id, subId)}
                    onAddSubtopic={(title) => addSubtopic(selectedCycle.id, selectedSubject.id, module.id, title)}
                    onAddAttachment={(file) => addAttachment(selectedCycle.id, selectedSubject.id, module.id, file)}
                    onRemoveAttachment={(attId) => removeAttachment(selectedCycle.id, selectedSubject.id, module.id, attId)}
                    onUpdateAnalysis={(attId, analysis) => updateAttachmentAnalysis(selectedCycle.id, selectedSubject.id, module.id, attId, analysis)}
                  />
                ))}
              </div>
            </div>
          </div>
        </PersonaBackground>
      );
    }

    // VIEW: CYCLE DASHBOARD (Subject List)
    if (selectedCycle) {
      const stats = calculateStats(selectedCycle.subjects);
      
      return (
        <PersonaBackground>
           <div className="relative min-h-screen">
            {/* Watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
              <ZenifiedLogo variant="watermark" size={140} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto animate-fade-in-up pb-24 pt-24 px-4 sm:px-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setSelectedCycleId(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                  <div className="p-1 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                    <ArrowLeft size={16} />
                  </div>
                  All Cycles
                </button>
              </div>

              {/* Cycle Stats Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-surface to-surfaceLight border border-slate-800 rounded-3xl p-8 mb-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                        {selectedCycle.name}
                      </h2>
                      <p className="text-slate-400 max-w-lg">Manage your subjects, track progress, and organize your study materials for this cycle.</p>
                    </div>
                    
                    <div className="flex gap-6 md:gap-12">
                      <div className="text-center">
                          <div className="text-3xl font-display font-bold text-white">{stats.percent}%</div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Complete</div>
                      </div>
                      <div className="w-px h-12 bg-slate-700"></div>
                      <div className="text-center">
                          <div className="text-3xl font-display font-bold text-secondary">{stats.completedSubjects}<span className="text-lg text-slate-600">/{stats.totalSubjects}</span></div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Subjects</div>
                      </div>
                      <div className="w-px h-12 bg-slate-700"></div>
                      <div className="text-center">
                          <div className="text-3xl font-display font-bold text-accent">{stats.completedTopics}<span className="text-lg text-slate-600">/{stats.totalTopics}</span></div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Topics</div>
                      </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-blue-500 transition-all duration-1000 ease-out" style={{ width: `${stats.percent}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCycle.subjects.map(subject => {
                  const subStats = calculateStats([subject]);
                  return (
                    <div 
                      key={subject.id}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className="group bg-surface hover:bg-surfaceLight border border-slate-800 hover:border-slate-600 p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-bento relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">{subject.courseCode}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${subStats.percent === 100 ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300'}`}>
                          {subStats.percent === 100 && <CheckCircle size={10} />}
                          {subStats.percent}%
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-display font-semibold text-slate-200 mb-2 group-hover:text-white truncate">{subject.name}</h3>
                      
                      <div className="flex gap-4 text-xs text-slate-500 mb-5">
                        <span>{subStats.totalModules} Modules</span>
                        <span>•</span>
                        <span>{subStats.completedTopics}/{subStats.totalTopics} Topics</span>
                      </div>
                      
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full transition-all duration-700" style={{ width: `${subStats.percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </PersonaBackground>
      );
    }

    // VIEW: CYCLE SELECTION (Home)
    return (
      <PersonaBackground>
        <div className="relative min-h-screen flex flex-col">
          {/* Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
            <ZenifiedLogo variant="watermark" size={140} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-6 min-h-[85vh] animate-fade-in-up pt-24">
            
            {/* Global Stats Bar */}
            <div className="w-full max-w-5xl mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl">
                  <div className="p-4 flex flex-col items-center justify-center border-r border-slate-800/50 last:border-0">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total Progress</span>
                    <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{globalStats.percent}%</span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center border-r border-slate-800/50 last:border-0">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Subjects</span>
                    <span className="text-2xl font-display font-bold text-white">{globalStats.completedSubjects} <span className="text-sm text-slate-600">/ {globalStats.totalSubjects}</span></span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center border-r border-slate-800/50 last:border-0">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Modules</span>
                    <span className="text-2xl font-display font-bold text-white">{globalStats.completedModules} <span className="text-sm text-slate-600">/ {globalStats.totalModules}</span></span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Topics Done</span>
                    <span className="text-2xl font-display font-bold text-secondary">{globalStats.completedTopics}</span>
                  </div>
              </div>
            </div>

            <div className="z-10 w-full max-w-4xl text-center space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur text-xs font-mono text-primary-200 mb-4 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  <BrainCircuit size={14} />
                  SELECT YOUR STREAM
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight">
                  Your Engineering <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Companion</span>
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Physics Cycle Card */}
                {data.filter(c => c.id === 'physics').map(cycle => {
                  const cStats = calculateStats(cycle.subjects);
                  return (
                    <div 
                      key={cycle.id}
                      onClick={() => setSelectedCycleId(cycle.id)}
                      className="group relative bg-surface border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-primary/50 transition-all duration-500 hover:shadow-glow text-left flex flex-col h-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                      <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-primary border border-slate-800 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <BookOpen size={28} />
                            </div>
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                  <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                  <path className="text-primary" strokeDasharray={`${cStats.percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                              </svg>
                              <span className="absolute text-sm font-bold text-white">{cStats.percent}%</span>
                            </div>
                        </div>
                        
                        <h3 className="text-3xl font-display font-bold text-white mb-2">{cycle.name}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                          Maths-I, Applied Physics, Electronics, Python Programming, and more.
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-center mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                            <div>
                                <div className="text-lg font-bold text-white">{cStats.completedSubjects}</div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Subjects</div>
                            </div>
                            <div className="border-l border-slate-800">
                                <div className="text-lg font-bold text-white">{cStats.completedModules}</div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Modules</div>
                            </div>
                            <div className="border-l border-slate-800">
                                <div className="text-lg font-bold text-white">{cStats.completedTopics}</div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Topics</div>
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs font-mono text-primary pt-6 border-t border-slate-800 group-hover:border-slate-700 transition-colors">
                        <span className="uppercase tracking-widest font-bold">Open Dashboard</span>
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  );
                })}

                {/* Chemistry Cycle Card */}
                {data.filter(c => c.id === 'chemistry').map(cycle => {
                  const cStats = calculateStats(cycle.subjects);
                  return (
                    <div 
                      key={cycle.id}
                      onClick={() => setSelectedCycleId(cycle.id)}
                      className="group relative bg-surface border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-secondary/50 transition-all duration-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] text-left flex flex-col h-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                      <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-secondary border border-slate-800 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Layers size={28} />
                            </div>
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                  <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                  <path className="text-secondary" strokeDasharray={`${cStats.percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                              </svg>
                              <span className="absolute text-sm font-bold text-white">{cStats.percent}%</span>
                            </div>
                        </div>
                        
                        <h3 className="text-3xl font-display font-bold text-white mb-2">{cycle.name}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                          Maths-I, Chemistry, Electrical, Mechanical, C Programming, and CAD.
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-center mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                            <div>
                                <div className="text-lg font-bold text-white">{cStats.completedSubjects}</div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Subjects</div>
                            </div>
                            <div className="border-l border-slate-800">
                                <div className="text-lg font-bold text-white">{cStats.completedModules}</div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Modules</div>
                            </div>
                            <div className="border-l border-slate-800">
                                <div className="text-lg font-bold text-white">{cStats.completedTopics}</div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Topics</div>
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs font-mono text-secondary pt-6 border-t border-slate-800 group-hover:border-slate-700 transition-colors">
                        <span className="uppercase tracking-widest font-bold">Open Dashboard</span>
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exit Button */}
              <button 
                onClick={handleExit}
                className="mt-8 px-6 py-2 bg-slate-900/80 hover:bg-red-900/20 border border-slate-700 hover:border-red-800/50 text-slate-400 hover:text-red-300 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 mx-auto relative z-50 cursor-pointer"
              >
                <LogOut size={14} /> Exit System
              </button>
            </div>
          </div>
        </div>
      </PersonaBackground>
    );
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white">
      {/* Background Decor - Only visible if not wrapped by PersonaBackground, acts as fallback */}
      {(!selectedCycleId && !selectedSubjectId) && view !== 'dashboard' && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full"></div>
        </div>
      )}

      {/* Global Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-40 bg-background/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div 
            onClick={handleHomeClick} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* New Branding */}
            <ZenifiedLogo size={32} withText variant="ghost" />
          </div>
          
          <button
            onClick={() => setView('planner')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all ml-4"
          >
            <CalendarCheck size={14} className="text-accent" />
            <span className="hidden sm:inline">Plan your time</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Persona Selector Dropdown */}
          <div className="relative mr-2" ref={personaMenuRef}>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hidden md:inline">Persona:</span>
               <button 
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-all min-w-[120px] justify-between"
               >
                 <span className="flex items-center gap-2">
                   {persona.id === 'night_owl' && '🌙'}
                   {persona.id === 'sprinter' && '⚡'}
                   {persona.id === 'deep_diver' && '🌊'}
                   {persona.id === 'light_reader' && '📖'}
                   {persona.name}
                 </span>
                 <ChevronDown size={14} className={`transition-transform duration-200 ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
               </button>
            </div>
            
            {/* Dropdown Menu */}
            {isPersonaMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-fade-in-up z-50">
                {Object.values(PERSONAS).map((p) => (
                   <button
                    key={p.id}
                    onClick={() => {
                      setPersona(p.id);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs flex flex-col hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 ${persona.id === p.id ? 'bg-slate-800/80 text-white' : 'text-slate-400'}`}
                   >
                     <span className="font-bold flex items-center gap-2">
                        <span>
                          {p.id === 'night_owl' && '🌙'}
                          {p.id === 'sprinter' && '⚡'}
                          {p.id === 'deep_diver' && '🌊'}
                          {p.id === 'light_reader' && '📖'}
                        </span>
                        {p.name}
                        {persona.id === p.id && <span className="ml-auto text-primary">●</span>}
                     </span>
                     <span className="text-[10px] opacity-70 mt-1 pl-6">{p.description}</span>
                   </button>
                ))}
              </div>
            )}
          </div>

          <StudyTimeChip 
            minutesToday={minutesToday} 
            onClick={() => setView('analytics')}
          />
        </div>
      </header>

      {/* Main Content Area */}
      {/* We removed standard padding/container here because renderContent() now manages its own wrapping with PersonaBackground */}
      <div className="relative z-10 min-h-screen">
        {renderContent()}
      </div>

      {/* Focus Timer Floating Action Button */}
      <FocusTimer subjects={allSubjects} onFinishSession={addSession} />
    </div>
  );
};

export default App;
