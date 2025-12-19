import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { Loader2, CheckCircle, XCircle, Send, AlertTriangle, Coins } from "lucide-react";
import { toast } from "sonner";

interface TransactionParams {
  to: string;
  amount: string;
  token?: string; // Token address for NFT/token transfers
  isTokenTransfer?: boolean; // Flag to indicate token transfer
}

interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
}

const ConfirmTransaction = () => {
  const { isConnected, publicKey, client, sendToken, network } = useKeetaWallet();
  const { balance: ktaBalance, isLoading: isLoadingBalance } = useKeetaBalance();
  const navigate = useNavigate();
  const [txParams, setTxParams] = useState<TransactionParams | null>(null);
  const [origin, setOrigin] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    checkPendingTransaction();
  }, []);

  // Fetch token metadata when txParams changes
  useEffect(() => {
    if (txParams?.isTokenTransfer && txParams.token) {
      fetchTokenMetadata(txParams.token);
    }
  }, [txParams]);

  const fetchTokenMetadata = async (tokenAddress: string) => {
    setLoadingMetadata(true);
    try {
      const apiUrl = network === 'main' 
        ? 'https://rep1.main.network.api.keeta.com'
        : 'https://rep1.test.network.api.keeta.com';
      
      const response = await fetch(`${apiUrl}/api/node/ledger/account/${tokenAddress}`);
      if (!response.ok) throw new Error('Failed to fetch token metadata');

      const data = await response.json();
      const info = data.info || {};
      
      const symbol = info.name || tokenAddress.substring(0, 8) + '...';
      const name = info.description || symbol;
      
      setTokenMetadata({ symbol, name, decimals: 0 });
      console.log('[ConfirmTx] Token metadata:', { symbol, name });
    } catch (error) {
      console.error('[ConfirmTx] Failed to fetch token metadata:', error);
      // Fallback to showing generic label
      setTokenMetadata(null);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const checkPendingTransaction = async () => {
    try {
      console.log('[ConfirmTx] Checking for pending transaction...');
      const result = await chrome.storage.local.get(['pending_tx', 'pending_tx_origin']);
      console.log('[ConfirmTx] Pending transaction:', result);
      
      if (result.pending_tx) {
        setTxParams(result.pending_tx);
        setOrigin(result.pending_tx_origin || 'Unknown website');
        setLoading(false);
      } else {
        console.warn('[ConfirmTx] No pending transaction found');
        toast.error("No pending transaction");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error('[ConfirmTx] Error checking pending transaction:', error);
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!isConnected || !publicKey || !client || !txParams) {
      toast.error("Wallet not connected");
      navigate("/");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('[ConfirmTx] Sending transaction:', txParams);
      
      let txHash: string;
      
      // Check if this is a token/NFT transfer
      if (txParams.isTokenTransfer && txParams.token) {
        console.log('[ConfirmTx] Sending token transfer...');
        txHash = await sendToken(txParams.to, txParams.amount, txParams.token);
      } else {
        // Regular KTA transfer
        console.log('[ConfirmTx] Sending KTA transfer...');
        const result = await client.send(
          txParams.to,
          parseFloat(txParams.amount)
        );
        txHash = result.hash || result.txid || 'success';
      }
      
      console.log('[ConfirmTx] Transaction successful:', txHash);
      
      // Clear pending transaction and store result
      await chrome.storage.local.set({
        pending_tx: null,
        pending_tx_origin: null,
        tx_result: txHash,
        tx_error: null
      });
      
      setConfirmed(true);
      toast.success("Transaction confirmed!");
      
      // Close popup
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error: any) {
      console.error('[ConfirmTx] Transaction failed:', error);
      
      // Store error
      await chrome.storage.local.set({
        pending_tx: null,
        pending_tx_origin: null,
        tx_result: null,
        tx_error: error.message || 'Transaction failed'
      });
      
      toast.error(`Transaction failed: ${error.message}`);
      
      setTimeout(() => {
        window.close();
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);

    try {
      console.log('[ConfirmTx] Transaction rejected');
      
      // Clear pending transaction and store error
      await chrome.storage.local.set({
        pending_tx: null,
        pending_tx_origin: null,
        tx_result: null,
        tx_error: 'User rejected transaction'
      });
      
      toast.info("Transaction rejected");

      // Close popup
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error('[ConfirmTx] Error rejecting transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && !txParams) {
    return (
      <div className="relative h-full flex flex-col items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 text-sw-blue animate-spin mx-auto mb-4" />
          <p className="text-sw-blue/60 font-mono text-sm">Checking transaction...</p>
        </div>
      </div>
    );
  }

  if (!txParams) {
    return (
      <div className="relative h-full flex flex-col items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <XCircle className="w-12 h-12 text-sw-red mx-auto mb-4" />
          <p className="text-sw-red font-mono text-sm">No pending transaction</p>
          <p className="text-gray-400 font-mono text-xs mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  const amountNum = parseFloat(txParams.amount);
  // Only check insufficient funds for KTA transfers (not token/NFT transfers)
  const insufficientFunds = !txParams.isTokenTransfer && amountNum > ktaBalance;

  return (
    <div className="relative flex flex-col h-full">
      <StarField />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <StarWarsPanel title="// CONFIRM TRANSACTION" className="w-full max-w-md">
          {confirmed ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-sw-green mx-auto mb-4" />
              <h3 className="text-xl font-display text-sw-green mb-2">
                Transaction Confirmed
              </h3>
              <p className="text-sm text-gray-400">
                You can now close this window
              </p>
            </div>
          ) : (
            <>
              {/* Origin Display */}
              <div className="mb-6 p-4 bg-sw-blue/10 border border-sw-blue/30 rounded">
                <div className="flex items-center gap-3 mb-2">
                  <Send className="w-5 h-5 text-sw-blue" />
                  <span className="font-mono text-xs text-sw-blue/60 tracking-wider uppercase">
                    Transaction Request
                  </span>
                </div>
                <p className="font-mono text-sw-blue break-all">
                  {origin}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="mb-6 space-y-3">
                {/* Token/NFT Transfer Indicator */}
                {txParams.isTokenTransfer && (
                  <div className="p-3 bg-sw-blue/10 border border-sw-blue/30 rounded flex items-center gap-2">
                    <Coins className="w-5 h-5 text-sw-blue" />
                    <span className="font-mono text-xs text-sw-blue tracking-wider">
                      {txParams.amount === "1" ? "NFT TRANSFER" : "TOKEN TRANSFER"}
                    </span>
                  </div>
                )}
                
                <div className="p-4 bg-black/30 border border-sw-yellow/20 rounded">
                  <p className="text-xs text-gray-400 mb-1">Recipient:</p>
                  <p className="font-mono text-sm text-sw-yellow break-all">
                    {txParams.to}
                  </p>
                </div>
                
                <div className="p-4 bg-black/30 border border-sw-yellow/20 rounded">
                  <p className="text-xs text-gray-400 mb-1">Amount:</p>
                  <p className="font-mono text-2xl font-bold text-sw-yellow">
                    {txParams.amount} {
                      txParams.isTokenTransfer 
                        ? (loadingMetadata 
                            ? "..." 
                            : (tokenMetadata?.symbol || (txParams.amount === "1" ? "NFT" : "TOKENS"))
                          )
                        : "KTA"
                    }
                  </p>
                </div>
                
                {/* Show token info for token transfers */}
                {txParams.isTokenTransfer && txParams.token && (
                  <div className="p-4 bg-black/30 border border-sw-blue/20 rounded">
                    {tokenMetadata && !loadingMetadata ? (
                      <>
                        <p className="text-xs text-gray-400 mb-1">Token:</p>
                        <p className="font-mono text-sm text-sw-blue font-bold mb-2">
                          {tokenMetadata.symbol} - {tokenMetadata.name}
                        </p>
                        <p className="font-mono text-xs text-sw-blue/50 break-all">
                          {txParams.token}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400 mb-1">Token Address:</p>
                        <p className="font-mono text-xs text-sw-blue break-all">
                          {loadingMetadata ? "Loading token info..." : txParams.token}
                        </p>
                      </>
                    )}
                  </div>
                )}
                
                {/* Only show KTA balance for KTA transfers */}
                {!txParams.isTokenTransfer && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Your Balance:</span>
                    <span className="font-mono text-sm text-sw-green">
                      {isLoadingBalance ? <Loader2 className="inline w-4 h-4 animate-spin" /> : `${ktaBalance.toFixed(4)} KTA`}
                    </span>
                  </div>
                )}
              </div>

              {/* Insufficient Funds Warning (only for KTA transfers) */}
              {insufficientFunds && (
                <div className="mb-6 p-4 bg-sw-red/10 border border-sw-red/30 rounded flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-sw-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-sw-red font-bold mb-1">Insufficient KTA Balance</p>
                    <p className="text-xs text-gray-400">
                      You don't have enough KTA to complete this transaction.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-transparent border border-sw-red/50 text-sw-red hover:bg-sw-red/10 font-display tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  REJECT
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing || !isConnected || insufficientFunds}
                  className="flex-1 py-3 bg-sw-green/20 border border-sw-green/50 text-sw-green hover:bg-sw-green/30 font-display tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
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

export default ConfirmTransaction;

