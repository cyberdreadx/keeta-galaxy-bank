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

// TODO: Replace with actual FX resolver public key for mainnet
const FX_RESOLVER_PUBLIC_KEY = {
  main: '', // Need mainnet FX resolver address
  test: '', // Need testnet FX resolver address
};

export function useKeetaSwap() {
  const { client, network, isConnected } = useKeetaWallet();
  const [fxClient, setFxClient] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<SwapToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize FX Client
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !client) return;

      const resolverPublicKey = FX_RESOLVER_PUBLIC_KEY[network];
      if (!resolverPublicKey) {
        console.log('[KeetaSwap] No FX resolver configured for network:', network);
        setError(`No FX resolver configured for ${network}net`);
        setIsInitialized(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load Anchor SDK
        const Anchor = await import('@keetanetwork/anchor');
        const KeetaNet = Anchor.KeetaNet;
        console.log('[KeetaSwap] Anchor SDK loaded');

        // Create resolver account from public key
        const resolverAccount = KeetaNet.lib.Account.fromPublicKeyString(resolverPublicKey);
        console.log('[KeetaSwap] Resolver account created');

        // Create FX Client
        const fxClientInstance = new (Anchor as any).FX.Client(client, { root: resolverAccount });
        console.log('[KeetaSwap] FX Client created');

        // Get available tokens
        const tokenList = await fxClientInstance.resolver.listTokens().catch(() => []);
        console.log('[KeetaSwap] Token list:', tokenList);

        // Get possible conversions from KTA
        const conversions = await fxClientInstance.listPossibleConversions({ from: '$KTA' }).catch(() => []);
        console.log('[KeetaSwap] Possible conversions:', conversions);

        setFxClient(fxClientInstance);
        
        // Set available tokens based on what we found
        if (tokenList && tokenList.length > 0) {
          setAvailableTokens(tokenList.map((t: any) => ({
            symbol: t.symbol || t.currencyCode || t,
            name: t.name || t.symbol || t,
            address: t.address || t.publicKey,
          })));
        } else {
          setAvailableTokens([
            { symbol: 'KTA', name: 'Keeta' },
            { symbol: 'USDC', name: 'USD Coin' },
          ]);
        }

        setIsInitialized(true);
      } catch (err: any) {
        console.error('[KeetaSwap] Init error:', err);
        setError(err?.message || 'Failed to initialize swap service');
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
      
      // Use FX client getEstimates method
      const estimates = await fxClient.getEstimates({
        affinity: 'from',
        amount,
        from: fromToken,
        to: toToken,
      });

      console.log('[KeetaSwap] Estimates result:', estimates);

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

      // Execute exchange via FX client
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
      return await fxClient.getExchangeStatus(exchangeId);
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
    availableTokens,
    getEstimate,
    executeSwap,
    getExchangeStatus,
  };
}
