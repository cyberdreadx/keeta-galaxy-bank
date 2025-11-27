import { useState, useEffect, useCallback } from 'react';

interface KtaPriceData {
  priceUsd: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// DexScreener API endpoint - update with actual KTA pair address when available
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/search?q=KTA';

export const useKtaPrice = (): KtaPriceData => {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [volume24h, setVolume24h] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
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
        const price = parseFloat(ktaPair.priceUsd || '0');
        const volume = parseFloat(ktaPair.volume?.h24 || '0');
        const change = parseFloat(ktaPair.priceChange?.h24 || '0');
        
        setPriceUsd(price);
        setVolume24h(volume);
        setPriceChange24h(change);
        console.log('[useKtaPrice] Found KTA - price:', price, 'volume:', volume, 'change:', change);
      } else {
        console.log('[useKtaPrice] KTA not found on DexScreener');
        setPriceUsd(null);
        setVolume24h(null);
        setPriceChange24h(null);
      }
    } catch (err: any) {
      console.error('[useKtaPrice] Error:', err);
      setError(err.message);
      setPriceUsd(null);
      setVolume24h(null);
      setPriceChange24h(null);
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

  return { priceUsd, volume24h, priceChange24h, isLoading, error, refetch: fetchPrice };
};
