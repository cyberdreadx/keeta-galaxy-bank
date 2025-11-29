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
        const KeetaNet = Anchor.KeetaNet;
        console.log('[KeetaSwap] Anchor SDK loaded');

        // Generate network account to use as resolver root
        // Network IDs: main = 1n, test = 2n
        const networkID = network === 'main' ? 1n : 2n;
        const networkAccount = KeetaNet.lib.Account.generateNetworkAddress(networkID);
        console.log('[KeetaSwap] Network account:', networkAccount.publicKeyString?.get?.() || networkAccount.publicKeyString);

        // Create FX Client with network account as root
        if ((Anchor as any).FX?.Client) {
          try {
            const fxClientInstance = new (Anchor as any).FX.Client(client, { 
              root: networkAccount 
            });
            console.log('[KeetaSwap] FX Client created with network root');
            
            // Check for available conversions
            const conversions = await fxClientInstance.listPossibleConversions?.({ from: '$KTA' }).catch((e: any) => {
              console.log('[KeetaSwap] listPossibleConversions error:', e?.message);
              return null;
            });
            console.log('[KeetaSwap] Conversions:', conversions);
            
            // Try to get token list
            const tokenList = await fxClientInstance.resolver?.listTokens?.().catch(() => []) || [];
            console.log('[KeetaSwap] Token list:', tokenList);

            if ((conversions && conversions.length > 0) || (tokenList && tokenList.length > 0)) {
              setFxClient(fxClientInstance);
              
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
            } else {
              console.log('[KeetaSwap] No FX services on network');
              setComingSoon(true);
            }
          } catch (e: any) {
            console.log('[KeetaSwap] FX Client error:', e?.message);
            setComingSoon(true);
          }
        } else {
          console.log('[KeetaSwap] FX.Client not found in SDK');
          setComingSoon(true);
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
