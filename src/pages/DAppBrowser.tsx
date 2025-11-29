import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StarField } from '@/components/StarField';
import { StarWarsPanel } from '@/components/StarWarsPanel';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';
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
  Bookmark
} from 'lucide-react';

interface SavedDApp {
  name: string;
  url: string;
  icon?: string;
}

const FEATURED_DAPPS: SavedDApp[] = [
  { name: 'KeetaScan', url: 'https://keetascan.com', icon: '🔍' },
  { name: 'Keeta Network', url: 'https://keeta.com', icon: '🌐' },
];

export default function DAppBrowser() {
  const { isConnected } = useKeetaWallet();
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const navigateTo = (targetUrl: string) => {
    let processedUrl = targetUrl.trim();
    
    // Add protocol if missing
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setCurrentUrl(processedUrl);
    setUrl(processedUrl);
    setIsLoading(true);
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
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter DApp URL..."
                className="w-full bg-sw-blue/5 border border-sw-blue/30 text-sw-blue font-mono text-sm px-10 py-2 focus:outline-none focus:border-sw-blue placeholder:text-sw-blue/30"
              />
              {url && (
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
            {!currentUrl ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <Globe className="w-16 h-16 text-sw-blue/30 mb-4" />
                <p className="text-sw-blue/50 font-mono text-sm mb-6 text-center">
                  ENTER A URL OR SELECT A DAPP
                </p>
                
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
                  Note: Some sites may block embedding for security
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
                <iframe
                  ref={iframeRef}
                  src={currentUrl}
                  className="w-full h-full border-0"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
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
    </div>
  );
}
