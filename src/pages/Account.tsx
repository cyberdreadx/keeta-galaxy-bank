import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet, AccountType } from "@/contexts/KeetaWalletContext";
import { Copy, LogOut, Settings, Shield, Plus, Wallet, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Account = () => {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { 
    publicKey, 
    isConnected, 
    disconnect,
    activeAccountType,
    checkingAccount,
    savingsAccount,
    createSavingsAccount,
    switchAccount,
  } = useKeetaWallet();

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    play('click');
    toast.success("Address copied to clipboard");
  };

  const handleDisconnect = () => {
    play('click');
    disconnect();
    toast.success("Wallet disconnected");
  };

  const handleCreateSavings = async () => {
    play('click');
    await createSavingsAccount();
    toast.success("Savings account created");
  };

  const handleSwitchAccount = (type: AccountType) => {
    if (type === activeAccountType) return;
    play('navigate');
    switchAccount(type);
    toast.success(`Switched to ${type} account`);
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // ACCOUNT
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              PROFILE
            </h2>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            {/* Account Selector */}
            {isConnected && (
              <StarWarsPanel title="ACCOUNTS" className="animate-slide-up">
                <div className="space-y-3">
                  {/* Checking Account */}
                  <button
                    onClick={() => handleSwitchAccount('checking')}
                    className={`w-full flex items-center gap-4 p-4 border rounded transition-all ${
                      activeAccountType === 'checking'
                        ? 'bg-sw-blue/20 border-sw-blue'
                        : 'bg-sw-blue/5 border-sw-blue/20 hover:bg-sw-blue/10'
                    }`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center border ${
                      activeAccountType === 'checking' ? 'border-sw-blue bg-sw-blue/20' : 'border-sw-blue/40 bg-sw-blue/10'
                    }`}>
                      <Wallet className={`w-6 h-6 ${activeAccountType === 'checking' ? 'text-sw-blue' : 'text-sw-blue/60'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-display text-sm tracking-wider ${
                          activeAccountType === 'checking' ? 'text-sw-blue' : 'text-sw-blue/80'
                        }`}>
                          CHECKING
                        </h3>
                        {activeAccountType === 'checking' && (
                          <span className="font-mono text-[10px] text-sw-green bg-sw-green/20 px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      {checkingAccount && (
                        <p className="font-mono text-[10px] text-sw-blue/50 truncate max-w-[200px] mt-1">
                          {checkingAccount.publicKey}
                        </p>
                      )}
                    </div>
                    {checkingAccount && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(checkingAccount.publicKey);
                        }}
                        className="p-2 hover:bg-sw-blue/20 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-sw-blue/60 hover:text-sw-yellow" />
                      </button>
                    )}
                  </button>

                  {/* Savings Account */}
                  {savingsAccount ? (
                    <button
                      onClick={() => handleSwitchAccount('savings')}
                      className={`w-full flex items-center gap-4 p-4 border rounded transition-all ${
                        activeAccountType === 'savings'
                          ? 'bg-sw-yellow/20 border-sw-yellow'
                          : 'bg-sw-yellow/5 border-sw-yellow/20 hover:bg-sw-yellow/10'
                      }`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center border ${
                        activeAccountType === 'savings' ? 'border-sw-yellow bg-sw-yellow/20' : 'border-sw-yellow/40 bg-sw-yellow/10'
                      }`}>
                        <PiggyBank className={`w-6 h-6 ${activeAccountType === 'savings' ? 'text-sw-yellow' : 'text-sw-yellow/60'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-display text-sm tracking-wider ${
                            activeAccountType === 'savings' ? 'text-sw-yellow' : 'text-sw-yellow/80'
                          }`}>
                            SAVINGS
                          </h3>
                          {activeAccountType === 'savings' && (
                            <span className="font-mono text-[10px] text-sw-green bg-sw-green/20 px-2 py-0.5 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-sw-yellow/50 truncate max-w-[200px] mt-1">
                          {savingsAccount.publicKey}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(savingsAccount.publicKey);
                        }}
                        className="p-2 hover:bg-sw-yellow/20 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-sw-yellow/60 hover:text-sw-blue" />
                      </button>
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateSavings}
                      className="w-full flex items-center gap-4 p-4 border border-dashed border-sw-yellow/30 rounded hover:border-sw-yellow/60 hover:bg-sw-yellow/5 transition-all group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center border border-dashed border-sw-yellow/30 group-hover:border-sw-yellow/60">
                        <Plus className="w-6 h-6 text-sw-yellow/40 group-hover:text-sw-yellow" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-display text-sm tracking-wider text-sw-yellow/60 group-hover:text-sw-yellow">
                          CREATE SAVINGS
                        </h3>
                        <p className="font-mono text-[10px] text-sw-yellow/40 mt-1">
                          Generate a new savings address
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </StarWarsPanel>
            )}

            <StarWarsPanel title="WALLET STATUS" className="animate-slide-up [animation-delay:100ms]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-sw-blue/60">STATUS</span>
                  <span className={`font-mono text-sm ${isConnected ? 'text-sw-green' : 'text-sw-red'}`}>
                    {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
                  </span>
                </div>
                
                {isConnected && publicKey && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-sw-blue/60">ACTIVE ACCOUNT</span>
                      <span className={`font-mono text-sm ${
                        activeAccountType === 'checking' ? 'text-sw-blue' : 'text-sw-yellow'
                      }`}>
                        {activeAccountType.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => copyAddress(publicKey)}
                      className="w-full flex items-center justify-between p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                    >
                      <span className="font-mono text-xs text-sw-blue truncate max-w-[250px]">
                        {publicKey}
                      </span>
                      <Copy className="w-4 h-4 text-sw-blue/60 group-hover:text-sw-yellow transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            </StarWarsPanel>

            <StarWarsPanel title="ACTIONS" className="animate-slide-up [animation-delay:200ms]">
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group">
                  <Settings className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-blue transition-colors" />
                  <span className="font-mono text-sm text-sw-blue/80 group-hover:text-sw-blue transition-colors">SETTINGS</span>
                </button>
                
                <button 
                  onClick={() => navigate("/security")}
                  className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                >
                  <Shield className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-blue transition-colors" />
                  <span className="font-mono text-sm text-sw-blue/80 group-hover:text-sw-blue transition-colors">SECURITY</span>
                </button>

                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 p-3 bg-sw-red/5 border border-sw-red/20 rounded hover:bg-sw-red/10 transition-colors group"
                  >
                    <LogOut className="w-5 h-5 text-sw-red/60 group-hover:text-sw-red transition-colors" />
                    <span className="font-mono text-sm text-sw-red/80 group-hover:text-sw-red transition-colors">DISCONNECT WALLET</span>
                  </button>
                )}
              </div>
            </StarWarsPanel>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Account;
