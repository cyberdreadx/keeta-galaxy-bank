import { useState } from "react";
import { StarField } from "@/components/StarField";
import { Lock, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const PIN_STORAGE_KEY = "keeta_account_pin";

const LockScreen = () => {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handlePinInput = (digit: string) => {
    play('keypad');
    
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      // Auto-submit when PIN reaches expected length
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
      if (storedPin && newPin.length === storedPin.length) {
        if (newPin === storedPin) {
          play('unlock');
          toast.success("Unlocked");
          navigate("/");
        } else {
          play('error');
          setError(true);
          setPin("");
          toast.error("Incorrect PIN");
        }
      }
    }
  };

  const handleDelete = () => {
    play('click');
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    play('click');
    setPin("");
    setError(false);
  };

  return (
    <div className="relative h-full flex items-center justify-center">
      <StarField />

      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <Hexagon className="w-16 h-16 text-sw-blue [filter:drop-shadow(0_0_15px_hsl(var(--sw-blue)/0.5))]" strokeWidth={1.5} />
            <Lock className="absolute inset-0 m-auto w-6 h-6 text-sw-yellow" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-wider">
            <span className="text-sw-yellow [text-shadow:0_0_10px_hsl(var(--sw-yellow)/0.5)]">KEETA</span>
            <span className="text-sw-blue [text-shadow:0_0_10px_hsl(var(--sw-blue)/0.5)]">BANK</span>
          </h1>
          <p className="font-mono text-xs text-sw-blue/60 tracking-[0.3em] mt-2">
            ENTER PIN TO UNLOCK
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                i < pin.length
                  ? error
                    ? "bg-sw-red border-sw-red shadow-[0_0_10px_hsl(var(--sw-red)/0.5)]"
                    : "bg-sw-yellow border-sw-yellow shadow-[0_0_10px_hsl(var(--sw-yellow)/0.5)]"
                  : "border-sw-blue/40"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinInput(String(num))}
              className="h-14 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-xl text-sw-blue hover:bg-sw-blue/10 hover:border-sw-blue/50 transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 bg-sw-red/5 border border-sw-red/30 rounded font-mono text-xs text-sw-red hover:bg-sw-red/10 transition-all active:scale-95"
          >
            CLEAR
          </button>
          <button
            onClick={() => handlePinInput("0")}
            className="h-14 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-xl text-sw-blue hover:bg-sw-blue/10 hover:border-sw-blue/50 transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 bg-sw-orange/5 border border-sw-orange/30 rounded font-mono text-xs text-sw-orange hover:bg-sw-orange/10 transition-all active:scale-95"
          >
            DEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
