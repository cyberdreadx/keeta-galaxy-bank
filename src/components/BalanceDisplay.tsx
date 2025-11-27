import { HologramCard } from "./HologramCard";
import { Wallet, TrendingUp, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
    <HologramCard className="p-6 md:p-8" glowIntensity="high">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-hologram/10 border border-hologram/30">
            <Wallet className="w-6 h-6 text-hologram" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Total Balance
            </p>
            <p className="text-xs text-muted-foreground/60">Galactic Credits</p>
          </div>
        </div>
        <button
          onClick={() => setIsHidden(!isHidden)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-display font-bold text-glow-gold transition-all duration-300",
            isHidden ? "blur-lg select-none" : ""
          )}>
            {isHidden ? "••••••" : formatBalance(balance)}
          </span>
          <span className="text-2xl md:text-3xl font-display text-credits font-semibold">
            {currency}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold",
            change24h >= 0 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          )}>
            <TrendingUp className={cn(
              "w-4 h-4",
              change24h < 0 && "rotate-180"
            )} />
            <span>{change24h >= 0 ? '+' : ''}{change24h}%</span>
          </div>
          <span className="text-sm text-muted-foreground">past 24 hours</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-24 h-24 bg-credits/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-hologram/5 rounded-full blur-xl pointer-events-none" />
    </HologramCard>
  );
};
