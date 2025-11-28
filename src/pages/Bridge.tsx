import { ArrowDown, ExternalLink, Info } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Bridge = () => {
  const { isConnected } = useKeetaWallet();
  const { play } = useSoundEffects();

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
              {/* Bridge Unavailable Notice */}
              <div className="flex items-start gap-3 p-4 bg-sw-orange/20 border border-sw-orange/50 rounded">
                <Info className="w-5 h-5 text-sw-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-sm text-sw-orange mb-2">Bridge Integration In Progress</p>
                  <p className="font-mono text-xs text-sw-orange/80">
                    The in-app bridge is currently under development. To bridge KTA between Keeta L1 and Base, please use the official Keeta bridge.
                  </p>
                </div>
              </div>

              {/* From Network Display */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  FROM NETWORK
                </label>
                <div className="p-4 border border-sw-blue/40 bg-sw-blue/10 rounded opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-sw-blue/60 bg-sw-blue/20 flex items-center justify-center">
                      <span className="font-mono text-xs text-sw-blue">L1</span>
                    </div>
                    <div>
                      <p className="font-display text-sm text-sw-blue">Keeta L1</p>
                      <p className="font-mono text-xs text-sw-blue/50">KTA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="p-3 border border-sw-blue/20 bg-sw-blue/5 opacity-60">
                  <ArrowDown className="w-5 h-5 text-sw-blue/50" />
                </div>
              </div>

              {/* To Network Display */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                  TO NETWORK
                </label>
                <div className="p-4 border border-sw-green/40 bg-sw-green/10 rounded opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-sw-green/60 bg-sw-green/20 flex items-center justify-center">
                      <span className="font-mono text-xs text-sw-green">B</span>
                    </div>
                    <div>
                      <p className="font-display text-sm text-sw-green">Base</p>
                      <p className="font-mono text-xs text-sw-blue/50">KTA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Bridge Button */}
              <a
                href="https://keeta.com/bridge"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => play('click')}
                className="w-full py-4 bg-sw-blue/20 border border-sw-blue/50 hover:bg-sw-blue/30 hover:border-sw-blue text-sw-blue font-display font-bold tracking-widest transition-all flex items-center justify-center gap-3"
              >
                <ExternalLink className="w-5 h-5" />
                USE OFFICIAL KEETA BRIDGE
              </a>

              {/* Info */}
              <p className="font-mono text-xs text-sw-blue/50 text-center">
                The official Keeta bridge at keeta.com supports secure cross-chain transfers between Keeta L1 and Base networks.
              </p>
            </div>
          </StarWarsPanel>
        </div>
      </main>
    </div>
  );
};

export default Bridge;
