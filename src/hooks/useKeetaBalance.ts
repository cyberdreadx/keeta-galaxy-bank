import { useState, useEffect, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  rawBalance: string;
  decimals: number;
}

interface KeetaBalance {
  balance: number;
  allTokens: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Known token addresses to symbols mapping for Keeta network
const TOKEN_MAP: Record<string, { symbol: string; decimals: number; name: string }> = {
  'keeta_anqdilpazdekdu4acw65fj7smltcp26wbrildkqtszqvverljpwpezmd44ssg': { symbol: 'KTA', decimals: 18, name: 'Keeta' },
  'keeta_amnkge74xitii5dsobstldatv3irmyimujfjotftx7plaaaseam4bntb7wnna': { symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  'keeta_apblhar4ncp3ln62wrygsn73pt3houuvj7ic47aarnolpcu67oqn4xqcji3au': { symbol: 'EURC', decimals: 6, name: 'Euro Coin' },
  'keeta_apyez4az5r6shtblf3qtzirmikq3tghb5svrmmrltdkxgnnzzhlstby3cuscc': { symbol: 'cbBTC', decimals: 8, name: 'Coinbase BTC' },
  // Tokens from user's wallet
  'keeta_anin2xcn2ijmhezrmrzyoabztxc5kq43n3ftr4bziw2unvg46dvncqkbbpc72': { symbol: 'KCHAD', decimals: 18, name: 'KeetaChad' },
  'keeta_ap46alqluwcixrc4eoi7b5pfsyin27cjzzvimn3dnsmwy6tdt6musnpqjbz6q': { symbol: 'KRT', decimals: 8, name: 'Kreet' },
  'keeta_ao7nitutebhm2pkrfbtniepivaw324hecyb43wsxts5rrhi2p5ckgof37racm': { symbol: 'MURF', decimals: 0, name: 'Murphy' },
  // Alpaca ecosystem tokens - PACA and NDA addresses corrected
  'keeta_ao55q4okjv4hrbo7z7zl3hivrf64og3fpokup5hvt2wfejim5mxzxcykboc3w': { symbol: 'PACA', decimals: 18, name: 'Alpaca' },
  'keeta_anzh4zo46vch2m2eb7gibttshj2swioe2nbrlsd7dy2bezdysb6tprofk4e5m': { symbol: 'NDA', decimals: 18, name: 'NDA' },
  'keeta_aoa7ejcq5g7u22zxs5rvxcwdukxyfltred4ddfpuec54slwmw7dpi5dxg55ak': { symbol: 'AKTA', decimals: 18, name: 'Alpaca KTA' },
  'keeta_amlgmfaobrh57frim75dme2us36q2yn45oyhdhmwf4a2e4qynxefesgoslht4': { symbol: 'KTARD', decimals: 18, name: 'KTARD' },
  'keeta_ap2l475td7qfntmwfh4ukkkb2ix6rvkvfpsdmoxzgyuckbrnnq5cq6xn2knka': { symbol: 'DRINK', decimals: 18, name: 'Drink' },
  'keeta_amk3yp4homezxzsa6q4dbzrcxtsbrwx3zrtvx5uvxps4mj5jq54v5mgornbb4': { symbol: 'SPIT', decimals: 18, name: 'Spit' },
  'keeta_an7olqkoktcbyelprqj7uxwviztcsva6y3trmbl4t6gfe2duatzzyp3aponla': { symbol: 'ERIC', decimals: 18, name: 'Eric' },
  'keeta_anke4cn3qzjzfuk32eox67urm4aolmnupg7fo4migsjob5sxmpof4zksbjeq2': { symbol: 'SOON', decimals: 18, name: 'Soon' },
  'keeta_am7dmy4bnr377napd4de73a65t5smeei3squcnrehrpmhbooqw7zq4h3n4yvu': { symbol: 'KWIF', decimals: 18, name: 'Kwif' },
};

// KTA decimals: testnet=9, mainnet=18
const getKtaDecimals = (network: 'test' | 'main'): number => {
  return network === 'main' ? 18 : 9;
};

export const useKeetaBalance = (): KeetaBalance => {
  const { client, isConnected, network } = useKeetaWallet();
  const [balance, setBalance] = useState<number>(0);
  const [allTokens, setAllTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!client || !isConnected) {
      setBalance(0);
      setAllTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all balances from the client
      const allBalances = await client.allBalances();
      console.log('[useKeetaBalance] Raw allBalances:', allBalances);

      if (!allBalances || Object.keys(allBalances).length === 0) {
        console.log('[useKeetaBalance] No balances found');
        setBalance(0);
        setAllTokens([]);
        return;
      }

      // Get the base token address (KTA) from the client
      const baseTokenAddr = client.baseToken.publicKeyString.toString();
      console.log('[useKeetaBalance] Base token address:', baseTokenAddr);

      // Process all balances
      let ktaBalance = BigInt(0);
      const tokens: TokenBalance[] = [];

      for (const [tokenId, balanceData] of Object.entries(allBalances)) {
        // Parse the balance data (handles bigint serialization)
        const tokenInfo = JSON.parse(
          JSON.stringify(balanceData, (k: string, v: any) => 
            typeof v === 'bigint' ? v.toString() : v
          )
        );
        const tokenAddr = String(tokenInfo.token || '');
        const balStr = String(tokenInfo.balance || '0');
        const rawBalance = BigInt(balStr);

        // Skip zero balances
        if (rawBalance === BigInt(0)) continue;

        // Get token info from mapping or use defaults
        const tokenMeta = TOKEN_MAP[tokenAddr] || { 
          symbol: tokenAddr.substring(0, 10) + '...', 
          decimals: 18,
          name: tokenAddr.substring(0, 10) + '...'
        };

        const divisor = Math.pow(10, tokenMeta.decimals);
        const balanceNum = Number(rawBalance) / divisor;

        tokens.push({
          address: tokenAddr,
          symbol: tokenMeta.symbol,
          name: tokenMeta.name,
          balance: balanceNum,
          rawBalance: balStr,
          decimals: tokenMeta.decimals,
        });

        // Track KTA balance separately
        if (tokenAddr === baseTokenAddr) {
          ktaBalance = rawBalance;
          console.log('[useKeetaBalance] Found KTA balance:', balStr);
        }
      }

      // Sort tokens: KTA first, then by balance
      tokens.sort((a, b) => {
        if (a.symbol === 'KTA') return -1;
        if (b.symbol === 'KTA') return 1;
        return b.balance - a.balance;
      });

      // Convert KTA using network-specific decimals
      const decimals = getKtaDecimals(network);
      const divisor = Math.pow(10, decimals);
      const balanceNum = Number(ktaBalance) / divisor;

      console.log('[useKeetaBalance] Final KTA balance:', balanceNum, 'decimals:', decimals);
      console.log('[useKeetaBalance] All tokens:', tokens);
      
      setBalance(balanceNum);
      setAllTokens(tokens);
    } catch (err: any) {
      console.error('[useKeetaBalance] Error fetching balance:', err);
      setError(err.message || 'Failed to fetch balance');
      setBalance(0);
      setAllTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [client, isConnected, network]);

  useEffect(() => {
    fetchBalance();
    
    // Poll for balance updates every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, allTokens, isLoading, error, refetch: fetchBalance };
};
