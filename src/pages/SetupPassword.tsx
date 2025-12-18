import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { hashPassword, validatePasswordStrength } from "@/lib/encryption";
import { toast } from "sonner";

export default function SetupPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const validation = validatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSetupPassword = async () => {
    if (!validation.isStrong) {
      toast.error("Password is not strong enough");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Hash password for storage (not for encryption!)
      const passwordHash = await hashPassword(password);
      
      // Store password hash in chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          wallet_password_hash: passwordHash,
          wallet_locked: false, // Unlock after setting password
          auto_lock_minutes: 15, // Default auto-lock time
        });
      } else {
        // Fallback to localStorage for development
        localStorage.setItem('wallet_password_hash', passwordHash);
        localStorage.setItem('wallet_locked', 'false');
        localStorage.setItem('auto_lock_minutes', '15');
      }

      toast.success("Password set successfully!");
      navigate("/");
    } catch (error: any) {
      console.error('Password setup error:', error);
      toast.error(error.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-sw-space h-screen flex flex-col">
      <StarField />
      
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <StarWarsPanel title="SECURE YOUR WALLET" className="max-w-md w-full">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-sw-green mx-auto mb-4 [filter:drop-shadow(0_0_10px_hsl(var(--sw-green)/0.5))]" />
            <p className="font-mono text-sm text-sw-blue/80 leading-relaxed">
              Set a strong password to protect your wallet and private keys
            </p>
          </div>

          {/* Security Warning */}
          <div className="mb-6 p-4 bg-sw-yellow/10 border border-sw-yellow/30 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-sw-yellow flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-sw-yellow font-bold mb-2">
                  CRITICAL SECURITY NOTICE
                </p>
                <ul className="font-mono text-xs text-sw-yellow/90 space-y-1">
                  <li>• This password encrypts your private keys</li>
                  <li>• Cannot be recovered if forgotten</li>
                  <li>• Keep it secure and never share it</li>
                  <li>• Different from your seed phrase backup</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs text-sw-blue/70 mb-2 block">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password"
                  className="w-full p-3 pl-10 pr-10 bg-sw-dark/50 border border-sw-blue/30 text-sw-blue font-mono text-sm focus:outline-none focus:border-sw-blue rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sw-blue/50 hover:text-sw-blue transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-mono text-xs text-sw-blue/70 mb-2 block">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full p-3 pl-10 bg-sw-dark/50 border border-sw-blue/30 text-sw-blue font-mono text-sm focus:outline-none focus:border-sw-blue rounded"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-sw-blue/70">STRENGTH:</span>
                  <span className={`font-mono text-xs font-bold ${
                    validation.isStrong ? 'text-sw-green' : 'text-sw-red'
                  }`}>
                    {validation.isStrong ? 'STRONG ✓' : 'WEAK ✗'}
                  </span>
                </div>
                
                {validation.issues.length > 0 && (
                  <ul className="space-y-1">
                    {validation.issues.map((issue, i) => (
                      <li key={i} className="font-mono text-[10px] text-sw-red/80 flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Passwords Match Indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  passwordsMatch ? 'bg-sw-green' : 'bg-sw-red'
                }`} />
                <span className={`font-mono text-xs ${
                  passwordsMatch ? 'text-sw-green' : 'text-sw-red'
                }`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSetupPassword}
              disabled={!validation.isStrong || !passwordsMatch || isLoading}
              className="w-full py-3 bg-sw-green/20 border border-sw-green text-sw-green font-mono text-sm hover:bg-sw-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isLoading ? 'SECURING WALLET...' : 'SET PASSWORD'}
            </button>

            {/* Skip Option (NOT RECOMMENDED) */}
            <button
              onClick={() => {
                if (confirm('⚠️ WARNING: Skipping password protection is NOT recommended. Your private keys will be less secure. Continue?')) {
                  navigate("/");
                }
              }}
              className="w-full py-2 border border-sw-red/30 text-sw-red/70 font-mono text-xs hover:bg-sw-red/10 transition-colors rounded"
            >
              SKIP (NOT RECOMMENDED)
            </button>
          </div>
        </StarWarsPanel>
      </main>
    </div>
  );
}

