import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, ArrowUpRight, RefreshCw, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { TokenIcon } from "./TokenIcon";

interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    symbol: string;
    name: string;
    balance: number;
    address: string;
    valueFiat: number | null;
    change: number | null;
    decimals: number;
    rawBalance: string;
  } | null;
}

export const TokenDetailModal = ({ isOpen, onClose, token }: TokenDetailModalProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { metadata, isLoading: metadataLoading } = useTokenMetadata(isOpen ? token?.address || null : null);

  if (!token) return null;

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onClose();
    navigate('/send');
  };

  const handleSwap = () => {
    onClose();
    navigate('/swap');
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 24) return addr;
    return `${addr.slice(0, 16)}...${addr.slice(-8)}`;
  };

  const formatSupply = (supply: string) => {
    try {
      const num = BigInt(supply);
      return num.toLocaleString();
    } catch {
      return supply;
    }
  };

  // Use fetched metadata name if available, otherwise fall back to local
  const displayName = metadata?.name || token.name;
  const displaySymbol = metadata?.symbol || token.symbol;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-sw-space border-sw-blue/40 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sw-blue font-mono tracking-wider flex items-center gap-3">
            <TokenIcon tokenAddress={token.address} symbol={token.symbol} size="lg" />
            <div>
              <div className="text-sw-white text-xl">{displayName}</div>
              <div className="text-sw-blue/60 text-sm font-normal">{displaySymbol}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Balance Section */}
          <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded">
            <div className="text-sw-blue/60 font-mono text-xs mb-1">YOUR BALANCE</div>
            <div className="text-sw-white font-display text-2xl font-bold">
              {token.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              <span className="text-sw-blue/60 text-lg ml-2">{displaySymbol}</span>
            </div>
            {token.valueFiat !== null && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sw-yellow font-mono">
                  ${token.valueFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {token.change !== null && (
                  <span className={cn(
                    "font-mono text-sm",
                    token.change >= 0 ? "text-sw-green" : "text-sw-red"
                  )}>
                    {token.change >= 0 ? '▲' : '▼'} {Math.abs(token.change).toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Token Details Section */}
          <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sw-blue/60 font-mono text-xs">TOKEN DETAILS</span>
              {metadataLoading && <Loader2 className="w-3 h-3 text-sw-blue animate-spin" />}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-sw-blue/10 pb-2">
                <span className="text-sw-blue/60 font-mono text-xs">Name</span>
                <span className="text-sw-white font-mono text-sm">{displayName}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-sw-blue/10 pb-2">
                <span className="text-sw-blue/60 font-mono text-xs">Symbol</span>
                <span className="text-sw-white font-mono text-sm">{displaySymbol}</span>
              </div>
              
              {metadata?.supply && metadata.supply !== '0' && (
                <div className="flex justify-between items-center border-b border-sw-blue/10 pb-2">
                  <span className="text-sw-blue/60 font-mono text-xs">Supply</span>
                  <span className="text-sw-white font-mono text-sm">{formatSupply(metadata.supply)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center border-b border-sw-blue/10 pb-2">
                <span className="text-sw-blue/60 font-mono text-xs">Decimal Places</span>
                <span className="text-sw-white font-mono text-sm">{metadata?.decimalPlaces ?? token.decimals}</span>
              </div>
              
              {metadata?.accessMode && (
                <div className="flex justify-between items-center border-b border-sw-blue/10 pb-2">
                  <span className="text-sw-blue/60 font-mono text-xs">Access Mode</span>
                  <span className="text-sw-green font-mono text-sm">{metadata.accessMode}</span>
                </div>
              )}
              
              {metadata?.defaultPermissions && (
                <div className="flex justify-between items-center">
                  <span className="text-sw-blue/60 font-mono text-xs">Default Permissions</span>
                  <span className="text-sw-green font-mono text-sm">{metadata.defaultPermissions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Token Address */}
          <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded">
            <div className="text-sw-blue/60 font-mono text-xs mb-2">TOKEN ADDRESS</div>
            <div className="flex items-center gap-2">
              <code className="text-sw-blue font-mono text-xs flex-1 break-all">
                {truncateAddress(token.address)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-8 w-8 p-0 text-sw-blue hover:text-sw-blue hover:bg-sw-blue/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSend}
              className="bg-sw-blue/20 border border-sw-blue/40 text-sw-blue hover:bg-sw-blue/30 font-mono"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              SEND
            </Button>
            <Button
              onClick={handleSwap}
              className="bg-sw-yellow/20 border border-sw-yellow/40 text-sw-yellow hover:bg-sw-yellow/30 font-mono"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              SWAP
            </Button>
          </div>

          {/* View on Explorer */}
          <a
            href={`https://explorer.keeta.com/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sw-blue/60 hover:text-sw-blue font-mono text-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            VIEW ON EXPLORER
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
