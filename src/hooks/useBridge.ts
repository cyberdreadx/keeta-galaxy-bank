import { useState, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

export interface BridgeNetwork {
  id: string;
  name: string;
  symbol: string;
  location: string;
  color: string;
}

export const BRIDGE_NETWORKS: BridgeNetwork[] = [
  { 
    id: "keeta", 
    name: "Keeta L1", 
    symbol: "KTA", 
    location: "keeta:l1",
    color: "sw-blue" 
  },
  { 
    id: "base", 
    name: "Base", 
    symbol: "KTA", 
    location: "evm:8453",
    color: "sw-green" 
  },
];

interface BridgeState {
  isBridging: boolean;
  transferId: string | null;
  status: 'idle' | 'pending' | 'completed' | 'failed';
  error: string | null;
}

interface BridgeResult {
  success: boolean;
  transferId?: string;
  instructions?: any[];
  error?: string;
}

export function useBridge() {
  const { client, isConnected, publicKey } = useKeetaWallet();
  const [state, setState] = useState<BridgeState>({
    isBridging: false,
    transferId: null,
    status: 'idle',
    error: null,
  });

  const initiateBridge = useCallback(async (
    fromNetwork: BridgeNetwork,
    toNetwork: BridgeNetwork,
    amount: string
  ): Promise<BridgeResult> => {
    if (!isConnected || !client || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    setState(prev => ({ ...prev, isBridging: true, status: 'pending', error: null }));

    try {
      // Try to dynamically import the Keeta Anchor SDK
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let anchorModule: any = null;
      
      try {
        anchorModule = await import('@keetanetwork/anchor');
      } catch (importErr) {
        console.warn('[Bridge] Anchor SDK not available:', importErr);
      }

      // Check for AssetMovement client in various export patterns
      const AssetMovementClient = anchorModule?.AssetMovement?.Client 
        || anchorModule?.KeetaAssetMovementAnchorClient
        || anchorModule?.AssetMovementClient
        || null;

      if (!AssetMovementClient) {
        // SDK structure not as expected - show info message
        console.log('[Bridge] Available exports:', Object.keys(anchorModule || {}));
        setState(prev => ({ ...prev, isBridging: false, status: 'idle' }));
        return { 
          success: false, 
          error: 'Bridge SDK integration in progress. Please visit keeta.com for bridging.' 
        };
      }

      // Initialize the Asset Movement client
      const assetMovementClient = new AssetMovementClient(client);

      // Find providers that support this transfer route
      const providers = await assetMovementClient.getProvidersForTransfer({
        from: { location: fromNetwork.location },
        to: { location: toNetwork.location },
        asset: { symbol: 'KTA' }
      });

      if (!providers || providers.length === 0) {
        setState(prev => ({ ...prev, isBridging: false, status: 'failed', error: 'No bridge providers available' }));
        return { success: false, error: 'No bridge providers available for this route' };
      }

      // Use the first available provider
      const provider = providers[0];

      // Convert amount to smallest units (9 decimals for KTA)
      const valueInSmallestUnits = BigInt(Math.floor(amountValue * 1e9));

      // Initiate the transfer
      const transfer = await provider.initiateTransfer({
        value: valueInSmallestUnits,
        asset: { symbol: 'KTA' },
        from: { location: fromNetwork.location },
        to: { 
          location: toNetwork.location,
          recipient: publicKey
        }
      });

      setState(prev => ({ 
        ...prev, 
        isBridging: false, 
        transferId: transfer.transferId, 
        status: 'completed' 
      }));

      return { 
        success: true, 
        transferId: transfer.transferId,
        instructions: transfer.instructions
      };
    } catch (err: any) {
      console.error('[Bridge] Error initiating transfer:', err);
      const errorMessage = err.message || 'Bridge transfer failed';
      setState(prev => ({ ...prev, isBridging: false, status: 'failed', error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [isConnected, client, publicKey]);

  const reset = useCallback(() => {
    setState({
      isBridging: false,
      transferId: null,
      status: 'idle',
      error: null,
    });
  }, []);

  return {
    ...state,
    initiateBridge,
    reset,
    networks: BRIDGE_NETWORKS,
  };
}
