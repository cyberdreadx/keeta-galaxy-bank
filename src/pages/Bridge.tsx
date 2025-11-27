import { useState } from "react";
import { ArrowDown, Loader2, ExternalLink, Info } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useBridge, BRIDGE_NETWORKS, BridgeNetwork } from "@/hooks/useBridge";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Bridge = () => {
  const { isConnected } = useKeetaWallet();
  const { play } = useSoundEffects();
  const { initiateBridge, isBridging, status, transferId, reset } = useBridge();
  
  const [fromNetwork, setFromNetwork] = useState<BridgeNetwork>(BRIDGE_NETWORKS[0]);
  const [toNetwork, setToNetwork] = useState<BridgeNetwork>(BRIDGE_NETWORKS[1]);
  const [amount, setAmount] = useState("");

  const handleSwapNetworks = () => {
    play('click');
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
  };

  const handleBridge = async () => {
    if (!isConnected) {
      play('error');
      toast.error("Please connect your wallet first");
      return;
    }

    const bridgeAmount = parseFloat(amount);
    if (isNaN(bridgeAmount) || bridgeAmount <= 0) {
      play('error');
      toast.error("Please enter a valid amount");
      return;
    }

    play('send');
    const result = await initiateBridge(fromNetwork, toNetwork, amount);

    if (result.success) {
      play('receive');
      toast.success(`Bridge initiated! Transfer ID: ${result.transferId}`);
      setAmount("");
    } else {
      play('error');
      toast.info(result.error || "Bridge failed");
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
              {/* Info Banner */}
              <div className="flex items-start gap-3 p-3 bg-sw-blue/10 border border-sw-blue/30 rounded">
                <Info className="w-5 h-5 text-sw-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-sw-blue/80">
                    Bridge KTA between Keeta L1 and Base network using the Keeta Anchor SDK. Cross-chain transfers typically take 5-15 minutes.
                  </p>
                </div>
              </div>

              {/* Transfer ID Display */}
              {transferId && (
                <div className="p-3 bg-sw-green/10 border border-sw-green/30 rounded">
                  <p className="font-mono text-xs text-sw-green/80">
                    Transfer ID: {transferId}
                  </p>
                </div>
              )}

              {/* From Network */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  FROM NETWORK
                </label>
                <div className="p-4 border border-sw-blue/40 bg-sw-blue/10 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-sw-blue/60 bg-sw-blue/20 flex items-center justify-center">
                        <span className="font-mono text-xs text-sw-blue">
                          {fromNetwork.id === 'keeta' ? 'L1' : 'B'}
                        </span>
                      </div>
                      <div>
                        <p className="font-display text-sm text-sw-blue">{fromNetwork.name}</p>
                        <p className="font-mono text-xs text-sw-blue/50">{fromNetwork.symbol}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2">
                <button
                  onClick={handleSwapNetworks}
                  className="p-3 border border-sw-orange/40 bg-sw-orange/10 hover:bg-sw-orange/20 transition-colors group"
                >
                  <ArrowDown className="w-5 h-5 text-sw-orange group-hover:animate-bounce" />
                </button>
              </div>

              {/* To Network */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  TO NETWORK
                </label>
                <div className="p-4 border border-sw-green/40 bg-sw-green/10 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-sw-green/60 bg-sw-green/20 flex items-center justify-center">
                        <span className="font-mono text-xs text-sw-green">
                          {toNetwork.id === 'keeta' ? 'L1' : 'B'}
                        </span>
                      </div>
                      <div>
                        <p className="font-display text-sm text-sw-green">{toNetwork.name}</p>
                        <p className="font-mono text-xs text-sw-blue/50">{toNetwork.symbol}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  AMOUNT (KTA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-sw-space/50 border border-sw-blue/30 text-sw-white font-mono text-sm placeholder:text-sw-blue/40 focus:border-sw-blue/60 focus:outline-none transition-colors"
                />
              </div>

              {/* Bridge Button */}
              <button
                onClick={handleBridge}
                disabled={isBridging || !amount}
                className="w-full py-4 bg-sw-orange/20 border border-sw-orange/50 hover:bg-sw-orange/30 hover:border-sw-orange text-sw-orange font-display font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isBridging ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    BRIDGING...
                  </>
                ) : (
                  <>
                    BRIDGE ASSETS
                  </>
                )}
              </button>

              {/* External Link */}
              <a
                href="https://keeta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sw-blue/60 hover:text-sw-blue transition-colors"
              >
                <span className="font-mono text-xs">Learn more about Keeta Bridge</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </StarWarsPanel>
        </div>
      </main>
    </div>
  );
};

export default Bridge;
