import { useState, useEffect, useCallback } from 'react';

interface KtaPriceData {
  priceUsd: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// DexScreener API endpoint - update with actual KTA pair address when available
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/search?q=KTA';

export const useKtaPrice = (): KtaPriceData => {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(DEXSCREENER_API);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }

      const data = await response.json();
      
      // Find KTA pair in results
      const ktaPair = data.pairs?.find((pair: any) => 
        pair.baseToken?.symbol?.toUpperCase() === 'KTA' ||
        pair.quoteToken?.symbol?.toUpperCase() === 'KTA'
      );

      if (ktaPair) {
        const price = parseFloat(ktaPair.priceUsd || ktaPair.priceNative || '0');
        setPriceUsd(price);
        console.log('[useKtaPrice] Found KTA price:', price);
      } else {
        // Fallback price for demo/testnet
        console.log('[useKtaPrice] KTA not found on DexScreener, using fallback');
        setPriceUsd(null);
      }
    } catch (err: any) {
      console.error('[useKtaPrice] Error:', err);
      setError(err.message);
      setPriceUsd(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return { priceUsd, isLoading, error, refetch: fetchPrice };
};
