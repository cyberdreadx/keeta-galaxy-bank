import { StarWarsPanel } from "./StarWarsPanel";
import { HologramDisplay } from "./HologramDisplay";
import { useEffect, useState } from "react";
import { useKtaPrice } from "@/hooks/useKtaPrice";

export const NetworkStats = () => {
  const [tps, setTps] = useState(9847523);
  const { volume24h, priceChange24h } = useKtaPrice();

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(prev => prev + Math.floor(Math.random() * 10000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const formatVolume = (vol: number | null) => {
    if (vol === null) return "---";
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  return (
    <StarWarsPanel title="// KEETA NETWORK TELEMETRY">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative">
          <HologramDisplay
            label="NETWORK TPS"
            value={tps.toLocaleString()}
            variant="blue"
            size="sm"
          />
          <div className="mt-2 h-1 bg-sw-dark border border-sw-blue/30">
            <div className="h-full bg-sw-blue sw-data-stream" style={{ width: '85%' }} />
          </div>
        </div>

        <div className="relative">
          <HologramDisplay
            label="SETTLEMENT"
            value="400"
            unit="MS"
            variant="green"
            size="sm"
          />
          <div className="mt-2 h-1 bg-sw-dark border border-sw-green/30">
            <div className="h-full bg-sw-green" style={{ width: '95%' }} />
          </div>
        </div>

        <div className="relative">
          <HologramDisplay
            label="24H VOLUME"
            value={formatVolume(volume24h)}
            variant="yellow"
            size="sm"
          />
          <div className="mt-2 h-1 bg-sw-dark border border-sw-yellow/30">
            <div className="h-full bg-sw-yellow" style={{ width: volume24h ? '72%' : '0%' }} />
          </div>
        </div>

        <div className="relative">
          <HologramDisplay
            label="24H CHANGE"
            value={priceChange24h !== null ? `${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%` : "---"}
            variant={priceChange24h !== null && priceChange24h >= 0 ? 'green' : 'red'}
            size="sm"
          />
          <div className="mt-2 flex items-center gap-1 justify-center">
            <div className={`w-2 h-2 rounded-full ${priceChange24h !== null && priceChange24h >= 0 ? 'bg-sw-green' : 'bg-sw-red'} animate-pulse`} />
            <span className={`font-mono text-[10px] ${priceChange24h !== null && priceChange24h >= 0 ? 'text-sw-green' : 'text-sw-red'}`}>
              {priceChange24h !== null ? (priceChange24h >= 0 ? 'BULLISH' : 'BEARISH') : 'NO DATA'}
            </span>
          </div>
        </div>
      </div>

      {/* Live indicator bar */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sw-blue/50 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sw-blue animate-pulse" />
          <span className="font-mono text-xs text-sw-blue tracking-widest">LIVE FEED</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-sw-blue/50 via-sw-blue/50 to-transparent" />
      </div>
    </StarWarsPanel>
  );
};
