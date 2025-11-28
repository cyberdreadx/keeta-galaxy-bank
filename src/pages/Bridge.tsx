import { useState } from "react";
import { ArrowDown, Loader2, ExternalLink } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useBridge, BRIDGE_NETWORKS } from "@/hooks/useBridge";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { useToast } from "@/hooks/use-toast";

const Bridge = () => {
  const { isConnected, network } = useKeetaWallet();
  const { play } = useSoundEffects();
  const { balance } = useKeetaBalance();
  const { toast } = useToast();
  const { initiateBridge, isBridging, status } = useBridge();
  
  const [fromNetwork, setFromNetwork] = useState(BRIDGE_NETWORKS[0]); // Keeta L1
  const [toNetwork, setToNetwork] = useState(BRIDGE_NETWORKS[1]); // Base
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const handleSwapNetworks = () => {
    play('click');
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
  };

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to bridge",
        variant: "destructive"
      });
      return;
    }

    if (!destinationAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please enter a destination address",
        variant: "destructive"
      });
      return;
    }

    play('click');
    
    const result = await initiateBridge(fromNetwork, toNetwork, amount, destinationAddress);
    
    if (result.success) {
      play('success');
      toast({
        title: "Bridge Initiated",
        description: `Transfer ID: ${result.transferId || 'Processing...'}`,
      });
      setAmount("");
      setDestinationAddress("");
    } else {
      play('error');
      toast({
        title: "Bridge Failed",
        description: result.error || "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleMaxClick = () => {
    play('click');
    if (balance) {
      setAmount(balance.toString());
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <Header />
        <main className="relative z-10 pt-20 pb-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 animate-fade-in">
              <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
                // CROSS-CHAIN
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
                <span className="text-sw-orange">BRIDGE</span>
              </h2>
            </div>
            <StarWarsPanel title="// BRIDGE ASSETS" className="max-w-lg mx-auto">
              <p className="text-sw-orange text-center">Please connect your wallet first</p>
            </StarWarsPanel>
          </div>
        </main>
      </div>
    );
  }

  // Check if on testnet (bridge only works on mainnet)
  const isTestnet = network === 'test';

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />
      
      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // CROSS-CHAIN
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              <span className="text-sw-orange">BRIDGE</span>
            </h2>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-sw-blue/50" />
              <span className="font-mono text-xs text-sw-blue/60">MOVE ASSETS ACROSS NETWORKS</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-sw-blue/50" />
            </div>
          </div>

          <StarWarsPanel title="// BRIDGE ASSETS" className="max-w-lg mx-auto animate-slide-up">
            <div className="space-y-6">
              {/* Testnet Warning */}
              {isTestnet && (
                <div className="p-3 bg-sw-orange/20 border border-sw-orange/50 rounded">
                  <p className="font-mono text-xs text-sw-orange text-center">
                    ⚠️ Bridge only available on Mainnet. Switch network in Settings.
                  </p>
                </div>
              )}

              {/* Balance Display */}
              <div className="text-center">
                <p className="font-mono text-xs text-sw-blue/60 mb-1">AVAILABLE BALANCE</p>
                <p className="font-display text-xl text-sw-blue">
                  {balance !== null ? `${balance.toFixed(2)} KTA` : '-- KTA'}
                </p>
              </div>

              {/* From Network */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  FROM NETWORK
                </label>
                <div className={`p-4 border border-${fromNetwork.color}/40 bg-${fromNetwork.color}/10 rounded`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border border-${fromNetwork.color}/60 bg-${fromNetwork.color}/20 flex items-center justify-center`}>
                      <span className={`font-mono text-xs text-${fromNetwork.color}`}>
                        {fromNetwork.id === 'keeta' ? 'L1' : 'B'}
                      </span>
                    </div>
                    <div>
                      <p className={`font-display text-sm text-${fromNetwork.color}`}>{fromNetwork.name}</p>
                      <p className="font-mono text-xs text-sw-blue/50">{fromNetwork.symbol}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapNetworks}
                  className="p-3 border border-sw-blue/30 bg-sw-blue/10 hover:bg-sw-blue/20 transition-colors"
                >
                  <ArrowDown className="w-5 h-5 text-sw-blue" />
                </button>
              </div>

              {/* To Network */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  TO NETWORK
                </label>
                <div className={`p-4 border border-${toNetwork.color}/40 bg-${toNetwork.color}/10 rounded`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border border-${toNetwork.color}/60 bg-${toNetwork.color}/20 flex items-center justify-center`}>
                      <span className={`font-mono text-xs text-${toNetwork.color}`}>
                        {toNetwork.id === 'keeta' ? 'L1' : 'B'}
                      </span>
                    </div>
                    <div>
                      <p className={`font-display text-sm text-${toNetwork.color}`}>{toNetwork.name}</p>
                      <p className="font-mono text-xs text-sw-blue/50">{toNetwork.symbol}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  DESTINATION ADDRESS
                </label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder={toNetwork.id === 'base' ? '0x... (Base EVM Address)' : 'Keeta Address'}
                  className="w-full p-4 bg-sw-space/80 border border-sw-blue/30 text-sw-blue placeholder:text-sw-blue/30 font-mono text-sm focus:outline-none focus:border-sw-blue/60"
                  disabled={isBridging || isTestnet}
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
                    className="w-full p-4 pr-20 bg-sw-space/80 border border-sw-blue/30 text-sw-blue placeholder:text-sw-blue/30 font-mono text-lg focus:outline-none focus:border-sw-blue/60"
                    disabled={isBridging || isTestnet}
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-sw-blue/20 border border-sw-blue/40 text-sw-blue font-mono text-xs hover:bg-sw-blue/30 transition-colors"
                    disabled={isBridging || isTestnet}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Bridge Button */}
              <button
                onClick={handleBridge}
                disabled={isBridging || isTestnet || !amount || !destinationAddress}
                className="w-full py-4 bg-sw-orange/20 border border-sw-orange/50 hover:bg-sw-orange/30 hover:border-sw-orange text-sw-orange font-display font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isBridging ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    BRIDGING...
                  </>
                ) : (
                  'INITIATE BRIDGE'
                )}
              </button>

              {/* Status */}
              {status !== 'idle' && (
                <p className={`font-mono text-xs text-center ${
                  status === 'completed' ? 'text-sw-green' : 
                  status === 'failed' ? 'text-sw-red' : 
                  'text-sw-yellow'
                }`}>
                  Status: {status.toUpperCase()}
                </p>
              )}

              {/* Official Bridge Link */}
              <div className="pt-4 border-t border-sw-blue/20">
                <a
                  href="https://keeta.com/bridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => play('click')}
                  className="flex items-center justify-center gap-2 text-sw-blue/60 hover:text-sw-blue font-mono text-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Use official Keeta bridge instead
                </a>
              </div>
            </div>
          </StarWarsPanel>
        </div>
      </main>
    </div>
  );
};

export default Bridge;
