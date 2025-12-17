import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { useKeetaBalance } from "@/hooks/useKeetaBalance";
import { Loader2, CheckCircle, XCircle, Globe } from "lucide-react";
import { toast } from "sonner";

const Connect = () => {
  const { isConnected, publicKey, network } = useKeetaWallet();
  const { balance } = useKeetaBalance();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    checkPendingRequest();
  }, []);

  const checkPendingRequest = async () => {
    try {
      console.log('[Connect] Checking for pending connection request...');
      const result = await chrome.storage.local.get(['pending_connection', 'pending_origin']);
      console.log('[Connect] Pending request:', result);
      
      if (result.pending_connection && result.pending_origin) {
        setOrigin(result.pending_origin);
        setLoading(false);
      } else {
        console.warn('[Connect] No pending connection found');
        toast.error("No pending connection request");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error('[Connect] Error checking pending request:', error);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!isConnected || !publicKey) {
      toast.error("Please connect your Keeta wallet first");
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      console.log('[Connect] Approving connection for:', origin);
      
      // Get existing connected sites
      const result = await chrome.storage.local.get(['connected_sites']);
      const connectedSites = result.connected_sites || [];
      
      // Add this site if not already connected
      const existingSite = connectedSites.find((site: any) => site.origin === origin);
      if (!existingSite) {
        connectedSites.push({
          origin: origin,
          publicKey: publicKey,
          connectedAt: Date.now(),
          lastUsed: Date.now()
        });
      } else {
        // Update last used time and public key
        existingSite.lastUsed = Date.now();
        existingSite.publicKey = publicKey;
      }

      // Store wallet connection and connected sites
      await chrome.storage.local.set({
        keeta_wallet_connected: true,
        keeta_public_key: publicKey,
        keeta_balance: balance,
        keeta_network: network,
        connected_sites: connectedSites,
        pending_connection: false,
        pending_origin: null,
        popup_window_id: null
      });

      console.log('[Connect] Connection approved! Updated storage:', {
        connectedSites,
        publicKey,
        network
      });

      setApproved(true);
      toast.success("Connection approved!");

      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error) {
      console.error('[Connect] Error approving connection:', error);
      toast.error("Failed to approve connection");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);

    try {
      console.log('[Connect] Rejecting connection for:', origin);
      
      // Clear pending request
      await chrome.storage.local.set({
        pending_connection: false,
        pending_origin: null,
        popup_window_id: null
      });

      console.log('[Connect] Connection rejected');
      
      toast.error("Connection rejected");

      // Close popup
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error('[Connect] Error rejecting connection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !origin) {
    // Show loading while checking for pending request
    return (
      <div className="relative h-full flex flex-col items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 text-sw-blue animate-spin mx-auto mb-4" />
          <p className="text-sw-blue/60 font-mono text-sm">Checking connection request...</p>
        </div>
      </div>
    );
  }

  if (!origin) {
    // No pending request found
    return (
      <div className="relative h-full flex flex-col items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <XCircle className="w-12 h-12 text-sw-red mx-auto mb-4" />
          <p className="text-sw-red font-mono text-sm">No pending connection request</p>
          <p className="text-gray-400 font-mono text-xs mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <StarField />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <StarWarsPanel title="// CONNECTION REQUEST" className="w-full max-w-md">
          {approved ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-sw-green mx-auto mb-4" />
              <h3 className="text-xl font-display text-sw-green mb-2">
                Connection Approved
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
                  <Globe className="w-5 h-5 text-sw-blue" />
                  <span className="font-mono text-xs text-sw-blue/60 tracking-wider uppercase">
                    Website Request
                  </span>
                </div>
                <p className="font-mono text-sw-blue break-all">
                  {origin}
                </p>
              </div>

              {/* Wallet Info */}
              {isConnected && publicKey ? (
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Account:</span>
                    <span className="font-mono text-sm text-sw-yellow">
                      {publicKey.slice(0, 8)}...{publicKey.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Network:</span>
                    <span className="font-mono text-sm text-sw-blue">
                      {network === 'main' ? 'Keeta Mainnet' : 'Keeta Testnet'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Balance:</span>
                    <span className="font-mono text-sm text-sw-green">
                      {parseFloat(balance).toFixed(2)} KTA
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-sw-orange/10 border border-sw-orange/30 rounded">
                  <p className="text-sm text-sw-orange font-mono">
                    ⚠️ No wallet connected. Please connect your Keeta wallet first.
                  </p>
                </div>
              )}

              {/* Permissions */}
              <div className="mb-6 p-4 bg-black/30 border border-sw-blue/20 rounded">
                <p className="text-xs text-gray-400 mb-2">This site will be able to:</p>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-sw-blue">✓</span>
                    View your wallet address
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sw-blue">✓</span>
                    View your account balance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sw-blue">✓</span>
                    Request transaction approval
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 py-3 bg-transparent border border-sw-red/50 text-sw-red hover:bg-sw-red/10 font-display tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  REJECT
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading || !isConnected}
                  className="flex-1 py-3 bg-sw-green/20 border border-sw-green/50 text-sw-green hover:bg-sw-green/30 font-display tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  APPROVE
                </button>
              </div>
            </>
          )}
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default Connect;

