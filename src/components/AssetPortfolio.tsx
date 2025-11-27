import { HologramCard } from "./HologramCard";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change: number;
  color: string;
}

const assets: Asset[] = [
  {
    symbol: "KTA",
    name: "Keeta",
    balance: 85000,
    value: 102000,
    change: 12.5,
    color: "from-hologram to-hologram-glow",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: 15000,
    value: 15000,
    change: 0.01,
    color: "from-blue-400 to-blue-600",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 2.5,
    value: 6250,
    change: -3.2,
    color: "from-purple-400 to-purple-600",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.05,
    value: 2597.32,
    change: 5.8,
    color: "from-orange-400 to-orange-600",
  },
];

export const AssetPortfolio = () => {
  const totalValue = assets.reduce((acc, asset) => acc + asset.value, 0);

  return (
    <HologramCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground uppercase tracking-wider">
          Asset Portfolio
        </h3>
        <span className="text-sm text-muted-foreground">
          ${totalValue.toLocaleString()} total
        </span>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => {
          const percentage = (asset.value / totalValue) * 100;

          return (
            <div
              key={asset.symbol}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-hologram/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-display font-bold text-sm text-primary-foreground",
                    asset.color
                  )}>
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-display font-semibold text-foreground">
                    ${asset.value.toLocaleString()}
                  </p>
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    asset.change >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {asset.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{asset.change >= 0 ? '+' : ''}{asset.change}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", asset.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                {asset.balance.toLocaleString()} {asset.symbol}
              </p>
            </div>
          );
        })}
      </div>
    </HologramCard>
  );
};
