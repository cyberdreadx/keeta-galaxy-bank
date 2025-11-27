import { Home, CreditCard, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const navItems = [
  { icon: Home, label: "HOME", path: "/" },
  { icon: CreditCard, label: "PAY", path: "/pay" },
  { icon: User, label: "ACCOUNT", path: "/account" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSoundEffects();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => {
    if (path === '/pay') {
      return ['/pay', '/send', '/receive'].includes(location.pathname);
    }
    return location.pathname === path;
  };

  const handleNavigate = (path: string) => {
    if (!isActive(path)) {
      play('navigate');
    }
    navigate(path);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-300",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      {/* Top border glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-sw-blue to-transparent" />
      
      {/* Main nav container */}
      <div className="relative bg-[hsl(220,40%,4%)]/95 backdrop-blur-sm">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--sw-blue)/0.1)_2px,hsl(var(--sw-blue)/0.1)_4px)]" />
        
        {/* Corner brackets */}
        <div className="absolute top-0 left-2 w-4 h-4 border-l border-t border-sw-blue/40" />
        <div className="absolute top-0 right-2 w-4 h-4 border-r border-t border-sw-blue/40" />
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16 relative">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 px-6 py-2 transition-all group",
                  isActive(item.path)
                    ? "text-sw-yellow"
                    : "text-sw-blue/60 hover:text-sw-blue"
                )}
              >
                {/* Icon with glow */}
                <item.icon className={cn(
                  "w-5 h-5 transition-all",
                  isActive(item.path) && "[filter:drop-shadow(0_0_8px_hsl(var(--sw-yellow)/0.8))]"
                )} />
                
                {/* Label */}
                <span className={cn(
                  "font-mono text-[10px] tracking-[0.2em] transition-all",
                  isActive(item.path) 
                    ? "[text-shadow:0_0_10px_hsl(var(--sw-yellow)/0.8),0_0_20px_hsl(var(--sw-yellow)/0.4)]"
                    : "group-hover:[text-shadow:0_0_8px_hsl(var(--sw-blue)/0.5)]"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator bar */}
                {isActive(item.path) && (
                  <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5">
                    <div className="w-full h-full bg-sw-yellow shadow-[0_0_10px_hsl(var(--sw-yellow)/0.8)]" />
                    <div className="absolute -left-1 top-0 w-1 h-0.5 bg-sw-yellow/50" />
                    <div className="absolute -right-1 top-0 w-1 h-0.5 bg-sw-yellow/50" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-sw-blue/20 via-sw-blue/40 to-sw-blue/20" />
      </div>
    </nav>
  );
};
