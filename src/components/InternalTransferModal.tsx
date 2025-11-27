import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKeetaWallet, AccountType } from "@/contexts/KeetaWalletContext";
import { ArrowRightLeft, Wallet, PiggyBank, Loader2, Tag, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface InternalTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InternalTransferModal = ({ open, onOpenChange }: InternalTransferModalProps) => {
  const { play } = useSoundEffects();
  const { getAllAccounts, transferBetweenAccounts } = useKeetaWallet();
  const [amount, setAmount] = useState("");
  const [fromAccount, setFromAccount] = useState<AccountType>("checking");
  const [toAccount, setToAccount] = useState<AccountType>("savings");
  const [isTransferring, setIsTransferring] = useState(false);

  const accounts = getAllAccounts();

  useEffect(() => {
    if (open && accounts.length >= 2) {
      setFromAccount(accounts[0].name === 'Checking' ? 'checking' : 
                     accounts[0].name === 'Savings' ? 'savings' : accounts[0].name);
      setToAccount(accounts[1].name === 'Checking' ? 'checking' : 
                   accounts[1].name === 'Savings' ? 'savings' : accounts[1].name);
    }
  }, [open, accounts.length]);

  const getAccountIcon = (accountType: AccountType) => {
    if (accountType === 'checking') return <Wallet className="w-5 h-5" />;
    if (accountType === 'savings') return <PiggyBank className="w-5 h-5" />;
    return <Tag className="w-5 h-5" />;
  };

  const getAccountDisplayName = (accountType: AccountType) => {
    if (accountType === 'checking') return 'Checking';
    if (accountType === 'savings') return 'Savings';
    return accountType;
  };

  const handleTransfer = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (fromAccount === toAccount) {
      toast.error("Cannot transfer to the same account");
      return;
    }

    setIsTransferring(true);
    play('click');

    try {
      await transferBetweenAccounts(fromAccount, toAccount, numAmount);
      
      play('send');
      toast.success(`Transferred ${numAmount} KTA to ${getAccountDisplayName(toAccount)}`);
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

  if (accounts.length < 2) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-sw-blue/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wider text-sw-blue text-center">
            INTERNAL TRANSFER
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="font-mono text-xs text-sw-blue/60 tracking-wider">
              AMOUNT (KTA)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-xl text-center text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-sw-blue"
              step="0.01"
              min="0"
            />
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
                TRANSFER
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
