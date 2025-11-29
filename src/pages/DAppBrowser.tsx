import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StarField } from '@/components/StarField';
import { StarWarsPanel } from '@/components/StarWarsPanel';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Home, 
  Star,
  ExternalLink,
  Search,
  X,
  Bookmark,
  AlertTriangle,
  Smartphone
} from 'lucide-react';

interface SavedDApp {
  name: string;
  url: string;
  icon?: string;
}

const FEATURED_DAPPS: SavedDApp[] = [
  { name: 'Rougee', url: 'https://rougee.app', icon: '🎮' },
  { name: 'KeetaScan', url: 'https://keetascan.com', icon: '🔍' },
  { name: 'Keeta Network', url: 'https://keeta.com', icon: '🌐' },
];

export default function DAppBrowser() {
  const { isConnected } = useKeetaWallet();
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [bookmarks, setBookmarks] = useState<SavedDApp[]>(() => {
    try {
      const saved = localStorage.getItem('yoda_dapp_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect iframe load errors via timeout (shorter for better UX)
  useEffect(() => {
    if (!currentUrl || !isLoading || isNative) return;
    
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 4000); // 4 second timeout - most sites load faster
    
    return () => clearTimeout(timeout);
  }, [currentUrl, isLoading, isNative]);

  // Open URL in native browser (Capacitor InAppBrowser)
  const openInNativeBrowser = async (targetUrl: string) => {
    try {
      await Browser.open({ 
        url: targetUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: '#0a0f1c'
      });
    } catch (error) {
      console.error('Failed to open native browser:', error);
      // Fallback to window.open
      window.open(targetUrl, '_blank');
    }
  };

  const navigateTo = (targetUrl: string) => {
    let processedUrl = targetUrl.trim();
    
    // Add protocol if missing
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    // If native app, use Capacitor InAppBrowser
    if (isNative) {
      openInNativeBrowser(processedUrl);
      setUrl(processedUrl);
      return;
    }
    
    // Web fallback - use iframe
    setLoadError(false);
    setCurrentUrl(processedUrl);
    setUrl(processedUrl);
    setIsLoading(true);
  };

  const handleUrlInputClick = () => {
    if (isMobile) {
      setModalUrl(url);
      setShowUrlModal(true);
    }
  };

  const handleModalSubmit = () => {
    if (modalUrl.trim()) {
      navigateTo(modalUrl);
    }
    setShowUrlModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      navigateTo(url);
    }
  };

  const goBack = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const goForward = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const goHome = () => {
    setCurrentUrl('');
    setUrl('');
  };

  const addBookmark = () => {
    if (!currentUrl) return;
    
    const hostname = new URL(currentUrl).hostname;
    const newBookmark: SavedDApp = {
      name: hostname,
      url: currentUrl,
      icon: '📌'
    };
    
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('yoda_dapp_bookmarks', JSON.stringify(updated));
  };

  const removeBookmark = (index: number) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    localStorage.setItem('yoda_dapp_bookmarks', JSON.stringify(updated));
  };

  const isBookmarked = bookmarks.some(b => b.url === currentUrl);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-sw-space flex flex-col">
        <StarField />
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <StarWarsPanel title="DAPP BROWSER" className="max-w-md w-full">
            <div className="text-center py-8">
              <Globe className="w-16 h-16 text-sw-blue/50 mx-auto mb-4" />
              <p className="text-sw-blue/70 font-mono text-sm">
                CONNECT WALLET TO ACCESS DAPPS
              </p>
            </div>
          </StarWarsPanel>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sw-space flex flex-col">
      <StarField />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-24 flex flex-col">
        <StarWarsPanel title="DAPP BROWSER" className="flex-1 flex flex-col">
          {/* URL Bar */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={goBack}
                disabled={!currentUrl}
                className="p-2 border border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10 transition-colors disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goForward}
                disabled={!currentUrl}
                className="p-2 border border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10 transition-colors disabled:opacity-30"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={refresh}
                disabled={!currentUrl}
                className="p-2 border border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10 transition-colors disabled:opacity-30"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={goHome}
                className="p-2 border border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10 transition-colors"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sw-blue/30" />
              <input
                type="text"
                value={url}
                onChange={(e) => !isMobile && setUrl(e.target.value)}
                onClick={handleUrlInputClick}
                readOnly={isMobile}
                placeholder="Enter DApp URL..."
                className="w-full bg-sw-blue/5 border border-sw-blue/30 text-sw-blue font-mono text-sm px-10 py-2 focus:outline-none focus:border-sw-blue placeholder:text-sw-blue/30 cursor-pointer md:cursor-text"
              />
              {url && !isMobile && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sw-blue/30 hover:text-sw-blue"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => currentUrl && (isBookmarked ? null : addBookmark())}
              disabled={!currentUrl}
              className={`p-2 border transition-colors disabled:opacity-30 ${
                isBookmarked 
                  ? 'border-sw-yellow bg-sw-yellow/20 text-sw-yellow' 
                  : 'border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10'
              }`}
            >
              <Star className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`p-2 border transition-colors ${
                showBookmarks 
                  ? 'border-sw-blue bg-sw-blue/20 text-sw-blue' 
                  : 'border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </form>

          {/* Bookmarks Panel */}
          {showBookmarks && bookmarks.length > 0 && (
            <div className="mb-4 p-3 border border-sw-blue/30 bg-sw-blue/5">
              <p className="text-sw-blue/50 font-mono text-xs mb-2">BOOKMARKS</p>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map((bookmark, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-sw-blue/10 border border-sw-blue/30">
                    <button
                      onClick={() => navigateTo(bookmark.url)}
                      className="px-2 py-1 text-sw-blue font-mono text-xs hover:bg-sw-blue/20 transition-colors"
                    >
                      {bookmark.icon} {bookmark.name}
                    </button>
                    <button
                      onClick={() => removeBookmark(idx)}
                      className="px-1 py-1 text-sw-red/50 hover:text-sw-red hover:bg-sw-red/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browser Content */}
          <div className="flex-1 min-h-[400px] border border-sw-blue/30 relative overflow-hidden">
            {!currentUrl || isNative ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <Globe className="w-16 h-16 text-sw-blue/30 mb-4" />
                <p className="text-sw-blue/50 font-mono text-sm mb-6 text-center">
                  {isNative ? 'SELECT A DAPP TO OPEN' : 'ENTER A URL OR SELECT A DAPP'}
                </p>
                
                {/* Native mode indicator */}
                {isNative && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-sw-green/10 border border-sw-green/30 rounded">
                    <Smartphone className="w-4 h-4 text-sw-green" />
                    <p className="text-sw-green font-mono text-xs">NATIVE BROWSER MODE</p>
                  </div>
                )}
                
                {/* Featured DApps */}
                <div className="w-full max-w-sm">
                  <p className="text-sw-blue/30 font-mono text-xs mb-3 text-center">FEATURED DAPPS</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FEATURED_DAPPS.map((dapp, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigateTo(dapp.url)}
                        className="p-4 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 hover:border-sw-blue/50 transition-all text-center group"
                      >
                        <span className="text-2xl mb-2 block">{dapp.icon}</span>
                        <p className="text-sw-blue font-mono text-xs">{dapp.name}</p>
                        <p className="text-sw-blue/30 font-mono text-[10px] mt-1 group-hover:text-sw-blue/50 transition-colors truncate">
                          {dapp.url.replace('https://', '')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                
                <p className="text-sw-blue/20 font-mono text-[10px] mt-6 text-center">
                  {isNative 
                    ? 'DApps open in full native browser' 
                    : 'Note: Some sites may block embedding for security'}
                </p>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-sw-space/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-sw-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sw-blue/70 font-mono text-xs">ESTABLISHING CONNECTION...</p>
                    </div>
                  </div>
                )}
                {loadError && (
                  <div className="absolute inset-0 bg-sw-space flex items-center justify-center z-10">
                    <div className="text-center p-6 max-w-sm">
                      <AlertTriangle className="w-12 h-12 text-sw-yellow mx-auto mb-4" />
                      <p className="text-sw-yellow font-mono text-sm mb-2">CONNECTION ISSUE</p>
                      <p className="text-sw-blue/70 font-mono text-xs mb-4">
                        This site may be blocking embedding or the URL is invalid. Try opening in a new tab instead.
                      </p>
                      <div className="flex flex-col gap-2">
                        <a
                          href={currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sw-blue/20 border border-sw-blue text-sw-blue font-mono text-xs hover:bg-sw-blue/30 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          OPEN IN NEW TAB
                        </a>
                        <button
                          onClick={goHome}
                          className="px-4 py-2 border border-sw-blue/30 text-sw-blue/70 font-mono text-xs hover:bg-sw-blue/10 transition-colors"
                        >
                          GO BACK HOME
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {!isLoading && !loadError && (
                  <div className="absolute bottom-2 left-2 right-2 bg-sw-space/80 border border-sw-blue/30 p-2 z-10">
                    <p className="text-sw-blue/50 font-mono text-[10px] text-center">
                      Page blank? Site may block embedding. Use "Open in New Tab" below.
                    </p>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={currentUrl}
                  className="w-full h-full border-0"
                  onLoad={() => {
                    setIsLoading(false);
                  }}
                  onError={() => {
                    setIsLoading(false);
                    setLoadError(true);
                  }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  title="DApp Browser"
                />
              </>
            )}
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-sw-blue/50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-sw-blue/50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-sw-blue/50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-sw-blue/50 pointer-events-none" />
          </div>

          {/* External link */}
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 py-2 border border-sw-blue/30 text-sw-blue/50 font-mono text-xs hover:bg-sw-blue/10 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              OPEN IN NEW TAB
            </a>
          )}
        </StarWarsPanel>
      </main>

      <Footer />

      {/* Mobile URL Input Modal */}
      {showUrlModal && (
        <div 
          className="fixed inset-0 bg-sw-space/95 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setShowUrlModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-sw-space border border-sw-blue/50 p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sw-blue font-mono text-sm">ENTER URL</p>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1 text-sw-blue/50 hover:text-sw-blue"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="url"
              value={modalUrl}
              onChange={(e) => setModalUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="w-full bg-sw-blue/10 border border-sw-blue/50 text-sw-blue font-mono text-base p-4 focus:outline-none focus:border-sw-blue placeholder:text-sw-blue/30 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowUrlModal(false)}
                className="flex-1 py-3 border border-sw-blue/30 text-sw-blue/70 font-mono text-sm hover:bg-sw-blue/10 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleModalSubmit}
                className="flex-1 py-3 bg-sw-blue/20 border border-sw-blue text-sw-blue font-mono text-sm hover:bg-sw-blue/30 transition-colors"
              >
                GO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
