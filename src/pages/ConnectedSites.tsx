import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Globe, Trash2, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ConnectedSite {
  origin: string;
  connectedAt: number;
  lastUsed: number;
}

const ConnectedSites = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<ConnectedSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectedSites();
  }, []);

  const loadConnectedSites = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['connected_sites']);
        const connectedSites = result.connected_sites || [];
        setSites(connectedSites);
      }
    } catch (error) {
      console.error('[ConnectedSites] Error loading sites:', error);
      toast.error("Failed to load connected sites");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (origin: string) => {
    try {
      // Remove site from connected sites
      const updatedSites = sites.filter(site => site.origin !== origin);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ connected_sites: updatedSites });
      }
      
      setSites(updatedSites);
      toast.success(`Disconnected from ${origin}`);
    } catch (error) {
      console.error('[ConnectedSites] Error disconnecting site:', error);
      toast.error("Failed to disconnect site");
    }
  };

  const handleDisconnectAll = async () => {
    if (!confirm("Are you sure you want to disconnect from all sites?")) {
      return;
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ connected_sites: [] });
      }
      
      setSites([]);
      toast.success("Disconnected from all sites");
    } catch (error) {
      console.error('[ConnectedSites] Error disconnecting all:', error);
      toast.error("Failed to disconnect all sites");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTimeSince = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative h-full flex flex-col">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24 px-4 flex-1 overflow-y-auto">
        <StarWarsPanel title="// CONNECTED SITES" className="max-w-2xl mx-auto mt-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-sw-blue border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading connected sites...</p>
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-display text-gray-400 mb-2">
                No Connected Sites
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                You haven't connected your wallet to any websites yet.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-sw-blue/20 border border-sw-blue/50 text-sw-blue hover:bg-sw-blue/30 font-mono text-sm tracking-wider transition-all"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          ) : (
            <>
              {/* Header Actions */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-sw-blue/20">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sw-green" />
                  <span className="font-mono text-sm text-gray-400">
                    {sites.length} {sites.length === 1 ? 'site' : 'sites'} connected
                  </span>
                </div>
                {sites.length > 0 && (
                  <button
                    onClick={handleDisconnectAll}
                    className="px-3 py-1 text-xs bg-transparent border border-sw-red/50 text-sw-red hover:bg-sw-red/10 font-mono tracking-wider transition-all"
                  >
                    DISCONNECT ALL
                  </button>
                )}
              </div>

              {/* Info Banner */}
              <div className="mb-6 p-3 bg-sw-blue/10 border border-sw-blue/30 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-sw-blue flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  These sites can view your wallet address, request transactions, and sign messages.
                  Disconnect any site you no longer trust.
                </p>
              </div>

              {/* Connected Sites List */}
              <div className="space-y-3">
                {sites.map((site) => (
                  <div
                    key={site.origin}
                    className="p-4 bg-black/30 border border-sw-blue/20 rounded hover:border-sw-blue/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-sw-blue flex-shrink-0" />
                          <span className="font-mono text-sm text-sw-blue truncate">
                            {site.origin}
                          </span>
                          <a
                            href={site.origin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-sw-blue transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Connected: {formatDate(site.connectedAt)}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span>
                            Last used: {getTimeSince(site.lastUsed)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(site.origin)}
                        className="px-3 py-1.5 bg-transparent border border-sw-red/50 text-sw-red hover:bg-sw-red/10 font-mono text-xs tracking-wider transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                        DISCONNECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate("/")}
                className="w-full mt-6 py-2 bg-transparent border border-sw-blue/30 text-sw-blue/70 hover:bg-sw-blue/10 hover:text-sw-blue font-mono text-sm tracking-wider transition-all"
              >
                ← BACK TO DASHBOARD
              </button>
            </>
          )}
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default ConnectedSites;

