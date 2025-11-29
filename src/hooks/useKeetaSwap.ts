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
  default: {
    name: 'Keeta Network',
    publicKey: null, // Uses Network account as default resolver
    description: 'General token swaps',
  },
  alpaca: {
    name: 'Alpaca DEX',
    publicKey: 'keeta_aabyuc4ce7n7n7gyjbcszpxlawujaacpu2wj72fljjjhhhyf25xmj66gand2ori',
    description: 'Alpaca ecosystem tokens ($PACA, $NDA, $AKTA, etc.)',
  },
  murf: {
    name: 'Murf',
    publicKey: 'keeta_athqkb6yw6h2e436xxaakuy4bctrqkqfctvy5xsp3ugvb3avv56zruxjcxauq',
    description: 'Murphy FX services',
  },
};

// Default to Network account resolver
const DEFAULT_ANCHOR = 'default';

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
        console.log('[KeetaSwap] Using FX Anchor:', anchor.name, anchor.publicKey || '(Network default)');

        // Create FX Client - with or without root depending on anchor
        if ((Anchor as any).FX?.Client) {
          try {
            let fxClientInstance;
            
            if (anchor.publicKey) {
              // Use specific anchor as root
              const resolverAccount = KeetaNet.lib.Account.fromPublicKeyString(anchor.publicKey);
              console.log('[KeetaSwap] Resolver account created');
              fxClientInstance = new (Anchor as any).FX.Client(client, { 
                root: resolverAccount 
              });
            } else {
              // Use default Network account resolver (no root option)
              console.log('[KeetaSwap] Using default Network resolver');
              fxClientInstance = new (Anchor as any).FX.Client(client);
            }
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
              
              // Helper to extract string symbol from various formats
              const extractSymbol = (val: any): string | null => {
                if (typeof val === 'string') return val.replace('$', '');
                if (val?.currency && typeof val.currency === 'string') return val.currency.replace('$', '');
                if (val?.symbol && typeof val.symbol === 'string') return val.symbol.replace('$', '');
                if (val?.currencyCode && typeof val.currencyCode === 'string') return val.currencyCode.replace('$', '');
                return null;
              };
              
              if (tokenList.length > 0) {
                const mappedTokens = tokenList
                  .map((t: any) => {
                    const sym = extractSymbol(t);
                    if (!sym) return null;
                    return {
                      symbol: sym,
                      name: t?.name || sym,
                      address: t?.token || t?.address || t?.publicKey,
                    };
                  })
                  .filter((t: any): t is NonNullable<typeof t> => t !== null);
                console.log('[KeetaSwap] Mapped tokens:', mappedTokens);
                setAvailableTokens(mappedTokens);
              } else if (conversions && conversions.length > 0) {
                // Build token list from conversions
                const tokens = new Set<string>();
                tokens.add('KTA');
                conversions.forEach((c: any) => {
                  const sym = extractSymbol(c) || extractSymbol(c?.to);
                  if (sym && sym !== '[object Object]') tokens.add(sym);
                });
                console.log('[KeetaSwap] Extracted tokens from conversions:', Array.from(tokens));
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

  // Convert decimal amount to base units (18 decimals for KTA)
  const toBaseUnits = (amount: string, decimals: number = 18): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    const baseUnits = BigInt(Math.floor(num * Math.pow(10, decimals)));
    return baseUnits.toString();
  };

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
      
      // Convert to base units (integer string)
      const amountInBaseUnits = toBaseUnits(amount);
      
      console.log('[KeetaSwap] Getting estimate for:', fromCode, '->', toCode, 'amount:', amountInBaseUnits);
      
      const estimates = await fxClient.getEstimates({
        affinity: 'from',
        amount: amountInBaseUnits,
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

      // Convert to base units
      const amountInBaseUnits = toBaseUnits(amount);

      // Get quotes from FX providers
      console.log('[KeetaSwap] Getting quotes for:', fromCode, '->', toCode, 'amount:', amountInBaseUnits);
      const quotes = await fxClient.getQuotes({
        affinity: 'from',
        amount: amountInBaseUnits,
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
