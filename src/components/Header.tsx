import { Bell, Settings, User, Menu, X, Hexagon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = ['DASHBOARD', 'TRANSFERS', 'ASSETS', 'STAKING'];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sw-blue/30 bg-[hsl(220,40%,4%)]/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Hexagon logo */}
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
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 border border-sw-blue/40 bg-sw-blue/10 hover:bg-sw-blue/20 transition-colors">
              <User className="w-4 h-4 text-sw-blue" />
              <span className="font-mono text-xs text-sw-blue">0x7a3f...e82b</span>
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
