import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '@/components/StarField';
import { StarWarsPanel } from '@/components/StarWarsPanel';
import { useBaseWallet } from '@/contexts/BaseWalletContext';
import { useBaseBalance } from '@/hooks/useBaseBalance';
import { useEthPrice } from '@/hooks/useEthPrice';
import { Loader2, CheckCircle, XCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectedSite {
  origin: string;
  address: string;
  connectedAt: number;
  lastUsed: number;
}

const ConnectBase = () => {
  const { isConnected, address } = useBaseWallet();
  const { ethBalance, isLoading: isLoadingBalance } = useBaseBalance();
  const { ethPrice } = useEthPrice();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  const ethFiatValue = ethPrice ? parseFloat(ethBalance) * ethPrice : 0;

  useEffect(() => {
    const checkPendingRequest = async () => {
      setLoading(true);
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const result = await chrome.storage.local.get(['pending_base_connection', 'pending_base_origin']);
          console.log('[ConnectBase] Pending request check result:', result);

          if (result.pending_base_connection && result.pending_base_origin) {
            setOrigin(result.pending_base_origin);
          } else {
            console.log('[ConnectBase] No pending connection, redirecting.');
            setTimeout(() => {
              navigate("/");
            }, 2000);
            return;
          }
        }
      } catch (error) {
        console.error('[ConnectBase] Error checking pending request:', error);
        toast.error("Error loading connection request.");
        setTimeout(() => {
          window.close();
        }, 1000);
      } finally {
        setLoading(false);
      }
    };
    checkPendingRequest();
  }, [navigate]);

  const handleApprove = async () => {
    if (!isConnected || !address || !origin) {
      toast.error("Please set up your Base wallet first in the main app.");
      return;
    }
    setLoading(true);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get('base_connected_sites');
        const connectedSites: ConnectedSite[] = result.base_connected_sites || [];

        const newSite: ConnectedSite = {
          origin,
          address,
          connectedAt: Date.now(),
          lastUsed: Date.now(),
        };

        const existingIndex = connectedSites.findIndex(site => site.origin === origin);
        if (existingIndex > -1) {
          connectedSites[existingIndex] = newSite;
        } else {
          connectedSites.push(newSite);
        }

        await chrome.storage.local.set({
          base_connected_sites: connectedSites,
          pending_base_connection: false,
          pending_base_origin: null,
        });
      }
      setApproved(true);
      toast.success("Base wallet connected!");
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to approve connection:", error);
      toast.error(`Failed to approve: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          pending_base_connection: false,
          pending_base_origin: null,
        });
      }
      toast.info("Connection rejected.");
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error: any) {
      console.error("Failed to reject connection:", error);
      toast.error(`Failed to reject: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center">
        <StarField />
        <Loader2 className="w-16 h-16 text-sw-blue animate-spin" />
        <p className="text-sw-blue/80 mt-4 font-mono text-sm">Loading Base connection request...</p>
      </div>
    );
  }

  if (!origin) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center text-center p-4">
        <StarField />
        <XCircle className="w-16 h-16 text-sw-red mx-auto mb-4" />
        <h3 className="text-xl font-display text-sw-red mb-2">
          No Pending Connection
        </h3>
        <p className="text-sm text-gray-400">
          This window will close automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <StarField />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <StarWarsPanel title="// BASE NETWORK CONNECTION" className="w-full max-w-md">
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
              <div className="mb-6 p-4 bg-sw-blue/10 border border-sw-blue/30 rounded">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-sw-blue" />
                  <span className="font-mono text-xs text-sw-blue/60 tracking-wider uppercase">
                    dApp Request
                  </span>
                </div>
                <p className="font-mono text-sw-blue break-all">
                  {origin}
                </p>
              </div>

              {isConnected && address ? (
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Wallet:</span>
                    <span className="font-mono text-sm text-sw-yellow">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Network:</span>
                    <span className="font-mono text-sm text-sw-green">
                      BASE MAINNET
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">ETH Balance:</span>
                    <span className="font-mono text-sm text-sw-yellow">
                      {isLoadingBalance ? (
                        <Loader2 className="inline w-4 h-4 animate-spin" />
                      ) : (
                        `${parseFloat(ethBalance).toFixed(4)} ETH`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">USD Value:</span>
                    <span className="font-mono text-sm text-sw-blue/80">
                      ≈ ${ethFiatValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-sw-orange/10 border border-sw-orange/30 rounded">
                  <p className="text-sm text-sw-orange font-mono">
                    ⚠️ No Base wallet connected. Please create or import a Base wallet first.
                  </p>
                  <button
                    onClick={() => {
                      navigate('/account');
                      window.close();
                    }}
                    className="mt-4 w-full px-6 py-3 bg-sw-blue/20 border border-sw-blue/50 hover:bg-sw-blue/30 text-sw-blue font-display font-bold tracking-widest transition-all"
                  >
                    SET UP BASE WALLET
                  </button>
                </div>
              )}

              <div className="mb-6 p-4 bg-black/30 border border-sw-blue/20 rounded">
                <p className="text-xs text-gray-400 mb-2">This dApp will be able to:</p>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-sw-blue">✓</span>
                    View your Base wallet address
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sw-blue">✓</span>
                    View your ETH and token balances
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sw-blue">✓</span>
                    Request transaction approval
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sw-orange">✗</span>
                    Cannot move funds without your approval
                  </li>
                </ul>
              </div>

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
                  CONNECT
                </button>
              </div>
            </>
          )}
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default ConnectBase;

