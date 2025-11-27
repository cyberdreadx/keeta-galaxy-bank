import { StarWarsPanel } from "./StarWarsPanel";
import { cn } from "@/lib/utils";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { WalletIcon, Loader2 } from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change: number;
}

export const AssetPortfolio = () => {
  const { isConnected } = useKeetaWallet();
  const { balance, isLoading } = useKeetaBalance();

  // Real asset from Keeta network - KTA is the native token
  const assets: Asset[] = isConnected ? [
    { symbol: "KTA", name: "KEETA", balance: balance, value: balance, change: 0 },
  ] : [];

  const totalValue = assets.reduce((acc, asset) => acc + asset.value, 0);

  if (!isConnected) {
    return (
      <StarWarsPanel title="// ASSET MANIFEST">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <WalletIcon className="w-12 h-12 text-sw-blue/40 mb-4" />
          <p className="font-mono text-sm text-sw-blue/60">WALLET DISCONNECTED</p>
          <p className="font-mono text-xs text-sw-blue/40 mt-2">Connect wallet to view assets</p>
        </div>
      </StarWarsPanel>
    );
  }

  if (isLoading) {
    return (
      <StarWarsPanel title="// ASSET MANIFEST">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sw-blue animate-spin mb-4" />
          <p className="font-mono text-xs text-sw-blue/60">SCANNING ASSETS...</p>
        </div>
      </StarWarsPanel>
    );
  }

  return (
    <StarWarsPanel title="// ASSET MANIFEST">
      <div className="space-y-3">
        {assets.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-sm text-sw-blue/60">NO ASSETS FOUND</p>
          </div>
        ) : (
          assets.map((asset, index) => {
            const percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 100;

            return (
              <div
                key={asset.symbol}
                className="relative border border-sw-blue/20 bg-sw-blue/5 p-4 hover:bg-sw-blue/10 hover:border-sw-blue/40 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Symbol badge */}
                    <div className="w-12 h-12 border border-sw-blue/40 bg-sw-blue/10 flex items-center justify-center">
                      <span className="font-display font-bold text-sm text-sw-blue">
                        {asset.symbol}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-sw-white">{asset.name}</p>
                      <p className="font-mono text-xs text-sw-blue/60">
                        {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {asset.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-sw-yellow">
                      {asset.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} KTA
                    </p>
                    <p className={cn(
                      "font-mono text-xs",
                      asset.change >= 0 ? "text-sw-green" : "text-sw-red"
                    )}>
                      {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change)}%
                    </p>
                  </div>
                </div>

                {/* Allocation bar */}
                <div className="h-1 bg-sw-dark border border-sw-blue/20">
                  <div
                    className="h-full bg-gradient-to-r from-sw-blue to-sw-blue-glow transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[10px] text-sw-blue/60">ALLOCATION</span>
                  <span className="font-mono text-[10px] text-sw-blue">{percentage.toFixed(1)}%</span>
                </div>

                {/* Corner markers */}
                <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-sw-blue/30" />
                <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-sw-blue/30" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-sw-blue/30" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-sw-blue/30" />
              </div>
            );
          })
        )}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-sw-blue/30 flex justify-between items-center">
        <span className="font-mono text-xs text-sw-blue/60 tracking-widest">TOTAL VALUE</span>
        <span className="font-display text-2xl font-bold text-sw-yellow [text-shadow:0_0_15px_hsl(var(--sw-yellow)/0.5)]">
          {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} KTA
        </span>
      </div>
    </StarWarsPanel>
  );
};
