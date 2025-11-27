import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types for Keeta SDK (will be populated when SDK loads)
interface KeetaAccount {
  publicKeyString: { toString: () => string };
}

interface KeetaUserClient {
  chain: () => Promise<any>;
  account: () => Promise<any>;
}

interface KeetaWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  seed: string | null;
  network: 'test' | 'main';
  client: KeetaUserClient | null;
  error: string | null;
}

interface KeetaWalletContextType extends KeetaWalletState {
  generateNewWallet: () => Promise<void>;
  importWallet: (seed: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'test' | 'main') => Promise<void>;
}

const KeetaWalletContext = createContext<KeetaWalletContextType | null>(null);

const STORAGE_KEY = 'keeta_wallet_seed';
const NETWORK_KEY = 'keeta_network';

export const KeetaWalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<KeetaWalletState>({
    isConnected: false,
    isConnecting: false,
    publicKey: null,
    seed: null,
    network: 'test',
    client: null,
    error: null,
  });

  const [KeetaNet, setKeetaNet] = useState<any>(null);

  // Load SDK
  useEffect(() => {
    const loadSDK = async () => {
      try {
        const sdk = await import('@keetanetwork/keetanet-client');
        setKeetaNet(sdk);
      } catch (err) {
        console.error('Failed to load KeetaNet SDK:', err);
        setState(prev => ({ ...prev, error: 'Failed to load KeetaNet SDK' }));
      }
    };
    loadSDK();
  }, []);

  // Auto-connect from stored seed
  useEffect(() => {
    if (!KeetaNet) return;
    
    const storedSeed = localStorage.getItem(STORAGE_KEY);
    const storedNetwork = localStorage.getItem(NETWORK_KEY) as 'test' | 'main' || 'test';
    
    if (storedSeed) {
      connectWithSeed(storedSeed, storedNetwork);
    }
  }, [KeetaNet]);

  const connectWithSeed = async (seed: string, network: 'test' | 'main') => {
    if (!KeetaNet) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const account = KeetaNet.lib.Account.fromSeed(seed, 0);
      const client = KeetaNet.UserClient.fromNetwork(network, account);
      const publicKey = account.publicKeyString.toString();

      // Store seed securely (in production, use encryption)
      localStorage.setItem(STORAGE_KEY, seed);
      localStorage.setItem(NETWORK_KEY, network);

      setState({
        isConnected: true,
        isConnecting: false,
        publicKey,
        seed,
        network,
        client,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect wallet',
      }));
    }
  };

  const generateNewWallet = useCallback(async () => {
    if (!KeetaNet) {
      setState(prev => ({ ...prev, error: 'SDK not loaded' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const seed = KeetaNet.lib.Account.generateRandomSeed({ asString: true });
      await connectWithSeed(seed, state.network);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to generate wallet',
      }));
    }
  }, [KeetaNet, state.network]);

  const importWallet = useCallback(async (seedInput: string) => {
    if (!KeetaNet) {
      setState(prev => ({ ...prev, error: 'SDK not loaded' }));
      return;
    }

    if (!seedInput.trim()) {
      setState(prev => ({ ...prev, error: 'Seed cannot be empty' }));
      return;
    }

    const trimmed = seedInput.trim();
    let finalSeed = trimmed;

    // Check if it's a passphrase/mnemonic (multiple words)
    const words = trimmed.split(/\s+/);
    if (words.length >= 12) {
      // Use Keeta SDK's seedFromPassphrase for mnemonic conversion
      try {
        const seedResult = KeetaNet.lib.Account.seedFromPassphrase(trimmed);
        // Handle different return types - could be string, buffer, or object with toString
        if (typeof seedResult === 'string') {
          finalSeed = seedResult;
        } else if (seedResult instanceof Uint8Array || Buffer.isBuffer(seedResult)) {
          finalSeed = Buffer.from(seedResult).toString('hex').toUpperCase();
        } else if (seedResult && typeof seedResult.toString === 'function') {
          finalSeed = seedResult.toString();
        } else {
          throw new Error('Unexpected seed format');
        }
      } catch (err: any) {
        console.error('seedFromPassphrase error:', err);
        setState(prev => ({ ...prev, error: err.message || 'Invalid passphrase. Please check your words.' }));
        return;
      }
    }

    await connectWithSeed(finalSeed, state.network);
  }, [KeetaNet, state.network]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isConnected: false,
      isConnecting: false,
      publicKey: null,
      seed: null,
      network: state.network,
      client: null,
      error: null,
    });
  }, [state.network]);

  const switchNetwork = useCallback(async (network: 'test' | 'main') => {
    if (state.seed) {
      await connectWithSeed(state.seed, network);
    } else {
      setState(prev => ({ ...prev, network }));
      localStorage.setItem(NETWORK_KEY, network);
    }
  }, [state.seed, KeetaNet]);

  return (
    <KeetaWalletContext.Provider
      value={{
        ...state,
        generateNewWallet,
        importWallet,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </KeetaWalletContext.Provider>
  );
};

export const useKeetaWallet = () => {
  const context = useContext(KeetaWalletContext);
  if (!context) {
    throw new Error('useKeetaWallet must be used within KeetaWalletProvider');
  }
  return context;
};
