import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { Copy, LogOut, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const { publicKey, isConnected, disconnect } = useKeetaWallet();

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast.success("Address copied to clipboard");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // ACCOUNT
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              PROFILE
            </h2>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <StarWarsPanel title="WALLET STATUS" className="animate-slide-up">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-sw-blue/60">STATUS</span>
                  <span className={`font-mono text-sm ${isConnected ? 'text-sw-green' : 'text-sw-red'}`}>
                    {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
                  </span>
                </div>
                
                {isConnected && publicKey && (
                  <div className="space-y-2">
                    <span className="font-mono text-sm text-sw-blue/60">ADDRESS</span>
                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center justify-between p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                    >
                      <span className="font-mono text-xs text-sw-blue truncate max-w-[250px]">
                        {publicKey}
                      </span>
                      <Copy className="w-4 h-4 text-sw-blue/60 group-hover:text-sw-yellow transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            </StarWarsPanel>

            <StarWarsPanel title="ACTIONS" className="animate-slide-up [animation-delay:100ms]">
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group">
                  <Settings className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-blue transition-colors" />
                  <span className="font-mono text-sm text-sw-blue/80 group-hover:text-sw-blue transition-colors">SETTINGS</span>
                </button>
                
                <button 
                  onClick={() => navigate("/security")}
                  className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                >
                  <Shield className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-blue transition-colors" />
                  <span className="font-mono text-sm text-sw-blue/80 group-hover:text-sw-blue transition-colors">SECURITY</span>
                </button>

                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 p-3 bg-sw-red/5 border border-sw-red/20 rounded hover:bg-sw-red/10 transition-colors group"
                  >
                    <LogOut className="w-5 h-5 text-sw-red/60 group-hover:text-sw-red transition-colors" />
                    <span className="font-mono text-sm text-sw-red/80 group-hover:text-sw-red transition-colors">DISCONNECT WALLET</span>
                  </button>
                )}
              </div>
            </StarWarsPanel>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Account;
