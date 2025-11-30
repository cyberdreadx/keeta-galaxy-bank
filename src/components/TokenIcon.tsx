import { useState } from "react";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import ktaLogo from "@/assets/kta-logo.jpg";
import kchadLogo from "@/assets/kchad-logo.jpg";
import pacaLogo from "@/assets/paca-logo.jpeg";

// Fallback emoji icons
const TOKEN_ICONS: Record<string, string> = {
  NDA: "📜", AKTA: "💎", KTARD: "🃏",
  DRINK: "🍺", SPIT: "💦", ERIC: "👤", SOON: "🔜", KWIF: "🎩",
  USDC: "💵", EURC: "💶", cbBTC: "₿", KRT: "🎫", MURF: "🐕"
};

// Static logo URLs for known tokens
const STATIC_LOGOS: Record<string, string> = {
  KTA: ktaLogo,
  KCHAD: kchadLogo,
  PACA: pacaLogo,
};

interface TokenIconProps {
  tokenAddress: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const TokenIcon = ({ tokenAddress, symbol, size = "md", className = "" }: TokenIconProps) => {
  const { metadata } = useTokenMetadata(tokenAddress);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl"
  };

  const fallbackIcon = TOKEN_ICONS[symbol] || "🪙";
  
  // Check for static logo first, then metadata logoURI
  const logoURI = STATIC_LOGOS[symbol] || metadata?.logoURI;

  // Show image if we have a valid logoURI and no error
  if (logoURI && !imgError) {
    return (
      <div className={`${sizeClasses[size]} border border-sw-blue/40 bg-sw-blue/10 flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src={logoURI}
          alt={symbol}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback to emoji
  return (
    <div className={`${sizeClasses[size]} border border-sw-blue/40 bg-sw-blue/10 flex items-center justify-center ${className}`}>
      {fallbackIcon}
    </div>
  );
};
