import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types for Keeta SDK (will be populated when SDK loads)
interface KeetaAccount {
  publicKeyString: { toString: () => string };
}

interface KeetaUserClient {
  chain: () => Promise<any>;
  account: () => Promise<any>;
  allBalances: () => Promise<Record<string, any>>;
  baseToken: { publicKeyString: { toString: () => string } };
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

  const connectWithSeed = async (seedOrMnemonic: string, network: 'test' | 'main') => {
    if (!KeetaNet) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { Account } = KeetaNet.lib;
      const { AccountKeyAlgorithm } = Account;
      
      // Always convert through seedFromPassphrase for CLI compatibility
      const seedHex = await Account.seedFromPassphrase(seedOrMnemonic, { asString: true });
      
      // Use secp256k1 algorithm at index 0 for CLI compatibility
      const account = Account.fromSeed(seedHex, 0, AccountKeyAlgorithm.ECDSA_SECP256K1);
      const client = KeetaNet.UserClient.fromNetwork(network, account);
      const publicKey = account.publicKeyString.toString();

      // Store original seed/mnemonic (in production, use encryption)
      localStorage.setItem(STORAGE_KEY, seedOrMnemonic);
      localStorage.setItem(NETWORK_KEY, network);

      setState({
        isConnected: true,
        isConnecting: false,
        publicKey,
        seed: seedOrMnemonic,
        network,
        client,
        error: null,
      });
    } catch (err: any) {
      console.error('connectWithSeed error:', err);
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

    // Pass directly to connectWithSeed - it handles both mnemonic and hex via seedFromPassphrase
    await connectWithSeed(seedInput.trim(), state.network);
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
