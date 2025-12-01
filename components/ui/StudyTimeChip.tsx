
import React from 'react';
import { Clock } from 'lucide-react';

interface StudyTimeChipProps {
  minutesToday: number;
  onClick?: () => void;
  className?: string;
}

export const StudyTimeChip: React.FC<StudyTimeChipProps> = ({
  minutesToday,
  onClick,
  className = "",
}) => {
  const formatLabel = (totalMinutes: number) => {
    if (totalMinutes <= 0) return "0 min";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    const mm = minutes.toString().padStart(2, "0");
    return `${hours}h ${mm}m`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-full border border-slate-700/60 
      bg-slate-900/80 px-4 py-2 text-xs md:text-sm font-medium text-slate-100 
      shadow-lg shadow-black/40 backdrop-blur-md hover:bg-slate-800/90 
      hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 
      hover:-translate-y-0.5 group z-50 ${className}`}
    >
      <div className="relative">
        <Clock size={14} className="text-secondary group-hover:text-primary transition-colors" />
        {minutesToday > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
        )}
      </div>
      <span className="flex flex-col items-start leading-none gap-0.5">
        <span className="uppercase tracking-widest text-[0.6rem] text-slate-400 font-bold">Studied Today</span>
        <span className="font-mono text-secondary group-hover:text-white transition-colors">{formatLabel(minutesToday)}</span>
      </span>
    </button>
  );
};
