import { useEffect, useState } from 'react';
import { StarField } from '@/components/StarField';
import { StarWarsPanel } from '@/components/StarWarsPanel';
import { useBaseWallet } from '@/contexts/BaseWalletContext';
import { useBaseBalance } from '@/hooks/useBaseBalance';
import { useEthPrice } from '@/hooks/useEthPrice';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';

interface PendingTransaction {
  from?: string;
  to?: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
}

const ConfirmBaseTransaction = () => {
  const { signAndSendTransaction, address } = useBaseWallet();
  const { ethBalance } = useBaseBalance();
  const { ethPrice } = useEthPrice();
  const [origin, setOrigin] = useState<string>('Unknown');
  const [txParams, setTxParams] = useState<PendingTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const ethFiatValue = ethPrice ? parseFloat(ethBalance) * ethPrice : 0;

  useEffect(() => {
    const loadPendingTransaction = async () => {
      setLoading(true);
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const result = await chrome.storage.local.get(['pending_base_tx', 'pending_base_tx_origin']);
          console.log('[ConfirmBaseTransaction] Pending tx:', result);

          if (result.pending_base_tx) {
            setTxParams(result.pending_base_tx);
            setOrigin(result.pending_base_tx_origin || 'Unknown');
          } else {
            console.log('[ConfirmBaseTransaction] No pending transaction');
            toast.error('No pending transaction found');
            setTimeout(() => {
              window.close();
            }, 1500);
          }
        }
      } catch (error) {
        console.error('[ConfirmBaseTransaction] Error loading transaction:', error);
        toast.error('Failed to load transaction');
        setTimeout(() => {
          window.close();
        }, 1500);
      } finally {
        setLoading(false);
      }
    };
    loadPendingTransaction();
  }, []);

  const handleConfirm = async () => {
    if (!txParams) {
      toast.error('No transaction to confirm');
      return;
    }

    setProcessing(true);
    try {
      console.log('[ConfirmBaseTransaction] Signing transaction:', txParams);

      // Sign and send the transaction
      const txHash = await signAndSendTransaction(txParams as ethers.TransactionRequest);
      console.log('[ConfirmBaseTransaction] Transaction sent:', txHash);

      // Store result in chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          pending_base_tx: null,
          base_tx_result: txHash,
          base_tx_error: null,
        });
      }

      setConfirmed(true);
      toast.success('Transaction sent!');
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error: any) {
      console.error('[ConfirmBaseTransaction] Transaction failed:', error);
      toast.error(`Transaction failed: ${error.message}`);

      // Store error in chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          pending_base_tx: null,
          base_tx_result: null,
          base_tx_error: error.message || 'Transaction failed',
        });
      }

      setTimeout(() => {
        window.close();
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          pending_base_tx: null,
          base_tx_result: null,
          base_tx_error: 'User rejected transaction',
        });
      }
      toast.info('Transaction rejected');
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error: any) {
      console.error('[ConfirmBaseTransaction] Error rejecting:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center">
        <StarField />
        <Loader2 className="w-16 h-16 text-sw-blue animate-spin" />
        <p className="text-sw-blue/80 mt-4 font-mono text-sm">Loading transaction...</p>
      </div>
    );
  }

  if (!txParams) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center text-center p-4">
        <StarField />
        <XCircle className="w-16 h-16 text-sw-red mx-auto mb-4" />
        <h3 className="text-xl font-display text-sw-red mb-2">
          No Transaction Found
        </h3>
      </div>
    );
  }

  const txValue = txParams.value ? ethers.formatEther(txParams.value) : '0';
  const txValueUsd = parseFloat(txValue) * (ethPrice || 0);
  const isContractInteraction = txParams.data && txParams.data !== '0x';

  return (
    <div className="relative flex flex-col h-full">
      <StarField />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <StarWarsPanel title="// CONFIRM TRANSACTION" className="w-full max-w-md">
          {confirmed ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-sw-green mx-auto mb-4" />
              <h3 className="text-xl font-display text-sw-green mb-2">
                Transaction Sent
              </h3>
              <p className="text-sm text-gray-400">
                Your transaction has been broadcast to Base network
              </p>
            </div>
          ) : (
            <>
              {/* Origin */}
              <div className="mb-4 p-3 bg-sw-blue/10 border border-sw-blue/30 rounded">
                <p className="text-xs text-gray-400 mb-1">Requesting dApp:</p>
                <p className="font-mono text-sm text-sw-blue break-all">{origin}</p>
              </div>

              {/* Transaction Type */}
              <div className="mb-4 flex items-center gap-2 justify-center">
                <Send className="w-5 h-5 text-sw-yellow" />
                <span className="font-display text-lg text-sw-yellow tracking-wider">
                  {isContractInteraction ? 'CONTRACT INTERACTION' : 'SEND ETH'}
                </span>
              </div>

              {/* Transaction Details */}
              <div className="mb-4 space-y-3">
                {/* From */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">From:</span>
                  <span className="font-mono text-sm text-sw-blue">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
                  </span>
                </div>

                {/* To */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">To:</span>
                  <span className="font-mono text-sm text-sw-blue">
                    {txParams.to ? `${txParams.to.slice(0, 6)}...${txParams.to.slice(-4)}` : 'Contract Creation'}
                  </span>
                </div>

                {/* Value */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Amount:</span>
                  <div className="text-right">
                    <p className="font-mono text-lg text-sw-yellow">
                      {txValue} ETH
                    </p>
                    {ethPrice && (
                      <p className="font-mono text-xs text-sw-blue/60">
                        ≈ ${txValueUsd.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Network */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Network:</span>
                  <span className="font-mono text-sm text-sw-green">
                    BASE MAINNET
                  </span>
                </div>

                {/* Gas (if provided) */}
                {(txParams.gas || txParams.gasPrice || txParams.maxFeePerGas) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Gas Limit:</span>
                    <span className="font-mono text-sm text-sw-blue/80">
                      {txParams.gas ? parseInt(txParams.gas, 16).toLocaleString() : 'Auto'}
                    </span>
                  </div>
                )}
              </div>

              {/* Contract Interaction Warning */}
              {isContractInteraction && (
                <div className="mb-4 p-3 bg-sw-orange/10 border border-sw-orange/30 rounded flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-sw-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-sw-orange font-semibold mb-1">
                      Contract Interaction
                    </p>
                    <p className="text-xs text-gray-400">
                      This transaction will interact with a smart contract. Make sure you trust this dApp.
                    </p>
                  </div>
                </div>
              )}

              {/* Balance Info */}
              <div className="mb-6 p-3 bg-black/30 border border-sw-blue/20 rounded">
                <p className="text-xs text-gray-400 mb-2">Your Balance:</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-sw-blue">
                    {parseFloat(ethBalance).toFixed(4)} ETH
                  </span>
                  <span className="font-mono text-xs text-gray-400">
                    ≈ ${ethFiatValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 py-3 bg-transparent border border-sw-red/50 text-sw-red hover:bg-sw-red/10 font-display tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  REJECT
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex-1 py-3 bg-sw-green/20 border border-sw-green/50 text-sw-green hover:bg-sw-green/30 font-display tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  CONFIRM
                </button>
              </div>
            </>
          )}
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default ConfirmBaseTransaction;

