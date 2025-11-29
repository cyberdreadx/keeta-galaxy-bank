import { useState } from "react";
import { ArrowDownUp, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { useKtaPrice } from "@/hooks/useKtaPrice";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Token {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
}

// Mock tokens for demonstration - in production these would come from the network
const AVAILABLE_TOKENS: Token[] = [
  { symbol: "KTA", name: "Keeta", balance: 0, icon: "⚡" },
  { symbol: "USDC", name: "USD Coin", balance: 0, icon: "💵" },
  { symbol: "WETH", name: "Wrapped ETH", balance: 0, icon: "◇" },
];

export default function Swap() {
  const { isConnected, network } = useKeetaWallet();
  const { balance: ktaBalance } = useKeetaBalance();
  const { priceUsd } = useKtaPrice();
  
  const [fromToken, setFromToken] = useState<Token>({ ...AVAILABLE_TOKENS[0], balance: ktaBalance });
  const [toToken, setToToken] = useState<Token>(AVAILABLE_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Update KTA balance when it changes
  const tokens = AVAILABLE_TOKENS.map(t => 
    t.symbol === "KTA" ? { ...t, balance: ktaBalance } : t
  );

  // Mock exchange rate calculation
  const getExchangeRate = (from: string, to: string): number => {
    const ktaUsdPrice = priceUsd || 0.05;
    const rates: Record<string, Record<string, number>> = {
      KTA: { USDC: ktaUsdPrice, WETH: ktaUsdPrice / 3000 },
      USDC: { KTA: 1 / ktaUsdPrice, WETH: 1 / 3000 },
      WETH: { KTA: 3000 / ktaUsdPrice, USDC: 3000 },
    };
    if (from === to) return 1;
    return rates[from]?.[to] || 0;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = getExchangeRate(fromToken.symbol, toToken.symbol);
      setToAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = getExchangeRate(toToken.symbol, fromToken.symbol);
      setFromAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setFromAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    const maxBalance = fromToken.symbol === "KTA" ? ktaBalance : fromToken.balance;
    handleFromAmountChange(maxBalance.toString());
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Enter an amount to swap");
      return;
    }

    const maxBalance = fromToken.symbol === "KTA" ? ktaBalance : fromToken.balance;
    if (parseFloat(fromAmount) > maxBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSwapping(true);
    
    // Simulate swap - in production this would call the DEX contract
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.info("Swap feature coming soon!", {
      description: "DEX integration is under development",
    });
    
    setIsSwapping(false);
  };

  const formatBalance = (amt: number): string => {
    return Math.floor(amt * 100) / 100 + "";
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-sw-space relative overflow-hidden">
        <StarField />
        <Header />
        <main className="relative z-10 pt-20 pb-24 px-4">
          <StarWarsPanel title="// TOKEN SWAP" className="mt-8">
            <div className="text-center py-12">
              <p className="text-sw-blue font-mono">CONNECT WALLET TO SWAP</p>
            </div>
          </StarWarsPanel>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sw-space relative overflow-hidden">
      <StarField />
      <Header />
      
      <main className="relative z-10 pt-20 pb-24 px-4 max-w-md mx-auto">
        <StarWarsPanel title="// TOKEN SWAP" className="mt-4">
          {/* Network indicator */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs text-sw-blue/60">
              NETWORK: {network === 'main' ? 'MAINNET' : 'TESTNET'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-sw-blue/60">SLIPPAGE:</span>
              <select 
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="bg-sw-blue/10 border border-sw-blue/30 text-sw-blue font-mono text-xs px-2 py-1 rounded"
              >
                <option value={0.1}>0.1%</option>
                <option value={0.5}>0.5%</option>
                <option value={1}>1.0%</option>
                <option value={2}>2.0%</option>
              </select>
            </div>
          </div>

          {/* From Token */}
          <div className="relative">
            <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded-t">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-sw-blue/60">FROM</span>
                <span className="font-mono text-xs text-sw-blue/60">
                  BAL: {formatBalance(fromToken.symbol === "KTA" ? ktaBalance : fromToken.balance)}
                </span>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowFromTokens(!showFromTokens)}
                    className="flex items-center gap-2 bg-sw-blue/10 border border-sw-blue/40 px-3 py-2 rounded hover:bg-sw-blue/20 transition-colors"
                  >
                    <span className="text-lg">{fromToken.icon}</span>
                    <span className="font-display font-bold text-sw-white">{fromToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-sw-blue" />
                  </button>
                  
                  <AnimatePresence>
                    {showFromTokens && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 z-50 bg-sw-space border border-sw-blue/40 rounded min-w-[150px]"
                      >
                        {tokens.filter(t => t.symbol !== toToken.symbol).map(token => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setFromToken(token);
                              setShowFromTokens(false);
                              handleFromAmountChange(fromAmount);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-sw-blue/20 transition-colors"
                          >
                            <span>{token.icon}</span>
                            <span className="font-mono text-sw-white">{token.symbol}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="bg-transparent border-none text-right text-2xl font-display text-sw-white placeholder:text-sw-blue/30 focus-visible:ring-0"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-1">
                <button
                  onClick={handleMaxClick}
                  className="font-mono text-xs text-sw-yellow hover:text-sw-yellow/80 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Swap direction button */}
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                onClick={handleSwapTokens}
                className="bg-sw-space border-2 border-sw-blue/60 p-2 rounded-full hover:bg-sw-blue/20 hover:border-sw-blue transition-all group"
              >
                <ArrowDownUp className="w-5 h-5 text-sw-blue group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* To Token */}
            <div className="border border-sw-blue/30 border-t-0 bg-sw-blue/5 p-4 rounded-b">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-sw-blue/60">TO</span>
                <span className="font-mono text-xs text-sw-blue/60">
                  BAL: {formatBalance(toToken.balance)}
                </span>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowToTokens(!showToTokens)}
                    className="flex items-center gap-2 bg-sw-blue/10 border border-sw-blue/40 px-3 py-2 rounded hover:bg-sw-blue/20 transition-colors"
                  >
                    <span className="text-lg">{toToken.icon}</span>
                    <span className="font-display font-bold text-sw-white">{toToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-sw-blue" />
                  </button>
                  
                  <AnimatePresence>
                    {showToTokens && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 z-50 bg-sw-space border border-sw-blue/40 rounded min-w-[150px]"
                      >
                        {tokens.filter(t => t.symbol !== fromToken.symbol).map(token => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setToToken(token);
                              setShowToTokens(false);
                              handleFromAmountChange(fromAmount);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-sw-blue/20 transition-colors"
                          >
                            <span>{token.icon}</span>
                            <span className="font-mono text-sw-white">{token.symbol}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    className="bg-transparent border-none text-right text-2xl font-display text-sw-white placeholder:text-sw-blue/30 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exchange rate info */}
          {fromAmount && toAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-3 border border-sw-blue/20 bg-sw-blue/5 rounded"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-sw-blue/60">RATE</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-sw-white">
                    1 {fromToken.symbol} = {getExchangeRate(fromToken.symbol, toToken.symbol).toFixed(6)} {toToken.symbol}
                  </span>
                  <RefreshCw className="w-3 h-3 text-sw-blue/60" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-mono text-xs text-sw-blue/60">MIN RECEIVED</span>
                <span className="font-mono text-sm text-sw-white">
                  {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
            </motion.div>
          )}

          {/* Swap button */}
          <Button
            onClick={handleSwap}
            disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
            variant="credits"
            className="w-full mt-6 h-14 text-lg font-display tracking-wider"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                SWAPPING...
              </>
            ) : (
              "SWAP TOKENS"
            )}
          </Button>

          {/* Info notice */}
          <p className="text-center font-mono text-xs text-sw-blue/40 mt-4">
            DEX INTEGRATION COMING SOON
          </p>
        </StarWarsPanel>
      </main>
    </div>
  );
}
