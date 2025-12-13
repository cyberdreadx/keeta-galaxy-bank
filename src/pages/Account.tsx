import { useState, useEffect } from "react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet, AccountType } from "@/contexts/KeetaWalletContext";
import { InternalTransferModal } from "@/components/InternalTransferModal";
import { Copy, LogOut, Settings as SettingsIcon, Shield, Plus, Wallet, PiggyBank, ArrowRightLeft, Tag, BookUser, Loader2, ExternalLink, AlertCircle, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useBridge } from "@/hooks/useBridge";
import { useBaseWallet } from "@/contexts/BaseWalletContext";
import { useBaseBalance } from "@/hooks/useBaseBalance";

const Account = () => {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [customAccountName, setCustomAccountName] = useState("");
  const [baseDepositAddress, setBaseDepositAddress] = useState<string | null>(null);
  const [loadingBaseAddress, setLoadingBaseAddress] = useState(false);
  const [showBaseWalletImport, setShowBaseWalletImport] = useState(false);
  const [baseWalletInput, setBaseWalletInput] = useState("");
  const [showBasePrivateKey, setShowBasePrivateKey] = useState(false);
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { getPersistentAddress } = useBridge();
  const { 
    isConnected: isBaseConnected, 
    address: baseAddress,
    privateKey: basePrivateKey,
    isConnecting: isBaseConnecting,
    error: baseError,
    generateNewWallet: generateBaseWallet,
    importWallet: importBaseWallet,
    disconnect: disconnectBaseWallet,
  } = useBaseWallet();
  const { ethBalance, ktaBalance, isLoading: isLoadingBaseBalance, refetch: refetchBaseBalance } = useBaseBalance();
  const { 
    publicKey, 
    isConnected, 
    disconnect,
    activeAccountType,
    checkingAccount,
    savingsAccount,
    customAccounts,
    createSavingsAccount,
    createCustomAccount,
    switchAccount,
    getAllAccounts,
  } = useKeetaWallet();

  // Fetch BASE deposit address when connected
  useEffect(() => {
    const fetchBaseAddress = async () => {
      if (isConnected) {
        setLoadingBaseAddress(true);
        const address = await getPersistentAddress(8453); // Base chain ID
        setBaseDepositAddress(address);
        setLoadingBaseAddress(false);
      }
    };
    fetchBaseAddress();
  }, [isConnected, getPersistentAddress]);

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
    const displayName = type === 'checking' ? 'Checking' : type === 'savings' ? 'Savings' : type;
    toast.success(`Switched to ${displayName} account`);
  };

  const handleCreateCustomAccount = async () => {
    if (!customAccountName.trim()) {
      toast.error("Please enter an account name");
      return;
    }
    play('click');
    await createCustomAccount(customAccountName.trim());
    toast.success(`${customAccountName} account created`);
    setCustomAccountName("");
    setShowCreateCustom(false);
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
            {/* Primary Accounts (Checking & Savings) */}
            {isConnected && (
              <StarWarsPanel title="PRIMARY ACCOUNTS" className="animate-slide-up">
                <div className="space-y-3">
                  {/* Checking Account */}
                  <div
                    onClick={() => handleSwitchAccount('checking')}
                    role="button"
                    tabIndex={0}
                    className={`w-full flex items-center gap-4 p-4 border rounded transition-all cursor-pointer ${
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
                  </div>

                  {/* Savings Account */}
                  {savingsAccount ? (
                    <div
                      onClick={() => handleSwitchAccount('savings')}
                      role="button"
                      tabIndex={0}
                      className={`w-full flex items-center gap-4 p-4 border rounded transition-all cursor-pointer ${
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
                    </div>
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

                  {/* Transfer Button - only show when multiple accounts exist */}
                  {getAllAccounts().length > 1 && (
                    <button
                      onClick={() => {
                        play('click');
                        setTransferModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-sw-orange/10 border border-sw-orange/30 rounded hover:bg-sw-orange/20 transition-colors group mt-4"
                    >
                      <ArrowRightLeft className="w-5 h-5 text-sw-orange/70 group-hover:text-sw-orange" />
                      <span className="font-mono text-sm text-sw-orange/80 group-hover:text-sw-orange">
                        TRANSFER BETWEEN ACCOUNTS
                      </span>
                    </button>
                  )}
                </div>
              </StarWarsPanel>
            )}

            {/* Custom Accounts */}
            {isConnected && (
              <StarWarsPanel title="CUSTOM ACCOUNTS" className="animate-slide-up [animation-delay:50ms]">
                <div className="space-y-3">
                  {customAccounts.length === 0 && !showCreateCustom && (
                    <p className="font-mono text-xs text-sw-green/50 text-center py-2">
                      Create accounts for specific purposes
                    </p>
                  )}

                  {customAccounts.map((account) => (
                    <div
                      key={account.publicKey}
                      onClick={() => handleSwitchAccount(account.name)}
                      role="button"
                      tabIndex={0}
                      className={`w-full flex items-center gap-4 p-4 border rounded transition-all cursor-pointer ${
                        activeAccountType === account.name
                          ? 'bg-sw-green/20 border-sw-green'
                          : 'bg-sw-green/5 border-sw-green/20 hover:bg-sw-green/10'
                      }`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center border ${
                        activeAccountType === account.name ? 'border-sw-green bg-sw-green/20' : 'border-sw-green/40 bg-sw-green/10'
                      }`}>
                        <Tag className={`w-6 h-6 ${activeAccountType === account.name ? 'text-sw-green' : 'text-sw-green/60'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-display text-sm tracking-wider ${
                            activeAccountType === account.name ? 'text-sw-green' : 'text-sw-green/80'
                          }`}>
                            {account.name.toUpperCase()}
                          </h3>
                          {activeAccountType === account.name && (
                            <span className="font-mono text-[10px] text-sw-green bg-sw-green/20 px-2 py-0.5 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-sw-green/50 truncate max-w-[200px] mt-1">
                          {account.publicKey}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(account.publicKey);
                        }}
                        className="p-2 hover:bg-sw-green/20 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-sw-green/60 hover:text-sw-yellow" />
                      </button>
                    </div>
                  ))}

                  {/* Create Custom Account */}
                  {showCreateCustom ? (
                    <div className="p-4 border border-sw-green/30 rounded bg-sw-green/5 space-y-3">
                      <input
                        type="text"
                        value={customAccountName}
                        onChange={(e) => setCustomAccountName(e.target.value)}
                        placeholder="Account name (e.g., Rent, Groceries)"
                        className="w-full p-3 bg-background border border-sw-green/30 rounded font-mono text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-sw-green"
                        maxLength={20}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateCustomAccount}
                          className="flex-1 py-2 bg-sw-green/20 border border-sw-green text-sw-green font-mono text-sm rounded hover:bg-sw-green/30 transition-colors"
                        >
                          CREATE
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateCustom(false);
                            setCustomAccountName("");
                          }}
                          className="flex-1 py-2 bg-sw-red/10 border border-sw-red/30 text-sw-red/70 font-mono text-sm rounded hover:bg-sw-red/20 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        play('click');
                        setShowCreateCustom(true);
                      }}
                      className="w-full flex items-center gap-4 p-4 border border-dashed border-sw-green/30 rounded hover:border-sw-green/60 hover:bg-sw-green/5 transition-all group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center border border-dashed border-sw-green/30 group-hover:border-sw-green/60">
                        <Plus className="w-6 h-6 text-sw-green/40 group-hover:text-sw-green" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-display text-sm tracking-wider text-sw-green/60 group-hover:text-sw-green">
                          CREATE CUSTOM ACCOUNT
                        </h3>
                        <p className="font-mono text-[10px] text-sw-green/40 mt-1">
                          For rent, groceries, bills, etc.
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

            {/* BASE Wallet Information */}
            {isConnected && (
              <StarWarsPanel title="BASE NETWORK" className="animate-slide-up [animation-delay:150ms]">
                <div className="space-y-4">
                  {/* Your BASE Wallet Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-sw-green/60 tracking-wider">YOUR BASE WALLET</span>
                      {isBaseConnected && (
                        <span className="font-mono text-xs text-sw-green">● CONNECTED</span>
                      )}
                    </div>

                    {!isBaseConnected ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-sw-green/5 border border-sw-green/20 rounded">
                          <p className="font-mono text-[10px] text-sw-green/70 mb-3">
                            Create or import a BASE wallet for instant onramps, swaps, and full control of your Base assets.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                play('click');
                                await generateBaseWallet();
                                toast.success("BASE wallet created!");
                              }}
                              disabled={isBaseConnecting}
                              className="flex-1 flex items-center justify-center gap-2 p-2 bg-sw-green/20 border border-sw-green/40 text-sw-green hover:bg-sw-green/30 transition-colors disabled:opacity-50"
                            >
                              {isBaseConnecting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                              <span className="font-mono text-xs">CREATE</span>
                            </button>
                            <button
                              onClick={() => {
                                play('click');
                                setShowBaseWalletImport(!showBaseWalletImport);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 p-2 bg-sw-yellow/20 border border-sw-yellow/40 text-sw-yellow hover:bg-sw-yellow/30 transition-colors"
                            >
                              <Key className="w-4 h-4" />
                              <span className="font-mono text-xs">IMPORT</span>
                            </button>
                          </div>

                          {showBaseWalletImport && (
                            <div className="mt-3 space-y-2">
                              <input
                                type={showBasePrivateKey ? "text" : "password"}
                                value={baseWalletInput}
                                onChange={(e) => setBaseWalletInput(e.target.value)}
                                placeholder="Private key or mnemonic..."
                                className="w-full p-2 bg-sw-dark/50 border border-sw-green/30 text-sw-green font-mono text-xs focus:outline-none focus:border-sw-green rounded"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowBasePrivateKey(!showBasePrivateKey)}
                                  className="p-1 hover:bg-sw-green/20 transition-colors"
                                >
                                  {showBasePrivateKey ? (
                                    <EyeOff className="w-3 h-3 text-sw-green/60" />
                                  ) : (
                                    <Eye className="w-3 h-3 text-sw-green/60" />
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!baseWalletInput.trim()) {
                                      toast.error("Please enter a private key or mnemonic");
                                      return;
                                    }
                                    play('click');
                                    await importBaseWallet(baseWalletInput);
                                    setBaseWalletInput("");
                                    setShowBaseWalletImport(false);
                                    toast.success("BASE wallet imported!");
                                  }}
                                  disabled={isBaseConnecting || !baseWalletInput.trim()}
                                  className="flex-1 p-2 bg-sw-green/20 border border-sw-green/40 text-sw-green hover:bg-sw-green/30 transition-colors disabled:opacity-50 font-mono text-xs"
                                >
                                  {isBaseConnecting ? "IMPORTING..." : "IMPORT"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* BASE Wallet Address */}
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-sw-green/60">ADDRESS</span>
                          <button
                            onClick={() => copyAddress(baseAddress || '')}
                            className="w-full flex items-center justify-between p-3 bg-sw-green/5 border border-sw-green/20 rounded hover:bg-sw-green/10 transition-colors group"
                          >
                            <span className="font-mono text-xs text-sw-green truncate max-w-[200px]">
                              {baseAddress}
                            </span>
                            <Copy className="w-4 h-4 text-sw-green/60 group-hover:text-sw-yellow transition-colors" />
                          </button>
                        </div>

                        {/* BASE Balances */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-sw-green/5 border border-sw-green/20 rounded">
                            <p className="font-mono text-[10px] text-sw-green/60 mb-1">ETH BALANCE</p>
                            <p className="font-mono text-sm text-sw-green">
                              {isLoadingBaseBalance ? "..." : parseFloat(ethBalance).toFixed(4)}
                            </p>
                          </div>
                          <div className="p-3 bg-sw-green/5 border border-sw-green/20 rounded">
                            <p className="font-mono text-[10px] text-sw-green/60 mb-1">KTA BALANCE</p>
                            <p className="font-mono text-sm text-sw-green">
                              {isLoadingBaseBalance ? "..." : parseFloat(ktaBalance).toFixed(4)}
                            </p>
                          </div>
                        </div>

                        {/* Backup Key */}
                        {basePrivateKey && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-sw-yellow/60">PRIVATE KEY (BACKUP REQUIRED)</span>
                              <button
                                onClick={() => setShowBasePrivateKey(!showBasePrivateKey)}
                                className="text-[10px] text-sw-yellow hover:underline"
                              >
                                {showBasePrivateKey ? "HIDE" : "SHOW"}
                              </button>
                            </div>
                            {showBasePrivateKey && (
                              <button
                                onClick={() => copyAddress(basePrivateKey)}
                                className="w-full flex items-center justify-between p-3 bg-sw-yellow/5 border border-sw-yellow/20 rounded hover:bg-sw-yellow/10 transition-colors group"
                              >
                                <span className="font-mono text-xs text-sw-yellow truncate max-w-[200px] blur-[2px] hover:blur-none transition-all">
                                  {basePrivateKey}
                                </span>
                                <Copy className="w-4 h-4 text-sw-yellow/60 group-hover:text-sw-yellow transition-colors" />
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={async () => {
                            play('click');
                            disconnectBaseWallet();
                            toast.success("BASE wallet disconnected");
                          }}
                          className="w-full p-2 bg-sw-red/5 border border-sw-red/20 text-sw-red hover:bg-sw-red/10 transition-colors font-mono text-xs"
                        >
                          DISCONNECT BASE WALLET
                        </button>
                      </div>
                    )}

                    {baseError && (
                      <div className="p-2 bg-sw-red/10 border border-sw-red/30 rounded">
                        <p className="font-mono text-xs text-sw-red">{baseError}</p>
                      </div>
                    )}
                  </div>

                  {/* Bridge Deposit Address Section */}
                  <div className="pt-3 border-t border-sw-green/20 space-y-2">
                    <div className="p-2 bg-sw-blue/10 border border-sw-blue/30 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-sw-blue mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-mono text-[10px] text-sw-blue/90 font-semibold mb-1">
                            Bridge Deposit Address (Different from Your Wallet)
                          </p>
                          <p className="font-mono text-[10px] text-sw-blue/70 leading-relaxed">
                            This is a <strong>one-way forwarding address</strong> for Base → Keeta L1 transfers only. 
                            You cannot control this address.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-sw-blue/60">BRIDGE DEPOSIT ADDRESS</span>
                      {loadingBaseAddress ? (
                        <div className="p-2 bg-sw-blue/5 border border-sw-blue/20 rounded flex items-center justify-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin text-sw-blue" />
                          <span className="font-mono text-[10px] text-sw-blue/70">Loading...</span>
                        </div>
                      ) : baseDepositAddress ? (
                        <button
                          onClick={() => copyAddress(baseDepositAddress)}
                          className="w-full flex items-center justify-between p-2 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                        >
                          <span className="font-mono text-[10px] text-sw-blue truncate max-w-[180px]">
                            {baseDepositAddress}
                          </span>
                          <Copy className="w-3 h-3 text-sw-blue/60 group-hover:text-sw-yellow transition-colors" />
                        </button>
                      ) : (
                        <div className="p-2 bg-sw-yellow/10 border border-sw-yellow/30 rounded">
                          <p className="font-mono text-[10px] text-sw-yellow/80 text-center">
                            Visit Bridge page to generate
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </StarWarsPanel>
            )}

            <StarWarsPanel title="ACTIONS" className="animate-slide-up [animation-delay:200ms]">
              <div className="space-y-3">
                <button 
                  onClick={() => navigate("/address-book")}
                  className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                >
                  <BookUser className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-blue transition-colors" />
                  <span className="font-mono text-sm text-sw-blue/80 group-hover:text-sw-blue transition-colors">ADDRESS BOOK</span>
                </button>

                <button 
                  onClick={() => navigate("/settings")}
                  className="w-full flex items-center gap-3 p-3 bg-sw-blue/5 border border-sw-blue/20 rounded hover:bg-sw-blue/10 transition-colors group"
                >
                  <SettingsIcon className="w-5 h-5 text-sw-blue/60 group-hover:text-sw-blue transition-colors" />
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

      <Footer />
      
      
      <InternalTransferModal 
        open={transferModalOpen} 
        onOpenChange={setTransferModalOpen} 
      />
    </div>
  );
};

export default Account;
