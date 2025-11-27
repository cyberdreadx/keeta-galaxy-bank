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
  send: (to: string, amount: bigint) => Promise<any>;
}

export type AccountType = 'checking' | 'savings';

interface AccountInfo {
  publicKey: string;
  client: KeetaUserClient;
}

interface KeetaWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  seed: string | null;
  network: 'test' | 'main';
  client: KeetaUserClient | null;
  error: string | null;
  activeAccountType: AccountType;
  checkingAccount: AccountInfo | null;
  savingsAccount: AccountInfo | null;
}

interface KeetaWalletContextType extends KeetaWalletState {
  generateNewWallet: () => Promise<void>;
  importWallet: (seed: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'test' | 'main') => Promise<void>;
  createSavingsAccount: () => Promise<void>;
  switchAccount: (accountType: AccountType) => void;
  transferBetweenAccounts: (from: AccountType, to: AccountType, amount: number) => Promise<void>;
}

const KeetaWalletContext = createContext<KeetaWalletContextType | null>(null);

const STORAGE_KEY = 'keeta_wallet_seed';
const NETWORK_KEY = 'keeta_network';
const SAVINGS_KEY = 'keeta_savings_enabled';
const ACTIVE_ACCOUNT_KEY = 'keeta_active_account';

export const KeetaWalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<KeetaWalletState>({
    isConnected: false,
    isConnecting: false,
    publicKey: null,
    seed: null,
    network: 'test',
    client: null,
    error: null,
    activeAccountType: 'checking',
    checkingAccount: null,
    savingsAccount: null,
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
    const savingsEnabled = localStorage.getItem(SAVINGS_KEY) === 'true';
    const activeAccount = localStorage.getItem(ACTIVE_ACCOUNT_KEY) as AccountType || 'checking';
    
    if (storedSeed) {
      connectWithSeed(storedSeed, storedNetwork, savingsEnabled, activeAccount);
    }
  }, [KeetaNet]);

  const createAccountAtIndex = async (seedHex: string, index: number, network: 'test' | 'main'): Promise<AccountInfo> => {
    const { Account } = KeetaNet.lib;
    const { AccountKeyAlgorithm } = Account;
    
    const account = Account.fromSeed(seedHex, index, AccountKeyAlgorithm.ECDSA_SECP256K1);
    const client = KeetaNet.UserClient.fromNetwork(network, account);
    const publicKey = account.publicKeyString.toString();
    
    return { publicKey, client };
  };

  const connectWithSeed = async (
    seedOrMnemonic: string, 
    network: 'test' | 'main', 
    includeSavings: boolean = false,
    activeAccount: AccountType = 'checking'
  ) => {
    if (!KeetaNet) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { Account } = KeetaNet.lib;
      
      // Always convert through seedFromPassphrase for CLI compatibility
      const seedHex = await Account.seedFromPassphrase(seedOrMnemonic, { asString: true });
      
      // Create checking account at index 0
      const checkingAccount = await createAccountAtIndex(seedHex, 0, network);
      
      // Create savings account at index 1 if enabled
      let savingsAccount: AccountInfo | null = null;
      if (includeSavings) {
        savingsAccount = await createAccountAtIndex(seedHex, 1, network);
      }

      // Determine active account
      const activeAccountInfo = activeAccount === 'savings' && savingsAccount 
        ? savingsAccount 
        : checkingAccount;

      // Store original seed/mnemonic (in production, use encryption)
      localStorage.setItem(STORAGE_KEY, seedOrMnemonic);
      localStorage.setItem(NETWORK_KEY, network);
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, activeAccount);

      setState({
        isConnected: true,
        isConnecting: false,
        publicKey: activeAccountInfo.publicKey,
        seed: seedOrMnemonic,
        network,
        client: activeAccountInfo.client,
        error: null,
        activeAccountType: savingsAccount && activeAccount === 'savings' ? 'savings' : 'checking',
        checkingAccount,
        savingsAccount,
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
      await connectWithSeed(seed, state.network, false, 'checking');
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
    await connectWithSeed(seedInput.trim(), state.network, false, 'checking');
  }, [KeetaNet, state.network]);

  const createSavingsAccount = useCallback(async () => {
    if (!KeetaNet || !state.seed) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    try {
      const { Account } = KeetaNet.lib;
      const seedHex = await Account.seedFromPassphrase(state.seed, { asString: true });
      
      const savingsAccount = await createAccountAtIndex(seedHex, 1, state.network);
      
      localStorage.setItem(SAVINGS_KEY, 'true');
      
      setState(prev => ({
        ...prev,
        savingsAccount,
      }));
    } catch (err: any) {
      console.error('createSavingsAccount error:', err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to create savings account',
      }));
    }
  }, [KeetaNet, state.seed, state.network]);

  const switchAccount = useCallback((accountType: AccountType) => {
    const targetAccount = accountType === 'savings' ? state.savingsAccount : state.checkingAccount;
    
    if (!targetAccount) {
      setState(prev => ({ ...prev, error: `${accountType} account not available` }));
      return;
    }

    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountType);

    setState(prev => ({
      ...prev,
      activeAccountType: accountType,
      publicKey: targetAccount.publicKey,
      client: targetAccount.client,
    }));
  }, [state.checkingAccount, state.savingsAccount]);

  const transferBetweenAccounts = useCallback(async (from: AccountType, to: AccountType, amount: number) => {
    const fromAccount = from === 'checking' ? state.checkingAccount : state.savingsAccount;
    const toAccount = to === 'checking' ? state.checkingAccount : state.savingsAccount;

    if (!fromAccount || !toAccount) {
      throw new Error('Both accounts must exist for transfer');
    }

    // Convert amount to raw value (9 decimals for KTA)
    const rawAmount = BigInt(Math.floor(amount * 1_000_000_000));

    try {
      await fromAccount.client.send(toAccount.publicKey, rawAmount);
    } catch (err: any) {
      console.error('Transfer error:', err);
      throw new Error(err.message || 'Transfer failed');
    }
  }, [state.checkingAccount, state.savingsAccount]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SAVINGS_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    setState({
      isConnected: false,
      isConnecting: false,
      publicKey: null,
      seed: null,
      network: state.network,
      client: null,
      error: null,
      activeAccountType: 'checking',
      checkingAccount: null,
      savingsAccount: null,
    });
  }, [state.network]);

  const switchNetwork = useCallback(async (network: 'test' | 'main') => {
    if (state.seed) {
      const savingsEnabled = state.savingsAccount !== null;
      await connectWithSeed(state.seed, network, savingsEnabled, state.activeAccountType);
    } else {
      setState(prev => ({ ...prev, network }));
      localStorage.setItem(NETWORK_KEY, network);
    }
  }, [state.seed, state.savingsAccount, state.activeAccountType, KeetaNet]);

  return (
    <KeetaWalletContext.Provider
      value={{
        ...state,
        generateNewWallet,
        importWallet,
        disconnect,
        switchNetwork,
        createSavingsAccount,
        switchAccount,
        transferBetweenAccounts,
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
