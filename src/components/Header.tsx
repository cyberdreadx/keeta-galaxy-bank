import { Bell, Settings, User, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-hologram flex items-center justify-center shadow-hologram">
                <span className="font-display font-bold text-lg text-primary-foreground">K</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground tracking-wide">
                KEETA<span className="text-hologram">BANK</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Galactic Banking Protocol
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {['Dashboard', 'Transfers', 'Assets', 'Staking'].map((item) => (
              <a
                key={item}
                href="#"
                className={cn(
                  "font-display text-sm font-medium uppercase tracking-wider transition-colors",
                  item === 'Dashboard'
                    ? "text-hologram"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-credits" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="hologram" size="sm" className="hidden sm:flex gap-2">
              <User className="w-4 h-4" />
              <span>0x7a3f...e82b</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {['Dashboard', 'Transfers', 'Assets', 'Staking'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={cn(
                    "px-4 py-3 rounded-lg font-display text-sm font-medium uppercase tracking-wider transition-colors",
                    item === 'Dashboard'
                      ? "bg-hologram/10 text-hologram"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
