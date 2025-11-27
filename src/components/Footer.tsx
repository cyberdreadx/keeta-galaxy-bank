import { Link } from "react-router-dom";
import { Hexagon, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-sw-blue/20 bg-sw-space/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Hexagon className="w-5 h-5 text-sw-green" strokeWidth={1.5} />
            <span className="font-display text-sm font-bold tracking-wider">
              <span className="text-sw-green">YODA</span>
              <span className="text-sw-blue">WALLET</span>
            </span>
          </Link>
          
          {/* Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/landing" 
              className="font-mono text-xs text-sw-blue/60 hover:text-sw-green transition-colors flex items-center gap-1"
            >
              ABOUT
            </Link>
            <a 
              href="https://keeta.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors flex items-center gap-1"
            >
              KEETA
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://docs.keeta.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors flex items-center gap-1"
            >
              DOCS
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          {/* Copyright */}
          <p className="font-mono text-[10px] text-sw-blue/40">
            © {new Date().getFullYear()} YODA WALLET
          </p>
        </div>
      </div>
    </footer>
  );
};
