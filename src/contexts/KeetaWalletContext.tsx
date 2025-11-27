import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types for Keeta SDK (will be populated when SDK loads)
interface KeetaAccount {
  publicKeyString: { toString: () => string };
}

interface KeetaUserClient {
  chain: () => Promise<any>;
  account: () => Promise<any>;
  allBalances: () => Promise<Record<string, any>>;
  baseToken: any;
  send: (to: string, amount: bigint) => Promise<any>;
  initBuilder: () => any;
  computeBuilderBlocks: (builder: any) => Promise<any>;
  publishBuilder: (builder: any) => Promise<any>;
}

export type AccountType = 'checking' | 'savings' | string;

interface AccountInfo {
  publicKey: string;
  client: KeetaUserClient;
  name: string;
  derivationIndex: number;
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
  customAccounts: AccountInfo[];
}

interface KeetaWalletContextType extends KeetaWalletState {
  generateNewWallet: () => Promise<void>;
  importWallet: (seed: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'test' | 'main') => Promise<void>;
  createSavingsAccount: () => Promise<void>;
  createCustomAccount: (name: string) => Promise<void>;
  switchAccount: (accountType: AccountType) => void;
  transferBetweenAccounts: (from: AccountType, to: AccountType, amount: number) => Promise<void>;
  getActiveAccountName: () => string;
  getAllAccounts: () => AccountInfo[];
}

const KeetaWalletContext = createContext<KeetaWalletContextType | null>(null);

const STORAGE_KEY = 'keeta_wallet_seed';
const NETWORK_KEY = 'keeta_network';
const SAVINGS_KEY = 'keeta_savings_enabled';
const ACTIVE_ACCOUNT_KEY = 'keeta_active_account';
const CUSTOM_ACCOUNTS_KEY = 'keeta_custom_accounts';

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
    customAccounts: [],
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
    const customAccountsJson = localStorage.getItem(CUSTOM_ACCOUNTS_KEY);
    const customAccountNames: string[] = customAccountsJson ? JSON.parse(customAccountsJson) : [];
    
    if (storedSeed) {
      connectWithSeed(storedSeed, storedNetwork, savingsEnabled, activeAccount, customAccountNames);
    }
  }, [KeetaNet]);

  const createAccountAtIndex = async (seedHex: string, index: number, network: 'test' | 'main', name: string): Promise<AccountInfo> => {
    const { Account } = KeetaNet.lib;
    const { AccountKeyAlgorithm } = Account;
    
    const account = Account.fromSeed(seedHex, index, AccountKeyAlgorithm.ECDSA_SECP256K1);
    const client = KeetaNet.UserClient.fromNetwork(network, account);
    const publicKey = account.publicKeyString.toString();
    
    return { publicKey, client, name, derivationIndex: index };
  };

  const connectWithSeed = async (
    seedOrMnemonic: string, 
    network: 'test' | 'main', 
    includeSavings: boolean = false,
    activeAccount: AccountType = 'checking',
    customAccountNames: string[] = []
  ) => {
    if (!KeetaNet) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { Account } = KeetaNet.lib;
      
      // Always convert through seedFromPassphrase for CLI compatibility
      const seedHex = await Account.seedFromPassphrase(seedOrMnemonic, { asString: true });
      
      // Create checking account at index 0
      const checkingAccount = await createAccountAtIndex(seedHex, 0, network, 'Checking');
      
      // Create savings account at index 1 if enabled
      let savingsAccount: AccountInfo | null = null;
      if (includeSavings) {
        savingsAccount = await createAccountAtIndex(seedHex, 1, network, 'Savings');
      }

      // Create custom accounts starting at index 2
      const customAccounts: AccountInfo[] = [];
      for (let i = 0; i < customAccountNames.length; i++) {
        const customAccount = await createAccountAtIndex(seedHex, 2 + i, network, customAccountNames[i]);
        customAccounts.push(customAccount);
      }

      // Determine active account
      let activeAccountInfo = checkingAccount;
      if (activeAccount === 'savings' && savingsAccount) {
        activeAccountInfo = savingsAccount;
      } else if (activeAccount !== 'checking' && activeAccount !== 'savings') {
        const customAccount = customAccounts.find(a => a.name === activeAccount);
        if (customAccount) activeAccountInfo = customAccount;
      }

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
        activeAccountType: activeAccountInfo.name === 'Checking' ? 'checking' : 
                          activeAccountInfo.name === 'Savings' ? 'savings' : activeAccountInfo.name,
        checkingAccount,
        savingsAccount,
        customAccounts,
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

    // Check localStorage for previously saved account state
    const savingsEnabled = localStorage.getItem(SAVINGS_KEY) === 'true';
    const activeAccount = localStorage.getItem(ACTIVE_ACCOUNT_KEY) as AccountType || 'checking';
    const customAccountsJson = localStorage.getItem(CUSTOM_ACCOUNTS_KEY);
    const customAccountNames: string[] = customAccountsJson ? JSON.parse(customAccountsJson) : [];

    // Pass directly to connectWithSeed - it handles both mnemonic and hex via seedFromPassphrase
    await connectWithSeed(seedInput.trim(), state.network, savingsEnabled, activeAccount, customAccountNames);
  }, [KeetaNet, state.network]);

  const createSavingsAccount = useCallback(async () => {
    if (!KeetaNet || !state.seed) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    try {
      const { Account } = KeetaNet.lib;
      const seedHex = await Account.seedFromPassphrase(state.seed, { asString: true });
      
      const savingsAccount = await createAccountAtIndex(seedHex, 1, state.network, 'Savings');
      
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

  const createCustomAccount = useCallback(async (name: string) => {
    if (!KeetaNet || !state.seed) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    // Check for duplicate names
    const allNames = [
      'Checking', 'Savings',
      ...state.customAccounts.map(a => a.name)
    ];
    if (allNames.includes(name)) {
      setState(prev => ({ ...prev, error: 'Account name already exists' }));
      return;
    }

    try {
      const { Account } = KeetaNet.lib;
      const seedHex = await Account.seedFromPassphrase(state.seed, { asString: true });
      
      // Next derivation index: 2 + number of existing custom accounts
      const nextIndex = 2 + state.customAccounts.length;
      const newAccount = await createAccountAtIndex(seedHex, nextIndex, state.network, name);
      
      // Update storage
      const existingNames = state.customAccounts.map(a => a.name);
      localStorage.setItem(CUSTOM_ACCOUNTS_KEY, JSON.stringify([...existingNames, name]));
      
      setState(prev => ({
        ...prev,
        customAccounts: [...prev.customAccounts, newAccount],
      }));
    } catch (err: any) {
      console.error('createCustomAccount error:', err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to create custom account',
      }));
    }
  }, [KeetaNet, state.seed, state.network, state.customAccounts]);

  const switchAccount = useCallback((accountType: AccountType) => {
    let targetAccount: AccountInfo | null = null;
    
    if (accountType === 'checking') {
      targetAccount = state.checkingAccount;
    } else if (accountType === 'savings') {
      targetAccount = state.savingsAccount;
    } else {
      targetAccount = state.customAccounts.find(a => a.name === accountType) || null;
    }
    
    if (!targetAccount) {
      setState(prev => ({ ...prev, error: `${accountType} account not available` }));
      return;
    }

    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountType);

    setState(prev => ({
      ...prev,
      activeAccountType: accountType,
      publicKey: targetAccount!.publicKey,
      client: targetAccount!.client,
    }));
  }, [state.checkingAccount, state.savingsAccount, state.customAccounts]);

  const transferBetweenAccounts = useCallback(async (from: AccountType, to: AccountType, amount: number) => {
    if (!KeetaNet) {
      throw new Error('SDK not loaded');
    }

    const getAccount = (accountType: AccountType) => {
      if (accountType === 'checking') return state.checkingAccount;
      if (accountType === 'savings') return state.savingsAccount;
      return state.customAccounts.find(a => a.name === accountType) || null;
    };

    const fromAccount = getAccount(from);
    const toAccount = getAccount(to);

    console.log('[Transfer] From:', from, 'To:', to, 'Amount:', amount);
    console.log('[Transfer] From account public key:', fromAccount?.publicKey);
    console.log('[Transfer] To account public key:', toAccount?.publicKey);

    if (!fromAccount || !toAccount) {
      throw new Error('Both accounts must exist for transfer');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const decimals = state.network === 'main' ? 18 : 9;
    const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));
    
    console.log('[Transfer] Raw amount (with decimals):', rawAmount.toString());
    console.log('[Transfer] Network:', state.network, 'Decimals:', decimals);

    try {
      // Create recipient account object from public key string
      const recipientAccount = KeetaNet.lib.Account.fromPublicKeyString(toAccount.publicKey);
      console.log('[Transfer] Recipient account created');

      // Use the builder pattern for proper transaction
      const builder = fromAccount.client.initBuilder();
      console.log('[Transfer] Builder initialized');

      // Add send operation: amount to recipient using base token (KTA)
      builder.send(recipientAccount, rawAmount, fromAccount.client.baseToken);
      console.log('[Transfer] Send operation added to builder');

      // Compute transaction blocks
      const computed = await fromAccount.client.computeBuilderBlocks(builder);
      console.log('[Transfer] Blocks computed:', computed?.blocks?.length || 0);

      // Publish the transaction
      const transaction = await fromAccount.client.publishBuilder(builder);
      console.log('[Transfer] Transaction published:', transaction);
    } catch (err: any) {
      console.error('[Transfer] Error:', err);
      console.error('[Transfer] Error message:', err?.message);
      
      const errStr = String(err?.message || err || '');
      
      if (errStr.includes('insufficient') || errStr.includes('Insufficient') || errStr.includes('balance')) {
        throw new Error('Insufficient KTA balance for this transfer');
      }
      throw new Error(err?.message || 'Transfer failed. Please try again.');
    }
  }, [KeetaNet, state.checkingAccount, state.savingsAccount, state.customAccounts, state.network]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SAVINGS_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    localStorage.removeItem(CUSTOM_ACCOUNTS_KEY);
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
      customAccounts: [],
    });
  }, [state.network]);

  const switchNetwork = useCallback(async (network: 'test' | 'main') => {
    if (state.seed) {
      const savingsEnabled = state.savingsAccount !== null;
      const customAccountNames = state.customAccounts.map(a => a.name);
      await connectWithSeed(state.seed, network, savingsEnabled, state.activeAccountType, customAccountNames);
    } else {
      setState(prev => ({ ...prev, network }));
      localStorage.setItem(NETWORK_KEY, network);
    }
  }, [state.seed, state.savingsAccount, state.activeAccountType, state.customAccounts, KeetaNet]);

  const getActiveAccountName = useCallback(() => {
    if (state.activeAccountType === 'checking') return 'Checking';
    if (state.activeAccountType === 'savings') return 'Savings';
    return state.activeAccountType; // Custom account name
  }, [state.activeAccountType]);

  const getAllAccounts = useCallback((): AccountInfo[] => {
    const accounts: AccountInfo[] = [];
    if (state.checkingAccount) accounts.push(state.checkingAccount);
    if (state.savingsAccount) accounts.push(state.savingsAccount);
    accounts.push(...state.customAccounts);
    return accounts;
  }, [state.checkingAccount, state.savingsAccount, state.customAccounts]);

  return (
    <KeetaWalletContext.Provider
      value={{
        ...state,
        generateNewWallet,
        importWallet,
        disconnect,
        switchNetwork,
        createSavingsAccount,
        createCustomAccount,
        switchAccount,
        transferBetweenAccounts,
        getActiveAccountName,
        getAllAccounts,
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
