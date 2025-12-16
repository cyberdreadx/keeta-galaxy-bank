import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';

// Ensure ethers is available
if (typeof ethers === 'undefined') {
  console.error('ethers.js is not available');
}

// Base network configuration
// using reliable public RPC that supports CORS
const BASE_RPC_URL = 'https://base.llamarpc.com'; 
const BASE_CHAIN_ID = 8453;

interface BaseWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  privateKey: string | null; // Encrypted in production
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  error: string | null;
}

interface BaseWalletContextType extends BaseWalletState {
  generateNewWallet: () => Promise<void>;
  importWallet: (privateKeyOrMnemonic: string) => Promise<void>;
  disconnect: () => void;
  getBalance: () => Promise<string>;
  getKtaBalance: (ktaTokenAddress?: string) => Promise<string>;
  sendTransaction: (to: string, amount: string) => Promise<ethers.TransactionResponse>;
}

const BaseWalletContext = createContext<BaseWalletContextType | null>(null);

const STORAGE_KEY = 'base_wallet_private_key';
const ENCRYPTION_KEY = 'base_wallet_encryption'; // In production, use proper encryption

// Simple encryption (for demo - use proper encryption in production)
const encrypt = (text: string): string => {
  // In production, use a proper encryption library like crypto-js
  return btoa(text); // Base64 encoding (not secure, just for demo)
};

const decrypt = (encrypted: string): string => {
  try {
    return atob(encrypted); // Base64 decoding
  } catch {
    throw new Error('Failed to decrypt wallet');
  }
};

export const BaseWalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<BaseWalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    privateKey: null,
    provider: null,
    signer: null,
    error: null,
  });


  // Initialize provider
  useEffect(() => {
    let mounted = true;
    const initProvider = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
        if (mounted) {
          setState(prev => ({ ...prev, provider }));
        }
      } catch (err) {
        console.error('Failed to initialize BASE provider:', err);
        if (mounted) {
          setState(prev => ({ ...prev, error: 'Failed to initialize BASE network provider' }));
        }
      }
    };
    initProvider();
    return () => { mounted = false; };
  }, []);


  const connectWithPrivateKey = useCallback(async (privateKeyOrMnemonic: string) => {
    if (!state.provider) {
      setState(prev => ({ ...prev, error: 'Provider not initialized' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      let wallet: ethers.Wallet | ethers.HDNodeWallet;

      // Check if it's a mnemonic (12 or 24 words)
      const words = privateKeyOrMnemonic.trim().split(/\s+/);
      if (words.length === 12 || words.length === 24) {
        // It's a mnemonic - create HD wallet from mnemonic
        const mnemonic = words.join(' ');
        // In ethers v6, use Wallet.fromPhrase or create from mnemonic
        try {
          // Try the direct method first
          wallet = ethers.Wallet.fromPhrase(mnemonic).connect(state.provider);
        } catch {
          // Fallback: create from mnemonic object
          const mnemonicObj = ethers.Mnemonic.fromPhrase(mnemonic);
          wallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObj).connect(state.provider);
        }
      } else {
        // It's a private key
        wallet = new ethers.Wallet(privateKeyOrMnemonic, state.provider);
      }

      const address = await wallet.getAddress();
      const signer = wallet.connect(state.provider);

      // Store encrypted private key
      const encrypted = encrypt(wallet.privateKey);
      localStorage.setItem(STORAGE_KEY, encrypted);

      setState({
        isConnected: true,
        isConnecting: false,
        address,
        privateKey: wallet.privateKey, // Keep in memory (encrypted in storage)
        provider: state.provider,
        signer,
        error: null,
      });
    } catch (err: any) {
      console.error('connectWithPrivateKey error:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect wallet',
      }));
    }
  }, [state.provider]);

  // Auto-connect from stored private key
  useEffect(() => {
    if (!state.provider) return;

    const storedEncrypted = localStorage.getItem(STORAGE_KEY);
    console.log('[BaseWallet] Checking storage for key:', !!storedEncrypted);
    
    if (storedEncrypted) {
      try {
        const privateKey = decrypt(storedEncrypted);
        console.log('[BaseWallet] Key found, connecting...');
        connectWithPrivateKey(privateKey).catch((err) => {
          console.error('Failed to load stored wallet:', err);
          // Do NOT remove key on connection error (could be network issue)
          // localStorage.removeItem(STORAGE_KEY);
        });
      } catch (err) {
        console.error('Failed to decrypt stored wallet:', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [state.provider, connectWithPrivateKey]);

  const generateNewWallet = useCallback(async () => {
    if (!state.provider) {
      setState(prev => ({ ...prev, error: 'Provider not initialized' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wallet = ethers.Wallet.createRandom();
      await connectWithPrivateKey(wallet.privateKey);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to generate wallet',
      }));
    }
  }, [state.provider, connectWithPrivateKey]);

  const importWallet = useCallback(async (privateKeyOrMnemonic: string) => {
    if (!privateKeyOrMnemonic.trim()) {
      setState(prev => ({ ...prev, error: 'Private key or mnemonic cannot be empty' }));
      return;
    }

    await connectWithPrivateKey(privateKeyOrMnemonic.trim());
  }, [connectWithPrivateKey]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      privateKey: null,
      provider: state.provider,
      signer: null,
      error: null,
    });
  }, [state.provider]);

  const getBalance = useCallback(async (): Promise<string> => {
    console.log('[BaseWallet] getBalance called, provider:', !!state.provider, 'address:', state.address);
    if (!state.provider || !state.address) {
      console.log('[BaseWallet] No provider or address, returning 0');
      return '0';
    }

    try {
      console.log('[BaseWallet] Fetching balance from RPC for:', state.address);
      const balance = await state.provider.getBalance(state.address);
      const formatted = ethers.formatEther(balance);
      console.log('[BaseWallet] Raw balance:', balance.toString(), 'Formatted:', formatted);
      return formatted;
    } catch (err) {
      console.error('[BaseWallet] Failed to get balance:', err);
      return '0';
    }
  }, [state.provider, state.address]);

  const getKtaBalance = useCallback(async (ktaTokenAddress?: string): Promise<string> => {
    if (!state.provider || !state.address) {
      return '0';
    }

    // If no token address provided, return ETH balance
    if (!ktaTokenAddress) {
      return getBalance();
    }

    try {
      // ERC20 token ABI (just balanceOf function)
      const tokenABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];

      const tokenContract = new ethers.Contract(ktaTokenAddress, tokenABI, state.provider);
      const balance = await tokenContract.balanceOf(state.address);
      const decimals = await tokenContract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (err: any) {
      // Ignore "BAD_DATA" errors which happen when address is not a contract
      if (err.code !== 'BAD_DATA') {
        console.error('Failed to get KTA balance:', err);
      }
      return '0';
    }
  }, [state.provider, state.address, getBalance]);

  const sendTransaction = useCallback(async (
    to: string,
    amount: string
  ): Promise<ethers.TransactionResponse> => {
    if (!state.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await state.signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      return tx;
    } catch (err: any) {
      throw new Error(err.message || 'Transaction failed');
    }
  }, [state.signer]);

  return (
    <BaseWalletContext.Provider
      value={{
        ...state,
        generateNewWallet,
        importWallet,
        disconnect,
        getBalance,
        getKtaBalance,
        sendTransaction,
      }}
    >
      {children}
    </BaseWalletContext.Provider>
  );
};

export const useBaseWallet = () => {
  const context = useContext(BaseWalletContext);
  if (!context) {
    throw new Error('useBaseWallet must be used within BaseWalletProvider');
  }
  return context;
};

