import { useState } from "react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { Eye, EyeOff, Copy, Lock, ArrowLeft, AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const PIN_STORAGE_KEY = "keeta_account_pin";
const SOUND_ENABLED_KEY = "keeta_sound_enabled";

const Security = () => {
  const navigate = useNavigate();
  const { seed, isConnected } = useKeetaWallet();
  const { play, setEnabled, isEnabled } = useSoundEffects();
  
  const [showSeed, setShowSeed] = useState(false);
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_ENABLED_KEY) !== 'false');
  
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasExistingPin, setHasExistingPin] = useState(() => !!localStorage.getItem(PIN_STORAGE_KEY));

  const copySeed = () => {
    play('click');
    if (seed) {
      navigator.clipboard.writeText(seed);
      toast.success("Seed phrase copied to clipboard");
    }
  };

  const handleSetPin = () => {
    if (pin.length < 4) {
      play('error');
      toast.error("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      play('error');
      toast.error("PINs do not match");
      return;
    }
    play('success');
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    setHasExistingPin(true);
    setPin("");
    setConfirmPin("");
    toast.success("PIN set successfully");
  };

  const handleRemovePin = () => {
    play('click');
    localStorage.removeItem(PIN_STORAGE_KEY);
    setHasExistingPin(false);
    toast.success("PIN removed");
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    setEnabled(newValue);
    if (newValue) {
      play('success');
    }
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <button
              onClick={() => {
                play('navigate');
                navigate("/account");
              }}
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
            {/* Sound Effects Toggle */}
            <StarWarsPanel title="SOUND EFFECTS" className="animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-sw-green" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-sw-blue/60" />
                  )}
                  <p className="font-mono text-sm text-sw-blue/80">
                    {soundEnabled ? "Sound enabled" : "Sound disabled"}
                  </p>
                </div>
                <button
                  onClick={toggleSound}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    soundEnabled ? 'bg-sw-green/30' : 'bg-sw-blue/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      soundEnabled 
                        ? 'left-7 bg-sw-green shadow-[0_0_8px_hsl(var(--sw-green)/0.5)]' 
                        : 'left-1 bg-sw-blue/60'
                    }`}
                  />
                </button>
              </div>
            </StarWarsPanel>

            {/* Export Private Key */}
            <StarWarsPanel title="EXPORT PRIVATE KEY" variant="warning" className="animate-slide-up [animation-delay:50ms]">
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
                    onClick={() => {
                      play('click');
                      setSeedConfirmed(true);
                    }}
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
                        onClick={() => {
                          play('click');
                          setShowSeed(!showSeed);
                        }}
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
    </div>
  );
};

export default Security;
