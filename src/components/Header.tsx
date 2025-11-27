import { Bell, Lock, Wallet, Menu, X, Hexagon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { WalletModal } from "./WalletModal";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const PIN_STORAGE_KEY = "keeta_account_pin";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const { isConnected, isConnecting, publicKey, network } = useKeetaWallet();
  const { play } = useSoundEffects();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setHasPin(!!localStorage.getItem(PIN_STORAGE_KEY));
  }, []);

  const navItems = [
    { label: 'DASHBOARD', path: '/' },
    { label: 'SEND', path: '/send' },
    { label: 'RECEIVE', path: '/receive' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLock = () => {
    play('lock');
    if (hasPin) {
      navigate("/lock");
    } else {
      navigate("/security");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-sw-blue to-transparent" />
        
        <div className="relative bg-[hsl(220,40%,4%)]/95 backdrop-blur-sm border-b border-sw-blue/30">
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--sw-blue)/0.1)_2px,hsl(var(--sw-blue)/0.1)_4px)]" />
          
          {/* Corner brackets */}
          <div className="absolute bottom-0 left-2 w-4 h-4 border-l border-b border-sw-blue/40" />
          <div className="absolute bottom-0 right-2 w-4 h-4 border-r border-b border-sw-blue/40" />
          
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 relative">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 relative">
                    <Hexagon className="w-10 h-10 text-sw-blue [filter:drop-shadow(0_0_10px_hsl(var(--sw-blue)/0.5))]" strokeWidth={1.5} />
                    <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm text-sw-green">Y</span>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sw-green animate-pulse" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg tracking-[0.2em]">
                    <span className="text-sw-green [text-shadow:0_0_10px_hsl(var(--sw-green)/0.5)]">YODA</span>
                    <span className="text-sw-blue [text-shadow:0_0_10px_hsl(var(--sw-blue)/0.5)]">WALLET</span>
                  </h1>
                  <p className="font-mono text-[8px] text-sw-blue/60 tracking-[0.3em]">
                    THE FORCE OF FINANCE
                  </p>
                </div>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "relative px-4 py-2 font-mono text-xs tracking-wider transition-all",
                      isActive(item.path)
                        ? "text-sw-yellow bg-sw-yellow/10 border border-sw-yellow/30"
                        : "text-sw-blue/70 hover:text-sw-blue hover:bg-sw-blue/5 border border-transparent hover:border-sw-blue/20"
                    )}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-px bg-sw-yellow" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="relative p-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors text-sw-blue hidden sm:block">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-sw-orange" />
                </button>
                
                {/* Lock Button */}
                <button 
                  onClick={handleLock}
                  className={cn(
                    "p-2 border transition-colors hidden sm:block",
                    hasPin 
                      ? "border-sw-yellow/30 bg-sw-yellow/5 hover:bg-sw-yellow/10 text-sw-yellow" 
                      : "border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 text-sw-blue"
                  )}
                >
                  <Lock className="w-4 h-4" />
                </button>
                
                {/* Wallet Button */}
                <button 
                  onClick={() => setIsWalletModalOpen(true)}
                  className={cn(
                    "hidden sm:flex items-center gap-2 px-3 py-2 border transition-colors",
                    isConnected
                      ? "border-sw-green/40 bg-sw-green/10 hover:bg-sw-green/20"
                      : "border-sw-yellow/40 bg-sw-yellow/10 hover:bg-sw-yellow/20"
                  )}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 text-sw-blue animate-spin" />
                  ) : (
                    <Wallet className={cn(
                      "w-4 h-4",
                      isConnected ? "text-sw-green" : "text-sw-yellow"
                    )} />
                  )}
                  {isConnected && publicKey ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sw-green">
                        {truncateAddress(publicKey)}
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 text-[8px] font-mono tracking-wider",
                        network === 'test' 
                          ? "bg-sw-orange/20 text-sw-orange border border-sw-orange/30"
                          : "bg-sw-green/20 text-sw-green border border-sw-green/30"
                      )}>
                        {network === 'test' ? 'TEST' : 'MAIN'}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-sw-yellow">
                      {isConnecting ? 'CONNECTING...' : 'CONNECT'}
                    </span>
                  )}
                </button>
                
                <button
                  className="p-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors text-sw-blue md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-sw-blue/30 animate-fade-in">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "px-4 py-3 font-mono text-xs tracking-wider transition-all text-left",
                        isActive(item.path)
                          ? "text-sw-yellow bg-sw-yellow/10 border-l-2 border-sw-yellow"
                          : "text-sw-blue/70 hover:text-sw-blue hover:bg-sw-blue/5"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                  
                  {/* Mobile Lock Button */}
                  <button 
                    onClick={() => {
                      handleLock();
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "mx-4 mt-2 flex items-center gap-2 px-4 py-3 border transition-colors",
                      hasPin 
                        ? "border-sw-yellow/40 bg-sw-yellow/10" 
                        : "border-sw-blue/40 bg-sw-blue/10"
                    )}
                  >
                    <Lock className={cn(
                      "w-4 h-4",
                      hasPin ? "text-sw-yellow" : "text-sw-blue"
                    )} />
                    <span className={cn(
                      "font-mono text-xs",
                      hasPin ? "text-sw-yellow" : "text-sw-blue"
                    )}>
                      {hasPin ? 'LOCK APP' : 'SET UP PIN'}
                    </span>
                  </button>
                  
                  {/* Mobile Wallet Button */}
                  <button 
                    onClick={() => {
                      setIsWalletModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "mx-4 mt-2 flex items-center gap-2 px-4 py-3 border transition-colors",
                      isConnected
                        ? "border-sw-green/40 bg-sw-green/10"
                        : "border-sw-yellow/40 bg-sw-yellow/10"
                    )}
                  >
                    <Wallet className={cn(
                      "w-4 h-4",
                      isConnected ? "text-sw-green" : "text-sw-yellow"
                    )} />
                    <span className={cn(
                      "font-mono text-xs",
                      isConnected ? "text-sw-green" : "text-sw-yellow"
                    )}>
                      {isConnected && publicKey ? truncateAddress(publicKey) : 'CONNECT WALLET'}
                    </span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
    </>
  );
};
