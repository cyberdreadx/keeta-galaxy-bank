import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HologramCardProps {
  children: ReactNode;
  className?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
  animate?: boolean;
}

export const HologramCard = ({ 
  children, 
  className,
  glowIntensity = 'medium',
  animate = false 
}: HologramCardProps) => {
  const glowStyles = {
    low: 'shadow-[0_0_15px_hsl(var(--hologram)/0.1)]',
    medium: 'shadow-[0_0_25px_hsl(var(--hologram)/0.2)]',
    high: 'shadow-[0_0_40px_hsl(var(--hologram)/0.3)]',
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-hologram/20 bg-card/80 backdrop-blur-xl",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-hologram/5 before:to-transparent before:pointer-events-none",
        "after:absolute after:inset-[1px] after:rounded-xl after:bg-gradient-to-t after:from-card after:to-card/50 after:pointer-events-none after:-z-10",
        glowStyles[glowIntensity],
        animate && "animate-glow-pulse",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-hologram/40 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-hologram/40 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-hologram/40 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-hologram/40 rounded-br-lg" />
    </div>
  );
};
