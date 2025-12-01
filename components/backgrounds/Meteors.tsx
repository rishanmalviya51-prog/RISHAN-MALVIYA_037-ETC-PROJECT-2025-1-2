
import React from "react";
import { cn } from "../../lib/utils";

export const Meteors = ({
  number,
  className,
  color, 
}: {
  number?: number;
  className?: string;
  color?: string; // Expects a hex code or valid CSS color for the trail
}) => {
  const meteors = new Array(number || 20).fill(true);
  
  // Default to slate/blue-ish if no color provided
  const trailColor = color || "#64748b";

  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
            // We inject the color directly into the gradient via CSS variable or style
            // Note: Tailwind before:from-[color] is tricky with dynamic values, using style for the gradient start
            // @ts-ignore
            "--meteor-color": trailColor,
          }}
        >
            <style jsx>{`
                span::before {
                    background-image: linear-gradient(to right, ${trailColor}, transparent);
                }
            `}</style>
        </span>
      ))}
    </>
  );
};
