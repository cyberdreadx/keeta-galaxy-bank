import { Send, Download, RefreshCw, QrCode, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "./ui/button";
import { HologramCard } from "./HologramCard";

const actions = [
  {
    icon: ArrowUpRight,
    label: "Send",
    description: "Transfer credits",
    variant: "hologram" as const,
  },
  {
    icon: ArrowDownLeft,
    label: "Receive",
    description: "Get credits",
    variant: "hologram" as const,
  },
  {
    icon: RefreshCw,
    label: "Swap",
    description: "Exchange assets",
    variant: "hologram" as const,
  },
  {
    icon: QrCode,
    label: "Scan",
    description: "QR payment",
    variant: "hologram" as const,
  },
];

export const QuickActions = () => {
  return (
    <HologramCard className="p-6">
      <h3 className="text-lg font-display font-semibold mb-4 text-foreground uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-hologram/40 hover:bg-hologram/5 transition-all duration-300"
          >
            <div className="p-3 rounded-lg bg-hologram/10 border border-hologram/20 group-hover:bg-hologram/20 group-hover:border-hologram/40 group-hover:shadow-hologram transition-all duration-300">
              <action.icon className="w-5 h-5 text-hologram" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-sm text-foreground uppercase tracking-wide">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </HologramCard>
  );
};
