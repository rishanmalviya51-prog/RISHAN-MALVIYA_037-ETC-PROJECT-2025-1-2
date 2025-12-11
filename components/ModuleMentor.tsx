
import React from "react";
import { ModuleMentorData } from "../types";
import { AlertTriangle, BookOpen, Calculator, CheckCircle2, ChevronRight, Layers, Lightbulb, Map, TrendingUp } from "lucide-react";

interface ModuleMentorProps {
  data: ModuleMentorData;
}

const ModuleMentor: React.FC<ModuleMentorProps> = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Overview */}
      <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-secondary" />
          <h3 className="font-display font-bold text-white text-lg">Module Strategy</h3>
        </div>
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">{data.module_overview.summary}</p>
        <div className="grid gap-2">
          {data.module_overview.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Pyramid */}
      <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-accent" />
          <h3 className="font-display font-bold text-white text-lg">Priority Hierarchy</h3>
        </div>
        <div className="space-y-3">
          {data.priority.priority_list.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border flex items-start gap-3 ${
                item.band === 'S_TIER' ? 'bg-amber-500/10 border-amber-500/30' :
                item.band === 'A_TIER' ? 'bg-cyan-500/10 border-cyan-500/30' :
                'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-0.5 ${
                item.band === 'S_TIER' ? 'bg-amber-500 text-black' :
                item.band === 'A_TIER' ? 'bg-cyan-500 text-black' :
                'bg-slate-700 text-slate-300'
              }`}>
                {item.band.replace('_TIER', '')}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.topic}</p>
                <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulas & Derivations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.formulas.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={18} className="text-indigo-400" />
              <h3 className="font-display font-bold text-white text-lg">Formula Bank</h3>
            </div>
            <div className="space-y-3">
              {data.formulas.map((f, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="font-mono text-cyan-300 text-sm mb-1">{f.expression}</div>
                  <div className="text-xs text-slate-400 flex justify-between items-center">
                    <span>{f.meaning}</span>
                    {f.high_yield && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 uppercase">High Yield</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.derivations && data.derivations.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-purple-400" />
              <h3 className="font-display font-bold text-white text-lg">Derivations</h3>
            </div>
            <div className="space-y-3">
              {data.derivations.map((d, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-200 mb-2">
                    <span>{d.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                      d.importance === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                    }`}>{d.importance}</span>
                  </div>
                  <div className="pl-3 border-l border-slate-700 space-y-1">
                    {d.steps_outline.slice(0, 3).map((step, idx) => (
                      <p key={idx} className="text-xs text-slate-500 truncate">{step}</p>
                    ))}
                    {d.steps_outline.length > 3 && <p className="text-[10px] text-slate-600 italic">+{d.steps_outline.length - 3} more steps</p>}
                  </div>
                  <div className="mt-2 text-xs font-mono text-emerald-400/80 bg-emerald-900/10 px-2 py-1 rounded inline-block">
                    Result: {d.main_result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plan & Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Map size={18} className="text-emerald-400" />
            <h3 className="font-display font-bold text-white text-lg">Execution Plan</h3>
          </div>
          <div className="space-y-3">
            {data.plan.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400 border border-slate-700">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-300 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {data.mistakes && data.mistakes.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-400" />
              <h3 className="font-display font-bold text-white text-lg">Common Traps</h3>
            </div>
            <ul className="space-y-2">
              {data.mistakes.map((mistake, i) => (
                <li key={i} className="text-sm text-red-200/80 flex gap-2">
                  <span className="text-red-500">•</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleMentor;
