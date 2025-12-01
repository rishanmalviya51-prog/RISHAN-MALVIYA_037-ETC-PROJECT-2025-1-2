
"use client";

import React from "react";
import { useUserProfile } from "../../context/UserProfileContext";

import { WavyBackground } from "./WavyBackground";
import { Vortex } from "./Vortex";
import { HeroGeometric } from "./HeroGeometric";
import { Meteors } from "./Meteors";
import { cn } from "../../lib/utils";

interface PersonaBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrap ANY page with <PersonaBackground> to get
 * persona-based animated background for that page.
 */
export const PersonaBackground: React.FC<PersonaBackgroundProps> = ({
  children,
  className,
}) => {
  const { persona } = useUserProfile();
  const id = persona.id;

  // 🌙 Night Owl → WavyBackground
  if (id === "night_owl") {
    return (
      <WavyBackground containerClassName={cn("relative", className)}>
        {children}
      </WavyBackground>
    );
  }

  // ⚡ Sprinter → Vortex
  if (id === "sprinter") {
    return (
      <Vortex containerClassName={cn("relative", className)}>
        {children}
      </Vortex>
    );
  }

  // 🌊 Deep Diver → HeroGeometric
  if (id === "deep_diver") {
    return (
      <HeroGeometric className={className}>
        <div className={cn("mt-12 md:mt-16", className)}>{children}</div>
      </HeroGeometric>
    );
  }

  // 📖 Light Reader → Neon Royal Purple Theme (Cyberpunk/Synthwave Vibe)
  if (id === "light_reader") {
    return (
      <div
        className={cn(
          "relative min-h-screen w-full overflow-hidden flex flex-col royal-theme-wrapper",
          className
        )}
      >
        {/* CSS Overrides for Neon Royal Purple Theme */}
        <style jsx global>{`
          /* Backgrounds - Deep Royal Purple */
          .royal-theme-wrapper {
             background: radial-gradient(circle at center, #2e1065 0%, #020617 100%);
          }

          /* Cards & Panels - Translucent Purple with Neon Glow */
          .royal-theme-wrapper .bg-surface, 
          .royal-theme-wrapper .bg-slate-900,
          .royal-theme-wrapper .glass-panel {
            background-color: rgba(19, 7, 46, 0.7) !important; /* Deep violet */
            border-color: rgba(217, 70, 239, 0.4) !important; /* Neon Fuchsia border */
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.15), inset 0 0 0 1px rgba(217, 70, 239, 0.1) !important;
            backdrop-filter: blur(16px);
          }
          
          /* Page Background overrides */
          .royal-theme-wrapper .bg-background {
            background-color: transparent !important;
          }

          /* Typography - Crisp White & Neon Accents */
          .royal-theme-wrapper .text-white,
          .royal-theme-wrapper .text-slate-100,
          .royal-theme-wrapper .text-slate-200 {
            color: #ffffff !important;
            text-shadow: 0 0 5px rgba(255,255,255,0.3);
          }
          
          .royal-theme-wrapper .text-slate-400, 
          .royal-theme-wrapper .text-slate-500 {
            color: #e9d5ff !important; /* Purple-200 */
          }
          
          /* Borders */
          .royal-theme-wrapper .border-slate-800,
          .royal-theme-wrapper .border-slate-700 {
            border-color: rgba(139, 92, 246, 0.3) !important; /* Violet-500 */
          }

          /* Primary Accents -> Neon Pink/Fuchsia */
          .royal-theme-wrapper .text-primary,
          .royal-theme-wrapper .bg-primary {
             color: #f0abfc !important; /* Fuchsia-300 */
             background-color: #d946ef; /* Fuchsia-500 (only for bg) */
          }
          
          /* Secondary Accents -> Neon Cyan */
          .royal-theme-wrapper .text-secondary {
             color: #22d3ee !important; /* Cyan-400 */
          }

          /* Progress Bars Gradient Override */
          .royal-theme-wrapper .bg-gradient-to-r {
            background-image: linear-gradient(to right, #d946ef, #8b5cf6) !important; /* Fuchsia to Violet */
          }
          
          /* Headers */
          .royal-theme-wrapper header {
            background-color: rgba(19, 7, 46, 0.8) !important;
            border-bottom-color: rgba(217, 70, 239, 0.3) !important;
          }
        `}</style>

        {/* Neon Pink/Fuchsia Meteors */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <Meteors number={40} color="#d946ef" className="shadow-[0_0_10px_#d946ef]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">{children}</div>
      </div>
    );
  }

  // fallback
  return (
    <div className={cn("min-h-screen bg-slate-950", className)}>{children}</div>
  );
};
