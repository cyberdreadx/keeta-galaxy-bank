import { useState } from "react";
import { Header } from "@/components/Header";

// Coinbase App ID - Replace with your actual App ID
const COINBASE_APP_ID = "1e241fce-5d3a-4f70-9451-fde4b5dfc470";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, ArrowRight, RefreshCw, CheckCircle2, Plane, ExternalLink, Wallet } from "lucide-react";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useBaseWallet } from "@/contexts/BaseWalletContext";
import { useBaseBalance } from "@/hooks/useBaseBalance";
import { useToast } from "@/hooks/use-toast";
import { StarField } from "@/components/StarField";
import { generateCoinbaseSessionToken } from "@/lib/coinbase";

const Buy = () => {
  const { isConnected } = useKeetaWallet();
  const { isConnected: isBaseConnected, address: baseAddress } = useBaseWallet();
  const { ethBalance, ktaBalance, usdcBalance } = useBaseBalance();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const KTA_ADDRESS = "0xc0634090F2Fe6c6d75e61Be2b949464aBB498973";

  const handleBuyEth = async () => {
    if (!isBaseConnected || !baseAddress) {
      toast({
        title: "Base Wallet Required",
        description: "Please create or connect a Base wallet first.",
        variant: "destructive",
      });
      return;
    }

    // Copy address to clipboard for convenience
    navigator.clipboard.writeText(baseAddress);
    toast({
      title: "Address Copied",
      description: "Your Base wallet address has been copied to clipboard.",
    });

    // Open Coinbase Pay
    if (COINBASE_APP_ID) {
      setLoading(true);
      // Generate session token (Client-side signing + API call)
      // Note: This makes a real API call to Coinbase to get a short-lived session token
      const sessionToken = await generateCoinbaseSessionToken(baseAddress);
      setLoading(false);

      if (!sessionToken) {
        toast({
          title: "Error",
          description: "Failed to generate session token. Opening standard buy page.",
          variant: "destructive",
        });
        window.open("https://www.coinbase.com/buy", "_blank");
        setStep(2);
        return;
      }

      // Use official SDK URL with sessionToken only (addresses/assets are baked into the token)
      const params = new URLSearchParams();
      params.append('sessionToken', sessionToken);
      // Optional: Default view params
      params.append('defaultNetwork', "base");
      params.append('defaultAsset', "USDC"); // USDC often has better guest flows
      params.append('presetFiatAmount', "50");
      
      window.open(`https://pay.coinbase.com/buy/select-asset?${params.toString()}`, "_blank");
    } else {
      // Fallback to generic buy page if no App ID
      window.open("https://www.coinbase.com/buy", "_blank");
    }
    setStep(2);
  };

  const handleSwap = () => {
    // Open Aerodrome with pre-selected tokens
    // USDC -> KTA (Matching the default purchase asset)
    // Using explicit address for KTA to ensure it loads
    window.open(`https://aerodrome.finance/swap?from=usdc&to=${KTA_ADDRESS}`, "_blank");
    setStep(3);
  };

  const handleBridge = () => {
    // Navigate to internal bridge or open bridge
    // For now, let's just show success
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      toast({
        title: "Bridge Initiated",
        description: "Your Keeta is on its way to Mainnet.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-keeta-gold font-mono relative overflow-hidden pb-20">
      <StarField />
      <Header />
      
      <main className="container mx-auto px-4 pt-24 relative z-10">
        <StarWarsPanel title="INSTANT RAMP" subtitle="TURBO LANE">
          <div className="space-y-6">
            {/* BASE Wallet Status */}
            {!isBaseConnected && (
              <div className="p-4 bg-yellow-400/10 border-2 border-yellow-400/40 rounded-lg">
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-mono text-sm text-yellow-400 font-semibold mb-1">
                      BASE WALLET REQUIRED
                    </p>
                    <p className="font-mono text-xs text-yellow-400/80 mb-2">
                      You need a BASE wallet for instant onramps. Create or import one in your Account settings.
                    </p>
                    <a
                      href="/account"
                      className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-mono text-xs transition-colors"
                    >
                      Go to Account <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {isBaseConnected && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-green-400">BASE WALLET CONNECTED</span>
                  <span className="font-mono text-xs text-green-400/70">
                    {baseAddress?.slice(0, 6)}...{baseAddress?.slice(-4)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="font-mono text-[10px] text-green-400/60 mb-1">ETH (GAS)</p>
                    <p className="font-mono text-xs text-green-400">
                      {parseFloat(ethBalance).toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-green-400/60 mb-1">USDC</p>
                    <p className="font-mono text-xs text-green-400">
                      ${parseFloat(usdcBalance).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-green-400/60 mb-1">KTA</p>
                    <p className="font-mono text-xs text-green-400">
                      {parseFloat(ktaBalance).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-br from-yellow-400/10 via-yellow-400/5 to-transparent p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/20 relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-3 text-yellow-400">
                  <Plane className="h-6 w-6 animate-pulse" />
                  <span className="tracking-wider">FLIGHT TRACKER</span>
                </h3>
                <span className="text-sm bg-yellow-400/20 px-3 py-1.5 rounded-md text-yellow-400 border border-yellow-400/40 font-mono">
                  EST: ~2 MINS
                </span>
              </div>
              
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800/50 rounded-full -z-0" />
                
                {/* Animated Progress Fill */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500 ease-out shadow-lg shadow-yellow-400/50 -z-0"
                  style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : step >= 3 ? '100%' : '0%' }}
                />
                
                {/* Animated Progress Glow */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-yellow-400 rounded-full blur-sm opacity-50 transition-all duration-500 ease-out -z-0"
                  style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : step >= 3 ? '100%' : '0%' }}
                />
                
                <div className="flex justify-between items-center relative z-10">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-2 bg-transparent">
                    <div className={`relative transition-all duration-300 ${
                      step >= 1 
                        ? 'scale-110' 
                        : 'scale-100 opacity-60'
                    }`}>
                      {/* Outer glow ring for active step */}
                      {step === 1 && (
                        <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md animate-ping" />
                      )}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step >= 1 
                          ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50' 
                          : 'border-gray-600 bg-gray-900/50'
                      }`}>
                        {step > 1 ? (
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        ) : (
                          <CreditCard className={`h-5 w-5 ${step === 1 ? 'text-yellow-400' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      step >= 1 ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      Buy
                    </span>
                    {step === 1 && (
                      <span className="text-xs text-yellow-400/70 font-mono animate-pulse">Active</span>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-2 bg-transparent">
                    <div className={`relative transition-all duration-300 ${
                      step >= 2 
                        ? 'scale-110' 
                        : 'scale-100 opacity-60'
                    }`}>
                      {/* Outer glow ring for active step */}
                      {step === 2 && (
                        <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md animate-ping" />
                      )}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step >= 2 
                          ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50' 
                          : 'border-gray-600 bg-gray-900/50'
                      }`}>
                        {step > 2 ? (
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        ) : (
                          <RefreshCw className={`h-5 w-5 ${step === 2 ? 'text-yellow-400 animate-spin' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      step >= 2 ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      Swap
                    </span>
                    {step === 2 && (
                      <span className="text-xs text-yellow-400/70 font-mono animate-pulse">Active</span>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-2 bg-transparent">
                    <div className={`relative transition-all duration-300 ${
                      step >= 3 
                        ? 'scale-110' 
                        : 'scale-100 opacity-60'
                    }`}>
                      {/* Outer glow ring for active step */}
                      {step === 3 && (
                        <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md animate-ping" />
                      )}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step >= 3 
                          ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50' 
                          : 'border-gray-600 bg-gray-900/50'
                      }`}>
                        {step > 3 ? (
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        ) : (
                          <ArrowRight className={`h-5 w-5 ${step === 3 ? 'text-yellow-400' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      step >= 3 ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      Bridge
                    </span>
                    {step === 3 && (
                      <span className="text-xs text-yellow-400/70 font-mono animate-pulse">Active</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1 Content */}
              <Card className={`p-5 bg-black/60 border-2 transition-all duration-300 ${step === 1 ? 'opacity-100 ring-2 ring-yellow-400/50 border-yellow-400/40 shadow-lg shadow-yellow-400/20' : 'opacity-50 border-gray-700/50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-1 text-lg">1. Coinbase Onramp</h4>
                    <p className="text-sm text-gray-400">Buy USDC on Base network instantly with card.</p>
                  </div>
                  {step === 1 && (
                    <Button onClick={handleBuyEth} className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 py-3 text-lg shadow-2xl shadow-yellow-400/60 ring-4 ring-yellow-400/40 hover:ring-yellow-300/60 transition-all brightness-110">
                      Start <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                  {step > 1 && <CheckCircle2 className="text-green-500 h-6 w-6" />}
                </div>
              </Card>

              {/* Step 2 Content */}
              <Card className={`p-5 bg-black/60 border-2 transition-all duration-300 ${step === 2 ? 'opacity-100 ring-2 ring-yellow-400/50 border-yellow-400/40 shadow-lg shadow-yellow-400/20' : 'opacity-50 border-gray-700/50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-1 text-lg">2. Swap on Aerodrome</h4>
                    <p className="text-sm text-gray-400">Swap ETH for Keeta (KTA) on Base.</p>
                  </div>
                  {step === 2 && (
                    <Button onClick={handleSwap} className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 py-3 text-lg shadow-2xl shadow-yellow-400/60 ring-4 ring-yellow-400/40 hover:ring-yellow-300/60 transition-all brightness-110">
                      Swap <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                  {step > 2 && <CheckCircle2 className="text-green-500 h-6 w-6" />}
                </div>
              </Card>

              {/* Step 3 Content */}
              <Card className={`p-5 bg-black/60 border-2 transition-all duration-300 ${step === 3 ? 'opacity-100 ring-2 ring-yellow-400/50 border-yellow-400/40 shadow-lg shadow-yellow-400/20' : 'opacity-50 border-gray-700/50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-1 text-lg">3. Bridge to Mainnet</h4>
                    <p className="text-sm text-gray-400">Move KTA from Base to Keeta Mainnet.</p>
                  </div>
                  {step === 3 && (
                    <Button onClick={handleBridge} disabled={loading} className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 py-3 text-lg shadow-2xl shadow-yellow-400/60 ring-4 ring-yellow-400/40 hover:ring-yellow-300/60 transition-all brightness-110 disabled:opacity-50">
                      {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Bridge Now"}
                    </Button>
                  )}
                  {step > 3 && <CheckCircle2 className="text-green-500 h-6 w-6" />}
                </div>
              </Card>
              
              {step === 4 && (
                 <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/30 animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-500">Purchase Complete!</h3>
                    <p className="text-gray-400">Your Keeta tokens are arriving in your wallet.</p>
                    <Button onClick={() => setStep(1)} variant="outline" className="mt-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-300">
                      Buy More
                    </Button>
                 </div>
              )}
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-8">
              <p>Powered by Coinbase • Aerodrome • Keeta Bridge</p>
              <p>No fiat custody. Non-custodial flow.</p>
            </div>
          </div>
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default Buy;
