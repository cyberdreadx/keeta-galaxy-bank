import { useState, useEffect } from "react";
import { Download, Smartphone, Apple, Monitor } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { StarField } from "@/components/StarField";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <StarField />
      <Header />

      <main className="pt-20 pb-24 px-4 relative z-10">
        <div className="max-w-lg mx-auto space-y-6">
          <StarWarsPanel className="p-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Download className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-orbitron text-primary">Install Yoda Wallet</h1>
              <p className="text-muted-foreground">
                Install the app on your device for the best experience with offline access and quick launching.
              </p>
            </div>
          </StarWarsPanel>

          {isInstalled ? (
            <StarWarsPanel className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-orbitron text-green-400">Already Installed!</h2>
                <p className="text-muted-foreground">
                  Yoda Wallet is already installed on your device.
                </p>
              </div>
            </StarWarsPanel>
          ) : (
            <>
              {deferredPrompt && (
                <StarWarsPanel className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-6 h-6 text-primary" />
                      <h2 className="text-lg font-orbitron text-primary">Quick Install</h2>
                    </div>
                    <Button onClick={handleInstall} className="w-full" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Install Now
                    </Button>
                  </div>
                </StarWarsPanel>
              )}

              {isIOS && (
                <StarWarsPanel className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Apple className="w-6 h-6 text-primary" />
                      <h2 className="text-lg font-orbitron text-primary">iOS Installation</h2>
                    </div>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">1.</span>
                        Tap the Share button in Safari (square with arrow)
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">2.</span>
                        Scroll down and tap "Add to Home Screen"
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">3.</span>
                        Tap "Add" to install Yoda Wallet
                      </li>
                    </ol>
                  </div>
                </StarWarsPanel>
              )}

              {!isIOS && !deferredPrompt && (
                <StarWarsPanel className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-primary" />
                      <h2 className="text-lg font-orbitron text-primary">Android Installation</h2>
                    </div>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">1.</span>
                        Tap the menu (three dots) in Chrome
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">2.</span>
                        Tap "Install app" or "Add to Home screen"
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-bold">3.</span>
                        Confirm to install Yoda Wallet
                      </li>
                    </ol>
                  </div>
                </StarWarsPanel>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Install;
