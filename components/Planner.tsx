
import React, { useState, useMemo } from 'react';
import { PlannerState } from '../types';
import { ArrowLeft, CheckSquare, Plus, Trash2, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

interface PlannerProps {
  plannerState: PlannerState;
  onAddTask: (date: string, title: string) => void;
  onToggleTask: (date: string, taskId: string) => void;
  onDeleteTask: (date: string, taskId: string) => void;
  onBack: () => void;
}

type Tab = 'daily' | 'weekly';

const Planner: React.FC<PlannerProps> = ({ plannerState, onAddTask, onToggleTask, onDeleteTask, onBack }) => {
  const [tab, setTab] = useState<Tab>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTask, setNewTask] = useState('');

  // --- Daily Logic ---
  const currentPlan = plannerState.dailyPlans[selectedDate] || { date: selectedDate, tasks: [] };
  const completedCount = currentPlan.tasks.filter(t => t.completed).length;
  const totalCount = currentPlan.tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(selectedDate, newTask.trim());
      setNewTask('');
    }
  };

  // --- Weekly Logic ---
  const weekDates = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0=Sun
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setTab('daily')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                tab === 'daily' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Daily Plan
            </button>
            <button
              onClick={() => setTab('weekly')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                tab === 'weekly' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Weekly Overview
            </button>
          </div>
        </div>

        {tab === 'daily' && (
          <div className="space-y-6">
            {/* Date Nav */}
            <div className="flex items-center justify-between bg-surface border border-slate-800 p-4 rounded-2xl">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <div className="text-sm font-mono text-primary font-bold uppercase tracking-widest">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-xl font-display font-bold text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </div>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Today's Focus</h3>
                <p className="text-sm text-slate-400">{completedCount} of {totalCount} tasks completed</p>
              </div>
              <div className="text-3xl font-display font-bold text-primary">{progress}%</div>
            </div>

            {/* Task List */}
            <div className="bg-surface border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
              <div className="p-6 space-y-4">
                <form onSubmit={handleAddTask} className="relative">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </form>

                <div className="space-y-2 mt-4">
                  {currentPlan.tasks.length === 0 ? (
                    <div className="text-center text-slate-500 py-12 flex flex-col items-center gap-3">
                      <CheckSquare size={32} className="opacity-20" />
                      <p>No tasks for this day. Plan your success!</p>
                    </div>
                  ) : (
                    currentPlan.tasks.map(task => (
                      <div 
                        key={task.id}
                        className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          task.completed 
                            ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                            : 'bg-surfaceLight border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => onToggleTask(selectedDate, task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-500 hover:border-primary'
                            }`}
                          >
                            {task.completed && <Plus size={14} className="rotate-45" />}
                          </button>
                          <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        <button 
                          onClick={() => onDeleteTask(selectedDate, task.id)}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'weekly' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weekDates.map(dateStr => {
              const plan = plannerState.dailyPlans[dateStr] || { tasks: [] };
              const done = plan.tasks.filter(t => t.completed).length;
              const total = plan.tasks.length;
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              
              return (
                <div 
                  key={dateStr}
                  onClick={() => { setSelectedDate(dateStr); setTab('daily'); }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    isToday 
                      ? 'bg-primary/10 border-primary shadow-glow' 
                      : 'bg-surface border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-500'}`}>
                      {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    {isToday && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                  </div>
                  <div className="text-2xl font-display font-bold text-white mb-4">
                    {new Date(dateStr).getDate()}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Tasks</span>
                      <span>{done}/{total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full" 
                        style={{ width: `${total === 0 ? 0 : (done/total)*100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
