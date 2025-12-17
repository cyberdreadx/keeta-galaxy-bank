import { useState, useEffect } from "react";
import { Copy, Check, QrCode } from "lucide-react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useKeetaWallet } from "@/contexts/KeetaWalletContext";
import { toast } from "sonner";
import QRCode from "qrcode";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Receive = () => {
  const { isConnected, publicKey, network } = useKeetaWallet();
  const { play } = useSoundEffects();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      play('receive');
      QRCode.toDataURL(publicKey, {
        width: 200,
        margin: 2,
        color: {
          dark: '#00D4FF',
          light: '#0a0a0f',
        },
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [publicKey]);

  const handleCopy = async () => {
    if (!publicKey) return;
    
    try {
      play('click');
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      play('error');
      toast.error("Failed to copy address");
    }
  };

  if (!isConnected || !publicKey) {
    return (
      <div className="bg-sw-space text-sw-white relative overflow-hidden">
        <StarField />
        <Header />
        <main className="container mx-auto px-4 py-8 pt-20 pb-24 relative z-10">
          <StarWarsPanel title="// RECEIVE CREDITS" className="max-w-lg mx-auto">
            <p className="text-sw-orange text-center">Please connect your wallet first</p>
          </StarWarsPanel>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-sw-space text-sw-white relative overflow-hidden">
      <StarField />
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20 pb-24 relative z-10">

        <StarWarsPanel title="// RECEIVE CREDITS" className="max-w-lg mx-auto">
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center py-6">
              <div className="relative p-4 border border-sw-blue/30 bg-sw-space/80">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Wallet QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-sw-blue/50 animate-pulse" />
                  </div>
                )}
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-sw-blue" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-sw-blue" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-sw-blue" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-sw-blue" />
              </div>
              
              <p className="mt-4 font-mono text-xs text-sw-blue/60 tracking-widest uppercase">
                SCAN TO SEND KTA
              </p>
            </div>

            {/* Address Display */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-sw-blue/80 tracking-widest uppercase">
                YOUR WALLET ADDRESS
              </label>
              <div className="relative">
                <div className="w-full px-4 py-3 bg-sw-space/50 border border-sw-blue/30 text-sw-yellow font-mono text-xs break-all">
                  {publicKey}
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="w-full py-4 bg-sw-blue/20 border border-sw-blue/50 hover:bg-sw-blue/30 hover:border-sw-blue text-sw-blue font-display font-bold tracking-widest transition-all flex items-center justify-center gap-3"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  COPIED!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  COPY ADDRESS
                </>
              )}
            </button>

            {/* Network Info */}
            <p className="text-center font-mono text-xs text-sw-blue/50">
              NETWORK: {network.toUpperCase()}NET
            </p>
          </div>
        </StarWarsPanel>
      </main>
    </div>
  );
};

export default Receive;
