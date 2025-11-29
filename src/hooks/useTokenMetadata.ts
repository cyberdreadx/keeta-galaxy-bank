import { useState, useEffect, useCallback } from 'react';
import pako from 'pako';

interface TokenMetadata {
  name: string;
  symbol: string;
  supply: string;
  decimalPlaces: number;
  accessMode: string;
  defaultPermissions: string;
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
      console.log('[useTokenMetadata] Raw data:', data);
      
      // Default metadata
      let parsedMetadata: TokenMetadata = {
        name: 'Unknown',
        symbol: 'UNKNOWN',
        supply: '0',
        decimalPlaces: 0,
        accessMode: 'PUBLIC',
        defaultPermissions: 'ACCESS',
      };

      if (data.info?.metadata) {
        try {
          const metadataStr = data.info.metadata;
          console.log('[useTokenMetadata] Metadata string:', metadataStr.substring(0, 50));
          
          // Decode base64 first
          const binaryStr = atob(metadataStr);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          
          let jsonStr: string;
          
          // Check if it's zlib compressed (starts with 0x78)
          if (bytes[0] === 0x78) {
            // Compressed - decompress with pako
            console.log('[useTokenMetadata] Decompressing zlib data');
            jsonStr = pako.inflate(bytes, { to: 'string' });
          } else {
            // Not compressed - just decode as UTF-8
            console.log('[useTokenMetadata] Decoding as plain text');
            jsonStr = new TextDecoder().decode(bytes);
          }
          
          console.log('[useTokenMetadata] Parsed JSON string:', jsonStr.substring(0, 100));
          const parsed = JSON.parse(jsonStr);
          console.log('[useTokenMetadata] Parsed metadata:', parsed);
          
          parsedMetadata = {
            name: parsed.name || parsed.Name || 'Unknown',
            symbol: parsed.symbol || parsed.Symbol || 'UNKNOWN',
            supply: String(parsed.supply || parsed.Supply || '0'),
            decimalPlaces: parsed.decimalPlaces ?? parsed.DecimalPlaces ?? 0,
            accessMode: parsed.accessMode || parsed.AccessMode || 'PUBLIC',
            defaultPermissions: parsed.defaultPermissions || parsed.DefaultPermissions || 'ACCESS',
          };
        } catch (parseErr) {
          console.warn('[useTokenMetadata] Could not parse metadata:', parseErr);
        }
      }

      // Also check for direct info fields as fallback
      if (data.info?.name && parsedMetadata.name === 'Unknown') {
        parsedMetadata.name = data.info.name;
      }
      if (data.info?.description) {
        // Sometimes name is in description
        const desc = data.info.description;
        if (desc && parsedMetadata.name === 'Unknown') {
          parsedMetadata.name = desc;
        }
      }

      console.log('[useTokenMetadata] Final metadata:', parsedMetadata);
      
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
