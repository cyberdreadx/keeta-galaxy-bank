import { Home, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "HOME", path: "/" },
  { icon: ArrowUpRight, label: "SEND", path: "/send" },
  { icon: ArrowDownLeft, label: "RECEIVE", path: "/receive" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sw-blue/30 bg-[hsl(220,40%,4%)]/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 transition-all",
                isActive(item.path)
                  ? "text-sw-yellow"
                  : "text-sw-blue/60 hover:text-sw-blue"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all",
                isActive(item.path) && "[filter:drop-shadow(0_0_8px_hsl(var(--sw-yellow)/0.6))]"
              )} />
              <span className={cn(
                "font-mono text-[10px] tracking-wider",
                isActive(item.path) && "[text-shadow:0_0_10px_hsl(var(--sw-yellow)/0.5)]"
              )}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-sw-yellow" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
