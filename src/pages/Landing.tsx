import { Link } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Wallet, 
  Send, 
  QrCode,
  ArrowLeftRight,
  Hexagon,
  Star,
  ChevronRight
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen relative bg-sw-space">
      <StarField />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sw-space/90 backdrop-blur-md border-b border-sw-blue/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Hexagon className="w-10 h-10 text-sw-green [filter:drop-shadow(0_0_10px_hsl(var(--sw-green)/0.5))]" strokeWidth={1.5} />
                <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm text-sw-green">Y</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-[0.15em]">
                  <span className="text-sw-green">YODA</span>
                  <span className="text-sw-blue">WALLET</span>
                </h1>
              </div>
            </div>
            <Link
              to="/"
              className="px-6 py-2 bg-sw-green/20 border border-sw-green/50 text-sw-green font-display font-bold tracking-wider hover:bg-sw-green/30 transition-all"
            >
              LAUNCH APP
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sw-green/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-sw-green/10 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-sw-blue/10 rounded-full blur-[80px]" />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sw-green/10 border border-sw-green/30 rounded-full mb-8">
            <Star className="w-4 h-4 text-sw-yellow" />
            <span className="font-mono text-xs text-sw-green tracking-wider">POWERED BY KEETA NETWORK</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-wider mb-6">
            <span className="block text-sw-white">THE FORCE OF</span>
            <span className="block bg-gradient-to-r from-sw-green via-sw-blue to-sw-green bg-clip-text text-transparent">
              DIGITAL FINANCE
            </span>
          </h1>
          
          <p className="font-mono text-lg md:text-xl text-sw-blue/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Strong in the ways of blockchain, Yoda Wallet is. Send, receive, and bridge your credits across the galaxy with the wisdom of the Force.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="group flex items-center gap-3 px-8 py-4 bg-sw-green text-sw-space font-display font-bold tracking-wider hover:bg-sw-green/90 transition-all"
            >
              GET STARTED
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://keeta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 border border-sw-blue/50 text-sw-blue font-display tracking-wider hover:bg-sw-blue/10 transition-all"
            >
              LEARN MORE
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
            <div className="text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-sw-green mb-2">$2.4M+</p>
              <p className="font-mono text-xs text-sw-blue/60 tracking-wider">VOLUME PROCESSED</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-sw-yellow mb-2">50K+</p>
              <p className="font-mono text-xs text-sw-blue/60 tracking-wider">TRANSACTIONS</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-sw-blue mb-2">2</p>
              <p className="font-mono text-xs text-sw-blue/60 tracking-wider">NETWORKS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs text-sw-green tracking-[0.5em] mb-4">// FEATURES</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider">
              MASTER YOUR <span className="text-sw-green">CREDITS</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Wallet className="w-8 h-8" />}
              title="SECURE WALLET"
              description="Your credits, protected by the strongest encryption in the galaxy."
              color="sw-green"
            />
            <FeatureCard
              icon={<Send className="w-8 h-8" />}
              title="INSTANT TRANSFERS"
              description="Send credits faster than the Millennium Falcon makes the Kessel Run."
              color="sw-yellow"
            />
            <FeatureCard
              icon={<QrCode className="w-8 h-8" />}
              title="EASY RECEIVE"
              description="Generate QR codes to receive payments from anyone, anywhere."
              color="sw-blue"
            />
            <FeatureCard
              icon={<ArrowLeftRight className="w-8 h-8" />}
              title="CROSS-CHAIN BRIDGE"
              description="Bridge assets between Keeta L1 and Base networks seamlessly."
              color="sw-orange"
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-sw-blue/5 to-transparent">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs text-sw-yellow tracking-[0.5em] mb-4">// SECURITY</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-6">
                PROTECTED BY THE <span className="text-sw-yellow">FORCE</span>
              </h2>
              <p className="font-mono text-sw-blue/70 leading-relaxed mb-8">
                Do or do not, there is no try. Your assets are secured with military-grade encryption, 
                PIN protection, and the battle-tested security of the Keeta blockchain.
              </p>
              
              <div className="space-y-4">
                <SecurityFeature text="End-to-end encryption for all transactions" />
                <SecurityFeature text="Optional PIN lock for app security" />
                <SecurityFeature text="Non-custodial - you control your keys" />
                <SecurityFeature text="Multi-account management support" />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-sw-yellow/10 rounded-lg blur-[50px]" />
              <div className="relative border border-sw-yellow/30 bg-sw-space/50 p-8 backdrop-blur-sm">
                <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-sw-yellow/50" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-sw-yellow/50" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-sw-yellow/50" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-sw-yellow/50" />
                
                <div className="flex items-center justify-center mb-6">
                  <Shield className="w-24 h-24 text-sw-yellow [filter:drop-shadow(0_0_20px_hsl(var(--sw-yellow)/0.5))]" />
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-sw-yellow mb-2">FORTRESS MODE</p>
                  <p className="font-mono text-xs text-sw-blue/60">Your credits are safe with us</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <p className="font-mono text-xs text-sw-blue tracking-[0.5em] mb-4">// NETWORKS</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-12">
            ACROSS THE <span className="text-sw-blue">GALAXY</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <NetworkCard
              name="Keeta L1"
              description="The native Keeta blockchain - fast, secure, and built for payments"
              symbol="L1"
              color="sw-blue"
            />
            <NetworkCard
              name="Base"
              description="Ethereum L2 powered by Coinbase - bridged seamlessly"
              symbol="B"
              color="sw-green"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="relative border border-sw-green/30 bg-gradient-to-br from-sw-green/10 to-transparent p-12 text-center">
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-sw-green/50" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-sw-green/50" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-sw-green/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-sw-green/50" />
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-6">
              READY TO <span className="text-sw-green">BEGIN</span>?
            </h2>
            <p className="font-mono text-sw-blue/70 max-w-xl mx-auto mb-8">
              "Do or do not, there is no try." Start your journey with Yoda Wallet today.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-10 py-4 bg-sw-green text-sw-space font-display font-bold tracking-wider hover:bg-sw-green/90 transition-all"
            >
              LAUNCH YODA WALLET
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-sw-blue/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Hexagon className="w-8 h-8 text-sw-green" strokeWidth={1.5} />
              <span className="font-display font-bold tracking-wider">
                <span className="text-sw-green">YODA</span>
                <span className="text-sw-blue">WALLET</span>
              </span>
            </div>
            
            <div className="flex items-center gap-8">
              <a href="https://keeta.com" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">
                KEETA NETWORK
              </a>
              <a href="https://docs.keeta.com" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">
                DOCS
              </a>
              <Link to="/" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">
                APP
              </Link>
            </div>
            
            <p className="font-mono text-xs text-sw-blue/40">
              © {new Date().getFullYear()} YODA WALLET. MAY THE FORCE BE WITH YOU.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) => (
  <div className={`relative p-6 border border-${color}/30 bg-${color}/5 hover:bg-${color}/10 transition-all group`}>
    <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-current opacity-30" />
    <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-current opacity-30" />
    
    <div className={`text-${color} mb-4 group-hover:[filter:drop-shadow(0_0_10px_currentColor)] transition-all`}>
      {icon}
    </div>
    <h3 className="font-display text-lg font-bold text-sw-white mb-2 tracking-wider">{title}</h3>
    <p className="font-mono text-xs text-sw-blue/60 leading-relaxed">{description}</p>
  </div>
);

// Security Feature Component
const SecurityFeature = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 bg-sw-green rotate-45" />
    <span className="font-mono text-sm text-sw-blue/80">{text}</span>
  </div>
);

// Network Card Component
const NetworkCard = ({ 
  name, 
  description, 
  symbol, 
  color 
}: { 
  name: string; 
  description: string; 
  symbol: string; 
  color: string;
}) => (
  <div className={`relative p-8 border border-${color}/30 bg-${color}/5 hover:border-${color}/60 transition-all`}>
    <div className={`w-16 h-16 border border-${color}/60 bg-${color}/20 flex items-center justify-center mx-auto mb-4`}>
      <span className={`font-mono text-xl text-${color} font-bold`}>{symbol}</span>
    </div>
    <h3 className={`font-display text-xl font-bold text-${color} mb-2`}>{name}</h3>
    <p className="font-mono text-xs text-sw-blue/60">{description}</p>
  </div>
);

export default Landing;
