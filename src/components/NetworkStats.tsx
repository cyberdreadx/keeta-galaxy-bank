import { HologramCard } from "./HologramCard";
import { Zap, Clock, Activity, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface Stat {
  icon: typeof Zap;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}

const stats: Stat[] = [
  {
    icon: Zap,
    label: "Network TPS",
    value: "10M+",
    subValue: "Transactions/sec",
    color: "text-credits",
  },
  {
    icon: Clock,
    label: "Settlement Time",
    value: "400ms",
    subValue: "Average finality",
    color: "text-hologram",
  },
  {
    icon: Activity,
    label: "Total Volume",
    value: "$2.4B",
    subValue: "24h trading",
    color: "text-success",
  },
  {
    icon: Shield,
    label: "Network Status",
    value: "Optimal",
    subValue: "All systems go",
    color: "text-success",
  },
];

export const NetworkStats = () => {
  const [tps, setTps] = useState(9847523);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(prev => prev + Math.floor(Math.random() * 10000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <HologramCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <h3 className="text-lg font-display font-semibold text-foreground uppercase tracking-wider">
          Keeta Network Status
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-hologram/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {stat.label}
              </span>
            </div>
            <p className={`text-2xl font-display font-bold ${stat.color}`}>
              {stat.label === "Network TPS" ? tps.toLocaleString() : stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
          </div>
        ))}
      </div>

      {/* Live activity indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-hologram to-hologram-glow data-stream" />
        </div>
        <span className="text-xs text-muted-foreground">Live</span>
      </div>
    </HologramCard>
  );
};
