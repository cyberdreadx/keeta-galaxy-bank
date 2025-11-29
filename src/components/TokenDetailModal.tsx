import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, ArrowUpRight, RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    icon: string;
    decimals: number;
    rawBalance: string;
  } | null;
}

export const TokenDetailModal = ({ isOpen, onClose, token }: TokenDetailModalProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-sw-space border-sw-blue/40 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sw-blue font-mono tracking-wider flex items-center gap-3">
            <span className="text-3xl">{token.icon}</span>
            <div>
              <div className="text-sw-white text-xl">{token.name}</div>
              <div className="text-sw-blue/60 text-sm font-normal">{token.symbol}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Balance Section */}
          <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded">
            <div className="text-sw-blue/60 font-mono text-xs mb-1">BALANCE</div>
            <div className="text-sw-white font-display text-2xl font-bold">
              {token.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              <span className="text-sw-blue/60 text-lg ml-2">{token.symbol}</span>
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

          {/* Token Info */}
          <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded space-y-3">
            <div>
              <div className="text-sw-blue/60 font-mono text-xs mb-1">TOKEN ADDRESS</div>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sw-blue/60 font-mono text-xs mb-1">DECIMALS</div>
                <div className="text-sw-white font-mono">{token.decimals}</div>
              </div>
              <div>
                <div className="text-sw-blue/60 font-mono text-xs mb-1">RAW BALANCE</div>
                <div className="text-sw-white font-mono text-xs truncate" title={token.rawBalance}>
                  {token.rawBalance.length > 15 ? `${token.rawBalance.slice(0, 15)}...` : token.rawBalance}
                </div>
              </div>
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
            href={`https://scan.keeta.com/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sw-blue/60 hover:text-sw-blue font-mono text-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            VIEW ON KEETA SCAN
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
