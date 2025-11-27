import { cn } from "@/lib/utils";

interface HologramDisplayProps {
  value: string | number;
  label: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blue' | 'yellow' | 'green' | 'red';
}

export const HologramDisplay = ({
  value,
  label,
  unit,
  size = 'md',
  variant = 'blue'
}: HologramDisplayProps) => {
  const sizeStyles = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const colorStyles = {
    blue: 'text-sw-blue [text-shadow:0_0_20px_hsl(var(--sw-blue)/0.8)]',
    yellow: 'text-sw-yellow [text-shadow:0_0_20px_hsl(var(--sw-yellow)/0.8)]',
    green: 'text-sw-green [text-shadow:0_0_20px_hsl(var(--sw-green)/0.8)]',
    red: 'text-sw-red [text-shadow:0_0_20px_hsl(var(--sw-red)/0.8)]',
  };

  return (
    <div className="text-center sw-flicker">
      <p className="font-mono text-xs text-sw-blue/60 tracking-[0.3em] uppercase mb-1">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-2">
        <span className={cn(
          "font-display font-bold",
          sizeStyles[size],
          colorStyles[variant]
        )}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-sm text-sw-blue/80">{unit}</span>
        )}
      </div>
    </div>
  );
};
