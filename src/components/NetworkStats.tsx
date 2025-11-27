import { StarWarsPanel } from "./StarWarsPanel";
import { HologramDisplay } from "./HologramDisplay";
import { useEffect, useState } from "react";

export const NetworkStats = () => {
  const [tps, setTps] = useState(9847523);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(prev => prev + Math.floor(Math.random() * 10000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
            value="$2.4B"
            variant="yellow"
            size="sm"
          />
          <div className="mt-2 h-1 bg-sw-dark border border-sw-yellow/30">
            <div className="h-full bg-sw-yellow" style={{ width: '72%' }} />
          </div>
        </div>

        <div className="relative">
          <HologramDisplay
            label="SYSTEM STATUS"
            value="OPTIMAL"
            variant="green"
            size="sm"
          />
          <div className="mt-2 flex items-center gap-1 justify-center">
            <div className="w-2 h-2 rounded-full bg-sw-green animate-pulse" />
            <span className="font-mono text-[10px] text-sw-green">ALL SYSTEMS GO</span>
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
