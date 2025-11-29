import { useState, useCallback } from 'react';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';

export interface BridgeNetwork {
  id: string;
  name: string;
  symbol: string;
  location: string;
  chainId?: number; // EVM chain ID for persistent address lookup
  color: string;
}

export const BRIDGE_NETWORKS: BridgeNetwork[] = [
  { 
    id: "keeta", 
    name: "Keeta L1", 
    symbol: "KTA", 
    location: "chain:keeta:21378",
    color: "sw-blue" 
  },
  { 
    id: "base", 
    name: "Base", 
    symbol: "KTA", 
    location: "chain:evm:8453",
    chainId: 8453,
    color: "sw-green" 
  },
];

interface BridgeState {
  isBridging: boolean;
  transferId: string | null;
  status: 'idle' | 'pending' | 'completed' | 'failed';
  error: string | null;
  persistentAddress: string | null;
}

interface BridgeResult {
  success: boolean;
  transferId?: string;
  instructions?: any[];
  error?: string;
  noProviders?: boolean;
}

export function useBridge() {
  const { client, isConnected, publicKey, checkingAccount } = useKeetaWallet();
  const [state, setState] = useState<BridgeState>({
    isBridging: false,
    transferId: null,
    status: 'idle',
    error: null,
    persistentAddress: null,
  });

  // Get the persistent address (EVM deposit address) for reverse bridging
  const getPersistentAddress = useCallback(async (evmChainId: number): Promise<string | null> => {
    if (!isConnected || !client) {
      console.log('[Bridge] Cannot get persistent address - wallet not connected');
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anchorModule: any = await import('@keetanetwork/anchor');
      console.log('[Bridge] Looking for persistent address method...');
      
      // Log all exports to find the persistent address method
      const moduleKeys = Object.keys(anchorModule || {});
      console.log('[Bridge] Anchor module exports:', moduleKeys);
      
      // Check for AssetMovement client
      const AssetMovementClient = 
        anchorModule?.AssetMovement?.Client 
        || anchorModule?.KeetaAssetMovementAnchorClient
        || anchorModule?.AssetMovementClient
        || anchorModule?.default?.AssetMovement?.Client
        || anchorModule?.default;

      if (AssetMovementClient) {
        const assetClient = new AssetMovementClient(client);
        console.log('[Bridge] AssetMovement client methods:', Object.keys(assetClient));
        console.log('[Bridge] AssetMovement client prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(assetClient)));
        
        // Try various method names for getting persistent address
        const methodNames = [
          'getPersistentAddress',
          'persistentAddress', 
          'getDepositAddress',
          'depositAddress',
          'getEvmAddress',
          'evmAddress',
          'getExternalAddress',
          'externalAddress'
        ];
        
        for (const methodName of methodNames) {
          if (typeof assetClient[methodName] === 'function') {
            console.log(`[Bridge] Found method: ${methodName}`);
            try {
              // Method signature: (account/publicKey, chainId) based on user info
              // Try with publicKey string first
              const address = await assetClient[methodName](publicKey, evmChainId);
              console.log(`[Bridge] ${methodName} returned:`, address);
              if (address) {
                setState(prev => ({ ...prev, persistentAddress: address }));
                return address;
              }
            } catch (methodErr) {
              console.log(`[Bridge] ${methodName} failed:`, methodErr);
            }
          }
        }

        // Also check if it's a property getter
        for (const methodName of methodNames) {
          if (assetClient[methodName] && typeof assetClient[methodName] !== 'function') {
            console.log(`[Bridge] Found property: ${methodName} =`, assetClient[methodName]);
          }
        }
      }

      // Also check if there's a static method on the module
      const staticMethods = ['getPersistentAddress', 'persistentAddress', 'getDepositAddress'];
      for (const methodName of staticMethods) {
        if (typeof anchorModule[methodName] === 'function') {
          console.log(`[Bridge] Found static method: ${methodName}`);
          try {
            const address = await anchorModule[methodName](publicKey, evmChainId);
            console.log(`[Bridge] Static ${methodName} returned:`, address);
            if (address) {
              setState(prev => ({ ...prev, persistentAddress: address }));
              return address;
            }
          } catch (staticErr) {
            console.log(`[Bridge] Static ${methodName} failed:`, staticErr);
          }
        }
      }

      console.log('[Bridge] Could not find persistent address method');
      return null;
    } catch (err) {
      console.error('[Bridge] Error getting persistent address:', err);
      return null;
    }
  }, [isConnected, client, publicKey]);

  const initiateBridge = useCallback(async (
    fromNetwork: BridgeNetwork,
    toNetwork: BridgeNetwork,
    amount: string,
    destinationAddress: string
  ): Promise<BridgeResult> => {
    if (!isConnected || !client || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    if (!destinationAddress.trim()) {
      return { success: false, error: 'Destination address required' };
    }

    setState(prev => ({ ...prev, isBridging: true, status: 'pending', error: null }));

    try {
      // Try to dynamically import the Keeta Anchor SDK
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let anchorModule: any = null;
      
      try {
        anchorModule = await import('@keetanetwork/anchor');
        console.log('[Bridge] Anchor SDK loaded successfully');
        const moduleKeys = Object.keys(anchorModule || {});
        console.log('[Bridge] All exports:', moduleKeys);
        
        // Log all exports with their types
        for (const key of moduleKeys) {
          const exportValue = anchorModule[key];
          console.log(`[Bridge] Export "${key}":`, typeof exportValue, exportValue);
          if (typeof exportValue === 'object' && exportValue && !Array.isArray(exportValue)) {
            const nestedKeys = Object.keys(exportValue);
            console.log(`[Bridge] Export "${key}" nested keys:`, nestedKeys);
            // Go one level deeper
            for (const nestedKey of nestedKeys.slice(0, 5)) {
              console.log(`[Bridge] Export "${key}.${nestedKey}":`, typeof exportValue[nestedKey]);
            }
          }
          if (typeof exportValue === 'function') {
            console.log(`[Bridge] Export "${key}" is a function/class, prototype:`, Object.keys(exportValue.prototype || {}));
          }
        }
      } catch (importErr) {
        console.error('[Bridge] Anchor SDK import failed:', importErr);
        setState(prev => ({ ...prev, isBridging: false, status: 'idle' }));
        return { 
          success: false, 
          error: 'Bridge SDK not available. Please use keeta.com/bridge for bridging.' 
        };
      }

      // Check for AssetMovement client in many possible patterns
      const AssetMovementClient = 
        anchorModule?.AssetMovement?.Client 
        || anchorModule?.KeetaAssetMovementAnchorClient
        || anchorModule?.AssetMovementClient
        || anchorModule?.AssetMovementAnchorClient
        || anchorModule?.AnchorClient
        || anchorModule?.BridgeClient
        || anchorModule?.Client
        || anchorModule?.default?.AssetMovement?.Client
        || anchorModule?.default?.AssetMovementClient
        || anchorModule?.default?.Client
        || anchorModule?.default
        || null;

      console.log('[Bridge] AssetMovementClient found:', !!AssetMovementClient, AssetMovementClient);

      // If we found something, try to use it
      if (!AssetMovementClient) {
        console.log('[Bridge] No matching client class found in SDK exports');
        setState(prev => ({ ...prev, isBridging: false, status: 'idle' }));
        return { 
          success: false, 
          error: 'Bridge SDK client not found. Please use keeta.com/bridge to bridge your KTA.' 
        };
      }

      // Get the base token (KTA) from the client for proper asset format
      const baseToken = client.baseToken;
      console.log('[Bridge] Using baseToken:', baseToken);
      console.log('[Bridge] Destination address:', destinationAddress);

      // Initialize the Asset Movement client
      const assetMovementClient = new AssetMovementClient(client);

      // Find providers that support this transfer route
      // Use baseToken directly as the asset (it has the proper SDK type)
      console.log('[Bridge] Calling getProvidersForTransfer with:', {
        from: fromNetwork.location,
        to: toNetwork.location,
        asset: baseToken
      });
      
      const providers = await assetMovementClient.getProvidersForTransfer({
        from: fromNetwork.location,
        to: toNetwork.location,
        asset: baseToken
      });

      console.log('[Bridge] Providers returned:', providers);
      console.log('[Bridge] Providers count:', providers?.length || 0);
      if (providers && providers.length > 0) {
        console.log('[Bridge] First provider:', providers[0]);
        console.log('[Bridge] Provider keys:', Object.keys(providers[0] || {}));
      }

      if (!providers || providers.length === 0) {
        setState(prev => ({ ...prev, isBridging: false, status: 'idle' }));
        return { 
          success: false, 
          error: 'Bridge route not yet available. The Keeta L1 ↔ Base bridge is coming soon. Visit keeta.com for updates.',
          noProviders: true
        };
      }

      // Use the first available provider
      const provider = providers[0];

      // Convert amount to smallest units (18 decimals for KTA)
      const valueInSmallestUnits = BigInt(Math.floor(amountValue * 1e18));

      // Initiate the transfer with user-provided destination address
      console.log('[Bridge] Calling initiateTransfer...');
      let transfer;
      try {
        transfer = await provider.initiateTransfer({
          value: valueInSmallestUnits,
          asset: baseToken,
          from: { location: fromNetwork.location },
          to: { 
            location: toNetwork.location,
            recipient: destinationAddress
          }
        });
      } catch (initError: any) {
        console.error('[Bridge] initiateTransfer error:', initError);
        throw new Error(`Failed to initiate transfer: ${initError.message || initError}`);
      }

      console.log('[Bridge] Transfer response:', transfer);
      console.log('[Bridge] Transfer keys:', Object.keys(transfer || {}));

      // The SDK wraps the response - actual data is in transfer.transfer
      const transferData = transfer?.transfer || transfer;
      console.log('[Bridge] Transfer data:', transferData);

      // Get transfer ID
      const transferId = transferData?.id || transferData?.transferId;
      
      // Get instructions from instructionChoices
      const instructions = transferData?.instructionChoices || transferData?.instructions || [];
      console.log('[Bridge] Instructions:', instructions);

      // Execute the transfer instructions if available
      if (instructions && instructions.length > 0) {
        console.log('[Bridge] Executing transfer instructions...');
        console.log('[Bridge] Full instruction data:', JSON.stringify(instructions, null, 2));
        
        for (const instruction of instructions) {
          console.log('[Bridge] Instruction:', instruction);
          console.log('[Bridge] Instruction keys:', Object.keys(instruction || {}));
          
          // Check if instruction has an execute method
          if (typeof instruction?.execute === 'function') {
            console.log('[Bridge] Using instruction.execute() method');
            try {
              const result = await instruction.execute();
              console.log('[Bridge] Execute result:', result);
              continue;
            } catch (execErr: any) {
              console.error('[Bridge] instruction.execute() failed:', execErr);
            }
          }
          
          // Check if provider has executeInstruction method
          if (typeof provider?.executeInstruction === 'function') {
            console.log('[Bridge] Using provider.executeInstruction() method');
            try {
              const result = await provider.executeInstruction(instruction);
              console.log('[Bridge] Provider execute result:', result);
              continue;
            } catch (provExecErr: any) {
              console.error('[Bridge] provider.executeInstruction() failed:', provExecErr);
            }
          }
          
          // Fallback: manual send for KEETA_SEND type
          if (instruction?.type === 'KEETA_SEND' && instruction?.sendToAddress) {
            try {
              // Use our calculated amount, not the instruction value (which may be wrong)
              const sendAmount = valueInSmallestUnits;
              console.log('[Bridge] Manual send to:', instruction.sendToAddress);
              console.log('[Bridge] Instruction value:', instruction?.value);
              console.log('[Bridge] Our calculated amount:', sendAmount.toString());
              console.log('[Bridge] External data (hex):', instruction?.external);
              
              // Load SDK to create account from address
              const KeetaNet = await import('@keetanetwork/keetanet-client');
              
              // Create recipient account from the bridge address
              const recipientAccount = KeetaNet.lib.Account.fromPublicKeyString(instruction.sendToAddress);
              console.log('[Bridge] Recipient account created');
              
              // Use the builder pattern for the transaction
              const builder = client.initBuilder();
              console.log('[Bridge] Builder initialized');
              
              // builder.send() accepts optional 4th param: external?: string (hex string)
              const externalHex = instruction?.external || undefined;
              console.log('[Bridge] Sending', sendAmount.toString(), 'with external data:', externalHex ? 'yes' : 'no');
              
              builder.send(
                recipientAccount, 
                sendAmount,  // Use our calculated amount
                client.baseToken, 
                externalHex
              );
              console.log('[Bridge] Send operation added with amount:', sendAmount.toString());
              
              // Compute transaction blocks
              const computed = await client.computeBuilderBlocks(builder);
              console.log('[Bridge] Blocks computed:', computed?.blocks?.length || 0);
              
              // Publish the transaction
              const transaction = await client.publishBuilder(builder);
              console.log('[Bridge] Transaction published:', transaction);
            } catch (sendError: any) {
              console.error('[Bridge] Send error:', sendError);
              throw new Error(`Failed to send to bridge: ${sendError.message || sendError}`);
            }
          }
        }
      } else {
        console.log('[Bridge] No instructions to execute');
      }

      setState(prev => ({ 
        ...prev, 
        isBridging: false, 
        transferId: transferId || null, 
        status: 'completed' 
      }));

      return { 
        success: true, 
        transferId: transferId,
        instructions: instructions
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
      persistentAddress: null,
    });
  }, []);

  return {
    ...state,
    initiateBridge,
    getPersistentAddress,
    reset,
    networks: BRIDGE_NETWORKS,
  };
}
