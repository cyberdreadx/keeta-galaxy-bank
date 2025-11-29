import { useState, useCallback } from 'react';

// FX Swap service is currently in development
// Will be enabled once FX resolver is deployed on mainnet

interface SwapEstimate {
  fromAmount: string;
  toAmount: string;
  rate: number;
  fee?: string;
}

export function useKeetaSwap() {
  const [isLoading] = useState(false);

  const getEstimate = useCallback(async (
    _fromToken: string,
    _toToken: string,
    _amount: string
  ): Promise<SwapEstimate | null> => {
    return null;
  }, []);

  const executeSwap = useCallback(async (
    _fromToken: string,
    _toToken: string,
    _amount: string,
    _minReceived?: string
  ): Promise<{ success: boolean; txId?: string; error?: string }> => {
    return { success: false, error: 'Swap service coming soon' };
  }, []);

  const getExchangeStatus = useCallback(async (_exchangeId: string) => {
    return null;
  }, []);

  return {
    isInitialized: true,
    isLoading,
    error: null,
    fxServiceAvailable: false,
    comingSoon: true,
    availableTokens: [],
    getEstimate,
    executeSwap,
    getExchangeStatus,
  };
}
