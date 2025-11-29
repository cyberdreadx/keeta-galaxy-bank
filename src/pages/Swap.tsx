import { useState, useEffect } from "react";
import { ArrowDownUp, ChevronDown, Loader2, RefreshCw, AlertCircle, Rocket } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { useKtaPrice } from "@/hooks/useKtaPrice";
import { useKeetaSwap } from "@/hooks/useKeetaSwap";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Token {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
}

// Token icons mapping
const TOKEN_ICONS: Record<string, string> = {
  KTA: "⚡", PACA: "🦙", NDA: "📜", AKTA: "💎", KTARD: "🃏",
  DRINK: "🍺", SPIT: "💦", ERIC: "👤", KCHAD: "💪", SOON: "🔜", KWIF: "🎩"
};

export default function Swap() {
  const { isConnected, network } = useKeetaWallet();
  const { balance: ktaBalance } = useKeetaBalance();
  const { priceUsd } = useKtaPrice();
  const { 
    isInitialized, 
    isLoading: swapLoading, 
    error: swapError, 
    fxServiceAvailable,
    comingSoon,
    availableTokens,
    getEstimate,
    executeSwap 
  } = useKeetaSwap();
  
  // Build token list from FX service
  const tokens: Token[] = availableTokens.length > 0 
    ? availableTokens.map(t => {
        const sym = t.symbol.replace('$', '');
        return {
          symbol: sym,
          name: t.name || sym,
          balance: sym === 'KTA' ? ktaBalance : 0,
          icon: TOKEN_ICONS[sym] || '🪙'
        };
      })
    : [{ symbol: 'KTA', name: 'Keeta', balance: ktaBalance, icon: '⚡' }];

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [estimateLoading, setEstimateLoading] = useState(false);

  // Initialize tokens when available
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      setFromToken(tokens.find(t => t.symbol === 'KTA') || tokens[0]);
      setToToken(tokens.find(t => t.symbol !== 'KTA') || tokens[1] || tokens[0]);
    }
  }, [tokens, fromToken]);

  // Fallback exchange rate calculation when FX service unavailable
  const getFallbackRate = (from: string, to: string): number => {
    const ktaUsdPrice = priceUsd || 0.05;
    const rates: Record<string, Record<string, number>> = {
      KTA: { USDC: ktaUsdPrice, WETH: ktaUsdPrice / 3000 },
      USDC: { KTA: 1 / ktaUsdPrice, WETH: 1 / 3000 },
      WETH: { KTA: 3000 / ktaUsdPrice, USDC: 3000 },
    };
    if (from === to) return 1;
    return rates[from]?.[to] || 0;
  };

  // Get estimate from resolver or use fallback
  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    
    if (!value || isNaN(parseFloat(value)) || !fromToken || !toToken) {
      setToAmount("");
      return;
    }

    // Try to get estimate from FX service
    if (fxServiceAvailable && isInitialized) {
      setEstimateLoading(true);
      const estimate = await getEstimate(fromToken.symbol, toToken.symbol, value);
      setEstimateLoading(false);
      
      if (estimate) {
        setToAmount(estimate.toAmount);
        return;
      }
    }

    // Fallback to calculated rate
    const rate = getFallbackRate(fromToken.symbol, toToken.symbol);
    setToAmount((parseFloat(value) * rate).toFixed(6));
  };

  const handleToAmountChange = async (value: string) => {
    setToAmount(value);
    
    if (!value || isNaN(parseFloat(value)) || !fromToken || !toToken) {
      setFromAmount("");
      return;
    }

    // Try reverse estimate from FX service
    if (fxServiceAvailable && isInitialized) {
      setEstimateLoading(true);
      const estimate = await getEstimate(toToken.symbol, fromToken.symbol, value);
      setEstimateLoading(false);
      
      if (estimate) {
        setFromAmount(estimate.toAmount);
        return;
      }
    }

    // Fallback
    const rate = getFallbackRate(toToken.symbol, fromToken.symbol);
    setFromAmount((parseFloat(value) * rate).toFixed(6));
  };

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    if (!fromToken) return;
    const maxBalance = fromToken.symbol === "KTA" ? ktaBalance : fromToken.balance;
    handleFromAmountChange(maxBalance.toString());
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken) return;
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

    if (fxServiceAvailable) {
      // Use resolver FX service for swap
      const minReceived = (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6);
      const result = await executeSwap(fromToken.symbol, toToken.symbol, fromAmount, minReceived);

      if (result.success) {
        toast.success("Swap executed!", {
          description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        });
        setFromAmount("");
        setToAmount("");
      } else {
        const errorMessage = result.error?.includes('No quotes available')
          ? `No liquidity providers found for ${fromToken.symbol}/${toToken.symbol} on the default resolver. Try again later as liquidity is still being added.`
          : result.error;
        toast.error("Swap failed", {
          description: errorMessage,
        });
      }
    } else {
      // No FX service - show coming soon
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.info("Swap service not available", {
        description: `No FX resolver found on ${network === 'main' ? 'Mainnet' : 'Testnet'}`,
      });
    }
    
    setIsSwapping(false);
  };

  const formatBalance = (amt: number): string => {
    return Math.floor(amt * 100) / 100 + "";
  };

  const currentRate = fromToken && toToken ? getFallbackRate(fromToken.symbol, toToken.symbol) : 0;

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

  // Show Coming Soon state when FX service isn't available
  if (comingSoon || !fxServiceAvailable) {
    return (
      <div className="min-h-screen bg-sw-space relative overflow-hidden">
        <StarField />
        <Header />
        <main className="relative z-10 pt-20 pb-24 px-4 max-w-md mx-auto">
          <StarWarsPanel title="// TOKEN SWAP" className="mt-8">
            <motion.div 
              className="text-center py-12 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Rocket className="w-16 h-16 mx-auto text-sw-yellow" />
              </motion.div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-sw-yellow font-mono tracking-wider">
                  COMING SOON
                </h2>
                <p className="text-sw-blue/80 font-mono text-sm">
                  FX SWAP SERVICE IN DEVELOPMENT
                </p>
              </div>
              
              <div className="bg-sw-space/50 border border-sw-blue/20 rounded-lg p-4 max-w-xs mx-auto">
                <p className="text-sw-blue/60 font-mono text-xs leading-relaxed">
                  Token swaps on Keeta L1 will be available once the FX Resolver is deployed. 
                  Stay tuned for updates!
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <div className="text-center">
                  <div className="text-sw-green font-mono text-lg">KTA</div>
                  <div className="text-sw-blue/40 font-mono text-xs">↔</div>
                  <div className="text-sw-green font-mono text-lg">USDC</div>
                </div>
                <div className="text-center">
                  <div className="text-sw-green font-mono text-lg">KTA</div>
                  <div className="text-sw-blue/40 font-mono text-xs">↔</div>
                  <div className="text-sw-green font-mono text-lg">WETH</div>
                </div>
              </div>
            </motion.div>
          </StarWarsPanel>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sw-space relative overflow-x-hidden overflow-y-auto">
      <StarField />
      <Header />
      
      <main className="relative z-10 pt-20 pb-32 px-4 max-w-md mx-auto">
        <StarWarsPanel title="// TOKEN SWAP" className="mt-4">
          {/* Status indicator */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-sw-blue/60">
                NETWORK: {network === 'main' ? 'MAINNET' : 'TESTNET'}
              </span>
              {isInitialized && (
                <span className={`font-mono text-xs ${fxServiceAvailable ? 'text-sw-green' : 'text-sw-yellow'}`}>
                  {fxServiceAvailable ? '● FX ACTIVE' : '○ FX OFFLINE'}
                </span>
              )}
            </div>
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

          {/* FX Service warning */}
          {isInitialized && !fxServiceAvailable && (
            <div className="mb-4 p-3 border border-sw-yellow/30 bg-sw-yellow/5 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-sw-yellow mt-0.5 flex-shrink-0" />
              <p className="font-mono text-xs text-sw-yellow/80">
                FX resolver not available on {network === 'main' ? 'Mainnet' : 'Testnet'}. Showing estimated rates.
              </p>
            </div>
          )}

          {/* From Token */}
          <div className="relative">
            <div className="border border-sw-blue/30 bg-sw-blue/5 p-4 rounded-t">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-sw-blue/60">FROM</span>
                <span className="font-mono text-xs text-sw-blue/60">
                  BAL: {formatBalance(fromToken?.symbol === "KTA" ? ktaBalance : fromToken?.balance || 0)}
                </span>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowFromTokens(!showFromTokens)}
                    className="flex items-center gap-2 bg-sw-blue/10 border border-sw-blue/40 px-3 py-2 rounded hover:bg-sw-blue/20 transition-colors"
                  >
                    <span className="text-lg">{fromToken?.icon || '🪙'}</span>
                    <span className="font-display font-bold text-sw-white">{fromToken?.symbol || 'Select'}</span>
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
                        {tokens.filter(t => t.symbol !== toToken?.symbol).map(token => (
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
                
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="bg-transparent border-none text-right text-2xl font-display text-sw-white placeholder:text-sw-blue/30 focus-visible:ring-0"
                  />
                  {estimateLoading && (
                    <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue animate-spin" />
                  )}
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
                  BAL: {formatBalance(toToken?.balance || 0)}
                </span>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowToTokens(!showToTokens)}
                    className="flex items-center gap-2 bg-sw-blue/10 border border-sw-blue/40 px-3 py-2 rounded hover:bg-sw-blue/20 transition-colors"
                  >
                    <span className="text-lg">{toToken?.icon || '🪙'}</span>
                    <span className="font-display font-bold text-sw-white">{toToken?.symbol || 'Select'}</span>
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
                        {tokens.filter(t => t.symbol !== fromToken?.symbol).map(token => (
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
                
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    className="bg-transparent border-none text-right text-2xl font-display text-sw-white placeholder:text-sw-blue/30 focus-visible:ring-0"
                  />
                  {estimateLoading && (
                    <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue animate-spin" />
                  )}
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
                    1 {fromToken?.symbol} = {currentRate.toFixed(6)} {toToken?.symbol}
                  </span>
                  <RefreshCw className="w-3 h-3 text-sw-blue/60" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-mono text-xs text-sw-blue/60">MIN RECEIVED</span>
                <span className="font-mono text-sm text-sw-white">
                  {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken?.symbol}
                </span>
              </div>
              {!fxServiceAvailable && (
                <div className="flex justify-between items-center mt-2">
                  <span className="font-mono text-xs text-sw-yellow/60">SOURCE</span>
                  <span className="font-mono text-xs text-sw-yellow/80">ESTIMATED (NO FX)</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Swap button */}
          <Button
            onClick={handleSwap}
            disabled={isSwapping || swapLoading || !fromAmount || parseFloat(fromAmount) <= 0}
            className="w-full mt-6 h-14 text-lg font-display tracking-wider bg-sw-yellow text-sw-space hover:bg-sw-yellow/90 border-2 border-sw-yellow"
          >
            {isSwapping || swapLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {fxServiceAvailable ? 'SWAPPING...' : 'PROCESSING...'}
              </>
            ) : fxServiceAvailable ? (
              "SWAP TOKENS"
            ) : (
              "SWAP (ESTIMATED)"
            )}
          </Button>

          {/* Info notice */}
          <p className="text-center font-mono text-xs text-sw-blue/40 mt-4">
            {fxServiceAvailable 
              ? 'POWERED BY KEETA FX RESOLVER'
              : 'FX RESOLVER INTEGRATION PENDING'
            }
          </p>
        </StarWarsPanel>
      </main>
    </div>
  );
}
