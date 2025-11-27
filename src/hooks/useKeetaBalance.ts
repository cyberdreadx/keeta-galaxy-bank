import { useState, useEffect, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

interface KeetaBalance {
  balance: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// KTA decimals: testnet=9, mainnet=18
const getKtaDecimals = (network: 'test' | 'main'): number => {
  return network === 'main' ? 18 : 9;
};

export const useKeetaBalance = (): KeetaBalance => {
  const { client, isConnected, network } = useKeetaWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!client || !isConnected) {
      setBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all balances from the client
      const allBalances = await client.allBalances();
      console.log('[useKeetaBalance] Raw allBalances:', allBalances);

      if (!allBalances || Object.keys(allBalances).length === 0) {
        console.log('[useKeetaBalance] No balances found');
        setBalance(0);
        return;
      }

      // Get the base token address (KTA) from the client
      const baseTokenAddr = client.baseToken.publicKeyString.toString();
      console.log('[useKeetaBalance] Base token address:', baseTokenAddr);

      // Find KTA balance by iterating over balance entries
      let ktaBalance = BigInt(0);

      for (const [tokenId, balanceData] of Object.entries(allBalances)) {
        // Parse the balance data (handles bigint serialization)
        const tokenInfo = JSON.parse(
          JSON.stringify(balanceData, (k: string, v: any) => 
            typeof v === 'bigint' ? v.toString() : v
          )
        );
        const tokenAddr = String(tokenInfo.token || '');

        // Match against the base token from client
        if (tokenAddr === baseTokenAddr) {
          const balStr = String(tokenInfo.balance || '0');
          ktaBalance = BigInt(balStr);
          console.log('[useKeetaBalance] Found KTA balance:', balStr);
          break;
        }
      }

      // Convert using network-specific decimals
      const decimals = getKtaDecimals(network);
      const divisor = Math.pow(10, decimals);
      const balanceNum = Number(ktaBalance) / divisor;

      console.log('[useKeetaBalance] Final balance:', balanceNum, 'decimals:', decimals);
      setBalance(balanceNum);
    } catch (err: any) {
      console.error('[useKeetaBalance] Error fetching balance:', err);
      setError(err.message || 'Failed to fetch balance');
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [client, isConnected, network]);

  useEffect(() => {
    fetchBalance();
    
    // Poll for balance updates every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch: fetchBalance };
};
