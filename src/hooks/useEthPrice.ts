import { useState, useEffect } from 'react';

// Simple hook to fetch ETH price in USD
export const useEthPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      try {
        // Use CoinGecko API (No API key required for low volume)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        if (data.ethereum && data.ethereum.usd) {
          setPrice(data.ethereum.usd);
        }
      } catch (err) {
        console.error('Failed to fetch ETH price:', err);
        // Fallback or keep previous price
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    // Refresh every minute
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading };
};

