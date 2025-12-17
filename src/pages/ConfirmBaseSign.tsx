import { useEffect, useState } from 'react';
import { StarField } from '@/components/StarField';
import { StarWarsPanel } from '@/components/StarWarsPanel';
import { useBaseWallet } from '@/contexts/BaseWalletContext';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface PendingSignature {
  message: string;
  address: string;
  origin: string;
}

const ConfirmBaseSign = () => {
  const { signMessage, address } = useBaseWallet();
  const [signRequest, setSignRequest] = useState<PendingSignature | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const loadPendingSignature = async () => {
      setLoading(true);
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const result = await chrome.storage.local.get('pending_base_sign');
          console.log('[ConfirmBaseSign] Pending signature:', result);

          if (result.pending_base_sign) {
            setSignRequest(result.pending_base_sign);
          } else {
            console.log('[ConfirmBaseSign] No pending signature');
            toast.error('No pending signature found');
            setTimeout(() => {
              window.close();
            }, 1500);
          }
        }
      } catch (error) {
        console.error('[ConfirmBaseSign] Error loading signature:', error);
        toast.error('Failed to load signature request');
        setTimeout(() => {
          window.close();
        }, 1500);
      } finally {
        setLoading(false);
      }
    };
    loadPendingSignature();
  }, []);

  const handleConfirm = async () => {
    if (!signRequest) {
      toast.error('No signature request to confirm');
      return;
    }

    setProcessing(true);
    try {
      console.log('[ConfirmBaseSign] Signing message:', signRequest.message);

      // Sign the message
      const signature = await signMessage(signRequest.message);
      console.log('[ConfirmBaseSign] Message signed:', signature);

      // Store result in chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          pending_base_sign: null,
          base_sign_result: signature,
          base_sign_error: null,
        });
      }

      setConfirmed(true);
      toast.success('Message signed!');
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error: any) {
      console.error('[ConfirmBaseSign] Signing failed:', error);
      toast.error(`Signing failed: ${error.message}`);

      // Store error in chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          pending_base_sign: null,
          base_sign_result: null,
          base_sign_error: error.message || 'Signature failed',
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
          pending_base_sign: null,
          base_sign_result: null,
          base_sign_error: 'User rejected signature',
        });
      }
      toast.info('Signature rejected');
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error: any) {
      console.error('[ConfirmBaseSign] Error rejecting:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatMessage = (msg: string) => {
    // If it's hex, try to decode it
    if (msg.startsWith('0x')) {
      try {
        // Remove 0x prefix
        const hex = msg.slice(2);
        // Convert hex to string
        const str = decodeURIComponent(hex.replace(/[0-9a-f]{2}/g, '%$&'));
        // If it looks like readable text, show it
        if (/^[\x20-\x7E\s]+$/.test(str)) {
          return str;
        }
      } catch {
        // If decoding fails, show hex
      }
    }
    return msg;
  };

  if (loading) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center">
        <StarField />
        <Loader2 className="w-16 h-16 text-sw-blue animate-spin" />
        <p className="text-sw-blue/80 mt-4 font-mono text-sm">Loading signature request...</p>
      </div>
    );
  }

  if (!signRequest) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center text-center p-4">
        <StarField />
        <XCircle className="w-16 h-16 text-sw-red mx-auto mb-4" />
        <h3 className="text-xl font-display text-sw-red mb-2">
          No Signature Request Found
        </h3>
      </div>
    );
  }

  const displayMessage = formatMessage(signRequest.message);
  const isLongMessage = displayMessage.length > 100;

  return (
    <div className="relative flex flex-col h-full">
      <StarField />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <StarWarsPanel title="// SIGN MESSAGE" className="w-full max-w-md">
          {confirmed ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-sw-green mx-auto mb-4" />
              <h3 className="text-xl font-display text-sw-green mb-2">
                Message Signed
              </h3>
              <p className="text-sm text-gray-400">
                Your signature has been created
              </p>
            </div>
          ) : (
            <>
              {/* Origin */}
              <div className="mb-4 p-3 bg-sw-blue/10 border border-sw-blue/30 rounded">
                <p className="text-xs text-gray-400 mb-1">Requesting dApp:</p>
                <p className="font-mono text-sm text-sw-blue break-all">{signRequest.origin}</p>
              </div>

              {/* Sign Icon */}
              <div className="mb-4 flex items-center gap-2 justify-center">
                <Edit className="w-5 h-5 text-sw-yellow" />
                <span className="font-display text-lg text-sw-yellow tracking-wider">
                  SIGNATURE REQUEST
                </span>
              </div>

              {/* Message */}
              <div className="mb-4 p-4 bg-black/30 border border-sw-blue/20 rounded">
                <p className="text-xs text-gray-400 mb-2">Message to sign:</p>
                <div className={`font-mono text-sm text-sw-blue break-all ${isLongMessage ? 'max-h-48 overflow-y-auto' : ''}`}>
                  {displayMessage}
                </div>
              </div>

              {/* Account Info */}
              <div className="mb-4 p-3 bg-sw-blue/10 border border-sw-blue/30 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Signing with:</span>
                  <span className="font-mono text-sm text-sw-yellow">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">Network:</span>
                  <span className="font-mono text-sm text-sw-green">
                    BASE MAINNET
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="mb-6 p-3 bg-sw-orange/10 border border-sw-orange/30 rounded flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-sw-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-sw-orange font-semibold mb-1">
                    Sign with Caution
                  </p>
                  <p className="text-xs text-gray-400">
                    Only sign messages from websites you trust. Signatures can be used to authorize transactions or prove ownership.
                  </p>
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
                  SIGN
                </button>
              </div>
            </>
          )}
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default ConfirmBaseSign;

