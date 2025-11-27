import { StarWarsPanel } from "./StarWarsPanel";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: number;
  currency: string;
  address?: string;
  timestamp: Date;
  status: 'completed' | 'pending';
}

const mockTransactions: Transaction[] = [
  { id: "TX-7A3F", type: "receive", amount: 5000, currency: "KTA", address: "0x7a3f...e82b", timestamp: new Date(Date.now() - 1000 * 60 * 30), status: "completed" },
  { id: "TX-9B2D", type: "send", amount: 1250.5, currency: "KTA", address: "0x9b2d...f41c", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: "completed" },
  { id: "TX-3C8E", type: "swap", amount: 10000, currency: "KTA → USDC", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), status: "completed" },
  { id: "TX-2D4F", type: "receive", amount: 25000, currency: "KTA", address: "REWARDS", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: "completed" },
  { id: "TX-8E5G", type: "send", amount: 500, currency: "KTA", address: "0x3c8e...a92f", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), status: "pending" },
];

const typeConfig = {
  send: { icon: ArrowUpRight, color: "text-sw-red", label: "OUTBOUND" },
  receive: { icon: ArrowDownLeft, color: "text-sw-green", label: "INBOUND" },
  swap: { icon: RefreshCw, color: "text-sw-blue", label: "EXCHANGE" },
};

const formatTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 60) return `${minutes}M AGO`;
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
};

export const TransactionHistory = () => {
  return (
    <StarWarsPanel title="// TRANSACTION LOG">
      <div className="space-y-2">
        {/* Header row */}
        <div className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-sw-blue/30">
          <span className="font-mono text-[10px] text-sw-blue/60">TX-ID</span>
          <span className="font-mono text-[10px] text-sw-blue/60">TYPE</span>
          <span className="font-mono text-[10px] text-sw-blue/60 text-right">AMOUNT</span>
          <span className="font-mono text-[10px] text-sw-blue/60 text-right">TIME</span>
        </div>

        {mockTransactions.map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;

          return (
            <div
              key={tx.id}
              className={cn(
                "grid grid-cols-4 gap-2 px-3 py-3 border border-sw-blue/10 bg-sw-blue/5",
                "hover:bg-sw-blue/10 hover:border-sw-blue/30 transition-all cursor-pointer",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <span className="font-mono text-xs text-sw-white">{tx.id}</span>
              </div>
              
              <div>
                <span className={cn("font-mono text-xs", config.color)}>
                  {config.label}
                </span>
              </div>

              <div className="text-right">
                <span className={cn(
                  "font-mono text-sm font-bold",
                  tx.type === 'receive' ? "text-sw-green" : tx.type === 'send' ? "text-sw-white" : "text-sw-blue"
                )}>
                  {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                  {tx.amount.toLocaleString()}
                </span>
                <span className="font-mono text-[10px] text-sw-blue/60 ml-1">{tx.currency}</span>
              </div>

              <div className="text-right flex items-center justify-end gap-2">
                <span className="font-mono text-[10px] text-sw-blue/60">
                  {formatTime(tx.timestamp)}
                </span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  tx.status === 'completed' ? "bg-sw-green" : "bg-sw-orange animate-pulse"
                )} />
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors font-mono text-xs text-sw-blue tracking-widest">
        VIEW ALL TRANSACTIONS →
      </button>
    </StarWarsPanel>
  );
};
