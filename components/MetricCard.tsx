
import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  status?: 'good' | 'neutral' | 'bad' | 'warning';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  status = 'neutral',
  trend,
  trendValue,
  tooltip 
}) => {
  
  const statusColors = {
    good: 'text-green-400 bg-green-500/10 border-green-500/20',
    neutral: 'text-primary bg-primary/10 border-primary/20',
    bad: 'text-red-400 bg-red-500/10 border-red-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-slate-500'
  };

  return (
    <div className="bg-surface/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
            {tooltip && (
                <div className="group/tip relative">
                    <HelpCircle size={12} className="text-slate-600 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-900 text-slate-300 text-[10px] rounded border border-slate-700 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20">
                        {tooltip}
                    </div>
                </div>
            )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${statusColors[status]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-bold text-white tracking-tight">{value}</span>
        {subtitle && <span className="text-sm font-medium text-slate-500">{subtitle}</span>}
      </div>

      {(trend || trendValue) && (
        <div className="mt-3 flex items-center gap-2 text-xs font-mono">
          <span className={`flex items-center gap-1 font-bold ${trend ? trendColors[trend] : 'text-slate-400'}`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </span>
          <span className="text-slate-600">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
