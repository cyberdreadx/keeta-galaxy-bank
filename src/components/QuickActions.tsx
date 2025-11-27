import { RefreshCw, Scan, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StarWarsPanel } from "./StarWarsPanel";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: ArrowUpRight,
    label: "SEND",
    code: "TX-001",
    path: "/send",
  },
  {
    icon: ArrowDownLeft,
    label: "RECEIVE",
    code: "RX-002",
    path: "/receive",
  },
  {
    icon: RefreshCw,
    label: "SWAP",
    code: "SW-003",
    path: null,
  },
  {
    icon: Scan,
    label: "SCAN",
    code: "SC-004",
    path: null,
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  
  const handleClick = (path: string | null) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <StarWarsPanel title="// COMMAND INTERFACE" className="h-full">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleClick(action.path)}
            disabled={!action.path}
            className={cn(
              "group relative p-4 border border-sw-blue/30 bg-sw-blue/5",
              "hover:bg-sw-blue/10 hover:border-sw-blue/60",
              "transition-all duration-300",
              "sw-target",
              !action.path && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Icon */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <action.icon className="w-8 h-8 text-sw-blue group-hover:text-sw-blue-glow transition-colors [filter:drop-shadow(0_0_8px_hsl(var(--sw-blue)/0.5))]" />
                {/* Animated ring on hover */}
                <div className="absolute inset-0 -m-2 border border-sw-blue/0 group-hover:border-sw-blue/40 rounded-full transition-all duration-300 group-hover:animate-ping" />
              </div>
              
              <div className="text-center">
                <p className="font-display font-bold text-sm text-sw-white tracking-wider">
                  {action.label}
                </p>
                <p className="font-mono text-[10px] text-sw-blue/60">
                  {action.code}
                </p>
              </div>
            </div>

            {/* Corner indicators */}
            <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-sw-blue/40" />
            <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-sw-blue/40" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-sw-blue/40" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-sw-blue/40" />
          </button>
        ))}
      </div>
    </StarWarsPanel>
  );
};
