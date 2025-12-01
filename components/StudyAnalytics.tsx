
import React, { useMemo } from 'react';
import { 
  ArrowLeft, Activity, Flame, Zap, Target, Scale, 
  BrainCircuit, Calendar, Clock, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { StudySession, Subject } from '../types';
import * as Analytics from '../lib/analytics';
import MetricCard from './MetricCard';

interface StudyAnalyticsProps {
  sessions: StudySession[];
  subjects: Subject[];
  onBack: () => void;
}

const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({ sessions, subjects, onBack }) => {
  // --- CORE METRICS CALCULATION ---
  const stats = useMemo(() => {
    // 1. Consistency
    const consistency = Analytics.getConsistencyScore(sessions);
    
    // 2. Focus Quality
    const focus = Analytics.getFocusQuality(sessions);
    
    // 3. Efficiency
    const efficiency = Analytics.getEfficiencyIndex(sessions, subjects);
    
    // 4. Momentum
    const momentum = Analytics.getMomentumIndex(sessions);
    
    // 5. Burn Risk
    const burnRisk = Analytics.getBurnRisk(sessions);
    
    // 6. Weak Modules
    const weakModules = Analytics.getWeakModules(sessions, subjects);
    
    // 7. Topic Revisit Rate
    const revisitRate = Analytics.getTopicRevisitRate(sessions);
    
    // 8. Balance Score
    const balance = Analytics.getBalanceScore(sessions, subjects);
    
    // 9. Confidence Score
    const confidence = Analytics.getConfidenceScore(sessions, subjects);
    
    // 10. Prediction
    const prediction = Analytics.getSyllabusPrediction(sessions, subjects);
    
    // 11. Time Intelligence
    const peakTime = Analytics.getPeakStudyTime(sessions);
    
    // 12. Graph Data
    const graphData = Analytics.getWeekdayData(sessions);

    return {
      consistency,
      focus,
      efficiency,
      momentum,
      burnRisk,
      weakModules,
      revisitRate,
      balance,
      confidence,
      prediction,
      peakTime,
      graphData
    };
  }, [sessions, subjects]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 animate-fade-in-up pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Analytics Engine</span>
          </div>
        </div>

        {/* ROW 1: PRIMARY KPIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
                title="Consistency" 
                value={`${stats.consistency}%`} 
                icon={Activity}
                status={stats.consistency > 70 ? 'good' : stats.consistency < 40 ? 'bad' : 'neutral'}
                tooltip="Percentage of days studied in the last 14 days."
            />
            <MetricCard 
                title="Focus Quality" 
                value={stats.focus.score}
                subtitle={stats.focus.rating}
                icon={BrainCircuit}
                status={stats.focus.rating === 'HIGH' ? 'good' : stats.focus.rating === 'LOW' ? 'bad' : 'neutral'}
                tooltip="Based on session duration and interruption frequency."
            />
            <MetricCard 
                title="Momentum" 
                value={`${stats.momentum.value}%`} 
                trend={stats.momentum.trend as any}
                trendValue={stats.momentum.trend === 'up' ? 'Growing' : 'Slowing'}
                icon={TrendingUp}
                status={stats.momentum.trend === 'up' ? 'good' : 'warning'}
                tooltip="Comparison of study volume vs previous week."
            />
             <MetricCard 
                title="Confidence" 
                value={`${stats.confidence}%`} 
                icon={Target}
                status={stats.confidence > 75 ? 'good' : 'neutral'}
                tooltip="AI estimation of syllabus mastery."
            />
        </div>

        {/* ROW 2: GRAPH & EFFICIENCY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productivity Graph */}
            <div className="lg:col-span-2 bg-surface/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-200 font-bold flex items-center gap-2">
                        <Activity size={18} className="text-secondary" />
                        Weekly Productivity
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">MINUTES</span>
                    </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 md:gap-4 relative z-10">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="w-full h-px bg-slate-600"></div>
                        <div className="w-full h-px bg-slate-600"></div>
                        <div className="w-full h-px bg-slate-600"></div>
                        <div className="w-full h-px bg-slate-600"></div>
                    </div>

                    {stats.graphData.days.map((day, i) => {
                        const val = stats.graphData.totals[i];
                        const pct = (val / stats.graphData.maxVal) * 100;
                        return (
                            <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group">
                                <div className="w-full max-w-[40px] bg-slate-800/50 rounded-t-lg relative overflow-hidden h-full flex items-end">
                                    <div 
                                        className="w-full bg-gradient-to-t from-secondary/40 to-primary/80 group-hover:from-secondary/60 group-hover:to-primary transition-all duration-500 rounded-t-lg relative"
                                        style={{ height: `${pct}%`, minHeight: '4px' }}
                                    >
                                        {val > 0 && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                {val}m
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="mt-2 text-[10px] font-mono text-slate-500 uppercase">{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Efficiency & Predictions */}
            <div className="space-y-4">
                 <div className="bg-surface/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-accent" /> Efficiency Index
                    </h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-display font-bold text-white">{stats.efficiency}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">topics / hour</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.min(100, stats.efficiency * 20)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Target: &gt; 2.5 topics/hr for optimal flow.</p>
                 </div>

                 <div className="bg-surface/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-400" /> Syllabus Forecast
                    </h3>
                     <div className="flex items-end gap-2">
                        <span className="text-4xl font-display font-bold text-white">
                            {stats.prediction.daysLeft > 365 ? '∞' : stats.prediction.daysLeft}
                        </span>
                        <span className="text-sm font-medium text-slate-500 mb-1">days left</span>
                    </div>
                    {stats.prediction.completionDate && (
                         <p className="text-xs text-indigo-300 mt-2 bg-indigo-500/10 py-1 px-2 rounded inline-block">
                            ETA: {stats.prediction.completionDate.toLocaleDateString()}
                         </p>
                    )}
                 </div>
            </div>
        </div>

        {/* ROW 3: ADVANCED INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Burn Risk */}
            <div className={`rounded-2xl p-6 border ${
                stats.burnRisk.status === 'SAFE' ? 'bg-green-500/5 border-green-500/20' : 
                stats.burnRisk.status === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' : 
                'bg-red-500/5 border-red-500/20'
            }`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Flame size={16} className={stats.burnRisk.status === 'SAFE' ? 'text-green-400' : 'text-red-400'} /> 
                        Burnout Detector
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                         stats.burnRisk.status === 'SAFE' ? 'text-green-400 border-green-500/30' : 
                         stats.burnRisk.status === 'WARNING' ? 'text-amber-400 border-amber-500/30' : 
                         'text-red-400 border-red-500/30'
                    }`}>
                        {stats.burnRisk.status}
                    </span>
                </div>
                <p className="text-2xl font-display font-bold text-white">{stats.burnRisk.reason}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Based on study consistency, duration trends, and momentum crashes.
                </p>
            </div>

            {/* Time Intelligence */}
            <div className="bg-surface/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                 <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-blue-400" /> Peak Productivity
                </h3>
                <p className="text-2xl font-display font-bold text-white">{stats.peakTime}</p>
                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    You perform best during this time window based on historical session data.
                </p>
            </div>

            {/* Balance Score */}
            <div className="bg-surface/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Scale size={16} className="text-purple-400" /> Subject Balance
                    </h3>
                    <span className="text-xl font-bold text-white">{stats.balance}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                        className={`h-full rounded-full ${stats.balance > 80 ? 'bg-green-500' : stats.balance > 50 ? 'bg-purple-500' : 'bg-red-500'}`}
                        style={{ width: `${stats.balance}%` }}
                    ></div>
                </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    Measure of how evenly you distribute time across different subjects.
                </p>
            </div>
        </div>

        {/* ROW 4: WEAK AREAS */}
        {stats.weakModules.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={20} className="text-red-400" />
                    <h3 className="text-lg font-bold text-red-200">Attention Needed: Low ROI Modules</h3>
                </div>
                <p className="text-sm text-red-200/70 mb-4">
                    You are spending above-average time on these modules but making below-average progress. Consider changing your study technique for:
                </p>
                <div className="flex flex-wrap gap-3">
                    {stats.weakModules.map(m => (
                        <span key={m} className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium">
                            {m}
                        </span>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default StudyAnalytics;
