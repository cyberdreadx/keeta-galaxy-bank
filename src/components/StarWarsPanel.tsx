import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StarWarsPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'warning' | 'danger';
}

export const StarWarsPanel = ({ 
  children, 
  className,
  title,
  variant = 'default'
}: StarWarsPanelProps) => {
  const borderColor = {
    default: 'border-sw-blue/40',
    warning: 'border-sw-orange/40',
    danger: 'border-sw-red/40',
  };

  const glowColor = {
    default: 'shadow-[0_0_20px_hsl(var(--sw-blue)/0.2),inset_0_0_30px_hsl(var(--sw-blue)/0.05)]',
    warning: 'shadow-[0_0_20px_hsl(var(--sw-orange)/0.2),inset_0_0_30px_hsl(var(--sw-orange)/0.05)]',
    danger: 'shadow-[0_0_20px_hsl(var(--sw-red)/0.2),inset_0_0_30px_hsl(var(--sw-red)/0.05)]',
  };

  return (
    <div
      className={cn(
        "relative bg-gradient-to-b from-[hsl(220,40%,8%)] to-[hsl(220,40%,4%)]",
        "border",
        borderColor[variant],
        glowColor[variant],
        "sw-scanlines",
        className
      )}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-sw-blue/60" />
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-sw-blue/60" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-sw-blue/60" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-sw-blue/60" />

      {/* Title bar */}
      {title && (
        <div className="border-b border-sw-blue/30 px-4 py-2 bg-sw-blue/5">
          <h3 className="font-mono text-sm text-sw-blue tracking-[0.3em] uppercase">
            {title}
          </h3>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-4">
        {children}
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 sw-grid opacity-30 pointer-events-none" />
    </div>
  );
};
