import { useState, useEffect, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

interface KeetaBalance {
  balance: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useKeetaBalance = (): KeetaBalance => {
  const { client, isConnected } = useKeetaWallet();
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
      // Fetch account data from the Keeta network
      const accountData = await client.account();
      
      // Balance is typically in smallest unit, convert to readable format
      // KTA has 9 decimals based on blockchain standards
      const rawBalance = accountData?.balance ?? 0n;
      const balanceNumber = Number(rawBalance) / 1e9;
      
      setBalance(balanceNumber);
    } catch (err: any) {
      console.error('Failed to fetch balance:', err);
      setError(err.message || 'Failed to fetch balance');
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [client, isConnected]);

  useEffect(() => {
    fetchBalance();
    
    // Poll for balance updates every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch: fetchBalance };
};
