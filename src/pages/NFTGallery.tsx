import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StarField } from '@/components/StarField';
import { StarWarsPanel } from '@/components/StarWarsPanel';
import { useKeetaWallet } from '@/contexts/KeetaWalletContext';
import { Image, Grid, List, ExternalLink, RefreshCw } from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  tokenId: string;
}

export default function NFTGallery() {
  const { isConnected, publicKey } = useKeetaWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  // Mock NFT data for demo - in production would fetch from Keeta network
  const fetchNFTs = async () => {
    if (!isConnected || !publicKey) return;
    
    setIsLoading(true);
    
    // Simulate API call - replace with actual Keeta NFT fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo NFTs with Star Wars theme
    const mockNFTs: NFT[] = [
      {
        id: '1',
        name: 'Holocron Fragment #42',
        description: 'A rare Sith holocron fragment containing ancient knowledge.',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop',
        collection: 'Ancient Artifacts',
        tokenId: '42'
      },
      {
        id: '2',
        name: 'Kyber Crystal - Blue',
        description: 'A pure kyber crystal radiating with Force energy.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop',
        collection: 'Kyber Crystals',
        tokenId: '108'
      },
      {
        id: '3',
        name: 'Galactic Map #7',
        description: 'Star chart of the Outer Rim territories.',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=400&fit=crop',
        collection: 'Galactic Archives',
        tokenId: '7'
      }
    ];
    
    setNfts(mockNFTs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNFTs();
  }, [isConnected, publicKey]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-sw-space flex flex-col">
        <StarField />
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <StarWarsPanel title="NFT VAULT" className="max-w-md w-full">
            <div className="text-center py-8">
              <Image className="w-16 h-16 text-sw-blue/50 mx-auto mb-4" />
              <p className="text-sw-blue/70 font-mono text-sm">
                CONNECT WALLET TO VIEW NFT COLLECTION
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
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <StarWarsPanel title="NFT VAULT" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sw-blue/70 font-mono text-xs">
              {nfts.length} ARTIFACTS IN COLLECTION
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border transition-colors ${
                  viewMode === 'grid' 
                    ? 'border-sw-blue bg-sw-blue/20 text-sw-blue' 
                    : 'border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border transition-colors ${
                  viewMode === 'list' 
                    ? 'border-sw-blue bg-sw-blue/20 text-sw-blue' 
                    : 'border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={fetchNFTs}
                disabled={isLoading}
                className="p-2 border border-sw-blue/30 text-sw-blue/50 hover:bg-sw-blue/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-sw-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sw-blue/70 font-mono text-xs">SCANNING COLLECTION...</p>
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-sw-blue/30 mx-auto mb-4" />
              <p className="text-sw-blue/50 font-mono text-sm">NO ARTIFACTS FOUND</p>
              <p className="text-sw-blue/30 font-mono text-xs mt-2">
                NFTs owned by this address will appear here
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {nfts.map((nft) => (
                <button
                  key={nft.id}
                  onClick={() => setSelectedNFT(nft)}
                  className="group relative border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-all hover:border-sw-blue/50 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-sw-space via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-sw-blue font-mono text-xs truncate">{nft.name}</p>
                    <p className="text-sw-blue/50 font-mono text-[10px]">{nft.collection}</p>
                  </div>
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-sw-blue/50" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-sw-blue/50" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-sw-blue/50" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-sw-blue/50" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {nfts.map((nft) => (
                <button
                  key={nft.id}
                  onClick={() => setSelectedNFT(nft)}
                  className="w-full flex items-center gap-4 p-3 border border-sw-blue/30 bg-sw-blue/5 hover:bg-sw-blue/10 transition-all hover:border-sw-blue/50"
                >
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-16 h-16 object-cover border border-sw-blue/30"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sw-blue font-mono text-sm">{nft.name}</p>
                    <p className="text-sw-blue/50 font-mono text-xs">{nft.collection}</p>
                    <p className="text-sw-blue/30 font-mono text-[10px]">Token #{nft.tokenId}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </StarWarsPanel>
      </main>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div 
          className="fixed inset-0 bg-sw-space/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNFT(null)}
        >
          <div 
            className="max-w-md w-full border border-sw-blue/50 bg-sw-space p-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sw-blue" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sw-blue" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-sw-blue" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-sw-blue" />
            
            <img
              src={selectedNFT.image}
              alt={selectedNFT.name}
              className="w-full aspect-square object-cover mb-4 border border-sw-blue/30"
            />
            <h3 className="text-sw-blue font-mono text-lg mb-1">{selectedNFT.name}</h3>
            <p className="text-sw-yellow font-mono text-xs mb-2">{selectedNFT.collection}</p>
            <p className="text-sw-blue/70 font-mono text-xs mb-4">{selectedNFT.description}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedNFT(null)}
                className="flex-1 py-2 border border-sw-blue/50 text-sw-blue font-mono text-xs hover:bg-sw-blue/10 transition-colors"
              >
                CLOSE
              </button>
              <button
                className="flex-1 py-2 bg-sw-blue/20 border border-sw-blue text-sw-blue font-mono text-xs hover:bg-sw-blue/30 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                VIEW ON CHAIN
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
