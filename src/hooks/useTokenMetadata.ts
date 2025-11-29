import { useState, useEffect, useCallback } from 'react';

interface TokenMetadata {
  name: string;
  symbol: string;
  supply: string;
  decimalPlaces: number;
  accessMode: string;
  defaultPermissions: string;
  isLoading: boolean;
  error: string | null;
}

const metadataCache: Record<string, TokenMetadata> = {};

export const useTokenMetadata = (tokenAddress: string | null) => {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    if (!tokenAddress) {
      setMetadata(null);
      return;
    }

    // Check cache first
    if (metadataCache[tokenAddress]) {
      setMetadata(metadataCache[tokenAddress]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch token account data from Keeta API
      const response = await fetch(
        `https://rep1.main.network.api.keeta.com/api/node/ledger/account/${tokenAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }

      const data = await response.json();
      
      // Parse metadata from the info field
      let parsedMetadata: TokenMetadata = {
        name: 'Unknown',
        symbol: 'UNKNOWN',
        supply: '0',
        decimalPlaces: 0,
        accessMode: 'PUBLIC',
        defaultPermissions: 'ACCESS',
        isLoading: false,
        error: null,
      };

      if (data.info?.metadata) {
        try {
          // Metadata is base64 + compressed, need to decode
          const metadataStr = data.info.metadata;
          
          // Try to decode if it's a JSON string or parse compressed data
          if (metadataStr.startsWith('eJ')) {
            // Compressed data - decode base64 and decompress
            const binaryStr = atob(metadataStr);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            
            // Use pako for decompression if available, otherwise try to parse raw
            try {
              const pako = await import('pako');
              const decompressed = pako.inflate(bytes, { to: 'string' });
              const parsed = JSON.parse(decompressed);
              
              parsedMetadata = {
                name: parsed.name || parsed.Name || 'Unknown',
                symbol: parsed.symbol || parsed.Symbol || 'UNKNOWN',
                supply: parsed.supply || parsed.Supply || '0',
                decimalPlaces: parsed.decimalPlaces ?? parsed.DecimalPlaces ?? 0,
                accessMode: parsed.accessMode || parsed.AccessMode || 'PUBLIC',
                defaultPermissions: parsed.defaultPermissions || parsed.DefaultPermissions || 'ACCESS',
                isLoading: false,
                error: null,
              };
            } catch (decompressErr) {
              console.warn('[useTokenMetadata] Could not decompress metadata:', decompressErr);
            }
          } else {
            // Try direct JSON parse
            const parsed = JSON.parse(metadataStr);
            parsedMetadata = {
              name: parsed.name || 'Unknown',
              symbol: parsed.symbol || 'UNKNOWN',
              supply: parsed.supply || '0',
              decimalPlaces: parsed.decimalPlaces ?? 0,
              accessMode: parsed.accessMode || 'PUBLIC',
              defaultPermissions: parsed.defaultPermissions || 'ACCESS',
              isLoading: false,
              error: null,
            };
          }
        } catch (parseErr) {
          console.warn('[useTokenMetadata] Could not parse metadata:', parseErr);
        }
      }

      // Also check for direct fields
      if (data.info?.name) parsedMetadata.name = data.info.name;
      if (data.info?.symbol) parsedMetadata.symbol = data.info.symbol;

      // Cache the result
      metadataCache[tokenAddress] = parsedMetadata;
      setMetadata(parsedMetadata);
    } catch (err: any) {
      console.error('[useTokenMetadata] Error:', err);
      setError(err.message || 'Failed to fetch token metadata');
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return { metadata, isLoading, error, refetch: fetchMetadata };
};
