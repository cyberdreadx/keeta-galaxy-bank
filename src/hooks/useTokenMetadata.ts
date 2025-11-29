import { useState, useEffect, useCallback } from 'react';
import pako from 'pako';

interface TokenMetadata {
  name: string;
  symbol: string;
  supply: string;
  decimalPlaces: number;
  accessMode: string;
  defaultPermissions: string;
  logoURI?: string;
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
      console.log('[useTokenMetadata] Raw API data:', JSON.stringify(data.info, null, 2));
      
      // Default metadata
      let parsedMetadata: TokenMetadata = {
        name: '',
        symbol: '',
        supply: '0',
        decimalPlaces: 18,
        accessMode: 'PUBLIC',
        defaultPermissions: 'ACCESS',
      };

      // First check info fields at top level
      // info.name contains the symbol (e.g., "MURF")
      // info.description contains the full name (e.g., "Murphy")
      if (data.info) {
        // Symbol is in info.name
        if (data.info.name) {
          parsedMetadata.symbol = data.info.name;
        }
        // Name is in info.description
        if (data.info.description) {
          parsedMetadata.name = data.info.description;
        }
      }

      // Parse the compressed/base64 metadata for other fields
      if (data.info?.metadata) {
        try {
          const metadataStr = data.info.metadata;
          
          // Decode base64 first
          const binaryStr = atob(metadataStr);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          
          let jsonStr: string;
          
          // Check if it's zlib compressed (starts with 0x78)
          if (bytes[0] === 0x78) {
            jsonStr = pako.inflate(bytes, { to: 'string' });
          } else {
            jsonStr = new TextDecoder().decode(bytes);
          }
          
          const parsed = JSON.parse(jsonStr);
          console.log('[useTokenMetadata] Parsed metadata JSON:', parsed);
          
          // Get decimals and other fields from metadata
          if (parsed.decimalPlaces !== undefined) {
            parsedMetadata.decimalPlaces = parsed.decimalPlaces;
          }
          if (parsed.DecimalPlaces !== undefined) {
            parsedMetadata.decimalPlaces = parsed.DecimalPlaces;
          }
          if (parsed.supply) {
            parsedMetadata.supply = String(parsed.supply);
          }
          if (parsed.accessMode) {
            parsedMetadata.accessMode = parsed.accessMode;
          }
          if (parsed.defaultPermissions) {
            parsedMetadata.defaultPermissions = parsed.defaultPermissions;
          }
          if (parsed.logoURI) {
            parsedMetadata.logoURI = parsed.logoURI;
          }
          
          // If name/symbol are in metadata, use them (some tokens might have it there)
          if (parsed.name && !parsedMetadata.name) {
            parsedMetadata.name = parsed.name;
          }
          if (parsed.symbol && !parsedMetadata.symbol) {
            parsedMetadata.symbol = parsed.symbol;
          }
        } catch (parseErr) {
          console.warn('[useTokenMetadata] Could not parse metadata:', parseErr);
        }
      }

      // Fallback: if still no name, use symbol
      if (!parsedMetadata.name && parsedMetadata.symbol) {
        parsedMetadata.name = parsedMetadata.symbol;
      }
      // Fallback: if still no symbol, use truncated address
      if (!parsedMetadata.symbol) {
        parsedMetadata.symbol = tokenAddress.substring(0, 10) + '...';
      }
      if (!parsedMetadata.name) {
        parsedMetadata.name = parsedMetadata.symbol;
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
