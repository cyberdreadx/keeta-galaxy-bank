import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { hashPassword } from "@/lib/encryption";
import { toast } from "sonner";

export default function UnlockWallet() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Check for lockout on mount
  useEffect(() => {
    const checkLockout = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['failed_unlock_attempts', 'lockout_until']);
        
        if (result.lockout_until && Date.now() < result.lockout_until) {
          setIsLocked(true);
          setLockoutTime(result.lockout_until);
        }
        
        if (result.failed_unlock_attempts) {
          setFailedAttempts(result.failed_unlock_attempts);
        }
      }
    };
    
    checkLockout();
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (!isLocked) return;
    
    const timer = setInterval(() => {
      if (Date.now() >= lockoutTime) {
        setIsLocked(false);
        setLockoutTime(0);
        setFailedAttempts(0);
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.remove(['failed_unlock_attempts', 'lockout_until']);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const handleUnlock = async () => {
    if (isLocked) {
      const remainingSeconds = Math.ceil((lockoutTime - Date.now()) / 1000);
      toast.error(`Wallet locked. Try again in ${remainingSeconds}s`);
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      // Get stored password hash
      let storedHash: string | null = null;
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('wallet_password_hash');
        storedHash = result.wallet_password_hash;
      } else {
        storedHash = localStorage.getItem('wallet_password_hash');
      }

      if (!storedHash) {
        // No password set yet - redirect to setup
        navigate("/setup-password");
        return;
      }

      // Hash entered password and compare
      const enteredHash = await hashPassword(password);
      
      if (enteredHash === storedHash) {
        // Success! Unlock wallet
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({
            wallet_locked: false,
            last_unlock_time: Date.now(),
            failed_unlock_attempts: 0
          });
          await chrome.storage.local.remove('lockout_until');
        } else {
          localStorage.setItem('wallet_locked', 'false');
          localStorage.setItem('last_unlock_time', Date.now().toString());
          localStorage.removeItem('failed_unlock_attempts');
          localStorage.removeItem('lockout_until');
        }

        toast.success("Wallet unlocked!");
        navigate("/");
      } else {
        // Failed attempt
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        // Lockout after 5 failed attempts
        if (newFailedAttempts >= 5) {
          const lockoutUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
          setIsLocked(true);
          setLockoutTime(lockoutUntil);

          if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({
              failed_unlock_attempts: newFailedAttempts,
              lockout_until: lockoutUntil
            });
          }

          toast.error("Too many failed attempts. Wallet locked for 5 minutes.");
        } else {
          if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({
              failed_unlock_attempts: newFailedAttempts
            });
          }
          
          toast.error(`Incorrect password. ${5 - newFailedAttempts} attempts remaining.`);
        }
        
        setPassword("");
      }
    } catch (error: any) {
      console.error('Unlock error:', error);
      toast.error("Failed to unlock wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isLocked) {
      handleUnlock();
    }
  };

  const remainingSeconds = isLocked ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0;

  return (
    <div className="bg-sw-space h-screen flex flex-col">
      <StarField />
      
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <StarWarsPanel title="WALLET LOCKED" className="max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-20 h-20 text-sw-yellow mx-auto mb-4 [filter:drop-shadow(0_0_15px_hsl(var(--sw-yellow)/0.5))] animate-pulse" />
            <p className="font-mono text-sm text-sw-blue/80">
              Enter your password to unlock
            </p>
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div className="mb-6 p-4 bg-sw-red/10 border border-sw-red/30 rounded animate-pulse">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-sw-red flex-shrink-0" />
                <div>
                  <p className="font-mono text-sm text-sw-red font-bold mb-1">
                    WALLET LOCKED
                  </p>
                  <p className="font-mono text-xs text-sw-red/80">
                    Too many failed attempts. Try again in {remainingSeconds} seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Failed Attempts Warning */}
          {!isLocked && failedAttempts > 0 && (
            <div className="mb-4 p-3 bg-sw-yellow/10 border border-sw-yellow/30 rounded">
              <p className="font-mono text-xs text-sw-yellow text-center">
                ⚠️ {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''} • {5 - failedAttempts} remaining
              </p>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password"
                disabled={isLocked}
                className="w-full p-4 pl-10 pr-10 bg-sw-dark/50 border border-sw-blue/30 text-sw-blue font-mono text-sm focus:outline-none focus:border-sw-blue disabled:opacity-50 rounded"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sw-blue/50 hover:text-sw-blue transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Unlock Button */}
            <button
              onClick={handleUnlock}
              disabled={isLoading || isLocked || !password}
              className="w-full py-3 bg-sw-blue/20 border border-sw-blue text-sw-blue font-mono text-sm hover:bg-sw-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isLoading ? 'UNLOCKING...' : isLocked ? `LOCKED (${remainingSeconds}s)` : 'UNLOCK WALLET'}
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-4 border-t border-sw-blue/20">
              <p className="font-mono text-xs text-sw-blue/60 mb-2">
                Forgot password?
              </p>
              <p className="font-mono text-[10px] text-sw-yellow/70">
                You'll need to restore from your seed phrase
              </p>
              <button
                onClick={() => {
                  if (confirm('⚠️ This will clear your current wallet. Make sure you have your seed phrase backed up!')) {
                    // Clear wallet data
                    if (typeof chrome !== 'undefined' && chrome.storage) {
                      chrome.storage.local.clear();
                    }
                    localStorage.clear();
                    navigate("/landing");
                  }
                }}
                className="mt-2 text-sw-red/70 hover:text-sw-red font-mono text-xs underline"
              >
                Reset Wallet
              </button>
            </div>
          </div>
        </StarWarsPanel>
      </main>
    </div>
  );
}

