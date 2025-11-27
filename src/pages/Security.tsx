import { useState } from "react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { Eye, EyeOff, Copy, Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PIN_STORAGE_KEY = "keeta_account_pin";

const Security = () => {
  const navigate = useNavigate();
  const { seed, isConnected } = useKeetaWallet();
  
  const [showSeed, setShowSeed] = useState(false);
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasExistingPin, setHasExistingPin] = useState(() => !!localStorage.getItem(PIN_STORAGE_KEY));

  const copySeed = () => {
    if (seed) {
      navigator.clipboard.writeText(seed);
      toast.success("Seed phrase copied to clipboard");
    }
  };

  const handleSetPin = () => {
    if (pin.length < 4) {
      toast.error("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    setHasExistingPin(true);
    setPin("");
    setConfirmPin("");
    toast.success("PIN set successfully");
  };

  const handleRemovePin = () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    setHasExistingPin(false);
    toast.success("PIN removed");
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <button
              onClick={() => navigate("/account")}
              className="inline-flex items-center gap-2 text-sw-blue/60 hover:text-sw-blue mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-xs tracking-wider">BACK</span>
            </button>
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // SECURITY
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              SECURITY
            </h2>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            {/* Export Private Key */}
            <StarWarsPanel title="EXPORT PRIVATE KEY" variant="warning" className="animate-slide-up">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-sw-orange/10 border border-sw-orange/30 rounded">
                  <AlertTriangle className="w-5 h-5 text-sw-orange flex-shrink-0 mt-0.5" />
                  <p className="font-mono text-xs text-sw-orange/80 leading-relaxed">
                    WARNING: Never share your seed phrase. Anyone with access can control your funds.
                  </p>
                </div>

                {!isConnected ? (
                  <p className="font-mono text-sm text-sw-blue/60 text-center py-4">
                    Connect wallet to export seed
                  </p>
                ) : !seedConfirmed ? (
                  <button
                    onClick={() => setSeedConfirmed(true)}
                    className="w-full p-3 bg-sw-orange/10 border border-sw-orange/30 rounded hover:bg-sw-orange/20 transition-colors font-mono text-sm text-sw-orange"
                  >
                    I UNDERSTAND THE RISKS
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="p-3 bg-sw-blue/5 border border-sw-blue/20 rounded font-mono text-xs text-sw-blue break-all min-h-[80px]">
                        {showSeed ? seed : "•".repeat(seed?.length || 48)}
                      </div>
                      <button
                        onClick={() => setShowSeed(!showSeed)}
                        className="absolute top-2 right-2 p-1.5 text-sw-blue/60 hover:text-sw-blue transition-colors"
                      >
                        {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={copySeed}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-sw-blue/10 border border-sw-blue/30 rounded hover:bg-sw-blue/20 transition-colors font-mono text-sm text-sw-blue"
                    >
                      <Copy className="w-4 h-4" />
                      COPY SEED PHRASE
                    </button>
                  </div>
                )}
              </div>
            </StarWarsPanel>

            {/* Set Account PIN */}
            <StarWarsPanel title="ACCOUNT PIN" className="animate-slide-up [animation-delay:100ms]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-sw-blue/60" />
                  <p className="font-mono text-xs text-sw-blue/60">
                    {hasExistingPin ? "PIN is currently set" : "Set a PIN for additional security"}
                  </p>
                </div>

                {hasExistingPin ? (
                  <button
                    onClick={handleRemovePin}
                    className="w-full p-3 bg-sw-red/10 border border-sw-red/30 rounded hover:bg-sw-red/20 transition-colors font-mono text-sm text-sw-red"
                  >
                    REMOVE PIN
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="font-mono text-xs text-sw-blue/60">NEW PIN</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter PIN"
                        className="w-full p-3 bg-sw-blue/5 border border-sw-blue/20 rounded font-mono text-sm text-sw-blue placeholder:text-sw-blue/30 focus:outline-none focus:border-sw-blue/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-xs text-sw-blue/60">CONFIRM PIN</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Confirm PIN"
                        className="w-full p-3 bg-sw-blue/5 border border-sw-blue/20 rounded font-mono text-sm text-sw-blue placeholder:text-sw-blue/30 focus:outline-none focus:border-sw-blue/50"
                      />
                    </div>
                    <button
                      onClick={handleSetPin}
                      disabled={!pin || !confirmPin}
                      className="w-full p-3 bg-sw-yellow/10 border border-sw-yellow/30 rounded hover:bg-sw-yellow/20 transition-colors font-mono text-sm text-sw-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      SET PIN
                    </button>
                  </div>
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

export default Security;
