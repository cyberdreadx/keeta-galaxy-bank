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
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(6);
  const [isFromCache, setIsFromCache] = useState(false);
  const ITEMS_PER_PAGE = 6;
  const CACHE_KEY = `yoda_tx_cache_${publicKey}`;
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Load from cache on mount
  useEffect(() => {
    if (!publicKey) return;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (data && data.length > 0) {
          // Restore dates from strings
          const restored = data.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp)
          }));
          setAllTransactions(restored);
          setTransactions(restored.slice(0, ITEMS_PER_PAGE));
          setIsFromCache(!isExpired);
        }
      }
    } catch (e) {
      console.warn('Failed to load tx cache:', e);
    }
  }, [publicKey, CACHE_KEY]);

  const saveToCache = useCallback((txs: Transaction[]) => {
    if (!publicKey) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: txs,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save tx cache:', e);
    }
  }, [publicKey, CACHE_KEY]);

  const fetchTransactions = useCallback(async (background = false) => {
    if (!client || !isConnected) {
      setTransactions([]);
      setAllTransactions([]);
      return;
    }

    if (!background) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const repsResponse = await fetch('https://rep1.main.network.api.keeta.com/api/node/ledger/representatives');
      const repsData = await repsResponse.json();
      const representatives = repsData.representatives || [];
      const rep = representatives.find((r: any) => r.weight !== "0x0") || representatives[0];
      
      if (!rep?.endpoints?.api) {
        throw new Error('No API endpoint available');
      }

      const historyResponse = await fetch(
        `${rep.endpoints.api}/node/ledger/account/${publicKey}/history?limit=100`
      );
      const historyData = await historyResponse.json();

      const allBlocks: any[] = [];
      if (historyData.history) {
        historyData.history.forEach((item: any) => {
          if (item.voteStaple?.blocks) {
            allBlocks.push(...item.voteStaple.blocks);
          }
        });
      }

      const KTA_TOKEN = 'keeta_anqdilpazdekdu4acw65fj7smltcp26wbrildkqtszqvverljpwpezmd44ssg';

      const allFormattedTxs: Transaction[] = allBlocks
        .filter(block => 
          block.account === publicKey ||
          block.operations?.some((op: any) => op.to === publicKey)
        )
        .map((block: any, index: number) => {
          const operations = block.operations || [];
          const isSender = block.account === publicKey;
          
          const ktaOps = operations.filter((op: any) => 
            op.token === KTA_TOKEN || !op.token
          );
          
          let amount = 0;
          let counterparty = '';
          let txType: 'send' | 'receive' = 'receive';
          
          if (isSender) {
            txType = 'send';
            for (const op of ktaOps) {
              if (op.amount) {
                try {
                  const rawAmount = op.amount;
                  const amountBigInt = typeof rawAmount === 'string' && rawAmount.startsWith('0x')
                    ? BigInt(rawAmount)
                    : BigInt(rawAmount || 0);
                  amount += Number(amountBigInt) / 1e18;
                } catch {}
              }
            }
            counterparty = ktaOps[0]?.to || '';
          } else {
            txType = 'receive';
            const myOp = ktaOps.find((op: any) => op.to === publicKey);
            if (myOp?.amount) {
              try {
                const rawAmount = myOp.amount;
                const amountBigInt = typeof rawAmount === 'string' && rawAmount.startsWith('0x')
                  ? BigInt(rawAmount)
                  : BigInt(rawAmount || 0);
                amount = Number(amountBigInt) / 1e18;
              } catch {}
            }
            counterparty = block.account || '';
          }
          
          const hash = block.$hash || block.hash || block.blockHash || String(index);
          const shortHash = typeof hash === 'string' ? hash.substring(0, 6).toUpperCase() : String(index);
          
          return {
            id: `TX-${shortHash}`,
            type: txType,
            amount: amount,
            currency: 'KTA',
            address: counterparty.substring(0, 12),
            timestamp: new Date(block.date || Date.now()),
            status: 'completed' as const,
          };
        });

      // Save to cache
      saveToCache(allFormattedTxs);
      
      setAllTransactions(allFormattedTxs);
      if (!background) {
        setDisplayCount(ITEMS_PER_PAGE);
        setTransactions(allFormattedTxs.slice(0, ITEMS_PER_PAGE));
      } else {
        // Keep current display count when refreshing in background
        setTransactions(allFormattedTxs.slice(0, displayCount));
      }
      setIsFromCache(false);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      if (!background) {
        setError(err.message || 'Failed to fetch transactions');
      }
    } finally {
      setIsLoading(false);
    }
  }, [client, isConnected, publicKey, saveToCache, displayCount]);

  const loadMore = useCallback(() => {
    setIsLoadingMore(true);
    const newCount = displayCount + ITEMS_PER_PAGE;
    setDisplayCount(newCount);
    setTransactions(allTransactions.slice(0, newCount));
    setIsLoadingMore(false);
  }, [allTransactions, displayCount]);

  const hasMore = displayCount < allTransactions.length;

  // Fetch fresh data (background refresh if we have cache)
  useEffect(() => {
    if (isConnected && publicKey) {
      const hasCache = allTransactions.length > 0;
      fetchTransactions(hasCache);
    }
  }, [isConnected, publicKey]); // Intentionally not including fetchTransactions to avoid loops

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
        onClick={() => fetchTransactions(false)}
        className="w-full mt-4 py-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors font-mono text-xs text-sw-blue tracking-widest"
      >
        {isLoading ? 'SCANNING...' : isFromCache ? 'REFRESH (CACHED) →' : 'REFRESH TRANSACTIONS →'}
      </button>

      {hasMore && transactions.length > 0 && (
        <button 
          onClick={loadMore}
          disabled={isLoadingMore}
          className="w-full mt-2 py-2 border border-sw-blue/20 bg-transparent hover:bg-sw-blue/5 transition-colors font-mono text-xs text-sw-blue/60 tracking-widest disabled:opacity-50"
        >
          {isLoadingMore ? 'LOADING...' : 'LOAD MORE →'}
        </button>
      )}
    </StarWarsPanel>
  );
};
