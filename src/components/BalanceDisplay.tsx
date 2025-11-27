import { StarWarsPanel } from "./StarWarsPanel";
import { HologramDisplay } from "./HologramDisplay";
import { Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";

export const BalanceDisplay = () => {
  const [isHidden, setIsHidden] = useState(false);
  const { isConnected, network } = useKeetaWallet();
  const { balance, isLoading, refetch } = useKeetaBalance();

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <StarWarsPanel title="// GALACTIC CREDIT BALANCE" className="h-full">
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={refetch}
          disabled={isLoading || !isConnected}
          className="p-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors text-sw-blue disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
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
            {isConnected ? `${network.toUpperCase()}NET BALANCE` : 'CONNECT WALLET'}
          </p>
          <div className={`flex items-baseline justify-center gap-3 transition-all duration-300 ${isHidden ? 'blur-lg select-none' : ''}`}>
            <span className="text-5xl md:text-6xl font-display font-bold text-sw-yellow [text-shadow:0_0_30px_hsl(var(--sw-yellow)/0.6),2px_2px_0_hsl(var(--sw-yellow-dim))]">
              {!isConnected ? "---" : isLoading ? "..." : isHidden ? "••••••" : formatBalance(balance)}
            </span>
            <span className="text-2xl font-mono text-sw-yellow/80">
              KTA
            </span>
          </div>
          {!isConnected && (
            <p className="font-mono text-xs text-sw-orange/80 mt-2 animate-pulse">
              WALLET DISCONNECTED
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sw-blue/20">
          <HologramDisplay
            label="NETWORK"
            value={isConnected ? network.toUpperCase() : "---"}
            variant={network === 'main' ? 'green' : 'yellow'}
            size="sm"
          />
          <HologramDisplay
            label="STATUS"
            value={isConnected ? "ONLINE" : "OFFLINE"}
            variant={isConnected ? 'green' : 'red'}
            size="sm"
          />
          <HologramDisplay
            label="SYNC"
            value={isLoading ? "LOADING" : "READY"}
            variant={isLoading ? 'yellow' : 'green'}
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
