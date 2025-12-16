import { useState, useEffect, useCallback } from 'react';
import { useBaseWallet } from '@/contexts/BaseWalletContext';

interface BaseBalance {
  ethBalance: string;
  ktaBalance: string;
  usdcBalance: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// KTA token address on Base
const KTA_TOKEN_ADDRESS = '0xc0634090F2Fe6c6d75e61Be2b949464aBB498973';
// USDC token address on Base (Native USDC)
const USDC_TOKEN_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export const useBaseBalance = (): BaseBalance => {
  // Safely get base wallet context
  let baseWallet;
  try {
    baseWallet = useBaseWallet();
  } catch (err) {
    // Context not available, return default values
    return {
      ethBalance: '0',
      ktaBalance: '0',
      usdcBalance: '0',
      isLoading: false,
      error: null,
      refetch: async () => {},
    };
  }

  const { isConnected, address, getBalance, getKtaBalance } = baseWallet;
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [ktaBalance, setKtaBalance] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    console.log('[useBaseBalance] fetchBalances called, isConnected:', isConnected, 'address:', address);
    
    if (!isConnected || !address) {
      console.log('[useBaseBalance] Not connected or no address, returning 0s');
      setEthBalance('0');
      setKtaBalance('0');
      setUsdcBalance('0');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useBaseBalance] Fetching ETH balance for address:', address);
      const eth = await getBalance();
      console.log('[useBaseBalance] ETH balance result:', eth);
      
      const [kta, usdc] = await Promise.all([
        getKtaBalance(KTA_TOKEN_ADDRESS),
        getKtaBalance(USDC_TOKEN_ADDRESS),
      ]);
      console.log('[useBaseBalance] KTA balance:', kta, 'USDC balance:', usdc);

      setEthBalance(eth);
      setKtaBalance(kta);
      setUsdcBalance(usdc);
    } catch (err: any) {
      console.error('[useBaseBalance] Failed to fetch BASE balances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, getBalance, getKtaBalance]);

  useEffect(() => {
    fetchBalances();

    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalances, 10000);

    return () => clearInterval(interval);
  }, [fetchBalances]);

  return {
    ethBalance,
    ktaBalance,
    usdcBalance,
    isLoading,
    error,
    refetch: fetchBalances,
  };
};
