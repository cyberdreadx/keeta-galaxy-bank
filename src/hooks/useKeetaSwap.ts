import { useState, useEffect, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

interface SwapEstimate {
  fromAmount: string;
  toAmount: string;
  rate: number;
  fee?: string;
}

interface SwapToken {
  symbol: string;
  name: string;
  address?: string;
}

export function useKeetaSwap() {
  const { client, network, isConnected } = useKeetaWallet();
  const [fxClient, setFxClient] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<SwapToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  // Initialize FX Client using default resolver
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !client) return;

      try {
        setIsLoading(true);
        setError(null);
        setComingSoon(false);

        // Load Anchor SDK
        const Anchor = await import('@keetanetwork/anchor');
        console.log('[KeetaSwap] Anchor SDK loaded');

        // Use getDefaultResolver which uses network account as root
        if (typeof (Anchor as any).getDefaultResolver === 'function') {
          console.log('[KeetaSwap] Using getDefaultResolver');
          const resolver = (Anchor as any).getDefaultResolver(client, { network });
          console.log('[KeetaSwap] Default resolver created');

          // Check for FX services
          if (typeof resolver.lookupFXServices === 'function') {
            const fxServices = await resolver.lookupFXServices().catch((e: any) => {
              console.log('[KeetaSwap] lookupFXServices error:', e?.message);
              return [];
            });
            console.log('[KeetaSwap] FX Services:', fxServices);

            if (fxServices && fxServices.length > 0) {
              // FX services available - try to create FX client
              if ((Anchor as any).FX?.Client) {
                const fxClientInstance = new (Anchor as any).FX.Client(client, { 
                  resolver 
                });
                setFxClient(fxClientInstance);
                
                // Get available tokens
                const tokenList = await fxClientInstance.resolver?.listTokens?.().catch(() => []) || [];
                console.log('[KeetaSwap] Token list:', tokenList);
                
                if (tokenList.length > 0) {
                  setAvailableTokens(tokenList.map((t: any) => ({
                    symbol: t.symbol || t.currencyCode || String(t),
                    name: t.name || t.symbol || String(t),
                    address: t.address || t.publicKey,
                  })));
                } else {
                  setAvailableTokens([
                    { symbol: 'KTA', name: 'Keeta' },
                    { symbol: 'USDC', name: 'USD Coin' },
                  ]);
                }
              }
            } else {
              console.log('[KeetaSwap] No FX services on network');
              setComingSoon(true);
              setError('No FX services available on this network');
            }
          } else {
            setComingSoon(true);
          }
        } else {
          // Fallback: Try FX.Client directly with network config
          console.log('[KeetaSwap] getDefaultResolver not found, trying FX.Client');
          
          if ((Anchor as any).FX?.Client) {
            try {
              const fxClientInstance = new (Anchor as any).FX.Client(client);
              console.log('[KeetaSwap] FX Client created');
              
              const conversions = await fxClientInstance.listPossibleConversions?.({ from: '$KTA' }).catch(() => []);
              console.log('[KeetaSwap] Conversions:', conversions);
              
              if (conversions && conversions.length > 0) {
                setFxClient(fxClientInstance);
                setAvailableTokens([
                  { symbol: 'KTA', name: 'Keeta' },
                  { symbol: 'USDC', name: 'USD Coin' },
                ]);
              } else {
                setComingSoon(true);
              }
            } catch (e: any) {
              console.log('[KeetaSwap] FX Client error:', e?.message);
              setComingSoon(true);
            }
          } else {
            console.log('[KeetaSwap] FX.Client not found');
            setComingSoon(true);
          }
        }

        setIsInitialized(true);
      } catch (err: any) {
        console.error('[KeetaSwap] Init error:', err);
        setError(err?.message || 'Failed to initialize swap service');
        setComingSoon(true);
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [isConnected, client, network]);

  const getEstimate = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<SwapEstimate | null> => {
    if (!fxClient || !amount || parseFloat(amount) <= 0) {
      return null;
    }

    try {
      setIsLoading(true);
      
      const estimates = await fxClient.getEstimates({
        affinity: 'from',
        amount,
        from: fromToken,
        to: toToken,
      });

      console.log('[KeetaSwap] Estimates:', estimates);

      if (estimates && estimates.length > 0) {
        const best = estimates[0];
        return {
          fromAmount: amount,
          toAmount: best.toAmount || best.output || '0',
          rate: best.rate || parseFloat(best.toAmount) / parseFloat(amount),
          fee: best.fee,
        };
      }

      return null;
    } catch (err: any) {
      console.error('[KeetaSwap] Estimate error:', err);
      setError(err?.message || 'Failed to get estimate');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fxClient]);

  const executeSwap = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: string,
    minReceived?: string
  ): Promise<{ success: boolean; txId?: string; error?: string }> => {
    if (!fxClient) {
      return { success: false, error: 'Swap service not available' };
    }

    try {
      setIsLoading(true);

      const result = await fxClient.exchange({
        from: fromToken,
        to: toToken,
        amount,
        minReceived,
      });

      console.log('[KeetaSwap] Exchange result:', result);

      return {
        success: true,
        txId: result?.id || result?.txId,
      };
    } catch (err: any) {
      console.error('[KeetaSwap] Swap error:', err);
      return {
        success: false,
        error: err?.message || 'Swap failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, [fxClient]);

  const getExchangeStatus = useCallback(async (exchangeId: string) => {
    if (!fxClient) return null;

    try {
      return await fxClient.getExchangeStatus?.(exchangeId);
    } catch (err) {
      console.error('[KeetaSwap] Status check error:', err);
      return null;
    }
  }, [fxClient]);

  return {
    isInitialized,
    isLoading,
    error,
    fxServiceAvailable: !!fxClient,
    comingSoon,
    availableTokens,
    getEstimate,
    executeSwap,
    getExchangeStatus,
  };
}
