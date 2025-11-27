import { StarWarsPanel } from "./StarWarsPanel";
import { HologramDisplay } from "./HologramDisplay";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface BalanceDisplayProps {
  balance: number;
  currency?: string;
  change24h?: number;
}

export const BalanceDisplay = ({ 
  balance = 125847.32, 
  currency = "KTA",
  change24h = 12.5 
}: BalanceDisplayProps) => {
  const [isHidden, setIsHidden] = useState(false);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <StarWarsPanel title="// GALACTIC CREDIT BALANCE" className="h-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsHidden(!isHidden)}
          className="p-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors text-sw-blue"
        >
          {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-6">
        {/* Main Balance */}
        <div className="text-center py-4">
          <p className="font-mono text-xs text-sw-blue/60 tracking-[0.3em] uppercase mb-2">
            TOTAL ASSETS
          </p>
          <div className={`flex items-baseline justify-center gap-3 transition-all duration-300 ${isHidden ? 'blur-lg select-none' : ''}`}>
            <span className="text-5xl md:text-6xl font-display font-bold text-sw-yellow [text-shadow:0_0_30px_hsl(var(--sw-yellow)/0.6),2px_2px_0_hsl(var(--sw-yellow-dim))]">
              {isHidden ? "••••••" : formatBalance(balance)}
            </span>
            <span className="text-2xl font-mono text-sw-yellow/80">
              {currency}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sw-blue/20">
          <HologramDisplay
            label="24H CHANGE"
            value={`${change24h >= 0 ? '+' : ''}${change24h}%`}
            variant={change24h >= 0 ? 'green' : 'red'}
            size="sm"
          />
          <HologramDisplay
            label="RANK"
            value="ELITE"
            variant="yellow"
            size="sm"
          />
          <HologramDisplay
            label="STATUS"
            value="ACTIVE"
            variant="green"
            size="sm"
          />
        </div>
      </div>

      {/* Decorative circuit lines */}
      <svg className="absolute bottom-4 left-4 w-16 h-16 text-sw-blue/20" viewBox="0 0 64 64">
        <path d="M0 32 H20 L24 28 H40 L44 32 H64" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M32 0 V20 L28 24 V40 L32 44 V64" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
      </svg>
    </StarWarsPanel>
  );
};
