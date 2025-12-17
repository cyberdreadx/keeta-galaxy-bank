import { StarWarsPanel } from "./StarWarsPanel";
import { HologramDisplay } from "./HologramDisplay";
import { Eye, EyeOff, RefreshCw, Loader2, Wallet, PiggyBank, Tag } from "lucide-react";
import { useState } from "react";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { useKtaPrice } from "@/hooks/useKtaPrice";
import { useSettings } from "@/contexts/SettingsContext";
import { useBaseWallet } from "@/contexts/BaseWalletContext";
import { useBaseBalance } from "@/hooks/useBaseBalance";
import { useEthPrice } from "@/hooks/useEthPrice";
import { formatBalance } from "@/lib/formatNumber";

export const BalanceDisplay = () => {
  const [isHidden, setIsHidden] = useState(false);
  const { isConnected, network, activeAccountType, getActiveAccountName } = useKeetaWallet();
  const { balance, isLoading, refetch } = useKeetaBalance();
  const { convertToFiat } = useKtaPrice();
  const { formatFiat } = useSettings();
  
  // Base Wallet
  const { isConnected: isBaseConnected } = useBaseWallet();
  const { ethBalance, ktaBalance } = useBaseBalance();
  const { price: ethPrice } = useEthPrice();

  const accountName = getActiveAccountName();
  const isChecking = activeAccountType === 'checking';
  const isSavings = activeAccountType === 'savings';
  const isCustom = !isChecking && !isSavings;

  const fiatValue = convertToFiat(balance);
  const ethFiatValue = ethPrice ? parseFloat(ethBalance) * ethPrice : 0;
  const baseKtaFiatValue = convertToFiat(parseFloat(ktaBalance));

  return (
    <StarWarsPanel title="// GALACTIC CREDIT BALANCE" className="h-full">
      {/* Active Account Indicator */}
      {isConnected && (
        <div className={`flex items-center justify-center gap-2 mb-4 py-2 px-4 rounded border ${
          isChecking ? 'bg-sw-blue/10 border-sw-blue/40' :
          isSavings ? 'bg-sw-yellow/10 border-sw-yellow/40' :
          'bg-sw-green/10 border-sw-green/40'
        }`}>
          {isChecking && <Wallet className="w-4 h-4 text-sw-blue" />}
          {isSavings && <PiggyBank className="w-4 h-4 text-sw-yellow" />}
          {isCustom && <Tag className="w-4 h-4 text-sw-green" />}
          <span className={`font-mono text-xs tracking-wider ${
            isChecking ? 'text-sw-blue' :
            isSavings ? 'text-sw-yellow' :
            'text-sw-green'
          }`}>
            {accountName.toUpperCase()} ACCOUNT
          </span>
        </div>
      )}

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
        <div className="text-center py-4 overflow-hidden">
          <p className="font-mono text-xs text-sw-blue/60 tracking-[0.3em] uppercase mb-2">
            {isConnected ? `${network.toUpperCase()}NET BALANCE` : 'CONNECT WALLET'}
          </p>
          <div className={`flex items-baseline justify-center gap-3 transition-all duration-300 ${isHidden ? 'blur-lg select-none' : ''} flex-wrap`}>
            <span className="text-5xl md:text-6xl font-display font-bold text-sw-yellow [text-shadow:0_0_30px_hsl(var(--sw-yellow)/0.6),2px_2px_0_hsl(var(--sw-yellow-dim))] break-all max-w-full">
              {!isConnected ? "---" : isLoading ? "..." : isHidden ? "••••••" : formatBalance(balance)}
            </span>
            <span className="text-2xl font-mono text-sw-yellow/80 flex-shrink-0">
              KTA
            </span>
          </div>
          {isConnected && fiatValue !== null && (
            <p className={`font-mono text-lg text-sw-blue/80 mt-1 transition-all duration-300 ${isHidden ? 'blur-lg select-none' : ''} break-all`}>
              ≈ {isHidden ? "••••" : formatFiat(fiatValue)}
            </p>
          )}
          {!isConnected && (
            <p className="font-mono text-xs text-sw-orange/80 mt-2 animate-pulse">
              WALLET DISCONNECTED
            </p>
          )}
        </div>

        {/* Base Wallet Balance Section */}
        {isBaseConnected && (
          <div className="border-t border-sw-blue/20 pt-4 px-4 pb-2 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-xs text-sw-blue/60 tracking-[0.2em] uppercase">
                BASE NETWORK WALLET
              </p>
              <span className="font-mono text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-1 rounded whitespace-nowrap">
                CONNECTED
              </span>
            </div>
            
            {/* ETH Balance */}
            <div className="mb-3 pb-3 border-b border-sw-blue/10">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-display text-xl text-sw-blue font-bold truncate ${isHidden ? 'blur-md' : ''}`}>
                  {parseFloat(ethBalance).toFixed(4)} <span className="text-xs font-mono opacity-70">ETH</span>
                </span>
                <span className={`font-mono text-xs text-sw-blue/60 ${isHidden ? 'blur-md' : ''}`}>
                  ≈ ${ethFiatValue.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* KTA Balance */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-display text-xl text-sw-yellow font-bold truncate ${isHidden ? 'blur-md' : ''}`}>
                  {parseFloat(ktaBalance).toFixed(4)} <span className="text-xs font-mono opacity-70">KTA</span>
                </span>
                <span className={`font-mono text-xs text-sw-blue/60 ${isHidden ? 'blur-md' : ''}`}>
                  ≈ {formatFiat(baseKtaFiatValue)}
                </span>
              </div>
            </div>
          </div>
        )}

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
