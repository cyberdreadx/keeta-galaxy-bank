import { useState, useEffect, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

const KEETA_API = {
  main: 'https://rep2.main.network.api.keeta.com/api',
  test: 'https://rep2.test.network.api.keeta.com/api',
};

export interface NFT {
  id: string;
  tokenAddress: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  supply: string;
  metadata: any;
}

interface AccountBalance {
  token: string;
  balance: string;
}

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  description: string;
  supply: string;
  decimals: number;
  metadata: any;
  isNFT: boolean;
}

async function fetchTokenInfo(tokenAddress: string, network: 'main' | 'test'): Promise<TokenInfo | null> {
  try {
    const response = await fetch(
      `${KEETA_API[network]}/node/ledger/accounts/${tokenAddress}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const accountData = Array.isArray(data) ? data[0] : data;
    const tokenInfo = accountData?.info || {};

    // Parse metadata if present
    let metadata = null;
    if (tokenInfo.metadata) {
      try {
        const metadataJson = atob(tokenInfo.metadata);
        metadata = JSON.parse(metadataJson);
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }

    // Convert hex supply to decimal string
    const supplyHex = tokenInfo.supply || '0x0';
    const supply = BigInt(supplyHex).toString();

    // Determine if NFT: supply of 1 with 0 decimals, or specific platform
    const isNFT = metadata?.platform === 'degen8bit' ||
                  (supply === '1' && (metadata?.decimalPlaces === 0 || !metadata?.decimalPlaces));

    return {
      address: tokenAddress,
      name: tokenInfo.name || 'Unknown Token',
      symbol: tokenInfo.symbol || tokenInfo.name || 'UNKNOWN',
      description: tokenInfo.description || '',
      supply,
      decimals: metadata?.decimalPlaces || metadata?.decimals || 0,
      metadata,
      isNFT
    };
  } catch (error) {
    console.error(`[useKeetaNFTs] Error fetching token info for ${tokenAddress}:`, error);
    return null;
  }
}

async function fetchAccountBalances(address: string, network: 'main' | 'test'): Promise<AccountBalance[]> {
  try {
    const response = await fetch(
      `${KEETA_API[network]}/node/ledger/accounts/${address}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const accountData = Array.isArray(data) ? data[0] : data;
    return accountData?.balances || [];
  } catch (error) {
    console.error('[useKeetaNFTs] Error fetching account balances:', error);
    return [];
  }
}

export function useKeetaNFTs() {
  const { isConnected, publicKey, network } = useKeetaWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!isConnected || !publicKey) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useKeetaNFTs] Fetching balances for:', publicKey, 'on', network);
      
      const balances = await fetchAccountBalances(publicKey, network);
      console.log('[useKeetaNFTs] Found', balances.length, 'token balances');

      // Filter out native token (KTA) and tokens with 0 balance
      const nonZeroTokens = balances.filter(b => {
        const balance = BigInt(b.balance);
        return balance > 0n;
      });

      console.log('[useKeetaNFTs] Non-zero balances:', nonZeroTokens.length);

      // Fetch token info for each balance to check if NFT
      const nftList: NFT[] = [];
      
      for (const balance of nonZeroTokens) {
        const tokenInfo = await fetchTokenInfo(balance.token, network);
        
        if (tokenInfo && tokenInfo.isNFT) {
          console.log('[useKeetaNFTs] Found NFT:', tokenInfo.name);
          
          // Extract image from metadata
          let image = '';
          if (tokenInfo.metadata) {
            image = tokenInfo.metadata.image || 
                    tokenInfo.metadata.imageUrl || 
                    tokenInfo.metadata.uri ||
                    '';
          }

          nftList.push({
            id: balance.token,
            tokenAddress: balance.token,
            name: tokenInfo.name,
            description: tokenInfo.description || tokenInfo.metadata?.description || '',
            image: image,
            collection: tokenInfo.metadata?.collection || tokenInfo.metadata?.platform || 'Unknown Collection',
            supply: tokenInfo.supply,
            metadata: tokenInfo.metadata
          });
        }
      }

      console.log('[useKeetaNFTs] Total NFTs found:', nftList.length);
      setNfts(nftList);
    } catch (err) {
      console.error('[useKeetaNFTs] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, publicKey, network]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return {
    nfts,
    isLoading,
    error,
    refetch: fetchNFTs
  };
}
