import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKeetaWallet, AccountType } from "@/contexts/KeetaWalletContext";
import { ArrowRightLeft, Wallet, PiggyBank, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface InternalTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InternalTransferModal = ({ open, onOpenChange }: InternalTransferModalProps) => {
  const { play } = useSoundEffects();
  const { checkingAccount, savingsAccount, transferBetweenAccounts } = useKeetaWallet();
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"checking-to-savings" | "savings-to-checking">("checking-to-savings");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsTransferring(true);
    play('click');

    try {
      const fromAccount: AccountType = direction === "checking-to-savings" ? "checking" : "savings";
      const toAccount: AccountType = direction === "checking-to-savings" ? "savings" : "checking";
      
      await transferBetweenAccounts(fromAccount, toAccount, numAmount);
      
      play('send');
      toast.success(`Transferred ${numAmount} KTA to ${toAccount}`);
      setAmount("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const toggleDirection = () => {
    play('click');
    setDirection(prev => 
      prev === "checking-to-savings" ? "savings-to-checking" : "checking-to-savings"
    );
  };

  if (!checkingAccount || !savingsAccount) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-sw-blue/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wider text-sw-blue text-center">
            INTERNAL TRANSFER
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transfer Direction */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex flex-col items-center p-3 border rounded transition-all ${
              direction === "checking-to-savings" 
                ? "border-sw-blue bg-sw-blue/10" 
                : "border-sw-yellow bg-sw-yellow/10"
            }`}>
              {direction === "checking-to-savings" ? (
                <Wallet className="w-8 h-8 text-sw-blue" />
              ) : (
                <PiggyBank className="w-8 h-8 text-sw-yellow" />
              )}
              <span className="font-mono text-[10px] mt-1 text-foreground/70">
                {direction === "checking-to-savings" ? "CHECKING" : "SAVINGS"}
              </span>
            </div>

            <button 
              onClick={toggleDirection}
              className="p-2 border border-sw-blue/30 rounded hover:bg-sw-blue/10 transition-colors group"
            >
              <ArrowRightLeft className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-yellow transition-colors" />
            </button>

            <div className={`flex flex-col items-center p-3 border rounded transition-all ${
              direction === "checking-to-savings" 
                ? "border-sw-yellow bg-sw-yellow/10" 
                : "border-sw-blue bg-sw-blue/10"
            }`}>
              {direction === "checking-to-savings" ? (
                <PiggyBank className="w-8 h-8 text-sw-yellow" />
              ) : (
                <Wallet className="w-8 h-8 text-sw-blue" />
              )}
              <span className="font-mono text-[10px] mt-1 text-foreground/70">
                {direction === "checking-to-savings" ? "SAVINGS" : "CHECKING"}
              </span>
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
            disabled={isTransferring || !amount}
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
