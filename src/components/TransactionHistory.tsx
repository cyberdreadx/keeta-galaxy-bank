import { HologramCard } from "./HologramCard";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: number;
  currency: string;
  to?: string;
  from?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    type: "receive",
    amount: 5000,
    currency: "KTA",
    from: "0x7a3f...e82b",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "completed",
  },
  {
    id: "tx_002",
    type: "send",
    amount: 1250.5,
    currency: "KTA",
    to: "0x9b2d...f41c",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "completed",
  },
  {
    id: "tx_003",
    type: "swap",
    amount: 10000,
    currency: "KTA",
    to: "USDC",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: "completed",
  },
  {
    id: "tx_004",
    type: "receive",
    amount: 25000,
    currency: "KTA",
    from: "Keeta Rewards",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "completed",
  },
  {
    id: "tx_005",
    type: "send",
    amount: 500,
    currency: "KTA",
    to: "0x3c8e...a92f",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: "pending",
  },
];

const typeConfig = {
  send: {
    icon: ArrowUpRight,
    color: "text-rebel",
    bg: "bg-rebel/10",
    label: "Sent",
  },
  receive: {
    icon: ArrowDownLeft,
    color: "text-success",
    bg: "bg-success/10",
    label: "Received",
  },
  swap: {
    icon: RefreshCw,
    color: "text-hologram",
    bg: "bg-hologram/10",
    label: "Swapped",
  },
};

const formatTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const TransactionHistory = () => {
  return (
    <HologramCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground uppercase tracking-wider">
          Recent Transactions
        </h3>
        <button className="text-sm text-hologram hover:text-hologram-glow transition-colors font-medium flex items-center gap-1">
          View All <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-hologram/20 hover:bg-muted/50 transition-all duration-300 cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-lg", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {config.label} {tx.type === 'swap' ? `to ${tx.to}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tx.type === 'send' ? `To: ${tx.to}` : tx.type === 'receive' ? `From: ${tx.from}` : ''}
                    <span className="mx-2">•</span>
                    {formatTime(tx.timestamp)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={cn(
                  "font-display font-semibold",
                  tx.type === 'receive' ? "text-success" : tx.type === 'send' ? "text-foreground" : "text-hologram"
                )}>
                  {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                  {tx.amount.toLocaleString()} {tx.currency}
                </p>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  tx.status === 'completed' ? "bg-success/10 text-success" :
                  tx.status === 'pending' ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </HologramCard>
  );
};
