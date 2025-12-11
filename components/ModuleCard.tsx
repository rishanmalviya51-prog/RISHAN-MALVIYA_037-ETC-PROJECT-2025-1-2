
import React, { useState } from 'react';
import { Module } from '../types';
import AttachmentManager from './AttachmentManager';
import { ChevronDown, CheckCircle2, Circle, Plus, Brain, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { runModuleMentor } from '../lib/gemini';
import ModuleMentor from './ModuleMentor';
import type { ModuleMentorData } from '../types';

interface ModuleCardProps {
  module: Module;
  onToggleTopic: (subId: string) => void;
  onAddSubtopic: (title: string) => void;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attId: string) => void;
  onUpdateAnalysis?: (attId: string, analysis: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  onToggleTopic, 
  onAddSubtopic,
  onAddAttachment,
  onRemoveAttachment,
  onUpdateAnalysis
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // AI Mentor State
  const [mentorData, setMentorData] = useState<ModuleMentorData | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState<string | null>(null);

  const completed = module.subtopics.filter(s => s.completed).length;
  const total = module.subtopics.length;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onAddSubtopic(newTopic);
      setNewTopic("");
      setIsAdding(false);
    }
  };

  const handleAskMentor = async () => {
    if (module.attachments.length === 0) {
      alert("Please upload at least one file (notes, slides, or questions) for the Mentor to analyze.");
      return;
    }

    setMentorLoading(true);
    setMentorError(null);

    try {
      // We need to fetch the blobs for all attachments to send to Gemini
      const filePromises = module.attachments.map(async (att) => {
        const response = await fetch(att.objectUrl);
        const blob = await response.blob();
        return new File([blob], att.fileName, { type: att.mimeType });
      });

      const files = await Promise.all(filePromises);
      const result = await runModuleMentor(
        module.title,
        module.subtopics.map(t => t.title),
        files
      );
      
      setMentorData(result);
    } catch (err) {
      console.error(err);
      setMentorError("Failed to generate module strategy. Ensure you have valid files and try again.");
    } finally {
      setMentorLoading(false);
    }
  };

  return (
    <div className={`bg-surface border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 ${expanded ? 'shadow-bento ring-1 ring-slate-700' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer flex items-center justify-between group"
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">Module {module.number}</span>
            <div className="h-px flex-1 bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
          </div>
          <h3 className="text-lg font-display font-medium text-slate-100 group-hover:text-white transition-colors">{module.title}</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-slate-400 mb-1">{completed}/{total} Done</div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className={`p-2 rounded-full bg-slate-800/50 text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-6 pt-2 border-t border-slate-800/50 animate-slide-down">
          
          {/* AI MENTOR SECTION */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
               <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                 <Brain size={16} className="text-indigo-400" /> 
                 Module Intelligence
               </h4>
               {!mentorData ? (
                 <button
                  onClick={handleAskMentor}
                  disabled={mentorLoading}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-full 
                  bg-gradient-to-r from-indigo-500 via-cyan-500 to-amber-400 
                  text-black font-bold shadow-lg hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mentorLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {mentorLoading ? "Analyzing..." : "Ask Module Mentor"}
                </button>
               ) : (
                 <button
                  onClick={handleAskMentor}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                 >
                   <RefreshCw size={12} /> Regenerate
                 </button>
               )}
            </div>

            {mentorError && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-xs mb-4">
                {mentorError}
              </div>
            )}

            {!mentorData && !mentorLoading && (
              <div className="p-6 border border-dashed border-slate-700 rounded-xl bg-slate-900/30 text-center">
                <p className="text-sm text-slate-400 mb-2">Unlock AI-powered strategy for this module.</p>
                <p className="text-xs text-slate-500">Upload your slides or notes below, then click "Ask Module Mentor" to generate priority lists, formulas, and a study plan.</p>
              </div>
            )}

            {mentorData && <ModuleMentor data={mentorData} />}
          </div>

          <div className="h-px w-full bg-slate-800 mb-6"></div>

          {/* Subtopics */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Checklist</h4>
            {module.subtopics.map(topic => (
              <div 
                key={topic.id}
                onClick={() => onToggleTopic(topic.id)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className={`mt-0.5 transition-colors ${topic.completed ? 'text-accent' : 'text-slate-600 group-hover:text-slate-500'}`}>
                  {topic.completed ? <CheckCircle2 size={20} className="fill-accent/10" /> : <Circle size={20} />}
                </div>
                <span className={`text-sm leading-relaxed transition-all ${topic.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {topic.title}
                </span>
              </div>
            ))}
          </div>

          {/* Add Subtopic Input */}
          {isAdding ? (
            <form onSubmit={handleAddSubmit} className="mt-3 flex gap-2">
              <input
                autoFocus
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Topic name..."
                className="flex-1 bg-background border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
              <button type="submit" className="px-3 py-2 bg-primary hover:bg-primary-600 text-white rounded-md text-sm">Add</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-md text-sm">Cancel</button>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-3 text-xs flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors px-3 py-2"
            >
              <Plus size={14} /> Add custom topic
            </button>
          )}

          {/* Attachments */}
          <div className="border-t border-slate-800 mt-6 pt-2">
            <AttachmentManager 
              attachments={module.attachments}
              onUpload={onAddAttachment}
              onDelete={onRemoveAttachment}
              onSaveAnalysis={onUpdateAnalysis}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
