import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { QuickActions } from "@/components/QuickActions";
import { TransactionHistory } from "@/components/TransactionHistory";
import { NetworkStats } from "@/components/NetworkStats";
import { AssetPortfolio } from "@/components/AssetPortfolio";

const Index = () => {
  return (
    <div className="relative">
      {/* Animated star background */}
      <StarField />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          {/* Hero Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block">
              <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
                // WELCOME BACK
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
                COMMANDER
              </h2>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-sw-blue/50" />
                <span className="font-mono text-xs text-sw-blue/60">KEETA NETWORK ONLINE</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-sw-blue/50" />
              </div>
            </div>
          </div>

          {/* Dashboard grid */}
          <div className="grid gap-6">
            {/* Top row - Balance and Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <BalanceDisplay />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <QuickActions />
              </div>
            </div>

            {/* Network Stats */}
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <NetworkStats />
            </div>

            {/* Bottom row - Transactions and Portfolio */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                <TransactionHistory />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
                <AssetPortfolio />
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12 pb-4">
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-12 bg-sw-blue/30" />
              <p className="font-mono text-xs text-sw-blue/60 tracking-[0.3em]">
                MAY THE FORCE BE WITH YOUR CREDITS
              </p>
              <div className="h-px w-12 bg-sw-blue/30" />
            </div>
            <p className="font-mono text-[10px] text-sw-blue/40 mt-2 tracking-wider">
              KEETA NETWORK • 10M+ TPS • 400MS SETTLEMENT • CROSS-CHAIN PROTOCOL
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
