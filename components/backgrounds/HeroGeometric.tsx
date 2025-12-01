import React from "react";
import { cn } from "../../lib/utils";

export const HeroGeometric = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative min-h-screen w-full bg-slate-950 overflow-hidden", className)}>
        {/* Geometric Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-overlay filter"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl mix-blend-overlay filter"></div>
            
            {/* Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <div className="absolute inset-0 bg-slate-950/80"></div>
            
            {/* Lines */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-700/20 to-transparent"></div>
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-700/20 to-transparent"></div>
            <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
            {children}
        </div>
    </div>
  );
};