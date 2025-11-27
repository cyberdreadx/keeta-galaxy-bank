import { Bell, Settings, Wallet, Menu, X, Hexagon, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { WalletModal } from "./WalletModal";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, isConnecting, publicKey, network } = useKeetaWallet();

  const navItems = ['DASHBOARD', 'TRANSFERS', 'ASSETS', 'STAKING'];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-sw-blue/30 bg-[hsl(220,40%,4%)]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 relative">
                  <Hexagon className="w-10 h-10 text-sw-blue [filter:drop-shadow(0_0_10px_hsl(var(--sw-blue)/0.5))]" strokeWidth={1.5} />
                  <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm text-sw-yellow">K</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sw-green animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-[0.2em]">
                  <span className="text-sw-yellow [text-shadow:0_0_10px_hsl(var(--sw-yellow)/0.5)]">KEETA</span>
                  <span className="text-sw-blue [text-shadow:0_0_10px_hsl(var(--sw-blue)/0.5)]">BANK</span>
                </h1>
                <p className="font-mono text-[8px] text-sw-blue/60 tracking-[0.3em]">
                  GALACTIC PROTOCOL v2.4
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={cn(
                    "relative px-4 py-2 font-mono text-xs tracking-wider transition-all",
                    index === 0
                      ? "text-sw-yellow bg-sw-yellow/10 border border-sw-yellow/30"
                      : "text-sw-blue/70 hover:text-sw-blue hover:bg-sw-blue/5 border border-transparent hover:border-sw-blue/20"
                  )}
                >
                  {item}
                  {index === 0 && (
                    <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-px bg-sw-yellow" />
                  )}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors text-sw-blue hidden sm:block">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-sw-orange" />
              </button>
              <button className="p-2 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-colors text-sw-blue hidden sm:block">
                <Settings className="w-4 h-4" />
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
                {navItems.map((item, index) => (
                  <a
                    key={item}
                    href="#"
                    className={cn(
                      "px-4 py-3 font-mono text-xs tracking-wider transition-all",
                      index === 0
                        ? "text-sw-yellow bg-sw-yellow/10 border-l-2 border-sw-yellow"
                        : "text-sw-blue/70 hover:text-sw-blue hover:bg-sw-blue/5"
                    )}
                  >
                    {item}
                  </a>
                ))}
                
                {/* Mobile Wallet Button */}
                <button 
                  onClick={() => {
                    setIsWalletModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "mt-2 mx-4 flex items-center gap-2 px-4 py-3 border transition-colors",
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
      </header>

      <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
    </>
  );
};
