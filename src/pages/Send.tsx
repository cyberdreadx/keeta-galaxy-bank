import { useState, useEffect } from "react";
import { ArrowLeft, Send as SendIcon, Loader2, Coins, Wallet } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { useBaseWallet } from "@/contexts/BaseWalletContext";
import { useBaseBalance } from "@/hooks/useBaseBalance";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type SendNetwork = 'keeta' | 'base';
type BaseAsset = 'ETH' | 'KTA' | 'USDC';

interface SelectedToken {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
}

const Send = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<SendNetwork>('keeta');
  
  // Keeta State
  const { isConnected: isKeetaConnected, client, network, sendToken: sendCustomToken } = useKeetaWallet();
  const { balance: keetaBalance, allTokens, refetch: refetchKeeta } = useKeetaBalance();
  
  // Base State
  const { isConnected: isBaseConnected, sendTransaction, sendErc20 } = useBaseWallet();
  const { ethBalance, ktaBalance, usdcBalance, refetch: refetchBase } = useBaseBalance();

  const { play } = useSoundEffects();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedBaseAsset, setSelectedBaseAsset] = useState<BaseAsset>('ETH');
  const [selectedKeetaToken, setSelectedKeetaToken] = useState<SelectedToken | null>(null);

  // Constants
  const KTA_ADDRESS = "0xc0634090F2Fe6c6d75e61Be2b949464aBB498973";
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Initialize selected Keeta token when allTokens loads
  useEffect(() => {
    if (allTokens.length > 0 && !selectedKeetaToken) {
      const ktaToken = allTokens.find(t => t.symbol === 'KTA') || allTokens[0];
      setSelectedKeetaToken(ktaToken);
    }
  }, [allTokens]);

  const formatBalance = (amt: number | string) => {
    const val = typeof amt === 'string' ? parseFloat(amt) : amt;
    const truncated = Math.floor(val * 10000) / 10000;
    return truncated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const getActiveBalance = () => {
    if (selectedNetwork === 'keeta') {
      return selectedKeetaToken?.balance || 0;
    }
    if (selectedBaseAsset === 'ETH') return parseFloat(ethBalance);
    if (selectedBaseAsset === 'KTA') return parseFloat(ktaBalance);
    if (selectedBaseAsset === 'USDC') return parseFloat(usdcBalance);
    return 0;
  };

  const getActiveSymbol = () => {
    if (selectedNetwork === 'keeta') {
      return selectedKeetaToken?.symbol || 'KTA';
    }
    return selectedBaseAsset;
  };

  const handleMaxClick = () => {
    play('click');
    setAmount(getActiveBalance().toString());
  };

  const handleSend = async () => {
    // Validate Connection
    if (selectedNetwork === 'keeta' && !isKeetaConnected) {
      play('error');
      toast.error("Keeta Wallet not connected");
      return;
    }
    if (selectedNetwork === 'base' && !isBaseConnected) {
      play('error');
      toast.error("Base Wallet not connected");
      return;
    }

    // Validate Input
    if (!recipient.trim()) {
      play('error');
      toast.error("Please enter a recipient address");
      return;
    }

    if (selectedNetwork === 'keeta' && !recipient.startsWith("keeta_")) {
      play('error');
      toast.error("Invalid Keeta address format");
      return;
    }
    if (selectedNetwork === 'base' && !recipient.startsWith("0x")) {
      play('error');
      toast.error("Invalid Ethereum address format");
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      play('error');
      toast.error("Please enter a valid amount");
      return;
    }

    if (sendAmount > getActiveBalance()) {
      play('error');
      toast.error("Insufficient balance");
      return;
    }

    setIsSending(true);
    play('send');

    try {
      if (selectedNetwork === 'keeta') {
        // Keeta Logic - send custom token
        if (!selectedKeetaToken) {
          throw new Error('No token selected');
        }

        const decimals = selectedKeetaToken.decimals;
        const amountInSmallestUnit = BigInt(Math.floor(sendAmount * Math.pow(10, decimals)));
        
        console.log('[Send] Sending token:', selectedKeetaToken.symbol);
        console.log('[Send] Token address:', selectedKeetaToken.address);
        console.log('[Send] Amount:', sendAmount, 'Decimals:', decimals);
        console.log('[Send] Raw amount:', amountInSmallestUnit.toString());

        // Check if this is KTA (base token) or custom token
        const isKTA = selectedKeetaToken.symbol === 'KTA';
        
        if (isKTA) {
          // Send KTA using the simple send method
          const result = await client!.send(recipient.trim(), amountInSmallestUnit);
          console.log('[Send] KTA transfer result:', result);
        } else {
          // Send custom token using sendToken method
          const txHash = await sendCustomToken(
            recipient.trim(),
            amountInSmallestUnit.toString(),
            selectedKeetaToken.address
          );
          console.log('[Send] Custom token transfer hash:', txHash);
        }
        
        await refetchKeeta();
      } else {
        // Base Logic
        let tx;
        if (selectedBaseAsset === 'ETH') {
          tx = await sendTransaction(recipient.trim(), amount);
        } else {
          const tokenAddr = selectedBaseAsset === 'KTA' ? KTA_ADDRESS : USDC_ADDRESS;
          tx = await sendErc20(recipient.trim(), amount, tokenAddr);
        }
        console.log('[Send] Base TX:', tx);
        await tx.wait(); // Wait for confirmation
        await refetchBase();
      }
      
      play('success');
      toast.success("Transaction sent successfully!");
      setRecipient("");
      setAmount("");
    } catch (err: any) {
      console.error('[Send] Error:', err);
      play('error');
      toast.error(err.message || "Failed to send transaction");
    } finally {
      setIsSending(false);
    }
  };

  const isConnected = selectedNetwork === 'keeta' ? isKeetaConnected : isBaseConnected;

  return (
    <div className="bg-sw-space text-sw-white relative overflow-hidden">
      <StarField />
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20 pb-24 relative z-10">

        <StarWarsPanel title="// SEND ASSETS" className="max-w-lg mx-auto">
          {/* Network Selector Tabs */}
          <div className="flex p-1 bg-sw-blue/10 rounded-lg mb-6 border border-sw-blue/20">
            <button
              onClick={() => setSelectedNetwork('keeta')}
              className={`flex-1 py-2 text-xs font-mono tracking-widest transition-all rounded ${
                selectedNetwork === 'keeta' 
                  ? 'bg-sw-blue text-black font-bold shadow-lg shadow-sw-blue/20' 
                  : 'text-sw-blue/60 hover:text-sw-blue hover:bg-sw-blue/5'
              }`}
            >
              KEETA NETWORK
            </button>
            <button
              onClick={() => setSelectedNetwork('base')}
              className={`flex-1 py-2 text-xs font-mono tracking-widest transition-all rounded ${
                selectedNetwork === 'base' 
                  ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/20' 
                  : 'text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/5'
              }`}
            >
              BASE NETWORK
            </button>
          </div>

          {!isConnected ? (
             <div className="text-center py-8">
               <p className={`text-sm font-mono mb-4 ${selectedNetwork === 'base' ? 'text-yellow-400' : 'text-sw-blue'}`}>
                 {selectedNetwork === 'base' ? 'BASE WALLET DISCONNECTED' : 'KEETA WALLET DISCONNECTED'}
               </p>
               <p className="text-xs text-gray-500">
                 Please connect your wallet in the Account section to send assets.
               </p>
             </div>
          ) : (
            <div className="space-y-6">
              {/* Token Selector (Keeta Only) */}
              {selectedNetwork === 'keeta' && allTokens.length > 0 && (
                <div className="space-y-2">
                  <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                    SELECT TOKEN
                  </label>
                  <div className="relative">
                    <select
                      value={selectedKeetaToken?.address || ''}
                      onChange={(e) => {
                        const token = allTokens.find(t => t.address === e.target.value);
                        if (token) setSelectedKeetaToken(token);
                      }}
                      className="w-full px-4 py-3 bg-sw-space/50 border border-sw-blue/30 text-sw-white font-mono text-sm focus:border-sw-blue/60 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {allTokens.map(token => (
                        <option key={token.address} value={token.address} className="bg-sw-space">
                          {token.symbol} - {formatBalance(token.balance)} ({token.name})
                        </option>
                      ))}
                    </select>
                    <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sw-blue/50 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Asset Selector (Base Only) */}
              {selectedNetwork === 'base' && (
                <div className="flex justify-center gap-3 mb-2">
                  {(['ETH', 'KTA', 'USDC'] as BaseAsset[]).map((asset) => (
                    <button
                      key={asset}
                      onClick={() => setSelectedBaseAsset(asset)}
                      className={`px-4 py-1.5 rounded text-xs font-mono border transition-all ${
                        selectedBaseAsset === asset
                          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400 shadow-md shadow-yellow-400/10'
                          : 'border-gray-700 bg-gray-900/50 text-gray-500 hover:border-gray-500'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              )}

              {/* Balance Display */}
              <div className="text-center py-4 border-b border-sw-blue/20">
                <p className="font-mono text-xs text-sw-blue/60 tracking-widest uppercase mb-1">
                  AVAILABLE {getActiveSymbol()} BALANCE
                </p>
                <p className={`text-3xl font-display font-bold ${selectedNetwork === 'base' ? 'text-yellow-400' : 'text-sw-yellow'}`}>
                  {formatBalance(getActiveBalance())} 
                  <span className={`text-lg ml-2 ${selectedNetwork === 'base' ? 'text-yellow-400/80' : 'text-sw-yellow/80'}`}>
                    {getActiveSymbol()}
                  </span>
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
                  placeholder={selectedNetwork === 'base' ? "0x..." : "keeta_..."}
                  className="w-full px-4 py-3 bg-sw-space/50 border border-sw-blue/30 text-sw-white font-mono text-sm placeholder:text-sw-blue/40 focus:border-sw-blue/60 focus:outline-none transition-colors"
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  AMOUNT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.0001"
                    className="w-full px-4 py-3 pr-16 bg-sw-space/50 border border-sw-blue/30 text-sw-white font-mono text-sm placeholder:text-sw-blue/40 focus:border-sw-blue/60 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleMaxClick}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-mono border hover:bg-opacity-10 transition-colors ${
                      selectedNetwork === 'base' 
                        ? 'text-yellow-400 border-yellow-400/30 hover:bg-yellow-400' 
                        : 'text-sw-yellow border-sw-yellow/30 hover:bg-sw-yellow'
                    }`}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={isSending || !recipient || !amount}
                className={`w-full py-4 border font-display font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  selectedNetwork === 'base'
                    ? 'bg-yellow-400/20 border-yellow-400/50 hover:bg-yellow-400/30 text-yellow-400'
                    : 'bg-sw-blue/20 border-sw-blue/50 hover:bg-sw-blue/30 text-sw-blue'
                }`}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    TRANSMITTING...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    SEND {selectedNetwork === 'base' ? 'ASSETS' : 'CREDITS'}
                  </>
                )}
              </button>

              {/* Network Info */}
              <p className="text-center font-mono text-xs text-sw-blue/50">
                NETWORK: {selectedNetwork === 'base' ? 'BASE MAINNET' : network.toUpperCase() + 'NET'}
              </p>
            </div>
          )}
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default Send;
