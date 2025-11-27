import { useState } from "react";
import { ArrowLeft, Send as SendIcon, Loader2 } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { BottomNav } from "@/components/BottomNav";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Send = () => {
  const { isConnected, client, network } = useKeetaWallet();
  const { balance, refetch } = useKeetaBalance();
  const { play } = useSoundEffects();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const formatBalance = (amt: number) => {
    const truncated = Math.floor(amt * 100) / 100;
    return truncated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSend = async () => {
    if (!client || !isConnected) {
      play('error');
      toast.error("Wallet not connected");
      return;
    }

    if (!recipient.trim()) {
      play('error');
      toast.error("Please enter a recipient address");
      return;
    }

    if (!recipient.startsWith("keeta_")) {
      play('error');
      toast.error("Invalid Keeta address format");
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      play('error');
      toast.error("Please enter a valid amount");
      return;
    }

    if (sendAmount > balance) {
      play('error');
      toast.error("Insufficient balance");
      return;
    }

    setIsSending(true);
    play('send');

    try {
      // Convert amount to smallest unit (9 decimals for testnet, 18 for mainnet)
      const decimals = network === 'main' ? 18 : 9;
      const amountInSmallestUnit = BigInt(Math.floor(sendAmount * Math.pow(10, decimals)));

      // Send transaction using Keeta client
      const result = await client.send(recipient.trim(), amountInSmallestUnit);
      
      console.log('[Send] Transaction result:', result);
      play('success');
      toast.success("Transaction sent successfully!");
      
      // Refresh balance
      await refetch();
      
      // Clear form
      setRecipient("");
      setAmount("");
    } catch (err: any) {
      console.error('[Send] Transaction error:', err);
      play('error');
      toast.error(err.message || "Failed to send transaction");
    } finally {
      setIsSending(false);
    }
  };

  const handleMaxClick = () => {
    play('click');
    setAmount(formatBalance(balance).replace(/,/g, ''));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-sw-space text-sw-white relative overflow-hidden">
        <StarField />
        <Header />
        <main className="container mx-auto px-4 py-8 pt-20 pb-24 relative z-10">
          <StarWarsPanel title="// SEND CREDITS" className="max-w-lg mx-auto">
            <p className="text-sw-orange text-center">Please connect your wallet first</p>
          </StarWarsPanel>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sw-space text-sw-white relative overflow-hidden">
      <StarField />
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20 pb-24 relative z-10">

        <StarWarsPanel title="// SEND CREDITS" className="max-w-lg mx-auto">
          <div className="space-y-6">
            {/* Balance Display */}
            <div className="text-center py-4 border-b border-sw-blue/20">
              <p className="font-mono text-xs text-sw-blue/60 tracking-widest uppercase mb-1">
                AVAILABLE BALANCE
              </p>
              <p className="text-3xl font-display font-bold text-sw-yellow">
                {formatBalance(balance)} <span className="text-lg text-sw-yellow/80">KTA</span>
              </p>
            </div>

            {/* Recipient Input */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                RECIPIENT ADDRESS
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="keeta_..."
                className="w-full px-4 py-3 bg-sw-space/50 border border-sw-blue/30 text-sw-white font-mono text-sm placeholder:text-sw-blue/40 focus:border-sw-blue/60 focus:outline-none transition-colors"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                AMOUNT (KTA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 pr-16 bg-sw-space/50 border border-sw-blue/30 text-sw-white font-mono text-sm placeholder:text-sw-blue/40 focus:border-sw-blue/60 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-mono text-sw-yellow border border-sw-yellow/30 hover:bg-sw-yellow/10 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isSending || !recipient || !amount}
              className="w-full py-4 bg-sw-blue/20 border border-sw-blue/50 hover:bg-sw-blue/30 hover:border-sw-blue text-sw-blue font-display font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  TRANSMITTING...
                </>
              ) : (
                <>
                  <SendIcon className="w-5 h-5" />
                  SEND CREDITS
                </>
              )}
            </button>

            {/* Network Info */}
            <p className="text-center font-mono text-xs text-sw-blue/50">
              NETWORK: {network.toUpperCase()}NET
            </p>
          </div>
        </StarWarsPanel>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Send;
