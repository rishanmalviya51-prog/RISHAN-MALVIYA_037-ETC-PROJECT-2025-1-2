import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = (n: number) => {
    return Math.sin(n) * Math.cos(n);
  };
  let ctx: CanvasRenderingContext2D;
  let w: number, h: number, nt: number, i: number, x: number, y: number;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctx = canvas.getContext("2d")!;
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    window.onresize = function () {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    render();
  };

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];

  const drawWave = (n: number) => {
    nt += getSpeed();
    for (i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (x = 0; x < w; x += 5) {
        y = noise(x / 800 + 0.3 * i + nt) * 100;
        ctx.lineTo(x, y + h * 0.5); // adjust for height
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId: number;
  const render = () => {
    if (!ctx) return;
    ctx.fillStyle = backgroundFill || "#020617";
    ctx.globalAlpha = waveOpacity || 0.5;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0 w-full h-full"
        ref={canvasRef}
        id="canvas"
      ></canvas>
      <div className={cn("relative z-10 w-full", className)} {...props}>
        {children}
      </div>
    </div>
  );
};