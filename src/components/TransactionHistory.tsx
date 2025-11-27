import { StarWarsPanel } from "./StarWarsPanel";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2, WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useState, useEffect, useCallback } from "react";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: number;
  currency: string;
  address?: string;
  timestamp: Date;
  status: 'completed' | 'pending';
}

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
  const { client, isConnected, publicKey } = useKeetaWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!client || !isConnected) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch account history from Keeta network
      const accountData = await client.account();
      const history = accountData?.history ?? [];
      
      // Transform Keeta transaction format to our format
      const formattedTxs: Transaction[] = history.slice(0, 10).map((tx: any, index: number) => {
        const isSend = tx.sender === publicKey;
        return {
          id: `TX-${tx.hash?.substring(0, 4).toUpperCase() || index}`,
          type: isSend ? 'send' : 'receive',
          amount: Number(tx.amount ?? 0) / 1e9,
          currency: 'KTA',
          address: isSend ? tx.recipient?.substring(0, 8) : tx.sender?.substring(0, 8),
          timestamp: new Date(tx.timestamp ?? Date.now()),
          status: tx.confirmed ? 'completed' : 'pending',
        };
      });

      setTransactions(formattedTxs);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [client, isConnected, publicKey]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!isConnected) {
    return (
      <StarWarsPanel title="// TRANSACTION LOG">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <WalletIcon className="w-12 h-12 text-sw-blue/40 mb-4" />
          <p className="font-mono text-sm text-sw-blue/60">WALLET DISCONNECTED</p>
          <p className="font-mono text-xs text-sw-blue/40 mt-2">Connect wallet to view transactions</p>
        </div>
      </StarWarsPanel>
    );
  }

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

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-sw-blue animate-spin" />
            <span className="font-mono text-xs text-sw-blue/60 ml-2">SCANNING NETWORK...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-sm text-sw-blue/60">NO TRANSACTIONS FOUND</p>
            <p className="font-mono text-xs text-sw-blue/40 mt-1">Your transaction history is empty</p>
          </div>
        ) : (
          transactions.map((tx, index) => {
            const config = typeConfig[tx.type];
            const Icon = config.icon;

            return (
              <div
                key={tx.id + index}
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
          })
        )}
      </div>

      <button 
        onClick={fetchTransactions}
        className="w-full mt-4 py-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors font-mono text-xs text-sw-blue tracking-widest"
      >
        {isLoading ? 'SCANNING...' : 'REFRESH TRANSACTIONS →'}
      </button>
    </StarWarsPanel>
  );
};
