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
  const { client, network, isConnected, seed } = useKeetaWallet();
  const [fxConfig, setFxConfig] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<SwapToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Anchor SDK and try to initialize FX services
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !client || !seed) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load Anchor SDK
        const anchor = await import('@keetanetwork/anchor');
        console.log('[KeetaSwap] Anchor SDK loaded');

        // Create account from seed
        const KeetaNet = anchor.KeetaNet as any;
        const Account = KeetaNet?.lib?.Account;
        if (!Account) {
          console.log('[KeetaSwap] Account class not found');
          setError('Account class not available');
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // Convert mnemonic to seed if needed
        let rawSeed = seed;
        if (seed.includes(' ')) {
          // It's a mnemonic phrase, convert to seed
          rawSeed = Account.seedFromPassphrase(seed);
          console.log('[KeetaSwap] Converted mnemonic to seed');
        }

        const userAccount = Account.fromSeed(rawSeed, 0);
        console.log('[KeetaSwap] Account created from seed');

        // Check if Resolver exists
        if (anchor.lib?.Resolver) {
          console.log('[KeetaSwap] Resolver class found');
          
          try {
            const Resolver = anchor.lib.Resolver as any;
            
            // Create resolver with proper config: { root, client, trustedCAs }
            const resolverInstance = new Resolver({
              root: userAccount,
              client: client,
              trustedCAs: []
            });
            console.log('[KeetaSwap] Resolver instance created');
            
            // Use lookupFXServices method
            if (typeof resolverInstance.lookupFXServices === 'function') {
              console.log('[KeetaSwap] Calling lookupFXServices...');
              const fxServices = await resolverInstance.lookupFXServices();
              console.log('[KeetaSwap] FX Services result:', fxServices);
              
              if (fxServices && (Array.isArray(fxServices) ? fxServices.length > 0 : true)) {
                setFxConfig(fxServices);
                setAvailableTokens([
                  { symbol: 'KTA', name: 'Keeta' },
                  { symbol: 'USDC', name: 'USD Coin' },
                ]);
                console.log('[KeetaSwap] FX services configured');
              } else {
                console.log('[KeetaSwap] No FX services available on this network');
                setError('No FX services available on this network');
              }
            } else {
              console.log('[KeetaSwap] lookupFXServices method not found');
              setError('FX lookup not available');
            }
          } catch (resolverErr: any) {
            console.error('[KeetaSwap] Resolver error:', resolverErr);
            setError(resolverErr?.message || 'FX resolver unavailable');
          }
        } else {
          console.log('[KeetaSwap] Resolver not found in anchor.lib');
          setError('Resolver not available in SDK');
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
  }, [isConnected, client, seed, network]);

  const getEstimate = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<SwapEstimate | null> => {
    if (!fxConfig || !amount || parseFloat(amount) <= 0) {
      return null;
    }

    try {
      setIsLoading(true);
      
      // Use FX service getEstimate method
      const estimate = await fxConfig.getEstimate({
        fromToken,
        toToken,
        amount,
      });

      console.log('[KeetaSwap] Estimate result:', estimate);

      return {
        fromAmount: amount,
        toAmount: estimate?.toAmount || estimate?.output || '0',
        rate: estimate?.rate || 0,
        fee: estimate?.fee,
      };
    } catch (err: any) {
      console.error('[KeetaSwap] Estimate error:', err);
      setError(err?.message || 'Failed to get estimate');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fxConfig]);

  const executeSwap = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: string,
    minReceived?: string
  ): Promise<{ success: boolean; txId?: string; error?: string }> => {
    if (!fxConfig) {
      return { success: false, error: 'Swap service not available' };
    }

    try {
      setIsLoading(true);

      // Get quote first
      const quote = await fxConfig.getQuote({
        fromToken,
        toToken,
        amount,
        minReceived,
      });

      console.log('[KeetaSwap] Quote:', quote);

      // Execute exchange
      const exchange = await fxConfig.createExchange({
        quoteId: quote?.id,
        fromToken,
        toToken,
        amount,
      });

      console.log('[KeetaSwap] Exchange created:', exchange);

      return {
        success: true,
        txId: exchange?.id || exchange?.txId,
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
  }, [fxConfig]);

  const getExchangeStatus = useCallback(async (exchangeId: string) => {
    if (!fxConfig) return null;

    try {
      return await fxConfig.getExchangeStatus(exchangeId);
    } catch (err) {
      console.error('[KeetaSwap] Status check error:', err);
      return null;
    }
  }, [fxConfig]);

  return {
    isInitialized,
    isLoading,
    error,
    fxServiceAvailable: !!fxConfig,
    availableTokens,
    getEstimate,
    executeSwap,
    getExchangeStatus,
  };
}
