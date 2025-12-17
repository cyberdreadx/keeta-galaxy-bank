import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Pay = () => {
  const navigate = useNavigate();
  const { play } = useSoundEffects();

  const handleNavigate = (path: string) => {
    play('navigate');
    navigate(path);
  };

  return (
    <div className="relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // TRANSACTIONS
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              <span className="text-sw-yellow">PAY</span>
            </h2>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-sw-blue/50" />
              <span className="font-mono text-xs text-sw-blue/60">GALACTIC TRANSFERS</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-sw-blue/50" />
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            {/* Send Option */}
            <button
              onClick={() => handleNavigate('/send')}
              className="w-full animate-slide-up"
            >
              <StarWarsPanel className="hover:border-sw-green/60 transition-colors group">
                <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 border border-sw-green/40 bg-sw-green/10 flex items-center justify-center group-hover:bg-sw-green/20 transition-colors">
                    <ArrowUpRight className="w-7 h-7 text-sw-green group-hover:[filter:drop-shadow(0_0_8px_hsl(var(--sw-green)/0.6))] transition-all" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-display text-lg text-sw-green tracking-wider group-hover:[text-shadow:0_0_10px_hsl(var(--sw-green)/0.5)] transition-all">
                      SEND CREDITS
                    </h3>
                    <p className="font-mono text-xs text-sw-blue/60 mt-1">
                      Transfer KTA to any address
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-sw-green/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-sw-green" />
                  </div>
                </div>
              </StarWarsPanel>
            </button>

            {/* Receive Option */}
            <button
              onClick={() => handleNavigate('/receive')}
              className="w-full animate-slide-up [animation-delay:100ms]"
            >
              <StarWarsPanel className="hover:border-sw-yellow/60 transition-colors group">
                <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 border border-sw-yellow/40 bg-sw-yellow/10 flex items-center justify-center group-hover:bg-sw-yellow/20 transition-colors">
                    <ArrowDownLeft className="w-7 h-7 text-sw-yellow group-hover:[filter:drop-shadow(0_0_8px_hsl(var(--sw-yellow)/0.6))] transition-all" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-display text-lg text-sw-yellow tracking-wider group-hover:[text-shadow:0_0_10px_hsl(var(--sw-yellow)/0.5)] transition-all">
                      RECEIVE CREDITS
                    </h3>
                    <p className="font-mono text-xs text-sw-blue/60 mt-1">
                      Show your wallet address & QR
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-sw-yellow/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowDownLeft className="w-4 h-4 text-sw-yellow" />
                  </div>
                </div>
              </StarWarsPanel>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pay;
