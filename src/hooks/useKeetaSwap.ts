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
  const [fxConfig, setFxConfig] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<SwapToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Anchor SDK and try to initialize FX services
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !client) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load Anchor SDK
        const anchor = await import('@keetanetwork/anchor');
        console.log('[KeetaSwap] Anchor SDK loaded');
        console.log('[KeetaSwap] Available in anchor.lib:', anchor.lib ? Object.keys(anchor.lib) : 'none');

        // Check if Resolver exists and explore its API
        if (anchor.lib?.Resolver) {
          console.log('[KeetaSwap] Resolver class found');
          
          try {
            // Use 'any' to bypass strict typing while exploring
            const Resolver = anchor.lib.Resolver as any;
            
            // Log what we have
            console.log('[KeetaSwap] Resolver:', Resolver);
            console.log('[KeetaSwap] Resolver.prototype:', Object.getOwnPropertyNames(Resolver.prototype || {}));

            // Based on the example, resolver config takes root accounts and services config
            // The FX services are configured in resolver.services.fx
            // Let's try different instantiation patterns
            
            let resolverInstance: any = null;
            
            // Pattern 1: Try with client directly
            try {
              resolverInstance = new Resolver(client);
              console.log('[KeetaSwap] Pattern 1 worked - client direct');
            } catch (e) {
              console.log('[KeetaSwap] Pattern 1 failed');
            }

            // Pattern 2: Try static method if available
            if (!resolverInstance && Resolver.fromNetwork) {
              try {
                resolverInstance = Resolver.fromNetwork(network, client);
                console.log('[KeetaSwap] Pattern 2 worked - fromNetwork');
              } catch (e) {
                console.log('[KeetaSwap] Pattern 2 failed');
              }
            }

            // Pattern 3: Try with empty config
            if (!resolverInstance) {
              try {
                resolverInstance = new Resolver({});
                console.log('[KeetaSwap] Pattern 3 worked - empty config');
              } catch (e) {
                console.log('[KeetaSwap] Pattern 3 failed');
              }
            }

            if (resolverInstance) {
              console.log('[KeetaSwap] Resolver instance created');
              console.log('[KeetaSwap] Instance keys:', Object.keys(resolverInstance));
              console.log('[KeetaSwap] Instance services:', resolverInstance.services);

              // Check for services.fx
              const services = resolverInstance.services;
              if (services?.fx) {
                setFxConfig(services.fx);
                console.log('[KeetaSwap] FX services found:', Object.keys(services.fx));
                setAvailableTokens([
                  { symbol: 'KTA', name: 'Keeta' },
                  { symbol: 'USDC', name: 'USD Coin' },
                ]);
              } else {
                console.log('[KeetaSwap] No FX services found');
                setError('FX service not available on this network');
              }
            } else {
              console.log('[KeetaSwap] Could not create resolver instance');
              setError('Resolver initialization failed');
            }
          } catch (resolverErr: any) {
            console.error('[KeetaSwap] Resolver error:', resolverErr);
            setError('FX resolver unavailable');
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
  }, [isConnected, client, network]);

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
