import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export const Vortex = ({
  children,
  className,
  containerClassName,
  particleCount = 200,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "#020617",
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Particle System
  const particles = useRef<any[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
       width = window.innerWidth;
       height = window.innerHeight;
       canvas.width = width;
       canvas.height = height;
    };
    
    window.addEventListener("resize", resize);
    resize();
    
    const initParticles = () => {
        particles.current = [];
        for (let i = 0; i < particleCount; i++) {
            particles.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * rangeSpeed,
                vy: (Math.random() - 0.5) * rangeSpeed,
                radius: baseRadius + Math.random() * rangeRadius,
                hue: baseHue + Math.random() * 50
            });
        }
    };
    
    initParticles();
    
    const animate = () => {
        ctx.fillStyle = backgroundColor + "40"; // trail effect
        ctx.fillRect(0, 0, width, height);
        
        particles.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Vortex math (simplified flow)
            const dx = p.x - width / 2;
            const dy = p.y - height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            p.vx += Math.cos(angle + Math.PI/2) * 0.05;
            p.vy += Math.sin(angle + Math.PI/2) * 0.05;
            
            // Friction and bounds
            p.vx *= 0.99;
            p.vy *= 0.99;
            
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 50%, 0.8)`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    };
    
    const animId = requestAnimationFrame(animate);
    
    return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animId);
    };
  }, [baseHue, backgroundColor, particleCount, rangeSpeed, baseRadius, rangeRadius]);

  return (
    <div className={cn("relative min-h-screen w-full overflow-x-hidden", containerClassName)} ref={containerRef}>
      {/* Fixed position ensures background covers screen during scroll, pointer-events-none allows clicking through */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-transparent pointer-events-none" />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};