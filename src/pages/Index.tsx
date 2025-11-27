import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { QuickActions } from "@/components/QuickActions";
import { TransactionHistory } from "@/components/TransactionHistory";
import { NetworkStats } from "@/components/NetworkStats";
import { AssetPortfolio } from "@/components/AssetPortfolio";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Animated star background */}
      <StarField />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero section */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-glow-hologram text-hologram">Commander</span>
            </h2>
            <p className="text-muted-foreground">
              Your galactic financial hub • Powered by Keeta Network
            </p>
          </div>

          {/* Dashboard grid */}
          <div className="grid gap-6">
            {/* Top row - Balance and Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <BalanceDisplay 
                  balance={125847.32} 
                  currency="KTA" 
                  change24h={12.5}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <QuickActions />
              </div>
            </div>

            {/* Network Stats */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <NetworkStats />
            </div>

            {/* Bottom row - Transactions and Portfolio */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                <TransactionHistory />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
                <AssetPortfolio />
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center mt-12 pb-8">
            <p className="text-sm text-muted-foreground font-display uppercase tracking-wider">
              May the credits be with you
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Keeta Network • 10M+ TPS • 400ms Settlement • Cross-Chain Interoperability
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
