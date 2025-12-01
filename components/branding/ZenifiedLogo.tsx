
"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface ZenifiedLogoProps {
  size?: number;         // base size in px for width/height
  withText?: boolean;    // show "Zenified Minds" next to it
  variant?: "solid" | "ghost" | "watermark";
  className?: string;
}

export const ZenifiedLogo: React.FC<ZenifiedLogoProps> = ({
  size = 40,
  withText = false,
  variant = "solid",
  className,
}) => {
  const base = "flex items-center gap-2 select-none";

  const variantClasses =
    variant === "solid"
      ? "opacity-100 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]"
      : variant === "ghost"
      ? "opacity-80 hover:opacity-100 transition-opacity duration-300"
      : "opacity-[0.07] pointer-events-none select-none grayscale mix-blend-screen"; // Watermark

  return (
    <div className={cn(base, className)}>
      <div
        className={cn(
          "relative flex items-center justify-center",
          variantClasses
        )}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* 1. OUTLINE GRADIENT (Cyan to Blue) */}
            <linearGradient id="outlineGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" /> {/* Sky 400 */}
              <stop offset="100%" stopColor="#6366f1" /> {/* Indigo 500 */}
            </linearGradient>

            {/* 2. BRAIN ENERGY GRADIENT (Gold/Orange) */}
            <radialGradient id="brainCore" cx="50" cy="35" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />  {/* Yellow 200 */}
              <stop offset="40%" stopColor="#facc15" />  {/* Yellow 400 */}
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" /> {/* Orange 600 */}
            </radialGradient>
            
            {/* 3. AURA RADIAL */}
            <radialGradient id="auraRadial" cx="50" cy="40" r="45" gradientUnits="userSpaceOnUse">
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* --- AURA FIELD --- */}
          <circle cx="50" cy="40" r="40" fill="url(#auraRadial)" />
          
          {/* --- HUMAN SILHOUETTE (Clean Vector Line) --- */}
          {/* Head (top), Neck, Shoulders (bottom) */}
          <path 
             d="M 50 15 
                C 38 15, 30 25, 30 38   /* Head Left */
                C 30 48, 34 54, 38 58   /* Jaw/Neck Left */
                C 38 65, 32 70, 15 85   /* Shoulder Slope Left */
                L 15 90 L 85 90 L 85 85 /* Base */
                C 68 70, 62 65, 62 58   /* Shoulder Slope Right */
                C 66 54, 70 48, 70 38   /* Jaw/Neck Right */
                C 70 25, 62 15, 50 15 Z /* Head Top */"
             stroke="url(#outlineGrad)" 
             strokeWidth="1.5"
             strokeLinecap="round"
             strokeLinejoin="round"
             fill="none"
          />
          
          {/* Fill the body slightly dark to pop the brain */}
          <path 
             d="M 50 15 C 38 15, 30 25, 30 38 C 30 48, 34 54, 38 58 C 38 65, 32 70, 15 85 L 15 90 L 85 90 L 85 85 C 68 70, 62 65, 62 58 C 66 54, 70 48, 70 38 C 70 25, 62 15, 50 15 Z"
             fill="#0f172a"
             fillOpacity="0.6"
             stroke="none"
          />

          {/* --- THE BRAIN (Neural Network Constellation) --- */}
          <g>
             {/* Glow behind connections */}
             <circle cx="50" cy="35" r="14" fill="url(#brainCore)" opacity="0.4" />

             {/* Neural Nodes & Synapses */}
             <g stroke="#facc15" strokeWidth="1.2" strokeLinecap="round">
                {/* Central Trunk */}
                <line x1="50" y1="45" x2="50" y2="28" />
                
                {/* Left Branch */}
                <line x1="50" y1="38" x2="42" y2="34" />
                <line x1="42" y1="34" x2="38" y2="38" />
                <line x1="42" y1="34" x2="40" y2="28" />

                {/* Right Branch */}
                <line x1="50" y1="38" x2="58" y2="34" />
                <line x1="58" y1="34" x2="62" y2="38" />
                <line x1="58" y1="34" x2="60" y2="28" />
                
                {/* Top Branch */}
                <line x1="50" y1="28" x2="46" y2="22" />
                <line x1="50" y1="28" x2="54" y2="22" />
             </g>

             {/* Nodes (Dots) */}
             <g fill="#ffffff">
                <circle cx="50" cy="45" r="1" />
                <circle cx="50" cy="28" r="1" />
                <circle cx="42" cy="34" r="1" />
                <circle cx="58" cy="34" r="1" />
                <circle cx="46" cy="22" r="0.8" />
                <circle cx="54" cy="22" r="0.8" />
                <circle cx="38" cy="38" r="0.8" />
                <circle cx="62" cy="38" r="0.8" />
             </g>
          </g>

          {/* --- HORIZON LINE (Optional Grounding) --- */}
          <line x1="20" y1="90" x2="80" y2="90" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
        </svg>
      </div>

      {withText && variant !== "watermark" && (
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
            ACADEMIC SUITE
          </span>
          <span className="text-sm md:text-base font-display font-bold tracking-[0.05em] text-slate-50">
            ZENIFIED<span className="text-slate-400 font-normal">MINDS</span>
          </span>
        </div>
      )}
    </div>
  );
};
