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

// Known FX Anchors on Keeta Network
const FX_ANCHORS = {
  alpaca: {
    name: 'Alpaca DEX',
    publicKey: 'keeta_aabyuc4ce7n7n7gyjbcszpxlawujaacpu2wj72fljjjhhhyf25xmj66gand2ori',
  },
  murf: {
    name: 'Murf (Murphy)',
    publicKey: 'keeta_athqkb6yw6h2e436xxaakuy4bctrqkqfctvy5xsp3ugvb3avv56zruxjcxauq',
  },
};

// Default to Alpaca DEX
const DEFAULT_ANCHOR = 'alpaca';

export function useKeetaSwap(anchorId: keyof typeof FX_ANCHORS = DEFAULT_ANCHOR) {
  const { client, network, isConnected } = useKeetaWallet();
  const [fxClient, setFxClient] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<SwapToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [anchorName, setAnchorName] = useState<string>('');

  // Initialize FX Client with selected anchor
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !client) return;

      const anchor = FX_ANCHORS[anchorId];
      if (!anchor) {
        setError('Invalid FX anchor selected');
        setComingSoon(true);
        setIsInitialized(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setComingSoon(false);
        setAnchorName(anchor.name);

        // Load Anchor SDK
        const Anchor = await import('@keetanetwork/anchor');
        const KeetaNet = Anchor.KeetaNet;
        console.log('[KeetaSwap] Anchor SDK loaded');
        console.log('[KeetaSwap] Using FX Anchor:', anchor.name, anchor.publicKey);

        // Create resolver account from anchor public key
        const resolverAccount = KeetaNet.lib.Account.fromPublicKeyString(anchor.publicKey);
        console.log('[KeetaSwap] Resolver account created');

        // Create FX Client with anchor as root
        if ((Anchor as any).FX?.Client) {
          try {
            const fxClientInstance = new (Anchor as any).FX.Client(client, { 
              root: resolverAccount 
            });
            console.log('[KeetaSwap] FX Client created');
            
            // Check for available conversions
            const conversions = await fxClientInstance.listPossibleConversions?.({ from: '$KTA' }).catch((e: any) => {
              console.log('[KeetaSwap] listPossibleConversions error:', e?.message);
              return null;
            });
            console.log('[KeetaSwap] Conversions from KTA:', conversions);
            
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
              } else if (conversions && conversions.length > 0) {
                // Build token list from conversions
                const tokens = new Set<string>();
                tokens.add('KTA');
                conversions.forEach((c: any) => {
                  if (c.symbol) tokens.add(c.symbol);
                  if (c.currencyCode) tokens.add(c.currencyCode);
                });
                setAvailableTokens(Array.from(tokens).map(s => ({
                  symbol: s,
                  name: s,
                })));
              } else {
                setAvailableTokens([
                  { symbol: 'KTA', name: 'Keeta' },
                  { symbol: 'USDC', name: 'USD Coin' },
                ]);
              }
              console.log('[KeetaSwap] FX services available!');
            } else {
              console.log('[KeetaSwap] No FX services found on anchor');
              setComingSoon(true);
            }
          } catch (e: any) {
            console.error('[KeetaSwap] FX Client error:', e?.message);
            setError(e?.message || 'Failed to connect to FX anchor');
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
  }, [isConnected, client, network, anchorId]);

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
      
      // Convert symbol to currency code format (e.g., KTA -> $KTA)
      const fromCode = fromToken.startsWith('$') || fromToken.startsWith('keeta_') 
        ? fromToken 
        : `$${fromToken}`;
      const toCode = toToken.startsWith('$') || toToken.startsWith('keeta_') 
        ? toToken 
        : `$${toToken}`;
      
      console.log('[KeetaSwap] Getting estimate for:', fromCode, '->', toCode, 'amount:', amount);
      
      const estimates = await fxClient.getEstimates({
        affinity: 'from',
        amount,
        from: fromCode,
        to: toCode,
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

      // Convert symbol to currency code format
      const fromCode = fromToken.startsWith('$') || fromToken.startsWith('keeta_') 
        ? fromToken 
        : `$${fromToken}`;
      const toCode = toToken.startsWith('$') || toToken.startsWith('keeta_') 
        ? toToken 
        : `$${toToken}`;

      // Get quotes from FX providers
      console.log('[KeetaSwap] Getting quotes for:', fromCode, '->', toCode);
      const quotes = await fxClient.getQuotes({
        affinity: 'from',
        amount,
        from: fromCode,
        to: toCode,
      });
      
      console.log('[KeetaSwap] Quotes:', quotes);

      if (!quotes || quotes.length === 0) {
        return { success: false, error: 'No quotes available for this pair' };
      }

      const bestQuote = quotes[0];
      console.log('[KeetaSwap] Best quote:', bestQuote);

      // The quote should contain execution instructions
      if (bestQuote.execute && typeof bestQuote.execute === 'function') {
        const result = await bestQuote.execute();
        console.log('[KeetaSwap] Execute result:', result);
        return { success: true, txId: result?.id || result?.txId };
      }

      if (bestQuote.accept && typeof bestQuote.accept === 'function') {
        const result = await bestQuote.accept();
        console.log('[KeetaSwap] Accept result:', result);
        return { success: true, txId: result?.id || result?.txId };
      }

      // Log quote structure
      console.log('[KeetaSwap] Quote keys:', Object.keys(bestQuote));
      console.log('[KeetaSwap] Quote prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(bestQuote) || {}));

      return { 
        success: false, 
        error: 'Quote received but execution method not available' 
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
    anchorName,
    anchors: FX_ANCHORS,
    getEstimate,
    executeSwap,
    getExchangeStatus,
  };
}
