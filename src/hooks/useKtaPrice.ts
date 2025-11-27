import { useState, useEffect, useCallback } from 'react';
import { useSettings, FiatCurrency } from '@/contexts/SettingsContext';

// Exchange rates relative to USD (approximate, would normally fetch from API)
const EXCHANGE_RATES: Record<FiatCurrency, number> = {
  USD: 1,
  GBP: 0.79,
  CAD: 1.36,
  EUR: 0.92,
  AUD: 1.53,
};

interface KtaPriceData {
  priceUsd: number | null;
  priceFiat: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  convertToFiat: (ktaAmount: number) => number | null;
  convertFromFiat: (fiatAmount: number) => number | null;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/search?q=KTA';

export const useKtaPrice = (): KtaPriceData => {
  const { fiatCurrency, formatFiat } = useSettings();
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
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Convert KTA to selected fiat currency
  const priceFiat = priceUsd !== null 
    ? priceUsd * EXCHANGE_RATES[fiatCurrency] 
    : null;

  const convertToFiat = useCallback((ktaAmount: number): number | null => {
    if (priceUsd === null) return null;
    return ktaAmount * priceUsd * EXCHANGE_RATES[fiatCurrency];
  }, [priceUsd, fiatCurrency]);

  const convertFromFiat = useCallback((fiatAmount: number): number | null => {
    if (priceUsd === null) return null;
    const fiatToUsd = fiatAmount / EXCHANGE_RATES[fiatCurrency];
    return fiatToUsd / priceUsd;
  }, [priceUsd, fiatCurrency]);

  return { 
    priceUsd, 
    priceFiat,
    volume24h, 
    priceChange24h, 
    isLoading, 
    error, 
    refetch: fetchPrice,
    convertToFiat,
    convertFromFiat,
  };
};
