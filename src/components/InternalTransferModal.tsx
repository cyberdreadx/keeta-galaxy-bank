import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKeetaWallet, AccountType } from "@/contexts/KeetaWalletContext";
import { ArrowRightLeft, Loader2, ChevronDown, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useKtaPrice } from "@/hooks/useKtaPrice";

interface InternalTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to fetch balance for a specific client
const fetchAccountBalance = async (client: any, network: 'test' | 'main'): Promise<number> => {
  try {
    const allBalances = await client.allBalances();
    if (!allBalances || Object.keys(allBalances).length === 0) return 0;

    const baseTokenAddr = client.baseToken.publicKeyString.toString();
    let ktaBalance = BigInt(0);

    for (const [, balanceData] of Object.entries(allBalances)) {
      const tokenInfo = JSON.parse(
        JSON.stringify(balanceData, (k: string, v: any) => 
          typeof v === 'bigint' ? v.toString() : v
        )
      );
      const tokenAddr = String(tokenInfo.token || '');
      if (tokenAddr === baseTokenAddr) {
        ktaBalance = BigInt(String(tokenInfo.balance || '0'));
        break;
      }
    }

    const decimals = network === 'main' ? 18 : 9;
    return Number(ktaBalance) / Math.pow(10, decimals);
  } catch {
    return 0;
  }
};

export const InternalTransferModal = ({ open, onOpenChange }: InternalTransferModalProps) => {
  const { play } = useSoundEffects();
  const { getAllAccounts, transferBetweenAccounts, network } = useKeetaWallet();
  const { priceUsd } = useKtaPrice();
  const [amount, setAmount] = useState("");
  const [fromAccount, setFromAccount] = useState<AccountType>("checking");
  const [toAccount, setToAccount] = useState<AccountType>("savings");
  const [isTransferring, setIsTransferring] = useState(false);
  const [fromBalance, setFromBalance] = useState<number | null>(null);
  const [toBalance, setToBalance] = useState<number | null>(null);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [inputMode, setInputMode] = useState<'kta' | 'usd'>('kta');

  const accounts = getAllAccounts();

  const getAccountByType = useCallback((type: AccountType) => {
    return accounts.find(a => {
      const normalizedName = a.name === 'Checking' ? 'checking' : a.name === 'Savings' ? 'savings' : a.name;
      return normalizedName === type;
    });
  }, [accounts]);

  // Fetch balances when accounts change
  useEffect(() => {
    if (!open || accounts.length < 2) return;

    const loadBalances = async () => {
      setLoadingBalances(true);
      
      const fromAcc = getAccountByType(fromAccount);
      const toAcc = getAccountByType(toAccount);

      const [fromBal, toBal] = await Promise.all([
        fromAcc ? fetchAccountBalance(fromAcc.client, network) : 0,
        toAcc ? fetchAccountBalance(toAcc.client, network) : 0,
      ]);

      setFromBalance(fromBal);
      setToBalance(toBal);
      setLoadingBalances(false);
    };

    loadBalances();
  }, [open, fromAccount, toAccount, accounts.length, network, getAccountByType]);

  useEffect(() => {
    if (open && accounts.length >= 2) {
      const firstType = accounts[0].name === 'Checking' ? 'checking' : 
                       accounts[0].name === 'Savings' ? 'savings' : accounts[0].name;
      const secondType = accounts[1].name === 'Checking' ? 'checking' : 
                        accounts[1].name === 'Savings' ? 'savings' : accounts[1].name;
      setFromAccount(firstType);
      setToAccount(secondType);
      setAmount("");
      setInputMode('kta');
    }
  }, [open, accounts.length]);

  const formatBalance = (bal: number) => {
    const truncated = Math.floor(bal * 100) / 100;
    return truncated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUsd = (bal: number) => {
    if (!priceUsd) return null;
    const usd = bal * priceUsd;
    return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const getAccountDisplayName = (accountType: AccountType) => {
    if (accountType === 'checking') return 'Checking';
    if (accountType === 'savings') return 'Savings';
    return accountType;
  };

  // Calculate KTA amount based on input mode
  const getKtaAmount = (): number => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    
    if (inputMode === 'usd' && priceUsd) {
      return numAmount / priceUsd;
    }
    return numAmount;
  };

  // Calculate USD amount based on input mode
  const getUsdAmount = (): number | null => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !priceUsd) return null;
    
    if (inputMode === 'kta') {
      return numAmount * priceUsd;
    }
    return numAmount;
  };

  const handleTransfer = async () => {
    const ktaAmount = getKtaAmount();
    if (ktaAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (fromAccount === toAccount) {
      toast.error("Cannot transfer to the same account");
      return;
    }

    if (fromBalance !== null && ktaAmount > fromBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsTransferring(true);
    play('click');

    try {
      await transferBetweenAccounts(fromAccount, toAccount, ktaAmount);
      
      play('send');
      toast.success(`Transferred ${formatBalance(ktaAmount)} KTA to ${getAccountDisplayName(toAccount)}`);
      setAmount("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const swapAccounts = () => {
    play('click');
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  const handleMaxClick = () => {
    if (fromBalance !== null && fromBalance > 0) {
      if (inputMode === 'kta') {
        setAmount(fromBalance.toString());
      } else if (priceUsd) {
        setAmount((fromBalance * priceUsd).toFixed(2));
      }
    }
  };

  const toggleInputMode = () => {
    play('click');
    // Convert current amount to new mode
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0 && priceUsd) {
      if (inputMode === 'kta') {
        // Converting KTA to USD
        setAmount((numAmount * priceUsd).toFixed(2));
      } else {
        // Converting USD to KTA
        setAmount((numAmount / priceUsd).toFixed(6));
      }
    }
    setInputMode(prev => prev === 'kta' ? 'usd' : 'kta');
  };

  if (accounts.length < 2) return null;

  const ktaAmount = getKtaAmount();
  const usdAmount = getUsdAmount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-sw-blue/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wider text-sw-blue text-center">
            INTERNAL TRANSFER
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* From Account */}
          <div className="space-y-2">
            <label className="font-mono text-xs text-sw-blue/60 tracking-wider">FROM</label>
            <div className="relative">
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value as AccountType)}
                className="w-full p-3 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-sw-blue"
              >
                {accounts.map((acc) => {
                  const value = acc.name === 'Checking' ? 'checking' : 
                               acc.name === 'Savings' ? 'savings' : acc.name;
                  return (
                    <option key={acc.publicKey} value={value}>
                      {acc.name.toUpperCase()}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue/60 pointer-events-none" />
            </div>
            {/* From Balance Display */}
            <div className="flex items-center justify-between px-1">
              <div className="font-mono text-xs text-sw-blue/70">
                {loadingBalances ? (
                  <span className="text-sw-blue/50">Loading...</span>
                ) : fromBalance !== null ? (
                  <span>
                    <span className="text-sw-yellow">{formatBalance(fromBalance)} KTA</span>
                    {formatUsd(fromBalance) && (
                      <span className="text-sw-blue/50 ml-2">≈ {formatUsd(fromBalance)}</span>
                    )}
                  </span>
                ) : null}
              </div>
              {fromBalance !== null && fromBalance > 0 && (
                <button
                  onClick={handleMaxClick}
                  className="font-mono text-[10px] text-sw-green hover:text-sw-yellow transition-colors"
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button 
              onClick={swapAccounts}
              className="p-3 border border-sw-blue/30 rounded-full hover:bg-sw-blue/10 transition-colors group"
            >
              <ArrowRightLeft className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-yellow transition-colors rotate-90" />
            </button>
          </div>

          {/* To Account */}
          <div className="space-y-2">
            <label className="font-mono text-xs text-sw-blue/60 tracking-wider">TO</label>
            <div className="relative">
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value as AccountType)}
                className="w-full p-3 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-sw-blue"
              >
                {accounts.map((acc) => {
                  const value = acc.name === 'Checking' ? 'checking' : 
                               acc.name === 'Savings' ? 'savings' : acc.name;
                  return (
                    <option key={acc.publicKey} value={value}>
                      {acc.name.toUpperCase()}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue/60 pointer-events-none" />
            </div>
            {/* To Balance Display */}
            <div className="font-mono text-xs text-sw-blue/70 px-1">
              {loadingBalances ? (
                <span className="text-sw-blue/50">Loading...</span>
              ) : toBalance !== null ? (
                <span>
                  <span className="text-sw-yellow">{formatBalance(toBalance)} KTA</span>
                  {formatUsd(toBalance) && (
                    <span className="text-sw-blue/50 ml-2">≈ {formatUsd(toBalance)}</span>
                  )}
                </span>
              ) : null}
            </div>
          </div>

          {/* Amount Input with Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-sw-blue/60 tracking-wider">
                AMOUNT ({inputMode === 'kta' ? 'KTA' : 'USD'})
              </label>
              {priceUsd && (
                <button
                  onClick={toggleInputMode}
                  className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-mono transition-all ${
                    inputMode === 'usd' 
                      ? 'bg-sw-green/20 border-sw-green text-sw-green' 
                      : 'bg-sw-blue/10 border-sw-blue/30 text-sw-blue/70 hover:border-sw-blue'
                  }`}
                >
                  <DollarSign className="w-3 h-3" />
                  {inputMode === 'kta' ? 'ENTER USD' : 'ENTER KTA'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-4 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-xl text-center text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-sw-blue"
                step={inputMode === 'kta' ? '0.01' : '0.01'}
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-sw-blue/50">
                {inputMode === 'kta' ? 'KTA' : 'USD'}
              </span>
            </div>
            {/* Show conversion */}
            {amount && parseFloat(amount) > 0 && (
              <div className="text-center space-y-1">
                {inputMode === 'kta' && usdAmount !== null && (
                  <p className="font-mono text-xs text-sw-blue/60">
                    ≈ {usdAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                )}
                {inputMode === 'usd' && ktaAmount > 0 && (
                  <p className="font-mono text-xs text-sw-yellow">
                    ≈ {formatBalance(ktaAmount)} KTA
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            disabled={isTransferring || !amount || fromAccount === toAccount}
            className="w-full py-4 bg-sw-blue/20 border border-sw-blue text-sw-blue font-display tracking-wider rounded hover:bg-sw-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTransferring ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                TRANSFERRING...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                TRANSFER {ktaAmount > 0 ? `${formatBalance(ktaAmount)} KTA` : ''}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
