import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useSettings, SUPPORTED_CURRENCIES, FiatCurrency } from "@/contexts/SettingsContext";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Volume2, VolumeX, Check, Globe, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const NETWORKS = [
  { id: 'test' as const, name: 'Testnet', description: 'For testing and development' },
  { id: 'main' as const, name: 'Mainnet', description: 'Live network with real assets' },
];

const Settings = () => {
  const { play } = useSoundEffects();
  const { fiatCurrency, setFiatCurrency, soundEnabled, setSoundEnabled } = useSettings();
  const { network, switchNetwork, isConnected } = useKeetaWallet();

  const handleCurrencyChange = (currency: FiatCurrency) => {
    play('click');
    setFiatCurrency(currency);
    toast.success(`Currency set to ${currency}`);
  };

  const handleSoundToggle = () => {
    play('click');
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? "Sounds disabled" : "Sounds enabled");
  };

  const handleNetworkChange = async (networkId: 'test' | 'main') => {
    if (networkId === network) return;
    
    play('click');
    
    if (networkId === 'main') {
      toast.warning("Switching to Mainnet - real assets!", {
        duration: 3000,
      });
    }
    
    await switchNetwork(networkId);
    toast.success(`Switched to ${networkId === 'main' ? 'Mainnet' : 'Testnet'}`);
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sw-materialize">
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // PREFERENCES
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              SETTINGS
            </h2>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            {/* Network Settings */}
            <StarWarsPanel title="NETWORK" className="sw-materialize">
              <div className="space-y-2">
                <p className="font-mono text-xs text-sw-blue/50 mb-4">
                  Select the Keeta network to connect to
                </p>
                
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => handleNetworkChange(net.id)}
                    className={`w-full flex items-center gap-3 p-3 border rounded transition-all ${
                      network === net.id
                        ? net.id === 'main' 
                          ? 'bg-sw-orange/20 border-sw-orange'
                          : 'bg-sw-green/20 border-sw-green'
                        : 'bg-sw-blue/5 border-sw-blue/20 hover:bg-sw-blue/10 hover:border-sw-blue/40'
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center border rounded ${
                      network === net.id
                        ? net.id === 'main'
                          ? 'border-sw-orange bg-sw-orange/20'
                          : 'border-sw-green bg-sw-green/20'
                        : 'border-sw-blue/30 bg-sw-blue/10'
                    }`}>
                      {net.id === 'main' ? (
                        <AlertTriangle className={`w-5 h-5 ${network === net.id ? 'text-sw-orange' : 'text-sw-blue/70'}`} />
                      ) : (
                        <Globe className={`w-5 h-5 ${network === net.id ? 'text-sw-green' : 'text-sw-blue/70'}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className={`font-display text-sm tracking-wider ${
                        network === net.id 
                          ? net.id === 'main' ? 'text-sw-orange' : 'text-sw-green'
                          : 'text-foreground'
                      }`}>
                        {net.name.toUpperCase()}
                      </h3>
                      <p className="font-mono text-[10px] text-foreground/50">
                        {net.description}
                      </p>
                    </div>

                    {network === net.id && (
                      <Check className={`w-5 h-5 ${net.id === 'main' ? 'text-sw-orange' : 'text-sw-green'}`} />
                    )}
                  </button>
                ))}
                
                {!isConnected && (
                  <p className="font-mono text-[10px] text-sw-yellow/70 mt-2">
                    Connect wallet to switch networks
                  </p>
                )}
              </div>
            </StarWarsPanel>

            {/* Currency Settings */}
            <StarWarsPanel title="DISPLAY CURRENCY" className="sw-materialize">
              <div className="space-y-2">
                <p className="font-mono text-xs text-sw-blue/50 mb-4">
                  Select your preferred currency for value display
                </p>
                
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    className={`w-full flex items-center gap-3 p-3 border rounded transition-all ${
                      fiatCurrency === currency.code
                        ? 'bg-sw-yellow/20 border-sw-yellow'
                        : 'bg-sw-blue/5 border-sw-blue/20 hover:bg-sw-blue/10 hover:border-sw-blue/40'
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center border rounded ${
                      fiatCurrency === currency.code
                        ? 'border-sw-yellow bg-sw-yellow/20'
                        : 'border-sw-blue/30 bg-sw-blue/10'
                    }`}>
                      <span className={`font-mono text-lg ${
                        fiatCurrency === currency.code ? 'text-sw-yellow' : 'text-sw-blue/70'
                      }`}>
                        {currency.symbol}
                      </span>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className={`font-display text-sm tracking-wider ${
                        fiatCurrency === currency.code ? 'text-sw-yellow' : 'text-foreground'
                      }`}>
                        {currency.code}
                      </h3>
                      <p className="font-mono text-[10px] text-foreground/50">
                        {currency.name}
                      </p>
                    </div>

                    {fiatCurrency === currency.code && (
                      <Check className="w-5 h-5 text-sw-yellow" />
                    )}
                  </button>
                ))}
              </div>
            </StarWarsPanel>

            {/* Sound Settings */}
            <StarWarsPanel title="AUDIO" className="sw-materialize">
              <button
                onClick={handleSoundToggle}
                className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-all"
              >
                <div className={`w-10 h-10 flex items-center justify-center border rounded ${
                  soundEnabled
                    ? 'border-sw-green bg-sw-green/20'
                    : 'border-sw-red/50 bg-sw-red/10'
                }`}>
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-sw-green" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-sw-red/70" />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="font-display text-sm tracking-wider text-foreground">
                    SOUND EFFECTS
                  </h3>
                  <p className="font-mono text-[10px] text-foreground/50">
                    {soundEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>

                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  soundEnabled ? 'bg-sw-green/30' : 'bg-sw-red/20'
                }`}>
                  <div className={`w-4 h-4 rounded-full transition-all ${
                    soundEnabled 
                      ? 'bg-sw-green translate-x-6 shadow-[0_0_10px_hsl(var(--sw-green))]' 
                      : 'bg-sw-red/60 translate-x-0'
                  }`} />
                </div>
              </button>
            </StarWarsPanel>

            {/* App Info */}
            <StarWarsPanel title="ABOUT" className="sw-materialize">
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-sw-blue/60">VERSION</span>
                  <span className="text-foreground">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sw-blue/60">NETWORK</span>
                  <span className={network === 'main' ? 'text-sw-orange' : 'text-sw-green'}>
                    KEETA {network === 'main' ? 'MAINNET' : 'TESTNET'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sw-blue/60">BUILD</span>
                  <span className="text-foreground/70">STAR WARS EDITION</span>
                </div>
              </div>
            </StarWarsPanel>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
