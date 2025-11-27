import { useState } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';
import { StarWarsPanel } from './StarWarsPanel';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Wallet, Key, Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface WalletConnectProps {
  onClose?: () => void;
}

export const WalletConnect = ({ onClose }: WalletConnectProps) => {
  const {
    isConnected,
    isConnecting,
    publicKey,
    seed,
    network,
    error,
    generateNewWallet,
    importWallet,
    disconnect,
    switchNetwork,
  } = useKeetaWallet();
  const { play } = useSoundEffects();

  const [mode, setMode] = useState<'select' | 'import'>('select');
  const [importSeed, setImportSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState<'seed' | 'address' | null>(null);

  const handleCopy = async (text: string, type: 'seed' | 'address') => {
    play('click');
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type === 'seed' ? 'Seed' : 'Address'} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    play('click');
    await generateNewWallet();
    play('connect');
  };

  const handleImport = async () => {
    play('click');
    await importWallet(importSeed);
    if (!error) {
      play('connect');
      setImportSeed('');
      setMode('select');
    } else {
      play('error');
    }
  };

  const handleDisconnect = () => {
    play('disconnect');
    disconnect();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (isConnected && publicKey) {
    return (
      <StarWarsPanel title="WALLET STATUS" className="w-full max-w-md">
        <div className="space-y-4">
          {/* Network Indicator */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-sw-blue/60 tracking-wider">NETWORK</span>
            <div className="flex gap-2">
              <button
                onClick={() => switchNetwork('test')}
                className={cn(
                  "px-3 py-1 font-mono text-xs tracking-wider transition-all",
                  network === 'test'
                    ? "bg-sw-yellow/20 text-sw-yellow border border-sw-yellow/40"
                    : "bg-sw-blue/10 text-sw-blue/60 border border-sw-blue/20 hover:border-sw-blue/40"
                )}
              >
                TESTNET
              </button>
              <button
                onClick={() => switchNetwork('main')}
                className={cn(
                  "px-3 py-1 font-mono text-xs tracking-wider transition-all",
                  network === 'main'
                    ? "bg-sw-green/20 text-sw-green border border-sw-green/40"
                    : "bg-sw-blue/10 text-sw-blue/60 border border-sw-blue/20 hover:border-sw-blue/40"
                )}
              >
                MAINNET
              </button>
            </div>
          </div>

          {/* Public Address */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-sw-blue/60 tracking-wider">PUBLIC ADDRESS</span>
            <div className="flex items-center gap-2 p-3 bg-sw-dark/50 border border-sw-blue/20">
              <code className="font-mono text-sm text-sw-blue flex-1 truncate">
                {truncateAddress(publicKey)}
              </code>
              <button
                onClick={() => handleCopy(publicKey, 'address')}
                className="p-1 hover:bg-sw-blue/20 transition-colors"
              >
                {copied === 'address' ? (
                  <Check className="w-4 h-4 text-sw-green" />
                ) : (
                  <Copy className="w-4 h-4 text-sw-blue" />
                )}
              </button>
            </div>
          </div>

          {/* Seed Backup */}
          {seed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-sw-orange/80 tracking-wider">
                  ⚠ BACKUP YOUR SEED
                </span>
                <button
                  onClick={() => setShowSeed(!showSeed)}
                  className="p-1 hover:bg-sw-blue/20 transition-colors"
                >
                  {showSeed ? (
                    <EyeOff className="w-4 h-4 text-sw-blue" />
                  ) : (
                    <Eye className="w-4 h-4 text-sw-blue" />
                  )}
                </button>
              </div>
              {showSeed && (
                <div className="flex items-center gap-2 p-3 bg-sw-red/10 border border-sw-red/30">
                  <code className="font-mono text-xs text-sw-yellow flex-1 break-all">
                    {seed}
                  </code>
                  <button
                    onClick={() => handleCopy(seed, 'seed')}
                    className="p-1 hover:bg-sw-red/20 transition-colors"
                  >
                    {copied === 'seed' ? (
                      <Check className="w-4 h-4 text-sw-green" />
                    ) : (
                      <Copy className="w-4 h-4 text-sw-yellow" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Disconnect */}
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full border-sw-red/40 text-sw-red hover:bg-sw-red/10"
          >
            DISCONNECT WALLET
          </Button>
        </div>
      </StarWarsPanel>
    );
  }

  return (
    <StarWarsPanel title="CONNECT WALLET" className="w-full max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-sw-red/10 border border-sw-red/40 font-mono text-xs text-sw-red">
            {error}
          </div>
        )}

        {mode === 'select' ? (
          <>
            {/* Generate New */}
            <button
              onClick={handleGenerate}
              disabled={isConnecting}
              className="w-full p-4 bg-sw-blue/10 border border-sw-blue/30 hover:border-sw-blue/60 hover:bg-sw-blue/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-sw-blue/40 flex items-center justify-center sw-target">
                  {isConnecting ? (
                    <Loader2 className="w-6 h-6 text-sw-blue animate-spin" />
                  ) : (
                    <Wallet className="w-6 h-6 text-sw-blue group-hover:text-sw-yellow transition-colors" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-display text-sm text-sw-blue tracking-wider">
                    CREATE NEW WALLET
                  </p>
                  <p className="font-mono text-xs text-sw-blue/60 mt-1">
                    Generate a fresh Keeta account
                  </p>
                </div>
              </div>
            </button>

            {/* Import Existing */}
            <button
              onClick={() => setMode('import')}
              className="w-full p-4 bg-sw-yellow/5 border border-sw-yellow/20 hover:border-sw-yellow/40 hover:bg-sw-yellow/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-sw-yellow/40 flex items-center justify-center sw-target">
                  <Key className="w-6 h-6 text-sw-yellow group-hover:text-sw-blue transition-colors" />
                </div>
                <div className="text-left">
                  <p className="font-display text-sm text-sw-yellow tracking-wider">
                    IMPORT EXISTING
                  </p>
                  <p className="font-mono text-xs text-sw-yellow/60 mt-1">
                    Restore from seed phrase
                  </p>
                </div>
              </div>
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-xs text-sw-blue/60 tracking-wider">
                ENTER YOUR SEED
              </label>
              <Input
                type="password"
                value={importSeed}
                onChange={(e) => setImportSeed(e.target.value)}
                placeholder="24-word mnemonic or hex seed..."
                className="bg-sw-dark/50 border-sw-blue/30 text-sw-blue font-mono text-sm focus:border-sw-yellow"
              />
              <p className="font-mono text-[10px] text-sw-blue/40">
                Supports 12/24-word mnemonic or 64-char hex seed
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setMode('select')}
                variant="outline"
                className="flex-1 border-sw-blue/40 text-sw-blue"
              >
                BACK
              </Button>
              <Button
                onClick={handleImport}
                disabled={isConnecting || !importSeed.trim()}
                className="flex-1 bg-sw-yellow/20 border border-sw-yellow/40 text-sw-yellow hover:bg-sw-yellow/30"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'IMPORT'
                )}
              </Button>
            </div>
          </div>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-sw-blue/60 hover:text-sw-blue"
          >
            CANCEL
          </Button>
        )}
      </div>
    </StarWarsPanel>
  );
};
